var EndScreen = (function (Event, Object, GameMode) {
    "use strict";

    function EndScreen(services) {
        this.stage = services.stage;
        this.events = services.events;
        this.timer = services.timer;
        this.sceneStorage = services.sceneStorage;
    }

    EndScreen.prototype.show = function (next) {
        var self = this;

        var screenWidth = 1920;
        var screenHeight = 1080;
        var tileWidth = 20;
        var hasEnded = false;
        var twoStepped = false;

        var aBtnListener = this.events.subscribe(Event.GAME_PAD, function (pad) {
            if (!twoStepped && pad.isStartPressed()) {
                twoStepped = true;
                showLastMatch();
            } else if (!hasEnded && pad.isStartPressed()) {
                hasEnded = true;
                endScene();
            }
        });

        if (!self.sceneStorage.matches)
            self.sceneStorage.matches = [];
        var matches = self.sceneStorage.matches;
        var lastMatch = self.sceneStorage.lastMatch;
        var mode = self.sceneStorage.gameMode;
        var playerColors = self.sceneStorage.playerColors;

        var playerDrawables = {};
        var playerTotalScore = {};
        function initPlayerScore(playerKey) {
            if (playerTotalScore[playerKey] === undefined) {
                playerTotalScore[playerKey] = 0;
            }
        }
        var startY = screenHeight / 8 * 2;
        var offSetY = screenHeight / 8;

        matches.forEach(addMatchScore);

        function addMatchScore(match) {
            if (mode.gameMode == GameMode.LAST_PLANE_FLYING) {
                initPlayerScore(match.winner);
                playerTotalScore[match.winner]++;
            } else if (mode.gameMode == GameMode.DEATH_MATCH) {
                Object.keys(match.kills).forEach(function (playerKey) {
                    initPlayerScore(playerKey);
                    playerTotalScore[playerKey] += match.kills[playerKey];
                });
                Object.keys(match.suicides).forEach(function (playerKey) {
                    initPlayerScore(playerKey);
                    playerTotalScore[playerKey]--;
                });
            }
        }

        Object.keys(playerColors).forEach(function (playerKey) {
            var playerColor = playerColors[playerKey];
            startY += offSetY;
            initPlayerScore(playerKey);
            playerDrawables[playerKey] = {
                name: self.stage.drawText(screenWidth / 3, startY, playerColor, tileWidth * 3, 'Arial'),
                score: self.stage.drawText(screenWidth / 3 * 2, startY, playerTotalScore[playerKey].toString(), tileWidth * 2, 'Arial')
            };
        });

        var gameControls = this.stage.drawText(screenWidth / 2, screenHeight / 8 * 7, "press 'START' to show new score",
            tileWidth * 2, 'Arial', 'darkblue');

        function showLastMatch() {
            gameControls.data.msg = "press 'START' to play again";

            addMatchScore(lastMatch);
            var highestScore = 0;
            var highestColor;
            Object.keys(playerDrawables).forEach(function (playerKey) {
                if (playerTotalScore[playerKey] > highestScore) {
                    highestScore = playerTotalScore[playerKey];
                    highestColor = playerColors[playerKey];
                }
                playerDrawables[playerKey].score.data.msg = playerTotalScore[playerKey].toString();
            });

            if (mode.kills <= highestScore) {
                gameControls.data.msg = highestColor + " won the game! 'refresh' to play again";
                self.events.unsubscribe(aBtnListener);
            }
        }

        function endScene() {
            matches.push(lastMatch);
            Object.keys(playerDrawables).forEach(function (playerKey) {
                self.stage.remove(playerDrawables[playerKey].name);
                self.stage.remove(playerDrawables[playerKey].score);
            });

            self.stage.remove(gameControls);
            self.events.unsubscribe(aBtnListener);
            self.timer.doLater(next, 6);
        }
    };

    return EndScreen;
})(Event, Object, GameMode);