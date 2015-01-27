var StartPositions = (function (range) {
    "use strict";

    function StartPositions(points) {
        this.startPositions = points;
    }

    StartPositions.prototype.initDefaultPoints = function (screenWidth, screenHeight) {
        this.startPositions = [
            {
                x: screenWidth / 6,
                y: screenHeight / 6
            }, {
                x: screenWidth / 6 * 5,
                y: screenHeight / 6
            }, {
                x: screenWidth / 6,
                y: screenHeight / 6 * 5
            }, {
                x: screenWidth / 6 * 5,
                y: screenHeight / 6 * 5
            }
        ];
    };

    StartPositions.prototype.get = function () {
        var randomIndex = range(0, this.startPositions.length - 1);
        return this.startPositions.splice(randomIndex, 1).pop();
    };

    return StartPositions;
})(range);