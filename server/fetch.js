var spawn = require('child_process').spawn;

// wait this long between fetches
var server_fetch_delay = 60000 * 5;
// don't fetch more often than this
var server_fetch_min_delay = 60000;

function curl(url) {
  return spawn('curl', [url]);
}

function err_handler(err) {
  console.log(err);
}

/* Manage fetching and delivering data from JSON APIs. */
function Fetch() {
  var self = this;

  this.tracked_jsons = [
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
  this.last_fetch_time = undefined;

  // fetch from sources and update local copies
  this.fetch = function(force) {
    // don't fetch too often, unless this is part of the main fetch loop.
    if(!force && this.last_fetch_time && (new Date()).getTime() - this.last_fetch_time < server_fetch_min_delay) {
      return;
    }

    for(var i in this.tracked_jsons) {
      var fetch = curl(this.tracked_jsons[i].url);
      fetch.on('error', err_handler);
      (function(i) {
        fetch.stdout.on('data', function(data) {
          self.tracked_jsons[i].last = JSON.parse(data);
        });
      })(i);
    }

    this.last_fetch_time = (new Date()).getTime();
  }

  // emit latest data
  this.news = function(socket) {
    var bundle = { last_fetch_time: last_fetch_time };
    for(var i in this.tracked_jsons) {
      if(this.tracked_jsons[i].last) {
        bundle[this.tracked_jsons[i].name] = this.tracked_jsons[i].last;
      }
    }
    socket.emit('news', bundle);
  }

  // initialize fetch functionality on the socket
  this.initialize = function(conn, socket) {
    // you can ask for news
    socket.on('news', function() {
      this.news(socket);
    });
    // or ask for a fetch
    socket.on('fetch', function() {
      this.fetch();
      this.news(socket);
    });
  }

  // peridoically fetch again
  setInterval(this.fetch, server_fetch_delay, true);
  this.fetch(true);
}

module.exports = Fetch;
