var createDefaultViewPort = (function (Math) {
    "use strict";

    function createDefaultViewPort(screenWidth, screenHeight) {
        return {
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
    }

    return createDefaultViewPort;
})(Math);