var ChoosePlaneScreen = (function () {
    "use strict";

    function ChoosePlaneScreen(services) {
        this.stage = services.stage;
        this.events = services.events;
        this.timer = services.timer;
    }

    ChoosePlaneScreen.prototype.show = function (next) {
        var screenWidth = 1920;
        var screenHeight = 1080;
        var tileWidth = 20;
        var hasEnded = false;

        var aBtnListener = this.events.subscribe(Event.GAME_PAD, function (pad) {
            if (!hasEnded && pad.isStartPressed()) {
                hasEnded = true;
                endScene();
            }
        });

        var myName = this.stage.drawText(screenWidth / 2, screenHeight / 6, 'Raphael Stary', tileWidth * 4, 'Arial',
            'black');

        var presents = this.stage.drawText(screenWidth / 2, screenHeight / 3, 'presents', tileWidth * 2, 'Arial');
        var gameName = this.stage.drawText(screenWidth / 2, screenHeight / 2, 'POOPY PLANES', tileWidth * 6, 'Arial');

        var gameJamEdition = this.stage.drawText(screenWidth / 2, screenHeight / 2 + tileWidth * 6, "game jam edition",
            tileWidth * 2, 'Arial', 'darkgreen');

        var gameControls = this.stage.drawText(screenWidth / 2, screenHeight / 4 * 3, "press 'START' to continue",
            tileWidth * 2, 'Arial', 'darkblue');

        var self = this;

        function endScene() {
            self.stage.remove(myName);
            self.stage.remove(presents);
            self.stage.remove(gameName);
            self.stage.remove(gameJamEdition);
            self.stage.remove(gameControls);
            self.events.unsubscribe(aBtnListener);
            self.timer.doLater(next, 6);
        }
    };

    return ChoosePlaneScreen;
})();