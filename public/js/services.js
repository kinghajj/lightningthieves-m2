'use strict';

angular.module('lightningthieves.services', []).
  value('version', '0.1').
  factory('socket', function($rootScope) {
    var connected = false, conn_err = false;
    var socket = io.connect();
    socket.on('connect', function() {
      connected = true;
    });
    socket.on('error', function() {
      conn_err = true;
      connected = false;
    });
    return {
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
      connected: function() {
        return connected;
      },
      conn_err: function() {
        return conn_err;
      }
    };
  });
