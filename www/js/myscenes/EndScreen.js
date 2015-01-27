var EndScreen = (function () {
    "use strict";

    function EndScreen(services) {
        this.stage = services.stage;
        this.events = services.events;
        this.timer = services.timer;
        this.sceneStorage = services.sceneStorage;
    }

    EndScreen.prototype.show = function (next) {
        var screenWidth = 1920;
        var screenHeight = 1080;
        var tileWidth = 20;
        var hasEnded = false;

        var aBtnListener = this.events.subscribe(Event.GAME_PAD, function (pad) {
            if (!hasEnded && (pad.isAPressed() || pad.isStartPressed())) {
                hasEnded = true;
                endScene();
            }
        });

        var winnerTitel = this.stage.drawText(screenWidth / 2, screenHeight / 6, 'Winner:', tileWidth * 4, 'Arial',
            'black');

        var winnerName = this.stage.drawText(screenWidth / 2, screenHeight / 2, this.sceneStorage.winner, tileWidth * 6, 'Arial');

        var gameControls = this.stage.drawText(screenWidth / 2, screenHeight / 4 * 3, "press 'START' to play again",
            tileWidth * 2, 'Arial', 'darkblue');

        var self = this;

        function endScene() {
            self.stage.remove(winnerTitel);
            self.stage.remove(winnerName);
            self.stage.remove(gameControls);
            self.events.unsubscribe(aBtnListener);
            self.timer.doLater(next, 6);
        }
    };

    return EndScreen;
})();