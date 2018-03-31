(function(){
    'use strict';



    var
    CONFIG      = {
        PLAN_ID             : 4,
        WIDTH               : 640,
        HEIGHT              : 480,
        ANIMATION_LENGTH    : 1 * 1000,
        POINT_RADIUS        : 5,
        POINT_START         : 0,
        POINT_END           : 2 * Math.PI,
        POINT_COLOR         : {
            crossedAbove: '#FF0000',
            crossedBelow: '#0000FF'
        },
        STATUS              : {
            NONE:       0,
            PROCESSING: 1,
            FINISHED:   2
        },
        CAMERA              : {
            '1': {
                crossedAbove: {
                    count:    0,
                    start:    { x: 520,   y: 80 },
                    end:      { x: 540,   y: 80 }
                },
                crossedBelow: {
                    count:    0,
                    start:    { x: 540,   y: 80 },
                    end:      { x: 520,   y: 80 }
                }
            },
            '2': {
                crossedAbove: {
                    count:    0,
                    start:    { x: 220,   y: 75 },
                    end:      { x: 220,   y: 55 }
                },
                crossedBelow: {
                    count:    0,
                    start:    { x: 220,   y: 55 },
                    end:      { x: 220,   y: 75 }
                }
            },
            '3': {
                crossedAbove: {
                    count:    0,
                    start:    { x: 15,    y: 345 },
                    end:      { x: 15,    y: 325 }
                },
                crossedBelow: {
                    count:    0,
                    start:    { x: 15,    y: 325 },
                    end:      { x: 15,    y: 345 }
                }
            }
        }
    },
    context     = null,
    plan        = new Image(),
    viewport    = $('[data-id="views"]'),
    tpl         = $('script[tpl="view-plan"]').html(),
    animations  = [];



    $.tmpl(tpl, { viewId: CONFIG.PLAN_ID, plan: "E2_3F" }).appendTo( viewport );



    ___INIT();



    function ___INIT(){
        plan.src = 'static/img/engineering_2_building_3rd_floor_layout.png';

        context = $('#canvas-plan').get(0).getContext('2d');
        context.canvas.width    = CONFIG.WIDTH;
        context.canvas.height   = CONFIG.HEIGHT;

        plan.addEventListener('load', ___DRAW_PLAN );
    }



    function ___COUNTING_UPDATE(counting){
        if( !counting.cameraId in CONFIG.CAMERA ) {
            console.log( 'Undefined counting configuration.' );
            return;
        }



        var prevCounting = CONFIG.CAMERA[counting.cameraId];

        if( prevCounting.crossedAbove.count < counting.crossedAbove )
        {
            animations.push( {
                type:           'crossedAbove',
                location:       prevCounting.crossedAbove,
                status:         CONFIG.STATUS.NONE,
                startTime:      null
            } );
            prevCounting.crossedAbove.count = counting.crossedAbove;
        }

        if( prevCounting.crossedBelow.count < counting.crossedBelow )
        {
            animations.push( {
                type:           'crossedBelow',
                location:       prevCounting.crossedBelow,
                status:         CONFIG.STATUS.NONE,
                startTime:      null
            } );
            prevCounting.crossedBelow.count = counting.crossedBelow;
        }



        ___DRAW_POINT_ANIMATION();
    }



    function ___DRAW_POINT_ANIMATION(){
        ___DRAW_PLAN();



        $.each(animations, function(idx, animation){
            var timestamp = Date.now();
            if( !animation.startTime ) animation.startTime = timestamp;
            var
            progress    = timestamp - animation.startTime,
            location    = animation.location,
            currLoc     = {
                x: location.start.x + (location.end.x - location.start.x) * progress / CONFIG.ANIMATION_LENGTH,
                y: location.start.y + (location.end.y - location.start.y) * progress / CONFIG.ANIMATION_LENGTH
            };



            context.beginPath();
            context.arc( currLoc.x, currLoc.y, CONFIG.POINT_RADIUS, CONFIG.POINT_START, CONFIG.POINT_END );
            context.fillStyle = CONFIG.POINT_COLOR[animation.type];
            context.fill();



            if( progress < CONFIG.ANIMATION_LENGTH ) return;

            animation.status = CONFIG.STATUS.FINISHED;
        });



        animations = animations.filter( function(animation){
            return animation.status !== CONFIG.STATUS.FINISHED;
        } );

        if( animations.length > 0 )
            window.requestAnimationFrame( ___DRAW_POINT_ANIMATION );
        else
            ___DRAW_PLAN();
    }



    function ___DRAW_PLAN(){
        context.clearRect( 0, 0, CONFIG.WIDTH, CONFIG.HEIGHT );
        context.drawImage( plan, 0, 0, CONFIG.WIDTH, CONFIG.HEIGHT );
    }



    window.COUNTING_UPDATE = ___COUNTING_UPDATE;
})();