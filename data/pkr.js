var NAMESPACE = 'urn:x-cast:com.pokercast.custom';
var APP_ID = 'B525BDB6';
var castBus;

var players = {};

var gotMessage = function(message, sender){
    var text = 'Received message from ' + sender;

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

var updatePlayers = function(){
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

    if(allReady && players.length > 1){
        $("#main-div").html("READY!!!!!!");
    }


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

