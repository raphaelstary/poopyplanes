var World = (function (Math, Object, Vectors) {
    "use strict";

    function World(stage, players, scenery, bullets, ghosts, playerController, camera) {
        this.stage = stage;

        this.scenery = scenery;
        this.players = players;
        this.bullets = bullets;
        this.ghosts = ghosts;

        this.activePlayers = 0;

        this.playerController = playerController;

        this.camera = camera;

        this.gravity = 5;
    }

    World.prototype.handleGamePad = function (gamePad) {
        var wrapper = this.players[gamePad.index];
        if (!wrapper)
            return;
        var player = wrapper.entity;
        var bufferedControls = wrapper.controls;
        while (bufferedControls.length > 0)
            bufferedControls.pop();

        var xDelta = Math.abs(gamePad.getLeftStickXAxis()) < 0.3 ? 0 : Math.floor(gamePad.getLeftStickXAxis());
        if (xDelta != 0) {
            bufferedControls.push(this.playerController.move.bind(this.playerController, player, xDelta));
        }

        if (!wrapper.jumpPressed && gamePad.isAPressed()) {
            wrapper.jumpPressed = true;
            this.playerController.jump(player);
        } else if (wrapper.jumpPressed && !gamePad.isAPressed()) {
            wrapper.jumpPressed = false;
        }

        if (!wrapper.firePressed && gamePad.isRightTriggerPressed()) {
            wrapper.firePressed = true;
            this.playerController.shoot(player);
        } else if (wrapper.firePressed && !gamePad.isRightTriggerPressed()) {
            wrapper.firePressed = false;
        }
    };

    World.prototype.updatePlayerMovement = function () {
        Object.keys(this.players).forEach(function (playerKey) {
            var bufferedControls = this.players[playerKey].controls;
            bufferedControls.forEach(function (fn) {
                fn();
            });

            var player = this.players[playerKey].entity;

            var forceX = 0;
            var forceY = 0;

            // current - river upstream
            forceY += this.gravity;

            var airResistance = 0.9;
            player.forceX *= airResistance;
            player.forceY *= airResistance;

            forceX += player.forceX;
            forceY += player.forceY;

            if (forceY < 0 && player.rotation > -Math.PI / 8) {
                player.rotation -= 0.05;
            } else if (player.rotation < Math.PI / 8) {
                player.rotation += 0.02;
            }
            player.flipHorizontally = forceX < 0;

            player.lastX = player.x;
            player.lastY = player.y;

            player.x += Math.round(forceX);
            player.y += Math.round(forceY);

            if (player.fireStop > 0) {
                player.fireStop--;
            }
        }, this);
    };

    World.prototype.updateBulletMovement = function () {
        this.bullets.forEach(function (bullet) {
            var forceX = 0;
            var forceY = 0;

            // current - river upstream
            forceY += this.gravity;

            var airResistance = 0.99;
            bullet.forceX *= airResistance;
            bullet.forceY *= airResistance;

            forceX += bullet.forceX;
            forceY += bullet.forceY;

            bullet.lastX = bullet.x;
            bullet.lastY = bullet.y;

            bullet.x += Math.round(forceX);
            bullet.y += Math.round(forceY);
        }, this);
    };

    World.prototype.updateCamera = function () {
        this.scenery.forEach(function (obj) {
            this.camera.calcScreenPosition(obj);
        }, this);
        this.bullets.forEach(function (bullet) {
            this.camera.calcScreenPosition(bullet);
        }, this);
        Object.keys(this.players).forEach(function (playerKey) {
            var player = this.players[playerKey].entity;

            this.camera.calcScreenPosition(player);
        }, this);
    };

    World.prototype.checkBulletCollision = function () {
        this.bullets.forEach(function (bullet, index, bulletArray) {
            var bulletWidthHalf = bullet.collision.getWidthHalf();
            var bulletHeightHalf = bullet.collision.getHeightHalf();

            Object.keys(this.players).forEach(function (playerKey) {
                if (playerKey == bullet.shooter)
                    return;

                var player = this.players[playerKey].entity;
                var widthHalf = player.collision.getWidthHalf();
                var heightHalf = player.collision.getHeightHalf();

                if (player.x + widthHalf > bullet.x - bulletWidthHalf &&
                    player.x - widthHalf < bullet.x + bulletWidthHalf &&
                    player.y + heightHalf > bullet.y - bulletHeightHalf &&
                    player.y - heightHalf < bullet.y + bulletHeightHalf) {

                    this.removeBullet(bullet, index, bulletArray);
                    this.killPlane(player, playerKey);
                }
            }, this);
        }, this);
    };

    World.prototype.checkCollisions = function () {
        this.scenery.forEach(function (element) {
            this.bullets.forEach(function (bullet, index, bulletsArray) {
                var widthHalf = bullet.collision.getWidthHalf();
                var heightHalf = bullet.collision.getHeightHalf();
                if (bullet.x + widthHalf > element.getCornerX() && bullet.x - widthHalf < element.getEndX() &&
                    bullet.y + heightHalf > element.getCornerY() && bullet.y - heightHalf < element.getEndY()) {

                    this.removeBullet(bullet, index, bulletsArray);
                }
            }, this);

            Object.keys(this.players).forEach(function (playerKey) {
                var player = this.players[playerKey].entity;

                var widthHalf = player.collision.getWidthHalf();
                var heightHalf = player.collision.getHeightHalf();
                if (player.x + widthHalf > element.getCornerX() && player.x - widthHalf < element.getEndX() &&
                    player.y + heightHalf > element.getCornerY() && player.y - heightHalf < element.getEndY()) {

                    player.rotation = 0;

                    var elemHeightHalf = element.collision.getHeightHalf();
                    var elemWidthHalf = element.collision.getWidthHalf();
                    var b4_y = element.y + elemHeightHalf;
                    var b1_y = element.y - elemHeightHalf;
                    var b4_x = element.x - elemWidthHalf;
                    var b1_x = b4_x;
                    var b2_x = element.x + elemWidthHalf;
                    var b3_x = b2_x;
                    var b2_y = b1_y;
                    var b3_y = b4_y;

                    var p;

                    // Now compare them to know the side of collision
                    if (player.lastX + widthHalf <= element.x - elemWidthHalf &&
                        player.x + widthHalf > element.x - elemWidthHalf) {

                        // Collision on right side of player
                        p = Vectors.getIntersectionPoint(player.lastX + widthHalf, player.lastY,
                            player.x + widthHalf, player.y, b1_x, b1_y, b4_x, b4_y);
                        player.x = p.x - widthHalf;
                        player.forceX = 0;

                    } else if (player.lastX - widthHalf >= element.x + elemWidthHalf &&
                        player.x - widthHalf < element.x + elemWidthHalf) {

                        // Collision on left side of player
                        p = Vectors.getIntersectionPoint(player.lastX - widthHalf, player.lastY,
                            player.x - widthHalf, player.y, b2_x, b2_y, b3_x, b3_y);
                        player.x = p.x + widthHalf;
                        player.forceX = 0;
                    } else if (player.lastY + heightHalf <= element.y - elemHeightHalf &&
                        player.y + heightHalf > element.y - elemHeightHalf) {

                        // Collision on bottom side of player
                        p = Vectors.getIntersectionPoint(player.lastX, player.lastY + heightHalf, player.x,
                            player.y + heightHalf, b1_x, b1_y, b2_x, b2_y);
                        player.y = p.y - heightHalf;
                        player.forceY = 0;
                    } else {
                        // Collision on top side of player
                        p = Vectors.getIntersectionPoint(player.lastX, player.lastY - heightHalf, player.x,
                            player.y - heightHalf, b3_x, b3_y, b4_x, b4_y);
                        player.y = p.y + heightHalf;
                        player.forceY = 0;
                    }
                }
            }, this);
        }, this);
    };

    World.prototype.removeBullet = function (bullet, index, bulletArray) {
        this.stage.remove(bullet.collision);
        this.stage.remove(bullet.sprite);
        bulletArray.splice(index, 1);
    };

    World.prototype.killPlane = function (player, key) {
        this.activePlayers--;
        //self.stage.remove(player.collision);
        delete this.players[key];

        this.ghosts.push(player.sprite);
        player.sprite.alpha = 0.2;
    };

    World.prototype.nuke = function () {
        var self = this;
        function remove(entity) {
            self.stage.remove(entity.collision);
            self.stage.remove(entity.sprite);
        }
        Object.keys(this.players).forEach(function (playerKey) {
            var player = this.players[playerKey].entity;

            remove(player);
        }, this);
        this.scenery.forEach(remove);
        this.bullets.forEach(remove);
        this.ghosts.forEach(this.stage.remove.bind(this.stage));
    };

    return World;
})(Math, Object, Vectors);