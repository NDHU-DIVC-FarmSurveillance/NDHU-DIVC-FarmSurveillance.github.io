(function(){
    'use strict';



    var
    LOCAL_RES   = 'static/img/',
    CONFIG      = {
        PLAN_ID             : 4,
        WIDTH               : 640,
        HEIGHT              : 480,
        ANIMATION_LENGTH    : 1.5 * 1000,
        ANIMATION_INTERVAL  : 100,
        ANIMATION_PERSON    : {
            STEPS:  [],
            RANGE:  8,      // animation variation range
            WIDTH:  2000,   // original size in image viewer
            HEIGHT: 320,    // original size in image viewer
            SCALE:  0.07
        },
        POINT_RADIUS        : 5,
        POINT_START         : 0,
        POINT_END           : 2 * Math.PI,
        POINT_COLOR         : {
            crossedAbove: '#FF0000',
            crossedBelow: '#0000FF'
        },
        TYPE_CROSSED_ABOVE  : 'crossedAbove',
        TYPE_CROSSED_BELOW  : 'crossedBelow',
        STATUS              : {
            NONE:       0,
            PROCESSING: 1,
            FINISHED:   2
        },
        CAMERA_INFO: {
            ICON_SIZE: {
                WIDTH:  50,
                HEIGHT: 50
            },
            ICONS: [
                { src: LOCAL_RES + 'camera-icon-1.png', color: '#44b9d5' },
                { src: LOCAL_RES + 'camera-icon-2.png', color: '#75bda7' },
                { src: LOCAL_RES + 'camera-icon-3.png', color: '#7c639a' },
                { src: LOCAL_RES + 'camera-icon-4.png', color: '#db637f' }
            ],
            ICON_COLOR_BLUE:    0,
            ICON_COLOR_GREEN:   1,
            ICON_COLOR_PURPLE:  2,
            ICON_COLOR_PINK:    3
        }
    },
    context     = null,
    plan        = new Image(),
    person      = {
        above: new Image(),
        below: new Image()
    },
    viewport    = $('[data-id="views"]'),
    tpl         = $('script[tpl="view-plan"]').html(),
    animations  = [],
    cameras     = {
        '1': {
            crossedAbove: {
                text:     'In :',
                count:    0,
                start:    { x: 520,   y: 70 },
                end:      { x: 540,   y: 70 }
            },
            crossedBelow: {
                text:     'Out:',
                count:    0,
                start:    { x: 540,   y: 70 },
                end:      { x: 520,   y: 70 }
            },
            location: {
                icon:     { x: 460, y: 100 },
                label:    { x: 365, y: 200 }
            },
            icon: new Image(),
            colorId: CONFIG.CAMERA_INFO.ICON_COLOR_PINK,
            available: true
        },
        '2': {
            crossedAbove: {
                text:     'In :',
                count:    0,
                start:    { x: 210,   y: 75 },
                end:      { x: 210,   y: 55 }
            },
            crossedBelow: {
                text:     'Out:',
                count:    0,
                start:    { x: 210,   y: 55 },
                end:      { x: 210,   y: 75 }
            },
            location: {
                icon:     { x: 196, y: 5 },
                label:    { x: 242, y: 200 }
            },
            icon: new Image(),
            colorId: CONFIG.CAMERA_INFO.ICON_COLOR_GREEN,
            available: true
        },
        '3': {
            crossedAbove: {
                text:     'In :',
                count:    0,
                start:    { x: 5,    y: 345 },
                end:      { x: 5,    y: 325 }
            },
            crossedBelow: {
                text:     'Out:',
                count:    0,
                start:    { x: 5,    y: 325 },
                end:      { x: 5,    y: 345 }
            },
            location: {
                icon:     { x: 25, y: 280 },
                label:    { x: 120, y: 200 }
            },
            icon: new Image(),
            colorId: CONFIG.CAMERA_INFO.ICON_COLOR_BLUE,
            available: true
        }
    };



    $.tmpl(tpl, { viewId: CONFIG.PLAN_ID, plan: "E2_3F" }).appendTo( viewport );



    ___INIT();



    function ___INIT(){
        $.each(cameras, function(idx, camera){
            var icon = CONFIG.CAMERA_INFO.ICONS[camera.colorId];
            camera.icon.src     = icon.src;
            camera.color   = icon.color;
        });
        plan.src    = LOCAL_RES + 'engineering_2_building_3rd_floor_layout.png';
        person.above.src  = LOCAL_RES + 'walk-sequence-above.png';
        person.below.src  = LOCAL_RES + 'walk-sequence-below.png';



        context = $('#canvas-plan').get(0).getContext('2d');
        context.canvas.width    = CONFIG.WIDTH;
        context.canvas.height   = CONFIG.HEIGHT;



        plan.addEventListener('load', ___DRAW_PLAN );


        person.above.addEventListener('load', function(){
            CONFIG.ANIMATION_PERSON.WIDTH   = person.above.width;
            CONFIG.ANIMATION_PERSON.HEIGHT  = person.above.height;
            for( var i = 0; i < CONFIG.ANIMATION_PERSON.RANGE; i++ )
                CONFIG.ANIMATION_PERSON.STEPS.push( CONFIG.ANIMATION_PERSON.WIDTH / CONFIG.ANIMATION_PERSON.RANGE * i)
        });
    }



    function ___COUNTING_UPDATE(counting){
        if( !counting.cameraId in cameras ) {
            console.log( 'Undefined counting configuration.' );
            return;
        }



        var prevCounting = cameras[counting.cameraId];

        if( prevCounting.crossedAbove.count < counting.crossedAbove )
        {
            animations.push( {
                type:           CONFIG.TYPE_CROSSED_ABOVE,
                location:       prevCounting.crossedAbove,
                status:         CONFIG.STATUS.NONE,
                startTime:      null,
                step:           0,
                delay:          0 // delay time to prevent animation changing too fast
            } );
            prevCounting.crossedAbove.count = counting.crossedAbove;
        }

        if( prevCounting.crossedBelow.count < counting.crossedBelow )
        {
            animations.push( {
                type:           CONFIG.TYPE_CROSSED_BELOW,
                location:       prevCounting.crossedBelow,
                status:         CONFIG.STATUS.NONE,
                startTime:      null,
                step:           0,
                delay:          0
            } );
            prevCounting.crossedBelow.count = counting.crossedBelow;
        }



        ___DRAW_PERSON_ANIMATION();
    }



    function ___DRAW_PERSON_ANIMATION(){
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
            },
            animeWidth  = CONFIG.ANIMATION_PERSON.WIDTH,
            animeHeight = CONFIG.ANIMATION_PERSON.HEIGHT;



            /*
            // INFO: Point display
            context.beginPath();
            context.arc( currLoc.x, currLoc.y, CONFIG.POINT_RADIUS, CONFIG.POINT_START, CONFIG.POINT_END );
            context.fillStyle = CONFIG.POINT_COLOR[animation.type];
            context.fill();
            */



            // ISSUE: This display is not working on svg file. (unknown size)
            if( animation.type === CONFIG.TYPE_CROSSED_ABOVE )
            {
                context.drawImage(person.above,
                    CONFIG.ANIMATION_PERSON.STEPS[animation.step], 0,
                    animeWidth / CONFIG.ANIMATION_PERSON.RANGE, animeHeight,
                    currLoc.x, currLoc.y,
                    animeWidth / CONFIG.ANIMATION_PERSON.RANGE * CONFIG.ANIMATION_PERSON.SCALE, animeHeight * CONFIG.ANIMATION_PERSON.SCALE
                );
            }
            else
            {
                context.drawImage(person.below,
                    CONFIG.ANIMATION_PERSON.STEPS[animation.step], 0,
                    animeWidth / CONFIG.ANIMATION_PERSON.RANGE, animeHeight,
                    currLoc.x, currLoc.y,
                    animeWidth / CONFIG.ANIMATION_PERSON.RANGE * CONFIG.ANIMATION_PERSON.SCALE, animeHeight * CONFIG.ANIMATION_PERSON.SCALE
                );
            }




            // INFO: Display delay
            if(progress - animation.delay > CONFIG.ANIMATION_INTERVAL)
            {
                animation.step  = ___NEXT_STEP(animation.step);
                animation.delay = progress;
            }



            if( progress < CONFIG.ANIMATION_LENGTH ) return;

            animation.status = CONFIG.STATUS.FINISHED;
        });



        animations = animations.filter( function(animation){
            return animation.status !== CONFIG.STATUS.FINISHED;
        } );

        if( animations.length > 0 )
            window.requestAnimationFrame( ___DRAW_PERSON_ANIMATION );
        else
            ___DRAW_PLAN();
    }



    function ___DRAW_PLAN(){
        context.clearRect( 0, 0, CONFIG.WIDTH, CONFIG.HEIGHT );
        context.drawImage( plan, 0, 0, CONFIG.WIDTH, CONFIG.HEIGHT );
        ___DRAW_CAMERAS();
    }

    function ___DRAW_CAMERAS(){

        $.each(cameras, function(idx, camera){
            if(!camera.available) return;

            var
            x                   = camera.location.label.x,
            y                   = camera.location.label.y,
            textSize            = 25,
            lineHeight          = 25,
            padding             = 10,
            textCrossedAbove    = camera.crossedAbove.text + camera.crossedAbove.count,
            textCrossedBelow    = camera.crossedBelow.text + camera.crossedBelow.count,
            textLength1         = context.measureText(textCrossedAbove).width,
            textLength2         = context.measureText(textCrossedBelow).width,
            // ISSUE: Unexpected error estimation text length on first element
            //textLength          = textLength1 > textLength2 ? textLength1: textLength2;
            textLength          = 90;


            context.drawImage(camera.icon, camera.location.icon.x, camera.location.icon.y, CONFIG.CAMERA_INFO.ICON_SIZE.WIDTH, CONFIG.CAMERA_INFO.ICON_SIZE.HEIGHT);


            context.fillStyle   = camera.color;
            context.strokeStyle = camera.color;
            TOOLS.DRAW_ROUND_RECT(context, x - padding, y - textSize-padding / 2, textLength + padding * 2, lineHeight * 2 + padding * 2, 20, true);


            context.font        = textSize + 'px Arial';
            context.fillStyle = '#FFFFFF';
            context.fillText(textCrossedAbove, x, y);
            context.fillText(textCrossedBelow, x, y + lineHeight);

        })
    }


    function ___NEXT_STEP(currStep){
        return (currStep + 1) % CONFIG.ANIMATION_PERSON.RANGE;
    }



    window.COUNTING_UPDATE = ___COUNTING_UPDATE;
})();