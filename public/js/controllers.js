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
  $scope.currency = 'LTC';

  $scope.last_btce_ltcbtc = 0;
  $scope.last_btce_ltcusd = 0;
  $scope.last_mtgox_btcusd = 0;
  $scope.confirmed_rewards = 0;
  $scope.estimated_rewards = 0;
  $scope.payout_history = 0;
  $scope.hash_rate = 0;
  $scope.difficulty = 0;
  $scope.weekly_income = 0;

  socket.on('news', function(news) {
    $scope.last_btce_ltcbtc = news.btce_ltcbtc.ticker.last;
    $scope.last_btce_ltcusd = news.btce_ltcusd.ticker.last;
    $scope.last_mtgox_btcusd = news.mtgox_btcusd.data.last_local.value;
    $scope.confirmed_rewards = news.ktr.confirmed_rewards;
    $scope.estimated_rewards = news.ktr.estimated_rewards;
    $scope.payout_history = news.ktr.payout_history;
    $scope.hash_rate = news.ktr.hashrate;
    $scope.difficulty = news.gml_api.difficulty;
  });

  setInterval(function() {
    socket.emit('news');
  }, 60000);
  socket.emit('news');
}
FetchCtrl.$inject = ['$scope', 'socket'];
