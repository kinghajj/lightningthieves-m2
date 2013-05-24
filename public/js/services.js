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
  factory('updates', ['$rootScope', 'socket', function($rootScope, socket) {
    var wrapper = {
      on: function(callback) {
        socket.on('news', function(news) {
          callback(news);
        });
      },
      update: function() {
        socket.emit('news');
      },
      fetch: function() {
        socket.emit('fetch');
      }
    };

    wrapper.update();
    setInterval(function() {
      wrapper.update();
    }, 60000);

    return wrapper;
  }]);
