'use strict';

function ChatCtrl($scope, socket) {
  $scope.chat_lines = [];

  // listen for incoming messages
  socket.on('chat', function(pack) {
    // remember the message
    $scope.chat_lines.push(pack);
    // trim excess ones
    while($scope.chat_lines.length > 10) {
      $scope.chat_lines.shift();
    }
  });

  // broadcast a message
  $scope.chat = function() {
    // emit it
    socket.emit('chat', { msg: $scope.msg });
    // clear the chat input
    $scope.msg = '';
  };
}
ChatCtrl.$inject = ['$scope', 'socket'];

function FetchCtrl($scope, socket) {
  $scope.init = false;

  $scope.update = function() {
    socket.emit('news');
  };

  $scope.fetch = function() {
    socket.emit('fetch');
  };

  $scope.running = function() {
    if(!$scope.init)
      return;

    var workers = $scope.news.ktr.workers;
    for(var w in workers)
      if(!workers[w].alive)
        return false;
    return true;
  };

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

  socket.on('news', function(news) {
    $scope.init = true;
    $scope.news = news;
    $scope.last_news_time = (new Date()).getTime();
    $scope.weekly_income = 50 / (news.gml_api.difficulty * 1) /
                           (Math.pow(2,48)/(Math.pow(2,16)-1)) *
                           Math.pow(10,6) * 60 * 60 * 24 * 7 * (637.0/1000.0);
  });

  setInterval(function() {
    socket.emit('news');
  }, 60000);
  socket.emit('news');
}
FetchCtrl.$inject = ['$scope', 'socket'];
