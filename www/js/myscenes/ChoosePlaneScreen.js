var ChoosePlaneScreen = (function (Event, createWorld) {
    "use strict";

    function ChoosePlaneScreen(services) {
        this.stage = services.stage;
        this.events = services.events;
        this.timer = services.timer;
        this.sceneStorage = services.sceneStorage;
    }

    ChoosePlaneScreen.prototype.show = function (next) {
        var screenWidth = 1920;
        var screenHeight = 1080;
        var tileHeight = 20;
        var hasEnded = false;

        var worldWrapper = createWorld(this.stage, screenWidth, screenHeight, tileHeight);
        var world = worldWrapper.world;
        var worldBuilder = worldWrapper.worldBuilder;
        worldBuilder.createDefaultWalls();
        var colorClouds = worldBuilder.createChoosePlane();
        worldBuilder.initDefaultPlayers(worldBuilder.getDefaultMenuPositionPoints());

        var gamePadListener = this.events.subscribe(Event.GAME_PAD, world.handleGamePad.bind(world));
        var movePlayerListener = this.events.subscribe(Event.TICK_MOVE, world.updatePlayerMovement.bind(world));
        var moveBulletsListener = this.events.subscribe(Event.TICK_MOVE, world.updateBulletMovement.bind(world));
        var wallCollisionListener = this.events.subscribe(Event.TICK_COLLISION, world.checkCollisions.bind(world));
        var cameraListener = this.events.subscribe(Event.TICK_CAMERA, world.updateCamera.bind(world));

        var aBtnListener = this.events.subscribe(Event.GAME_PAD, function (pad) {
            if (!hasEnded && pad.isStartPressed()) {
                var counter = 0;
                Object.keys(playerColorDict).forEach(function (playerId) {
                    counter++;
                });
                if (counter >= 2) {
                    if (hasEnded)
                        return;
                    hasEnded = true;
                    endScene();
                }
            }
        });

        var playerColorDict = {};
        var colorPlayerDict = {};

        var colorCollisions = this.events.subscribe(Event.TICK_COLLISION, function () {
            Object.keys(world.players).forEach(function (playerKey) {
                var player = world.players[playerKey].entity;

                var currentColor = playerColorDict[playerKey];
                if (currentColor) {
                    if (isOnColor(player, colorClouds[currentColor])) {
                        return;
                    } else {
                        delete colorPlayerDict[currentColor];
                        delete playerColorDict[playerKey];
                    }
                }

                Object.keys(colorClouds).forEach(function (colorKey) {
                    if (isOnColor(player, colorClouds[colorKey])) {
                        if (colorPlayerDict[colorKey]) {
                            return;
                        }
                        playerColorDict[playerKey] = colorKey;
                        colorPlayerDict[colorKey] = playerKey;
                    }
                });
            });
        });

        function isOnColor(player, zone) {
            var widthHalf = player.collision.getWidthHalf();
            var heightHalf = player.collision.getHeightHalf();
            return player.x + widthHalf > zone.getCornerX() && player.x - widthHalf < zone.getEndX() &&
            player.y + heightHalf > zone.getCornerY() - tileHeight && player.y - heightHalf < zone.getEndY();
        }

        var self = this;
        function endScene() {
            self.sceneStorage.playerColors = playerColorDict;
            world.nuke();
            self.events.unsubscribe(gamePadListener);
            self.events.unsubscribe(movePlayerListener);
            self.events.unsubscribe(moveBulletsListener);
            self.events.unsubscribe(wallCollisionListener);
            self.events.unsubscribe(cameraListener);
            self.events.unsubscribe(colorCollisions);

            self.events.unsubscribe(aBtnListener);
            self.timer.doLater(next, 6);
        }
    };

    return ChoosePlaneScreen;
})(Event, createWorld);