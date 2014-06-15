var NAMESPACE = 'urn:x-cast:com.pokercast.custom';
var APP_ID = 'B525BDB6';
var castBus;
var players = {};

function gotMessage(message, sender){

    console.log(sender);

    castBus.send(sender, 'Thanks for the message!');
    castBus.broadcast(sender + ' just sent a message to me!');

    if(message.type==="join"){
        players[sender]={name: message.name, status: "pending"};
    }

    if(message.type==="ready"){
        players[sender].status="ready";
    }

    updatePlayers();
}

function updatePlayers(){
    var allReady = true;
    var list = $("#players");
    list.empty();
    for(key in players){
        var p = players[key];
        list.append('<li class="' + p.status + '">' + p.name + '</li>');
        if(p.status==="pending"){
            allReady = false;
        }
    }

    if(allReady && Object.keys(players).length >= 1){

        var deck = shuffledDeck();
        for(i in deck){
            $("#main-div").append("<p>"+deck[i].value + '   ' + deck[i].suit + "</p>");
        }
    }

}

function shuffledDeck() {
    var a = [];
    for(s = 1; s <= 4; s++){
        for(n = 1; n <= 13; n++){
            var card = {"suit": s, "value": n};
            a.push(card);
        }
    }

    for(var j, x, i = a.length; i; j = Math.floor(Math.random() * i), x = a[--i], a[i] = a[j], a[j] = x);
    return a;
}

function rank(cardSet){
    var suitedCards = [[],[],[],[]];
    var valueCount = [0,0,0,0,0,0,0,0,0,0,0,0,0];

    //iterate over cards in cardset to build value and suited card counts
    for(var card in cardSet){
        //change aces to 14
        var editedValue = card.value;
        if(editedValue===1){
            editedValue=14;
        }
        //build the suit count for flush check
        var x = card.suit;
        suitedCards[x-1].push(editedValue);
        suitedCards[x-1].sort();
        //build the value count for pair/trip/quad check
        valueCount[editedValue-2]+=1

    }

    //created sorted values list for quad, full house, trip, two pair and pair checking
    var sortedValues = valueCount;
    sortedValues.sort();

    //check for quad
    if(sortedValues[12]===4){
        var quad = 0;
        var qkick = 0;
        for(var ii=12;ii=0;i--){
            if(quad===0 && valueCount[ii]===4){
                quad=ii+2;
            }
            if(qkick===0 && valueCount[ii]===1){
                qkick=ii+2;
            }
        }
        return [8,[quad,quad,quad,quad,qkick]];
    }

    //check for full house
    if(sortedValues[12]===3 && sortedValues[11]===2){
        var fhtrip = 0;
        var fhpair = 0;
        for(var ii=12;ii=0;i--){
            if(fhtrip===0 && valueCount[ii]===3){
                fhtrip=ii+2;
            }
            if(fhpair===0 && valueCount[ii]===2){
                fhpair=ii+2;
            }
        }
        return [7,[fhtrip,fhtrip,fhtrip,fhpair,fhpair]];
    }

    //check for flush
    for(var suit in suitedCards){
        if(suit.length >= 5){
            return [6,suit.slice(0,4)]
        }

    }

    //check for trip
    if(sortedValues[12]==3){
        var trip = 0;
        var tkick1 = 0;
        var tkick2 = 0;
        for(var ii=12;ii=0;i--){
            if(trip===0 && valueCount[ii]===3){
                trip=ii+2;
            }
            if(tkick1===0 && valueCount[ii]===1){
                tkick1=ii+2;
            }
            else if(tkick2===0 && valueCount[ii]===1){
                tkick2=ii+2;
            }
        }
        return [4,[trip,trip,trip,tkick1,tkick2]]
    }

    //check for two pair
    if(sortedValues[12]===2 && sortedValues[11]===2){
        var tp1 = 0;
        var tp2 = 0;
        var tpkick = 0;
        for(var ii=12;ii=0;i--){
            if(tp1===0 && valueCount[ii]===2){
                tp1=ii+2;
            }
            else if(tp2===0 && valueCount[ii]===2){
                tp2=ii+2;
            }
            if(tpkick===0 && valueCount[ii]===1){
                tpkick=ii+2;
            }
        }

        return [3,[tp1,tp1,tp2,tp2,tpkick]];
    }

    //check for single pair
    if(sortedValues[12]==2){
        var pair = 0;
        var pkick1 = 0;
        var pkick2 = 0;
        var pkick3 = 0;

    }

    return 1;
}





window.onload = function() {
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    castBus = window.castReceiverManager.getCastMessageBus(NAMESPACE);

    castBus.onMessage = function(event) {
        console.log(event.data);
        var message = JSON.parse(event.data);//castBus.deserializeMessage(event.data);
        gotMessage(message, event.senderId);
    };
    window.castReceiverManager.start();
}

