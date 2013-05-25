'use strict';

function ChatCtrl($scope, socket) {
  $scope.chat_lines = [];

  function alert_reset() {
    $scope.alert_type = 'info';
    $scope.alert_head = 'Waiting.'
    $scope.alert_mesg = 'Type and find if a nick is taken.'
  }
  alert_reset();

  // listen for incoming messages
  socket.on('chat', function(pack) {
    // remember the message
    $scope.chat_lines.push(pack);
    // trim excess ones
    while($scope.chat_lines.length > 10) {
      $scope.chat_lines.shift();
    }
  });
  socket.on('nick-invalid', function() {
    $scope.alert_type = 'error';
    $scope.alert_head = 'Error!';
    $scope.alert_mesg = 'That nick is taken or invalid.';
  });
  socket.on('nick-avail', function() {
    $scope.alert_type = 'success';
    $scope.alert_head = 'OK!';
    $scope.alert_mesg = 'That nick is available.';
  });
  socket.on('nick-reg', function(pack) {
    $scope.alert_type = 'info';
    $scope.alert_head = 'Registered'
    $scope.alert_mesg = 'as "' + pack.nick + '".';
  });

  // broadcast a message
  $scope.chat = function() {
    // emit it
    socket.emit('chat', { msg: $scope.msg });
    // clear the chat input
    $scope.msg = '';
  };
  $scope.change = function() {
    socket.emit('nick-chk', { nick: $scope.nick });
  };
  $scope.register = function() {
    alert_reset();
    socket.emit('nick-reg', { nick: $scope.nick });
    $scope.nick = '';
  };
}
ChatCtrl.$inject = ['$scope', 'socket'];

function ExchangeCtrl($scope, states, conversion) {
  $scope.conversion = conversion;

  states.on('convert', function(convert) {
    $scope.convert = convert;
  });
  states.on('currency', function(currency) {
    $scope.currency = currency;
  });
  states.on('news', function(news) {
    $scope.btce_ltcbtc = news.btce_ltcbtc.ticker.last;
    $scope.btce_ltcusd = news.btce_ltcusd.ticker.last;
    $scope.mtgox_btcusd = news.mtgox_btcusd.data.last_local.value;
  });

  conversion.convertLTC();
}

ExchangeCtrl.$inject = ['$scope', 'states', 'conversion'];

function RewardCtrl($scope, states) {
  $scope.convert = states.get('convert');
  $scope.currency = states.get('currency');
  states.on('convert', function(convert) {
    $scope.convert = convert;
  });
  states.on('currency', function(currency) {
    $scope.currency = currency;
  });
  states.on('news', function(news) {
    $scope.confirmed_rewards = news.ktr.confirmed_rewards;
    $scope.estimated_rewards = news.ktr.estimated_rewards;
    $scope.payout_history = news.ktr.payout_history;
  });
}
RewardCtrl.$inject = ['$scope', 'states'];

function MiningCtrl($scope, states) {
  $scope.convert = states.get('convert');
  $scope.alert_type = 'info';
  $scope.alert_head = 'Nothing.';
  $scope.alert_mesg = 'Waiting...';

  states.on('convert', function(convert) {
    $scope.convert = convert;
  });
  states.on('news', function(news) {
    $scope.hash_rate = news.ktr.hashrate;
    $scope.difficulty = news.gml_api.difficulty;
    $scope.weekly_income = 50 / ($scope.difficulty * 1) /
                           (Math.pow(2,48)/(Math.pow(2,16)-1)) *
                           Math.pow(10,6) * 60 * 60 * 24 * 7 * (637.0/1000.0);

    var running = true;
    for(var w in news.ktr.workers) {
      if(!news.ktr.workers[w].alive) {
        running = false;
        break;
      }
    }
    if(running) {
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
MiningCtrl.$inject = ['$scope', 'states'];

function UpdateCtrl($scope, updates) {
  updates.on(function(news) {
    $scope.last_news_time = (new Date()).getTime();
    $scope.last_fetch_time = news.last_fetch_time;
  });
}
UpdateCtrl.$inject = ['$scope', 'updates'];

function ConnCtrl($scope, socket) {
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
    $scope.connection_count = pack.connection_count;
  });
}
ConnCtrl.$inject = ['$scope', 'socket'];
