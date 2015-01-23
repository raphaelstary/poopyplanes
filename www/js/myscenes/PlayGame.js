var PlayGame = (function (Event) {
    "use strict";

    function PlayGame(services) {
        this.stage = services.stage;
        this.events = services.events;
    }

    PlayGame.prototype.show = function (next) {

    };

    return PlayGame;
})(Event);