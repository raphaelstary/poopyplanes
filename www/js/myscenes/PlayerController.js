var PlayerController = (function (Math, Entity) {
    "use strict";

    function PlayerController(bullets, stage, tileSize) {
        this.bullets = bullets;
        this.stage = stage;
        this.tileSize = tileSize;
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

        player.fireStop = 30;
        var bulletDrawable = this.stage.drawRectangle(player.x, player.y, this.tileSize, this.tileSize, 'red', true);
        var bullet = new Entity(bulletDrawable.x, bulletDrawable.y, 0, bulletDrawable, bulletDrawable);
        this.bullets.push(bullet);
        bullet.forceX = 30;
        bullet.forceY = 0;
        bullet.shooter = player.id;
    };

    return PlayerController;
})(Math, Entity);