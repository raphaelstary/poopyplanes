var PlayerController = (function (Math, Entity, Vectors) {
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
        var bullet = new Entity(bulletDrawable.x, bulletDrawable.y, player.rotation, bulletDrawable, bulletDrawable);
        bullet.flipHorizontally = player.flipHorizontally;
        this.bullets.push(bullet);
        var bulletMagnitude = 30;
        if (player.flipHorizontally) {
            bullet.forceX = Vectors.getX(0, bulletMagnitude, Math.PI - player.rotation);
            bullet.forceY = Vectors.getY(0, bulletMagnitude, Math.PI - player.rotation);
        } else {
            bullet.forceX = Vectors.getX(0, bulletMagnitude, player.rotation);
            bullet.forceY = Vectors.getY(0, bulletMagnitude, player.rotation);
        }
        bullet.shooter = player.id;
    };

    return PlayerController;
})(Math, Entity, Vectors);