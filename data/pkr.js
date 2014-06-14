var NAMESPACE = 'urn:x-cast:com.pokercast.custom';
var APP_ID = 'B525BDB6';
var castBus;

var gotMessage = function(data, sender){
    var text = 'Received "' + data + '" from ' + sender;

    console.log(text);
    $('#main-div').html(text);

    castBus.send(sender, 'Thanks for the message!');
    castBus.broadcast(sender + ' just sent a message to me!');
}

window.onload = function() {
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    castBus = window.castReceiverManager.getCastMessageBus(NAMESPACE);

    castBus.onMessage = function(event) {
        gotMessage(event.data, event.senderId);
    };
    window.castReceiverManager.start();
}

