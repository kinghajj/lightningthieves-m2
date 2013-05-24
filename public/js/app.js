'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('lightningthieves', ['lightningthieves.services']).
  config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]);
