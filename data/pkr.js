var NAMESPACE = 'urn:x-cast:com.pokercast.custom';
var APP_ID = 'B525BDB6';
var BUS = null;

window.onload = function() {
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    BUS = window.castReceiverManager.getCastMessageBus(NAMESPACE);
    window.castReceiverManager.start();
}
