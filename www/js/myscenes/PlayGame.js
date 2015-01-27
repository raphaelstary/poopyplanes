var PlayGame = (function (Event, createWorld) {
    "use strict";

    function PlayGame(services) {
        this.stage = services.stage;
        this.events = services.events;
        this.sceneStorage = services.sceneStorage;
    }

    PlayGame.prototype.show = function (next) {
        var hasEnded = false;
        var self = this;

        var screenWidth = 1920;
        var screenHeight = 1080;
        var tileHeight = 20;
        var worldWrapper = createWorld(this.stage, screenWidth, screenHeight, tileHeight);
        var world = worldWrapper.world;
        var worldBuilder = worldWrapper.worldBuilder;

        worldBuilder.createDefaultWalls();
        worldBuilder.createFirstLevel();
        worldBuilder.initPlayers(this.sceneStorage.playerColors);

        var gamePadListener = this.events.subscribe(Event.GAME_PAD, world.handleGamePad.bind(world));
        var movePlayerListener = this.events.subscribe(Event.TICK_MOVE, world.updatePlayerMovement.bind(world));
        var moveBulletsListener = this.events.subscribe(Event.TICK_MOVE, world.updateBulletMovement.bind(world));
        var bulletCollisionListener = this.events.subscribe(Event.TICK_COLLISION, world.checkBulletCollision.bind(world));
        var wallCollisionListener = this.events.subscribe(Event.TICK_COLLISION, world.checkCollisions.bind(world));
        var cameraListener = this.events.subscribe(Event.TICK_CAMERA, world.updateCamera.bind(world));

        function nextScene() {
            if (hasEnded)
                return;

            self.events.unsubscribe(gamePadListener);
            self.events.unsubscribe(movePlayerListener);
            self.events.unsubscribe(moveBulletsListener);
            self.events.unsubscribe(bulletCollisionListener);
            self.events.unsubscribe(wallCollisionListener);
            self.events.unsubscribe(cameraListener);

            next();
        }
    };

    return PlayGame;
})(Event, createWorld);