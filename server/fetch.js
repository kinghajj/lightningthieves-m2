var spawn = require('child_process').spawn;

// wait self long between fetches
var server_fetch_delay = 60000 * 5;

function curl(url) {
  return spawn('curl', [url]);
}

function err_handler(err) {
  console.log(err);
}

/* Manage fetching and delivering data from JSON APIs. */
function Fetch(conn) {
  var self = this;

  self.tracked_jsons = [
    {
      name: 'ktr',
      url:  'http://ltc.kattare.com/api.php?api_key=64b0fea666d47d5dd5ec5d609b0ae5925200626b495359c52ccdc18eb7ff3369'
    },
    {
      name: 'mtgox_btcusd',
      url:  'https://data.mtgox.com/api/2/BTCUSD/money/ticker'
    },
    {
      name: 'btce_ltcusd',
      url:  'https://btc-e.com/api/2/ltc_usd/ticker'
    },
    {
      name: 'btce_ltcbtc',
      url:  'https://btc-e.com/api/2/ltc_btc/ticker'
    },
    {
      name: 'gml_api',
      url:  'https://give-me-ltc.com/api'
    },
  ];
  self.last_fetch_time = undefined;

  // fetch from sources and update local copies
  self.fetch = function() {
    for(var i in self.tracked_jsons) {
      var fetch = curl(self.tracked_jsons[i].url);
      fetch.on('error', err_handler);
      (function(i) {
        fetch.stdout.on('data', function(data) {
          self.tracked_jsons[i].last = JSON.parse(data);
        });
      })(i);
    }

    self.last_fetch_time = (new Date()).getTime();
  };

  // emit latest data
  self.news = function(conn) {
    var bundle = { last_fetch_time: self.last_fetch_time };
    for(var i in self.tracked_jsons) {
      if(self.tracked_jsons[i].last) {
        bundle[self.tracked_jsons[i].name] = self.tracked_jsons[i].last;
      }
    }
    conn.sockets.emit('news', bundle);
  };

  // initialize functionality on the socket
  self.initialize = function(conn, socket) {
    self.news(conn);
  };

  self.fetch();
  setTimeout(self.news, 1000, conn);
  setInterval(function() {
    self.fetch();
    setTimeout(self.news, 1000, conn);
  }, server_fetch_delay);
}

module.exports = Fetch;
