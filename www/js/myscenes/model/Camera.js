var Camera = (function () {
    "use strict";

    function Camera(viewPort) {
        this.viewPort = viewPort;
    }

    Camera.prototype.calcScreenPosition = function (entity) {
        if (entity.getEndX() < this.viewPort.getCornerX() || entity.getCornerX() > this.viewPort.getEndX() ||
            entity.getEndY() < this.viewPort.getCornerY() || entity.getCornerY() > this.viewPort.getEndY()) {

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

        entity.sprite.x = entity.x - this.viewPort.getCornerX() * this.viewPort.scale;
        entity.sprite.y = entity.y - this.viewPort.getCornerY() * this.viewPort.scale;
        entity.sprite.rotation = entity.rotation;
        entity.sprite.flipHorizontally = entity.flipHorizontally;
        entity.sprite.scale *= this.viewPort.scale;

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
    };

    return Camera;
})();