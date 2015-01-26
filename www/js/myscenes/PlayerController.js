var PlayerController = (function (Math) {
    "use strict";

    function PlayerController() {
    }

    var maxAcceleration = 5;

    PlayerController.prototype.move = function (player, xDelta) {
        if (Math.abs(player.forceX) < maxAcceleration) {
            player.forceX += xDelta/2;
        }
    };

    PlayerController.prototype.jump = function (player) {
        player.forceY -= 15;
    };

    return PlayerController;
})(Math);