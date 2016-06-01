'use strict';

angular.module('mpk.codechallange', [
		'ui.router'
	])

	.config(['$urlRouterProvider', '$stateProvider',
		function($urlRouterProvider, $stateProvider) {

			$stateProvider.state('start', {
				url: '/start',
				templateUrl: 'app/start.html',
				controller: 'StartCtrl'
			});

			$urlRouterProvider.otherwise('/start');
		}
	])

	.controller('StartCtrl', ['$scope',
		function($scope) {
			$scope.title = 'Tic-tac-toe';
		}
	]);

	