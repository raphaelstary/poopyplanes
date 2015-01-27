var WorldBuilder = (function (Entity, StartPositions, Vectors) {
    "use strict";

    function WorldBuilder(stage, screenWidth, screenHeight, tileHeight, players, scenery, bullets) {
        this.stage = stage;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.tileHeight = tileHeight;

        this.players = players;
        this.scenery = scenery;
        this.bullets = bullets;
    }

    WorldBuilder.prototype.createDefaultWalls = function () {
        var wallLeft = this.stage.drawRectangle(this.tileHeight, this.screenHeight / 2, this.tileHeight * 2,
            this.screenHeight, 'grey', true);
        var wallRight = this.stage.drawRectangle(this.screenWidth - this.tileHeight, this.screenHeight / 2,
            this.tileHeight * 2, this.screenHeight, 'grey', true);
        var wallTop = this.stage.drawRectangle(this.screenWidth / 2, this.tileHeight, this.screenWidth,
            this.tileHeight * 2, 'grey', true);
        var wallBottom = this.stage.drawRectangle(this.screenWidth / 2, this.screenHeight - this.tileHeight,
            this.screenWidth, this.tileHeight * 2, 'grey', true);

        this.scenery.push(createEntity(wallTop), createEntity(wallBottom), createEntity(wallLeft),
            createEntity(wallRight));
    };

    WorldBuilder.prototype.createChoosePlane = function () {
        var cloud1 = this.stage.drawRectangle(this.screenWidth / 10 * 2, this.screenHeight / 3, this.tileHeight * 5,
            this.tileHeight * 2, 'red', true);
        var cloud2 = this.stage.drawRectangle(this.screenWidth / 10 * 4, this.screenHeight / 3, this.tileHeight * 5,
            this.tileHeight * 2, 'blue', true);
        var cloud3 = this.stage.drawRectangle(this.screenWidth / 10 * 6, this.screenHeight / 3, this.tileHeight * 5,
            this.tileHeight * 2, 'green', true);
        var cloud4 = this.stage.drawRectangle(this.screenWidth / 10 * 8, this.screenHeight / 3, this.tileHeight * 5,
            this.tileHeight * 2, 'black', true);

        this.scenery.push(createEntity(cloud1), createEntity(cloud2), createEntity(cloud3), createEntity(cloud4));

        return {
            red: cloud1,
            blue: cloud2,
            green: cloud3,
            black: cloud4
        }
    };

    WorldBuilder.prototype.createFirstLevel = function () {
        var cloud1 = this.stage.drawRectangle(this.screenWidth / 2, this.screenHeight / 6, this.tileHeight * 20,
            this.tileHeight * 10, 'grey', true);
        var cloud2 = this.stage.drawRectangle(this.screenWidth / 2, this.screenHeight / 6 * 5, this.tileHeight * 20,
            this.tileHeight * 10, 'grey', true);
        var cloud3 = this.stage.drawRectangle(this.screenWidth / 6, this.screenHeight / 2, this.tileHeight * 20,
            this.tileHeight * 10, 'grey', true);
        var cloud4 = this.stage.drawRectangle(this.screenWidth / 6 * 5, this.screenHeight / 2, this.tileHeight * 20,
            this.tileHeight * 10, 'grey', true);


        this.scenery.push(createEntity(cloud1), createEntity(cloud2), createEntity(cloud3), createEntity(cloud4));
    };

    function createEntity(drawable) {
        return new Entity(drawable.x, drawable.y, 0, drawable, drawable);
    }

    WorldBuilder.prototype.initPlayers = function (playerColorDict) {
        var positions = new StartPositions();
        positions.initDefaultPoints(this.screenWidth, this.screenHeight);

        Object.keys(playerColorDict).forEach(function (playerKey) {
            this.players[playerKey] = {
                entity: this.createPlayerEntity(positions.get(), playerKey, playerColorDict[playerKey]),
                controls: [],
                jumpPressed: false,
                fireStop: 0,
                firePressed: false,
                padIndex: playerKey
            };
        }, this);
    };

    WorldBuilder.prototype.initDefaultPlayers = function () {
        var positions = new StartPositions([
            {
                x: this.screenWidth / 2 - this.tileHeight * 2,
                y: this.screenHeight - this.tileHeight * 4
            }, {
                x: this.screenWidth / 2 - this.tileHeight * 5,
                y: this.screenHeight - this.tileHeight * 4
            }, {
                x: this.screenWidth / 2 + this.tileHeight * 5,
                y: this.screenHeight - this.tileHeight * 4
            }, {
                x: this.screenWidth / 2 + this.tileHeight * 2,
                y: this.screenHeight - this.tileHeight * 4
            }
        ]);

        this.players[0] = {
            entity: this.createPlayerEntity(positions.get(), 0),
            controls: [],
            jumpPressed: false,
            fireStop: 0,
            firePressed: false,
            padIndex: 0
        };

        this.players[1] = {
            entity: this.createPlayerEntity(positions.get(), 1),
            controls: [],
            jumpPressed: false,
            fireStop: 0,
            firePressed: false,
            padIndex: 1
        };
        this.players[2] = {
            entity: this.createPlayerEntity(positions.get(), 2),
            controls: [],
            jumpPressed: false,
            fireStop: 0,
            firePressed: false,
            padIndex: 2
        };
        this.players[3] = {
            entity: this.createPlayerEntity(positions.get(), 3),
            controls: [],
            jumpPressed: false,
            fireStop: 0,
            firePressed: false,
            padIndex: 3
        };
    };

    var startRotation = 0;

    WorldBuilder.prototype.createPlayerEntity = function (startPosition, id, color) {
        var sprite;
        if (color)
            sprite = this.stage.drawRectangle(startPosition.x, startPosition.y, this.tileHeight * 2, this.tileHeight,
                color, true); else {
            sprite = this.stage.drawRectangle(startPosition.x, startPosition.y, this.tileHeight * 2, this.tileHeight,
                'blue');
        }
        var entity = new Entity(startPosition.x, startPosition.y, startRotation, sprite, sprite);
        entity.id = id;
        return entity;
    };

    WorldBuilder.prototype.createBullet = function (player) {
        var bulletDrawable = this.stage.drawRectangle(player.x, player.y, this.tileHeight, this.tileHeight,
            player.sprite.data.color, true);
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

    return WorldBuilder;
})(Entity, StartPositions, Vectors);