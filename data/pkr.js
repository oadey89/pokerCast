var NAMESPACE = 'urn:x-cast:com.pokercast.custom';
var APP_ID = 'B525BDB6';

window.onload = function() {
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    var castBus = window.castReceiverManager.getCastMessageBus(NAMESPACE);

    castBus.onMessage = function(event) {
        var cameFrom = event.senderId;
        var text = event.data + ' from ' + cameFrom;
        console.log(text);
        $('#main-div').html(text);

        castBus.send(cameFrom, text);

        castBus.broadcast('Binnie is getting fired from FB for this');
    };
    window.castReceiverManager.start();
}
