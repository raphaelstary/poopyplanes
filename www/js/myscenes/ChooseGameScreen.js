var ChooseGameScreen = (function (createWorld, Event, GameMode) {
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
        var wallCollisionListener = this.events.subscribe(Event.TICK_COLLISION, world.checkJustPlayerCollisions.bind(world));
        var cameraListener = this.events.subscribe(Event.TICK_CAMERA, world.updateCamera.bind(world));

        var aBtnListener = this.events.subscribe(Event.GAME_PAD, function (pad) {
            if (!hasEnded && pad.isStartPressed()) {
                if (hasEnded)
                    return;
                hasEnded = true;
                endScene();
            }
        });

        var modes = {
            cloudsKill: true,
            gameMode: GameMode.LAST_PLANE_FLYING,
            kills: 5,
            fuelOn: false
        };

        function toggleCloudsKill() {
            modes.cloudsKill = !modes.cloudsKill;

            if (modes.cloudsKill) {
                setActive(cloudsKill);
                setInActive(friendlyClouds);
            } else {
                setInActive(cloudsKill);
                setActive(friendlyClouds);
            }
        }

        function gameModeLeft() {
            modes.gameMode = GameMode.LAST_PLANE_FLYING;
            setActive(gameModeLast);
            setInActive(gameModeDeath);
        }

        function gameModeRight() {
            modes.gameMode = GameMode.DEATH_MATCH;
            setInActive(gameModeLast);
            setActive(gameModeDeath);
        }

        function killsLeft() {
            if (modes.kills > 1) {
                modes.kills--;
                kills.data.msg = modes.kills.toString();
            }
        }

        function killsRight() {
            modes.kills++;
            kills.data.msg = modes.kills.toString();
        }

        function toggleFuelOn() {
            modes.fuelOn = !modes.fuelOn;
            if (modes.fuelOn) {
                setActive(fuelOn);
                setInActive(fuelOff);
            } else {
                setInActive(fuelOn);
                setActive(fuelOff);
            }
        }

        function setActive(drawable) {
            drawable.data.size = tileHeight * 1.5;
            drawable.data.color = 'red';
        }

        function setInActive(drawable) {
            drawable.data.size = tileHeight;
            drawable.data.color = 'black';
        }

        var cloudsKill = this.stage.drawText(clouds.cloudsKill.x - tileHeight, clouds.cloudsKill.y, 'clouds kill', tileHeight * 1.5, 'Arial',
            'red', 8);
        var friendlyClouds = this.stage.drawText(clouds.cloudsKill.x + tileHeight, clouds.cloudsKill.y, 'friedly clouds', tileHeight, 'Arial',
            'black', 8);
        var gameModeLast = this.stage.drawText(clouds.gameModeLeft.x, clouds.gameModeLeft.y, 'last plane flying', tileHeight * 1.5, 'Arial',
            'red', 8);
        var gameModeDeath = this.stage.drawText(clouds.gameModeRight.x, clouds.gameModeRight.y, 'death match', tileHeight, 'Arial',
            'black', 8);
        var kills = this.stage.drawText(clouds.killsLeft.x, clouds.killsLeft.y, modes.kills.toString(), tileHeight, 'Arial',
            'black', 8);
        var fuelOn = this.stage.drawText(clouds.fuelOn.x - tileHeight, clouds.fuelOn.y, 'fuel on', tileHeight * 1.5, 'Arial',
            'red', 8);
        var fuelOff = this.stage.drawText(clouds.fuelOn.x + tileHeight, clouds.fuelOn.y, 'fuel off', tileHeight, 'Arial',
            'black', 8);
        var guiDrawables = [cloudsKill, friendlyClouds, gameModeLast, gameModeDeath, kills, fuelOn, fuelOff];

        var selectCollisions = this.events.subscribe(Event.TICK_COLLISION, function () {
            world.bullets.forEach(function (bullet, index, bulletsArray) {
                if (changeSelection(bullet, clouds.cloudsKill)) {
                    world.removeBullet(bullet, index, bulletsArray);
                    toggleCloudsKill();
                } else if (changeSelection(bullet, clouds.gameModeLeft)) {
                    world.removeBullet(bullet, index, bulletsArray);
                    gameModeLeft();
                } else if (changeSelection(bullet, clouds.gameModeRight)) {
                    world.removeBullet(bullet, index, bulletsArray);
                    gameModeRight();
                } else if (changeSelection(bullet, clouds.killsLeft)) {
                    world.removeBullet(bullet, index, bulletsArray);
                    killsLeft();
                } else if (changeSelection(bullet, clouds.killsRight)) {
                    world.removeBullet(bullet, index, bulletsArray);
                    killsRight();
                } else if (changeSelection(bullet, clouds.fuelOn)) {
                    world.removeBullet(bullet, index, bulletsArray);
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
            self.sceneStorage.gameMode = modes;

            world.nuke();

            guiDrawables.forEach(self.stage.remove.bind(self.stage));

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
})(createWorld, Event, GameMode);