var PKR_NAMESPACE = 'urn:x-cast:com.pokercast.custom';
var PKR_APP_ID = 'B525BDB6';

/**
 * Interface for messages from the server.  This inferface allows
 * messages to be type-checked by the compiler.  It is declared as an
 * interface rather than a constructor because new instances are never
 * created by this app.
 */
function TicTacToeEvent() {}

TicTacToeEvent.prototype.event;
TicTacToeEvent.prototype.board;
TicTacToeEvent.prototype.message;
TicTacToeEvent.prototype.player;
TicTacToeEvent.prototype.row;
TicTacToeEvent.prototype.column;
TicTacToeEvent.prototype.end_state;

/**
 * The type of messages sent from this app to the server.  This type
 * is defined as a typedef so that instances can be created with
 * object literal syntax and type-checked by the compiler.
 */
var TicTacToeCommand;

function TicTacToeAppCtrl($scope) {
  this.logger_ = {'info':
    function(message) {
      console.info('[TicTacToeAppCtrl] ' + JSON.stringify(message));
    }
  };

  this.scope_ = $scope;

  this.model_ = {};
  this.resetModel_();

  // Use model to work around Angular's auto created scope problem.
  this.scope_['model'] = this.model_;
  this.scope_['model']['message'] = '';

  this.session_ = null;
  this.playerNumber_ = 0;
  this.playAction = false;

  window['__onGCastApiAvailable'] = (function(loaded, errorInfo) {
    if (loaded) {
      this.init_();
    } else {
      this.appendMessage_(errorInfo);
    }
  }).bind(this);

  // Async API script loading.
  // This also guarantees that window['__onGCastApiAvailable'] is set before API
  // script loads.
  var script = document.createElement('script');
  script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js';
  document.head.appendChild(script);
}

TicTacToeAppCtrl.nullFunction = function() {};

TicTacToeAppCtrl.prototype.appendMessage_ = function(message) {
  if (message) {
    this.model_['message'] += '\n' + JSON.stringify(message);
    this.safeApply_();
  }
};

TicTacToeAppCtrl.prototype.init_ = function() {
  if (!chrome.cast || !chrome.cast.isAvailable) {
    setTimeout(this.init_.bind(this), 1000);
    return;
  }

  this.scope_['apiInitialzed'] = false;
  this.scope_['stop'] = this.stop_.bind(this);
  this.scope_['move'] = this.move_.bind(this);
  this.scope_['play'] = this.play_.bind(this);
  this.scope_['quit'] = this.quit_.bind(this);
  this.model_['message'] = '';

  var sessionRequest = new chrome.cast.SessionRequest(PKR_APP_ID);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
    this.sessionListener_.bind(this),
    this.receiverListener_.bind(this));

  chrome.cast.initialize(apiConfig, this.onInitSuccess_.bind(this),
    this.onError_.bind(this));
};

TicTacToeAppCtrl.prototype.sessionUpdateListener_ = function(isAlive) {
  var message = isAlive ? 'Session Updated' : 'Session Removed';
  message += ': ' + this.session_.sessionId;
  this.appendMessage_(message);
  if (!isAlive) {
    this.session_ = null;
    this.model_['status'] = 'Game not started.';
    this.model_['started'] = false;
    this.resetModel_();
  }
  this.safeApply_();
};

TicTacToeAppCtrl.prototype.receiverListener_ = function(e) {
  this.appendMessage_('receiver listener: ' + e);
};

TicTacToeAppCtrl.prototype.onInitSuccess_ = function() {
  this.appendMessage_('init success');
  this.scope_['apiInitialzed'] = true;
  this.launch_();
  this.safeApply_();
};

TicTacToeAppCtrl.prototype.sessionListener_ = function(e) {
  this.appendMessage_('New session ID: ' + e.sessionId);
  this.session_ = e;
  e.addUpdateListener(this.sessionUpdateListener_.bind(this));
  e.addMessageListener(PKR_NAMESPACE,
      this.onReceiverMessage_.bind(this));
  window.setTimeout(this.requestLayout_.bind(this), 250);
  this.safeApply_();
  if( this.playAction ) { // initiated by join action
    this.play_();
    this.playAction = false;
  }
};

TicTacToeAppCtrl.prototype.onReceiverMessage_ = function(
    namespace, messageString) {
  this.appendMessage_('Got message: ' +
                      namespace + ' ' +
                      messageString);
  var message = /** @type {TicTacToeEvent} */ (JSON.parse(messageString));
  if (message.event == 'board_layout_response') {
    this.board = message.board;
    this.model_['boardDisplay'] = [
        this.board.slice(0, 3),
        this.board.slice(3, 6),
        this.board.slice(6, 9)
    ];
  } else if (message.event == 'error') {
    alert(message.message);
  } else if (message.event == 'moved') {
    //this.requestLayout_();
    if (this.model_['started']) {
      this.model_['myTurn'] = message.player != this.player_;
      if (this.model_['boardDisplay']) {
        this.model_['boardDisplay'][message.row][message.column] =
          message.player == 'X' ? 1 : 2;
      } else {
        this.requestLayout_();
      }
    } else {
      this.model_['status'] = 'Observing a game.';
      this.model_['observing'] = true;
      this.requestLayout_();
    }
  } else if (message.event == 'joined') {
    this.requestLayout_();
    this.player_ = message.player;
    this.playerNumber_ = this.player_ == 'X' ? 1 : 2;
    this.model_['status'] = 'Game in progress.';
    this.model_['symbol'] = this.player_;
    this.model_['gameInProgress'] = true;
    this.model_['myTurn'] = this.player_ == 'X';
  } else if (message.event == 'endgame') {
    this.model_['status'] = 'Game over.';
    this.model_['outcome'] = message.end_state;
    this.model_['gameInProgress'] = false;
    this.model_['observing'] = false;
    this.model_['started'] = false;
  }
  this.safeApply_();
};

TicTacToeAppCtrl.prototype.onError_ = function(e) {
  this.appendMessage_(e);
};

/**
 * General on-success callback.
 */
TicTacToeAppCtrl.prototype.onSuccess_ = function(message) {
  this.appendMessage_(message);
};

TicTacToeAppCtrl.prototype.safeApply_ = function() {
  if (!this.scope_.$$phase) {
    this.scope_.$apply();
  }
};

TicTacToeAppCtrl.prototype.launch_ = function() {
  this.appendMessage_('launching...');
  chrome.cast.requestSession(this.sessionListener_.bind(this),
    this.onError_.bind(this));
};

TicTacToeAppCtrl.prototype.sendTttMessage_ = function(command) {
  if (this.session_) {
    this.appendMessage_('Sending ' + JSON.stringify(command));
    this.session_.sendMessage(PKR_NAMESPACE, command,
      this.onSuccess_.bind(this, 'Message sent: ' + JSON.stringify(command)),
      this.onError_.bind(this));
  } else {
    this.appendMessage_('No session available');
  }
};

TicTacToeAppCtrl.prototype.stop_ = function() {
  if (this.session_) {
    this.appendMessage_('Stopping ' + this.session_.sessionId);
    this.session_.stop(this.onSuccess_.bind(this, 'Session stopped'),
      this.onError_.bind(this));
    this.session_ = null;
    this.model_['status'] = 'Game not started.';
    this.model_['started'] = false;
    this.sendTttMessage_({'command': 'endgame'});
    this.resetModel_();
  } else {
    this.appendMessage_('No session available');
  }
};

/**
 * Joins a game.
 */
TicTacToeAppCtrl.prototype.play_ = function() {
  if (this.session_) {
    this.sendTttMessage_({'command': 'join', 'name': 'web player'});
    this.resetModel_();
    this.model_['status'] = 'Waiting for another player to join.';
    this.model_['started'] = true;
    this.safeApply_();
  } else {
    this.playAction = true;
    this.launch_();
  }
};

/**
 * Leaves the game.
 */
TicTacToeAppCtrl.prototype.quit_ = function() {
  this.sendTttMessage_({'command': 'leave'});
  this.resetModel_();
};

TicTacToeAppCtrl.prototype.requestLayout_ = function() {
  this.sendTttMessage_({'command': 'board_layout_request'});
};

/**
 * Makes a move in the game.
 */
TicTacToeAppCtrl.prototype.move_ = function(row, column) {
  this.sendTttMessage_({'command': 'move', 'row': row, 'column': column});
  this.model_['myTurn'] = false;
  this.model_['boardDisplay'][row][column] = this.playerNumber_;
};

TicTacToeAppCtrl.prototype.resetModel_ = function() {
  this.model_['boardDisplay'] = null;
  this.model_['outcome'] = null;
  this.model_['player'] = null;
  this.model_['status'] = 'Game not started.';
  this.model_['started'] = false;
  this.model_['gameInProgress'] = false;
  this.model_['myTurn'] = false;
  this.model_['observing'] = false;
};