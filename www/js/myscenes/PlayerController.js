var PlayerController = (function () {
    "use strict";

    function PlayerController() {
    }

    PlayerController.prototype.move = function (player, xDelta) {
        player.forceX += xDelta;
    };

    PlayerController.prototype.jump = function (player) {
        player.forceY -= 50;
    };

    return PlayerController;
})();