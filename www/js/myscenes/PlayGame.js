var PlayGame = (function (Event) {
    "use strict";

    function PlayGame(services) {
        this.stage = services.stage;
        this.events = services.events;
    }

    PlayGame.prototype.show = function (next) {
        var width = 1920;
        var height = 1080;
        var tileHeight = 20;
        var groundTile = this.stage.drawRectangle(width/2, height/2, width / 3 * 2, tileHeight, 'black');
        var jumpTileOne = this.stage.drawRectangle(width/3, height/4, width / 4, tileHeight, 'black');
        var jumpTileTwo = this.stage.drawRectangle(width/3*2, height/4, width / 4, tileHeight, 'black');
        var baseGroundTile = this.stage.drawRectangle(width/2, height/4*3, width, tileHeight, 'black');
        var baseFire = this.stage.drawRectangle(width/2, height/4*3-tileHeight*2, width / 8, tileHeight*4, 'red');
    };

    return PlayGame;
})(Event);