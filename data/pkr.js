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

    if(allReady && players.length >= 1){
        var deck = shuffleCards();
        for(card in deck){
            $("#main-div").append(card)
        }
        $("#main-div").html("READY!!!!!!");
    }

}

function shuffleCards() {
  var array = [];
    for(var i=1; i<=52; i++){
        array.push(i)
    }
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
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

