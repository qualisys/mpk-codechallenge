'use strict';

angular.module('mpk.codechallange', [
		'ui.router'
	])

	// The maximum number of squares in a row/col on the board.
	// E.g. 3 means the board will be 3x3 squares.
	.constant('MAX_SQUARES', 3)
	.constant('NUM_PLAYERS', 2)

	// Initiate the gameScore object.
	.service('gameScore', function(MAX_SQUARES, NUM_PLAYERS) {

		// Calc the "lines" that can make a player win.
		this.winLines = [];

		// Add horizontal winlines.
		for (var y = 0; y < MAX_SQUARES; y++) {
			var hlines = [];
			for (var x = 0; x < MAX_SQUARES; x++) {
				hlines.push({ x: x, y: y });
			}
			this.winLines.push(hlines);
		}

		// Add diagonal winline.
		var dlines = [];
		for (var i = 0; i < MAX_SQUARES; i++) {
			dlines.push({ x: i, y: i });
		}
		this.winLines.push(dlines);

		// Add reverse-diagonal winline.
		var rdlines = [];
		for (var i = 0; i < MAX_SQUARES; i++) {
			rdlines.push({ x: i, y: MAX_SQUARES - i - 1 });
		}
		this.winLines.push(rdlines);

		// Add verical winlines.
		for (var x = 0; x < MAX_SQUARES; x++) {
			var vlines = [];
			for (var y = 0; y < MAX_SQUARES; y++) {
				vlines.push({ x: x, y: y });
			}
			this.winLines.push(vlines);
		}

		// Creates/resets score marks which are used to calculate who wins.
		this.clearScore = function() {
			// scoreMarks is a list of integers to keep track of how
			// close a player is to win. When a player has a line with
			// a score equal to maxSquares the player has won.
			this.scoreMarks = [];
			for (var i = 0; i < NUM_PLAYERS; i++) {
				this.scoreMarks.push(
					Array(this.winLines.length).fill(0)
				);
			}
		}

		// Create a 0 score for each player.
		this.winnings = Array(NUM_PLAYERS).fill(0)

		this.addMark = function(player, x, y) {
			// Add score marks per matching winLine "coordinate".
			for (var i = 0; i < this.winLines.length; i++) {
				//f (angular.equals({x: x, y: y}, this.winLines[i])) {
				if (this.winLines[i].find(function(e) { return e.x == x && e.y == y; }) !== undefined) {
					// x,y matches a "coordinate" in a win line.
					this.scoreMarks[player][i]++;
				}
			}
		}

		this.hasWon = function(player) {
			// Check if some scoreMark >= MAX_SQUARES.
			return this.scoreMarks[player].some(function(score) {
				return score >= MAX_SQUARES;
			});
		}
	})

	.config(['$urlRouterProvider', '$stateProvider',
		function($urlRouterProvider, $stateProvider) {
			$stateProvider
				.state('start', {
					url: '/start',
					templateUrl: 'app/start.html',
					controller: 'StartCtrl'
				})
				.state('game', {
					url: '/game',
					templateUrl: 'app/game.html',
					controller: 'GameCtrl'
				});

			$urlRouterProvider.otherwise('/start');
		}
	])

	.controller('StartCtrl', ['$scope', '$state',
		function($scope, $state) {
			$scope.title = 'Tic-tac-toe';

			$scope.start = function(form) {
				if (form.$valid) {
					$state.go("game");
				}
			};
		}
	])
	.controller('GameCtrl', ['$scope', '$state', 'gameScore', 'MAX_SQUARES', 'NUM_PLAYERS',
		function($scope, $state, gameScore, MAX_SQUARES, NUM_PLAYERS) {
			$scope.title = 'Tic-tac-toe';
			var currentPlayer = 0;
			$scope.getCurrentPlayer = function() {
				return currentPlayer + 1;
			}

			var gameIsOver = false;
			$scope.isGameOver = function() {
				return gameIsOver;
			}

			$scope.playAgain = function(form) {
				if (form.$valid) {
					$state.reload();
				}
			};

			// We need maxSquares availible in game.html
			$scope.maxSquares = MAX_SQUARES;

			// Set up a new playing board.
			var createSquares = function() {
				var squares = [];
				for (var x = 0; x < MAX_SQUARES; x++) {
					for (var y = 0; y < MAX_SQUARES; y++) {
						squares.push({ x: x, y: y, played: null });
					}
				}
				return squares; 
			}
			$scope.squares = createSquares();

			// We need to clear the scores (i.e. how close a pleyer is to win)
			// before we start a new game.
			gameScore.clearScore();

			var getNextPlayer = function() {
				var curPlayer = currentPlayer + 1;
				// Start at player 0 (first player) if we are at the last player.
				return curPlayer > NUM_PLAYERS - 1 ? 0 : curPlayer;
			}

			$scope.playSquare = function(square) {
				if (gameIsOver) {
					return;
				}

				// Find index if the square is unplayed.
				var index = $scope.squares.findIndex(function(e) {
					return this.x == e.x && this.y == e.y && e.played == null;
				}, square);

				if (index == -1) {
					return;
				}
				
				// Set this square as played.
				$scope.squares[index].played = currentPlayer;

				// Add marked square to score marks, so we later can
				// calculate who wins.
				gameScore.addMark(
					currentPlayer,
					$scope.squares[index].x,
					$scope.squares[index].y
				);

				if (gameScore.hasWon(currentPlayer)) {
					// See if current player have won.
					$scope.title = "Player " + $scope.getCurrentPlayer() + " wins!";
					gameIsOver = true;
					gameScore.winnings[currentPlayer]++;

				} else if ($scope.squares.every(function(square) {	return square.played !== null; })) {
					// See if game is over because all squares are filled, i.e. a draw.
					$scope.title = "Draw! Nobody wins"
					gameIsOver = true;
				}

				// Switch to the next player.
				currentPlayer = getNextPlayer();
			}

			// Get the index of the player that played this square, or null.
			$scope.getPlayed = function(square) {
				var value = $scope.squares.find(function(e) {
					return this.x == e.x && this.y == e.y;
				}, square);

				// Return player index or null.
				return value.played;
			}

			$scope.getWinnings = function() {
				return gameScore.winnings;
			}

		}
	]);

