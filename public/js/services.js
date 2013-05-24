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
      connected: false,
      conn_err: false
    };

    socket.on('connect', function() {
      wrapper.connected = true;
    });
    socket.on('error', function() {
      wrapper.conn_err = true;
      wrapper.connected = false;
    });

    return wrapper;
  });
