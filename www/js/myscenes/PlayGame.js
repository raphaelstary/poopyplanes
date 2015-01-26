var PlayGame = (function (Event, Math, PlayerController, Entity, Vectors, range) {
    "use strict";

    function PlayGame(services) {
        this.stage = services.stage;
        this.events = services.events;
    }

    PlayGame.prototype.show = function (next) {
        var self = this;

        var screenWidth = 1920;
        var screenHeight = 1080;
        var tileHeight = 20;

        var wallLeft = this.stage.drawRectangle(tileHeight, screenHeight / 2, tileHeight * 2, screenHeight, 'grey',
            true);
        var wallRight = this.stage.drawRectangle(screenWidth - tileHeight, screenHeight / 2, tileHeight * 2,
            screenHeight, 'grey', true);
        var wallTop = this.stage.drawRectangle(screenWidth / 2, tileHeight, screenWidth, tileHeight * 2, 'grey', true);
        var wallBottom = this.stage.drawRectangle(screenWidth / 2, screenHeight - tileHeight, screenWidth,
            tileHeight * 2, 'grey', true);
        var cloud1 = this.stage.drawRectangle(screenWidth / 2, screenHeight / 6, tileHeight * 20, tileHeight * 10,
            'grey', true);
        var cloud2 = this.stage.drawRectangle(screenWidth / 2, screenHeight / 6 * 5, tileHeight * 20, tileHeight * 10,
            'grey', true);
        var cloud3 = this.stage.drawRectangle(screenWidth / 6, screenHeight / 2, tileHeight * 20, tileHeight * 10,
            'grey', true);
        var cloud4 = this.stage.drawRectangle(screenWidth / 6 * 5, screenHeight / 2, tileHeight * 20, tileHeight * 10,
            'grey', true);

        function createEntity(drawable) {
            return new Entity(drawable.x, drawable.y, 0, drawable, drawable);
        }

        var scenery = [
            createEntity(wallTop),
            createEntity(wallBottom),
            createEntity(wallLeft),
            createEntity(wallRight),
            createEntity(cloud1),
            createEntity(cloud2),
            createEntity(cloud3),
            createEntity(cloud4)
        ];

        var startPositions = [
            {
                x: screenWidth / 6,
                y: screenHeight / 6
            },
            {
                x: screenWidth / 6 * 5,
                y: screenHeight / 6
            },
            {
                x: screenWidth / 6,
                y: screenHeight / 6 * 5
            },
            {
                x: screenWidth / 6 * 5,
                y: screenHeight / 6 * 5
            }
        ];

        function getStartPosition() {
            var randomIndex = range(0, startPositions.length - 1);
            return startPositions.splice(randomIndex, 1).pop();
        }

        var gravity = 5;
        //var maxAcceleration = 20;

        var players = {
            0: {
                entity: createPlayer(getStartPosition()),
                controls: [],
                jumpPressed: false
            },
            1: {
                entity: createPlayer(getStartPosition()),
                controls: [],
                jumpPressed: false
            },
            2: {
                entity: createPlayer(getStartPosition()),
                controls: [],
                jumpPressed: false
            },
            3: {
                entity: createPlayer(getStartPosition()),
                controls: [],
                jumpPressed: false
            }
        };

        function createPlayer(startPosition) {
            var sprite = self.stage.drawRectangle(startPosition.x, startPosition.y, tileHeight * 2, tileHeight,
                'blue');
            return new Entity(startPosition.x, startPosition.y, 0, sprite, sprite);
        }

        var viewPort = {
            x: screenWidth / 2,
            y: screenHeight / 2,
            width: screenWidth,
            height: screenHeight,
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

                var airResistance = 0.9;
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
})(Event, Math, PlayerController, Entity, Vectors, range);