(function(){
    var TOOLS = {
        FIT_IMAGE_ON: ___FIT_IMAGE_ON,
        UPDATE_COUNTER_ANIMATION: ___UPDATE_COUNTER_ANIMATION
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



    window.TOOLS = TOOLS;
})();

(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();
