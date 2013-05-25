'use strict';

angular.module('lightningthieves.services', []).
  value('version', '0.1').
  factory('socket', function($rootScope) {
    var socket = io.connect();

    var wrapper = {
      on: function(eventName, callback) {
        socket.on(eventName, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        socket.emit(eventName, data, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      },
    };

    return wrapper;
  }).
  factory('states', function($rootScope) {
    var states = {};

    function trigger(name) {
      var callbacks = states[name].callbacks;
      for(var i = 0; i < callbacks.length; i++) {
        callbacks[i](states[name].data);
      }
    }

    var wrapper = {
      get: function(name) {
        if(states[name]) {
          return states[name].data;
        }
      },
      put: function(name, data) {
        if(!states[name]) {
          states[name].callbacks = [];
        }
        states[name].data = data;
        trigger(name);
      },
      listen: function(name, source, event) {
        source.on(event, function(data) {
          wrapper.put(name, data);
        });
      },
      on: function(name, callback) {
        if(states[name]) {
          states[name].callbacks.push(callback);
        } else {
          states[name] = { data: undefined, callbacks: [callback] };
        }
      }
    };

    return wrapper;
  }).
  factory('updates', ['$rootScope', 'socket', 'states',
    function($rootScope, socket, states) {
      states.listen('news', socket, 'news');

      return {
        on: function(callback) {
          states.on('news', callback);
        },
      };
    }]).
  factory('conversion', ['$rootScope', 'states', function($rootScope, states) {
    var btce_ltcbtc = 0;
    var btce_ltcusd = 0;
    var mtgox_btcusd = 0;

    states.on('news', function(news) {
      btce_ltcbtc = news.btce_ltcbtc.ticker.last;
      btce_ltcusd = news.btce_ltcusd.ticker.last;
      mtgox_btcusd = news.mtgox_btcusd.data.last_local.value;
    });

    return {
      convertLTC: function() {
        states.put('currency', 'LTC');
        states.put('convert', function(p) {
          return p;
        });
      },
      convertBTCeBTC: function() {
        states.put('currency', 'BTC');
        states.put('convert', function(p) {
          return p * btce_ltcbtc;
        });
      },
      convertBTCeUSD: function() {
        states.put('currency', 'USD');
        states.put('convert', function(p) {
          return p * btce_ltcusd;
        });
      },
      convertMtGoxUSD: function() {
        states.put('currency', 'USD');
        states.put('convert', function(p) {
          return p * btce_ltcbtc * mtgox_btcusd;
        });
      }
    };
  }]);
