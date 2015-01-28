var ChooseGameScreen = (function (createWorld, Event) {
    "use strict";

    function ChooseGameScreen(services) {
        this.stage = services.stage;
        this.events = services.events;
        this.timer = services.timer;
        this.sceneStorage = services.sceneStorage;
    }

    ChooseGameScreen.prototype.show = function (next) {
        var screenWidth = 1920;
        var screenHeight = 1080;
        var tileHeight = 20;
        var hasEnded = false;

        var worldWrapper = createWorld(this.stage, screenWidth, screenHeight, tileHeight);
        var world = worldWrapper.world;
        var worldBuilder = worldWrapper.worldBuilder;
        worldBuilder.createDefaultWalls();
        var clouds = worldBuilder.createChooseGame();
        worldBuilder.initColoredDefaultPlayers(this.sceneStorage.playerColors,
            worldBuilder.getDefaultMenuPositionPoints());

        var gamePadListener = this.events.subscribe(Event.GAME_PAD, world.handleGamePad.bind(world));
        var movePlayerListener = this.events.subscribe(Event.TICK_MOVE, world.updatePlayerMovement.bind(world));
        var moveBulletsListener = this.events.subscribe(Event.TICK_MOVE, world.updateBulletMovement.bind(world));
        var wallCollisionListener = this.events.subscribe(Event.TICK_COLLISION, world.checkCollisions.bind(world));
        var cameraListener = this.events.subscribe(Event.TICK_CAMERA, world.updateCamera.bind(world));

        var aBtnListener = this.events.subscribe(Event.GAME_PAD, function (pad) {
            if (!hasEnded && pad.isStartPressed()) {
                if (hasEnded)
                    return;
                hasEnded = true;
                endScene();
            }
        });

        var GameMode = {
            LAST_PLANE_FLYING: 'last_plane_flying',
            DEATH_MATCH: 'death_match'
        };
        var modes = {
            cloudsKill: true,
            gameMode: GameMode.LAST_PLANE_FLYING,
            kills: 5,
            fuelOn: false
        };

        function toggleCloudsKill() {
            modes.cloudsKill = !modes.cloudsKill;
        }

        function gameModeLeft() {
            modes.gameMode = GameMode.LAST_PLANE_FLYING;
        }

        function gameModeRight() {
            modes.gameMode = GameMode.DEATH_MATCH;
        }

        function killsLeft() {
            if (modes.kills > 1) {
                modes.kills--;
            }
        }

        function killsRight() {
            modes.kills++;
        }

        function toggleFuelOn() {
            modes.fuelOn = !modes.fuelOn;
        }

        var selectCollisions = this.events.subscribe(Event.TICK_COLLISION, function () {
            world.bullets.forEach(function (bullet) {
                if (changeSelection(bullet, clouds.cloudsKill)) {
                    toggleCloudsKill();
                } else if (changeSelection(bullet, clouds.gameModeLeft)) {
                    gameModeLeft();
                } else if (changeSelection(bullet, clouds.gameModeRight)) {
                    gameModeRight();
                } else if (changeSelection(bullet, clouds.killsLeft)) {
                    killsLeft();
                } else if (changeSelection(bullet, clouds.killsRight)) {
                    killsRight();
                } else if (changeSelection(bullet, clouds.fuelOn)) {
                    toggleFuelOn();
                }
            });
        });

        function changeSelection(bullet, cloud) {
            var widthHalf = bullet.collision.getWidthHalf();
            var heightHalf = bullet.collision.getHeightHalf();
            return bullet.x + widthHalf > cloud.getCornerX() && bullet.x - widthHalf < cloud.getEndX() &&
                bullet.y + heightHalf > cloud.getCornerY() && bullet.y - heightHalf < cloud.getEndY();
        }

        var self = this;

        function endScene() {

            world.nuke();
            self.events.unsubscribe(gamePadListener);
            self.events.unsubscribe(movePlayerListener);
            self.events.unsubscribe(moveBulletsListener);
            self.events.unsubscribe(wallCollisionListener);
            self.events.unsubscribe(cameraListener);
            self.events.unsubscribe(selectCollisions);

            self.events.unsubscribe(aBtnListener);
            self.timer.doLater(next, 6);
        }
    };

    return ChooseGameScreen;
})(createWorld, Event);