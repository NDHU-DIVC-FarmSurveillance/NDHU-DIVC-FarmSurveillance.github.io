(function(){
    'use strict';



    var
    REMOTE_ADDR     = 'http://134.208.3.188:8000',
    CAMERA_LSIT     = [ '1', '2', '3'],
    CAMERA_NAMES    = {
        '1': 'DIVC Lab',
        '2': 'AI Lab',
        '3': 'A325',
        '4': ''
    },
    TIME_INTERVAL   = 5,

    menu            = $('[data-id="menu"]'),
    menuRegion      = {
        cameras:    menu.find('.cameras'),
        controller: menu.find('.controller')
    },
    viewport        = $('[data-id="views"]'),
    tpl             = {
        menuCameraList: $('script[tpl="menu-camera-list"]').html(),
        viewCameraList: $('script[tpl="view-camera-list"]').html(),
        trackSmallList: $('script[tpl="track-small-list"]').html()
    };



    $.each( CAMERA_LSIT, function(idx, cameraId){
        ___REGISTER_VIEW( REMOTE_ADDR + '/video/', cameraId );
    } );



    menuRegion.cameras.on('click', '[data-view-id]', function(e){
        var
        target = $(e.target),
        viewId = target.data('view-id');

        ___CLEAR_ALL_STATE();
        viewport.find('[data-view-id="' + viewId + '"]').click();
    });

    menuRegion.controller.on('click', '[data-click="view-all"]', ___CLEAR_ALL_STATE);

    viewport.on('click', '[data-view-id]', function(e){
        var target = $(e.target);

        if( target.data('state') === 'full' ){
            target.siblings().removeClass('hide');
            target.removeClass('view-full');
            target.data('state', '');
            return;
        }



        target.siblings().addClass('hide').removeClass('view-full');
        target.addClass('view-full');
        target.data('state', 'full');
    });



    function ___REGISTER_VIEW( apiAddr, cameraId ){
        $.tmpl( tpl.menuCameraList, { name: CAMERA_NAMES[cameraId],viewId: cameraId } ).appendTo( menuRegion.cameras );
        $.tmpl( tpl.viewCameraList, { viewId: cameraId } ).appendTo( viewport );

        var
        COLOR       = '#f45c42',
        source      = new EventSource( apiAddr + cameraId ),
        dataView    = viewport.find('[data-view-id="' + cameraId + '"]'),
        viewRegion  = {
            fps:    dataView.find('[data-view-info="fps"]'),
            person: dataView.find('[data-view-info="person"]'),
            track:  dataView.find('[data-view-info="track"]')
        },
        frameInfo   = {
            frameCount: 0,
            timeStart:  0,
            timeEnd:    0,
            fps:        0,
            person:     0
        },
        canvasTracking  = $('#canvas-track-small-' + cameraId).get(0),
        contextTracking = canvasTracking.getContext('2d');



        source.onmessage = function(e){
            var
            data        = e.data.split('___'),
            image       = data[0],
            prediction  = $.parseJSON( data[1] || '' ),
            counting    = $.parseJSON( data[2] || {} ),
            imgObj      = new Image(),
            canvas      = $('#canvas-' + cameraId).get(0),
            context     = canvas.getContext('2d');




            imgObj.addEventListener('load', __LOAD_HANDLER);
            imgObj.src = 'data:image/jpeg;base64,' + image;



            function __LOAD_HANDLER(){
                viewRegion.track.empty();
                frameInfo.person = 0;



                var
                width       = imgObj.width || 640,
                height      = imgObj.height || 480,
                textSize    = 25,
                fitInfo     = {
                    canvas: { width: canvasTracking.width, height: canvasTracking.height },
                    image:  { width: imgObj.width, height: imgObj.height }
                };

                context.canvas.width    = width;
                context.canvas.height   = height;

                context.lineWidth       = 3;
                context.font            = textSize + 'px Arial';
                context.textBaseline    = 'bottom';

                context.drawImage(imgObj, 0, 0, width, height);
                $.each(prediction, function(idx, pred){
                    var
                    x           = pred.topleft.x,
                    y           = pred.topleft.y,
                    w           = pred.bottomright.x - pred.topleft.x,
                    h           = pred.bottomright.y - pred.topleft.y,
                    label       = pred.label + (pred.confidence < 0 ? '': ' ' + pred.confidence.toFixed(2)),
                    textLength  = context.measureText(label).width,
                    color       = COLOR,
                    fit         = TOOLS.FIT_IMAGE_ON( fitInfo.canvas, fitInfo.image );


                    context.strokeStyle = color;
                    context.fillStyle = color;
                    context.strokeRect(x, y, w, h);

                    /*
                    // INFO: Label and text on bounding boxes
                    context.fillRect(x, y-textSize, textLength, textSize);
                    context.strokeRect(x, y-textSize, textLength, textSize);

                    context.fillStyle = '#FFFFFF';
                    context.fillText(label, x, y);
                    */


                    if( pred.label === 'person' || (typeof pred.label === 'number')  ) frameInfo.person++;



                    // INFO: Draw tracking people
                    contextTracking.clearRect( 0, 0, canvasTracking.width, canvasTracking.height );
                    contextTracking.drawImage(imgObj, x, y, w, h, fit.x, fit.y, fit.w, fit.h);
                    $.tmpl( tpl.trackSmallList, { id: pred.label, src: canvasTracking.toDataURL() } ).appendTo( viewRegion.track );
                });



                // INFO: Update person counter
                viewRegion.person.text( frameInfo.person );

                // INFO: Update frame counter
                frameInfo.frameCount ++;
                if( frameInfo.frameCount % TIME_INTERVAL === 1  )
                {
                    frameInfo.timeStart = Date.now();
                }
                else
                if( frameInfo.frameCount % TIME_INTERVAL === 0 )
                {
                    frameInfo.timeEnd = Date.now();
                    frameInfo.fps = TIME_INTERVAL * 1000 / ( frameInfo.timeEnd - frameInfo.timeStart );
                    viewRegion.fps.text( frameInfo.fps.toFixed(2) );
                }

                // INFO: Update counter animation
                TOOLS.UPDATE_COUNTER_ANIMATION($.extend(counting, { cameraId: cameraId }));



                imgObj.removeEventListener('load', __LOAD_HANDLER);
            }
        };

        source.onerror = function(e){
            console.log(e);
            source.close();
        };
    }

    function ___CLEAR_ALL_STATE(){
        viewport.find('[data-view-id]').removeClass('hide view-full').data('state', '');
    }
})();
