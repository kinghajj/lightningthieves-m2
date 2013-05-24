'use strict';

function ChatCtrl($scope, socket) {
  $scope.chat_lines = [];
  $scope.nick_status = 'question-sign';

  // listen for incoming messages
  socket.on('chat', function(pack) {
    // remember the message
    $scope.chat_lines.push(pack);
    // trim excess ones
    while($scope.chat_lines.length > 10) {
      $scope.chat_lines.shift();
    }
  });
  socket.on('nick-taken', function() {
    $scope.nick_status = 'exclamation-sign';
  });
  socket.on('nick-free', function() {
    $scope.nick_status = 'ok';
  });

  // broadcast a message
  $scope.chat = function() {
    // emit it
    socket.emit('chat', { msg: $scope.msg });
    // clear the chat input
    $scope.msg = '';
  };
  $scope.change = function() {
    socket.emit('check', { nick: $scope.nick });
  };
  $scope.register = function() {
    socket.emit('register', { nick: $scope.nick });
    $scope.nick = '';
  };
}
ChatCtrl.$inject = ['$scope', 'socket'];

function FetchCtrl($scope, updates) {
  $scope.init = false;
  $scope.updates = updates;
  $scope.alert_type = 'info';
  $scope.alert_head = 'Nothing.';
  $scope.alert_mesg = 'Waiting...';

  var running = function() {
    // check that all workers are alive
    var workers = $scope.news.ktr.workers;
    for(var w in workers)
      if(!workers[w].alive)
        return false;
    return true;
  };

  // various LTC currency conversions

  $scope.convertLTC = function(p) {
    $scope.currency = 'LTC';
    return p;
  };

  $scope.convertBTCeBTC = function(p) {
    $scope.currency = 'BTC';
    return p * $scope.news.btce_ltcbtc.ticker.last;
  };

  $scope.convertBTCeUSD = function(p) {
    $scope.currency = 'USD';
    return p * $scope.news.btce_ltcusd.ticker.last;
  };

  $scope.convertMtGoxUSD = function(p) {
    $scope.currency = 'USD';
    return p * $scope.news.btce_ltcbtc.ticker.last *
           $scope.news.mtgox_btcusd.data.last_local.value;
  };

  $scope.convert = $scope.convertLTC;

  // wait for news, update the model
  updates.on(function(news) {
    $scope.init = true;
    $scope.news = news;
    $scope.last_news_time = (new Date()).getTime();
    $scope.weekly_income = 50 / (news.gml_api.difficulty * 1) /
                           (Math.pow(2,48)/(Math.pow(2,16)-1)) *
                           Math.pow(10,6) * 60 * 60 * 24 * 7 * (637.0/1000.0);

    if(running()) {
      $scope.alert_type = 'success';
      $scope.alert_head = 'Hurray!';
      $scope.alert_mesg = 'The mining rig is running!';
    } else {
      $scope.alert_type = 'error';
      $scope.alert_head = 'Error!';
      $scope.alert_mesg = 'The mining rig is down!';
    }
  });
}
FetchCtrl.$inject = ['$scope', 'updates'];

function ConnCtrl($scope, socket) {
  $scope.init = false;
  $scope.connection_count = 0;
  $scope.connection_when = {'0': 'Nobody is connected. How do you see this...?',
                            '1': "You're the only one here. Congratulations.",
                            'other': 'There are {} connections.'};
  $scope.alert_type = 'info';
  $scope.alert_head = 'Starting.'
  $scope.alert_head = 'Wait for it...';

  // wait on various socket events and update model appropriately
  socket.on('connect', function() {
    $scope.alert_type = 'success';
    $scope.alert_head = 'Connected!'
    $scope.alert_mesg = 'The site should function normally.'
  });
  socket.on('connecting', function() {
    $scope.alert_type = 'info';
    $scope.alert_head = 'Connecting...'
    $scope.alert_mesg = 'Hang on.'
  });
  socket.on('disconnect', function() {
    $scope.alert_type = 'error';
    $scope.alert_head = 'Disconnected.'
    $scope.alert_mesg = 'So long.'
  });
  socket.on('connect_failed', function() {
    $scope.alert_type = 'error';
    $scope.alert_head = 'Connection failed.'
    $scope.alert_mesg = 'See the sysadmin.'
  });
  socket.on('error', function() {
    $scope.alert_type = 'error';
    $scope.alert_head = 'Error.';
    $scope.alert_mesg = "That's all I know.";
  });
  socket.on('reconnect_failed', function() {
    $scope.alert_type = 'error';
    $scope.alert_head = 'Reconnect failed..';
    $scope.alert_mesg = "Damn it.";
  });
  socket.on('reconnecting', function() {
    $scope.alert_type = 'info';
    $scope.alert_head = 'Reconnecting.';
    $scope.alert_mesg = "One more time.";
  });

  // wait for news, update the model
  socket.on('connection_count', function(pack) {
    $scope.init = true;
    $scope.connection_count = pack.connection_count;
  });

  // periodically request more news
  setInterval(function() {
    socket.emit('connection_count');
  }, 60000);
  socket.emit('connection_count');
}
ConnCtrl.$inject = ['$scope', 'socket'];
