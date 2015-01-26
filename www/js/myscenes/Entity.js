var Entity = (function (Math) {
    "use strict";

    function Entity(x, y, rotation, sprite, collision, direction) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.forceX = 0;
        this.forceY = 0;
        this.sprite = sprite;
        this.direction = direction;
        this.collision = collision;
        this.lastX = x;
        this.lastY = y;
        this.debug = false;
        this.flipHorizontally = false;
        this.flipVertically = false;
    }

    Entity.prototype.getCornerX = function () {
        if (!this.sprite.rotation || this.sprite.rotation == 0 || this.sprite.rotation == Math.PI) {
            return this.x - this.sprite.getWidthHalf();
        } else {
            var height = this.sprite.getHeight();
            var width = this.sprite.getWidth();
            if (height > width) {
                return this.x - height;
            }
            return this.x - width;
        }
    };

    Entity.prototype.getCornerY = function () {
        if (!this.sprite.rotation || this.sprite.rotation == 0 || this.sprite.rotation == Math.PI) {
            return this.y - this.sprite.getHeightHalf();
        } else {
            var height = this.sprite.getHeight();
            var width = this.sprite.getWidth();
            if (height > width) {
                return this.y - height;
            }
            return this.y - width;
        }
    };

    Entity.prototype.getEndX = function () {
        if (!this.sprite.rotation || this.sprite.rotation == 0 || this.sprite.rotation == Math.PI) {
            return this.x + this.sprite.getWidthHalf();
        } else {
            var height = this.sprite.getHeight();
            var width = this.sprite.getWidth();
            if (height > width) {
                return this.x + height;
            }
            return this.x + width;
        }
    };

    Entity.prototype.getEndY = function () {
        if (!this.sprite.rotation || this.sprite.rotation == 0 || this.sprite.rotation == Math.PI) {
            return this.y + this.sprite.getHeightHalf();
        } else {
            var height = this.sprite.getHeight();
            var width = this.sprite.getWidth();
            if (height > width) {
                return this.y + height;
            }
            return this.y + width;
        }
    };

    return Entity;
})(Math);