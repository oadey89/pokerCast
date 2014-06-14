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

