var PlayGame = (function (Event, Math, PlayerController, Entity, Vectors) {
    "use strict";

    function PlayGame(services) {
        this.stage = services.stage;
        this.events = services.events;
    }

    PlayGame.prototype.show = function (next) {
        var self = this;

        var width = 1920;
        var height = 1080;
        var tileHeight = 20;

        var groundTile = this.stage.drawRectangle(width / 2, height / 2, width / 3 * 2, tileHeight, 'black');
        var jumpTileOne = this.stage.drawRectangle(width / 3, height / 4, width / 4, tileHeight, 'black');
        var jumpTileTwo = this.stage.drawRectangle(width / 3 * 2, height / 4, width / 4, tileHeight, 'black');
        var baseGroundTile = this.stage.drawRectangle(width / 2, height / 4 * 3, width, tileHeight, 'black');
        var baseFire = this.stage.drawRectangle(width / 2, height / 4 * 3 - tileHeight * 2, width / 8, tileHeight * 4,
            'red');

        var scenery = [
            new Entity(groundTile.x, groundTile.y, 0, groundTile, groundTile),
            new Entity(jumpTileOne.x, jumpTileOne.y, 0, jumpTileOne, jumpTileOne),
            new Entity(jumpTileTwo.x, jumpTileTwo.y, 0, jumpTileTwo, jumpTileTwo),
            new Entity(baseGroundTile.x, baseGroundTile.y, 0, baseGroundTile, baseGroundTile),
            new Entity(baseFire.x, baseFire.y, 0, baseFire, baseFire)
        ];

        var startX = jumpTileOne.x;
        var startY = jumpTileOne.y - tileHeight * 3;
        var playerWidth = tileHeight * 2;
        var playerHeight = tileHeight * 5;

        var gravity = 10;

        var players = {
            0: {
                entity: createPlayer(startX, startY),
                controls: [],
                jumpPressed: false
            },
            1: {
                entity: createPlayer(startX, startY),
                controls: [],
                jumpPressed: false
            },
            2: {
                entity: createPlayer(startX, startY),
                controls: [],
                jumpPressed: false
            },
            3: {
                entity: createPlayer(startX, startY),
                controls: [],
                jumpPressed: false
            }
        };

        function createPlayer(x, y) {
            var sprite = self.stage.drawRectangle(x, y, tileHeight * 2, tileHeight * 4, 'blue');
            return new Entity(x, y, 0, sprite, sprite);
        }

        var viewPort = {
            x: width / 2,
            y: height / 2,
            width: width,
            height: height,
            scale: 1,
            getCornerX: function () {
                return Math.floor(this.x - this.width * this.scale / 2);
            },
            getCornerY: function () {
                return Math.floor(this.y - this.height * this.scale / 2);
            },
            getEndX: function () {
                return Math.floor(this.x + this.width * this.scale / 2);
            },
            getEndY: function () {
                return Math.floor(this.y + this.height * this.scale / 2);
            }
        };

        var playerController = new PlayerController();

        var gamePadListener = this.events.subscribe(Event.GAME_PAD, function (gamePad) {
            var wrapper = players[gamePad.index];
            var player = wrapper.entity;
            var bufferedControls = wrapper.controls;
            while (bufferedControls.length > 0)
                bufferedControls.pop();

            var xDelta = Math.abs(gamePad.getLeftStickXAxis()) < 0.3 ? 0 : Math.floor(gamePad.getLeftStickXAxis());
            if (xDelta != 0) {
                bufferedControls.push(playerController.move.bind(playerController, player, xDelta));
            }

            if (!wrapper.jumpPressed && gamePad.isAPressed()) {
                wrapper.jumpPressed = true;
                playerController.jump(player);
            } else if (wrapper.jumpPressed && !gamePad.isAPressed()) {
                wrapper.jumpPressed = false;
            }

            //if (gamePad.getRightTrigger() > 0.3) {
            //    var magnitude = Math.sqrt(gamePad.getRightStickXAxis() * gamePad.getRightStickXAxis() +
            //    gamePad.getRightStickYAxis() * gamePad.getRightStickYAxis());
            //    bufferedControls.push(
            //        __fire.bind(null, player, gamePad.getRightStickXAxis() / magnitude * 30,
            //            gamePad.getRightStickYAxis() / magnitude * 30)
            //    );
            //}
        });

        var movePlayerListener = this.events.subscribe(Event.TICK_MOVE, function () {
            Object.keys(players).forEach(function (playerKey) {
                var bufferedControls = players[playerKey].controls;
                bufferedControls.forEach(function (fn) {
                    fn();
                });

                var player = players[playerKey].entity;

                var forceX = 0;
                var forceY = 0;

                // current - river upstream
                forceY += gravity;

                var airResistance = 0.8;
                player.forceX *= airResistance;
                player.forceY *= airResistance;

                forceX += player.forceX;
                forceY += player.forceY;

                player.lastX = player.x;
                player.lastY = player.y;

                player.x += Math.round(forceX);
                player.y += Math.round(forceY);
            });
        });

        var moveBulletsListener = this.events.subscribe(Event.TICK_MOVE, function () {

        });

        var wallCollisionListener = this.events.subscribe(Event.TICK_COLLISION, function () {
            scenery.forEach(function (element) {
                Object.keys(players).forEach(function (playerKey) {
                    var player = players[playerKey].entity;

                    var widthHalf = player.collision.getWidthHalf();
                    var heightHalf = player.collision.getHeightHalf();
                    if (player.x + widthHalf > element.getCornerX() && player.x - widthHalf < element.getEndX() &&
                        player.y + heightHalf > element.getCornerY() && player.y - heightHalf < element.getEndY()) {

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
                });
            });
        });

        var cameraListener = this.events.subscribe(Event.TICK_CAMERA, function () {
            scenery.forEach(function (obj) {
                calcScreenPosition(obj);
            });
            Object.keys(players).forEach(function (playerKey) {
                var player = players[playerKey].entity;

                calcScreenPosition(player);
            });
        });

        function calcScreenPosition(entity) {
            if (entity.getEndX() < viewPort.getCornerX() || entity.getCornerX() > viewPort.getEndX() ||
                entity.getEndY() < viewPort.getCornerY() || entity.getCornerY() > viewPort.getEndY()) {

                entity.sprite.show = false;
                if (entity.debug) {
                    if (entity.direction) {
                        entity.direction.show = false;
                    }
                    if (entity.collision) {
                        entity.collision.show = false;
                    }
                }
                return;
            }

            entity.sprite.show = true;

            entity.sprite.x = entity.x - viewPort.getCornerX() * viewPort.scale;
            entity.sprite.y = entity.y - viewPort.getCornerY() * viewPort.scale;
            entity.sprite.rotation = entity.rotation;
            entity.sprite.scale *= viewPort.scale;

            if (entity.debug) {
                if (entity.direction) {
                    entity.direction.show = true;
                    entity.direction.x = entity.sprite.x;
                    entity.direction.y = entity.sprite.y;
                    entity.direction.rotation = entity.sprite.rotation;
                }
                if (entity.collision) {
                    entity.collision.show = true;
                    entity.collision.x = entity.sprite.x;
                    entity.collision.y = entity.sprite.y;
                }
            }
        }
    };

    return PlayGame;
})(Event, Math, PlayerController, Entity, Vectors);