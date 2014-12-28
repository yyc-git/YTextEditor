var TextCursor = YYC.Class({
    Init: function (width, fillStyle) {
        this.fillStyle = fillStyle || "rgba(0, 0, 0, 0.5)";
        this.width = width || 2;
        this.left = 0;
        this.top = 0;
    },
    Public: {
        getHeight: function (context) {
            var h = context.measureText("W").width;

            return h + h / 6;
        },
        createPath: function (context) {
            context.beginPath();
            context.rect(this.left, this.top, this.width, this.getHeight(context));
        },
        draw: function (context, left, bottom) {
            context.save();

            this.left = left;
            this.top = bottom - this.getHeight(context);

            this.createPath(context);

            context.fillStyle = this.fillStyle;
            context.fill();

            context.restore();
        },
        erase: function (context, imageData) {
            context.putImageData(imageData, 0, 0,
                this.left, this.top, this.width, this.getHeight(context));
        }
    }
});