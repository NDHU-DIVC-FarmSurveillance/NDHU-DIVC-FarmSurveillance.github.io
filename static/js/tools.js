(function(){
    var TOOLS = {
        FIT_IMAGE_ON: ___FIT_IMAGE_ON,
        UPDATE_COUNTER_ANIMATION: ___UPDATE_COUNTER_ANIMATION,
        DRAW_ROUND_RECT: ___DRAW_ROUND_RECT
    };



    function ___FIT_IMAGE_ON(canvasInfo, imageInfo) {
        var imageAspectRatio    = imageInfo.width / imageInfo.height;
        var canvasAspectRatio   = canvasInfo.width / canvasInfo.height;
        var renderableHeight, renderableWidth, xStart, yStart;

        // If image's aspect ratio is less than canvas's we fit on height
        // and place the image centrally along width
        if(imageAspectRatio < canvasAspectRatio) {
            renderableHeight    = canvasInfo.height;
            renderableWidth     = imageInfo.width * (renderableHeight / imageInfo.height);
            xStart              = (canvasInfo.width - renderableWidth) / 2;
            yStart              = 0;
        }

        // If image's aspect ratio is greater than canvas's we fit on width
        // and place the image centrally along height
        else if(imageAspectRatio > canvasAspectRatio) {
            renderableWidth     = canvasInfo.width;
            renderableHeight    = imageInfo.height * (renderableWidth / imageInfo.width);
            xStart              = 0;
            yStart              = (canvasInfo.height - renderableHeight) / 2;
        }

        // Happy path - keep aspect ratio
        else {
            renderableHeight    = canvasInfo.height;
            renderableWidth     = canvasInfo.width;
            xStart              = 0;
            yStart              = 0;
        }



        return {
            x: xStart,
            y: yStart,
            w: renderableWidth,
            h: renderableHeight
        };
    }

    function ___UPDATE_COUNTER_ANIMATION(countInfo){
        window.COUNTING_UPDATE(countInfo);
    }

    // INFO: http://js-bits.blogspot.tw/2010/07/canvas-rounded-corner-rectangles.html
    /**
     * Draws a rounded rectangle using the current state of the canvas.
     * If you omit the last three params, it will draw a rectangle
     * outline with a 5 pixel border radius
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} width The width of the rectangle
     * @param {Number} height The height of the rectangle
     * @param {Number} radius The corner radius. Defaults to 5;
     * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
     * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
     */
    function ___DRAW_ROUND_RECT(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke == "undefined") {
            stroke = true;
        }
        if (typeof radius === "undefined") {
            radius = 5;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (stroke) {
            ctx.stroke();
        }
        if (fill) {
            ctx.fill();
        }
    }
 


    window.TOOLS = TOOLS;
})();

(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();
