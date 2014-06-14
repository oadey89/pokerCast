var NAMESPACE = 'urn:x-cast:com.pokercast.custom';
var APP_ID = 'B525BDB6';
var castBus;

var gotMessage = function(message, sender){
    var text = 'Received message from ' + sender;

    console.log(sender);
    $('#main-div').html(sender);

    castBus.send(sender, 'Thanks for the message!');
    castBus.broadcast(sender + ' just sent a message to me!');
}

window.onload = function() {
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    castBus = window.castReceiverManager.getCastMessageBus(NAMESPACE);

    castBus.onMessage = function(event) {
        var message = window.castReceiverManager.deserializeMessage(event.data);
        gotMessage(message, event.senderId);
    };
    window.castReceiverManager.start();
}

