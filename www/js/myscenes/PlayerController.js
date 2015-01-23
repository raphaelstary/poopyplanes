var PlayerController = (function () {
    "use strict";

    function PlayerController() {
    }

    PlayerController.prototype.move = function (player, xDelta) {
        player.forceX += xDelta;
    };

    return PlayerController;
})();