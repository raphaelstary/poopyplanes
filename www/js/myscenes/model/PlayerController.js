var PlayerController = (function (Math, Entity, Vectors) {
    "use strict";

    function PlayerController(worldBuilder) {
        this.worldBuilder = worldBuilder;
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

    PlayerController.prototype.shoot = function (player) {
        if (player.fireStop > 0)
            return;

        player.fireStop = 15;
        this.worldBuilder.createBullet(player);
    };

    return PlayerController;
})(Math, Entity, Vectors);