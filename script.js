let canvas = document.getElementById('box-1');// canvas calls draw() from events directly
let context = canvas.getContext('2d');

let rafCanvas = document.getElementById('box-2'); // canvas uses requestAnimationFrame for drawing
let rafContext = rafCanvas.getContext('2d');

let actionMap = {
    left: 1,
    right: 2,
    up: 3,
    down: 4,
    jump: 5
}
let keyMap = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    ' ': 'jump'
}
let options = {
    keyDown: null,
    updateStarted: false
};

let keyPressTime = 0;

let touchLog = {
    start: {
        x: 0,
        y: 0
    },
    move: {
        x: 0,
        y: 0
    },
    moveFlag: false
};

options.canvas = {
    h: window.innerHeight - 40,
    w: window.innerWidth*0.5,
    border: 10,
}

options.canvas.draw = function (context) {
    context.clearRect(0, 0, options.canvas.w, options.canvas.h);

    context.lineWidth = options.canvas.border;
    context.strokeRect(0, 0, options.canvas.w, options.canvas.h);

}

options.boxData = {
    h: 100,
    w: 100,
    fillStyle: '#ff9933',
    min: {
        x: options.canvas.border,
        y: options.canvas.border
    },
    max: {
        x: options.canvas.w - ((options.canvas.border) + 100),
        y: options.canvas.h - ((options.canvas.border) + 100)
    },
    moveBy : 25,
    rafMoveBy: 5
}

options.box = {
    x: options.canvas.border,
    y: options.canvas.border,
}

options.rafBox = {
    x: options.canvas.border,
    y: options.canvas.border,
}

options.box.draw = function (context) {
    context.lineWidth = 1;
    context.fillStyle = options.boxData.fillStyle;
    context.fillRect(options.box.x, options.box.y, options.boxData.w, options.boxData.h);
}

options.rafBox.draw = function (context) {
    context.lineWidth = 1;
    context.fillStyle = options.boxData.fillStyle;
    context.fillRect(options.rafBox.x, options.rafBox.y, options.boxData.w, options.boxData.h);
}

let layers = ['canvas', 'box'];
let rafLayers = ['canvas', 'rafBox'];

canvas.height = options.canvas.h;
canvas.width = options.canvas.w;

rafCanvas.height = options.canvas.h;
rafCanvas.width = options.canvas.w;

compositior(context, layers);
compositior(rafContext, rafLayers);



(function addListeners()
{
    document.addEventListener("keydown", _handleKeyDown);
    document.addEventListener("keyup", _handleKeyUp);
    canvas.addEventListener("touchstart", _handleTouchStart);
    canvas.addEventListener("touchend", _handleTouchEnd);
    canvas.addEventListener("touchcancel", _handleTouchEnd);
    canvas.addEventListener("touchmove", _handleTouchMove);
})();


function move(direction) {
    let toMove = {
        x: options.box.x,
        y: options.box.y,
    }
    switch (actionMap[direction]) {
    case 1:
        toMove.x = Math.max(options.boxData.min.x, toMove.x - options.boxData.moveBy);
        break;
    case 2:
        toMove.x = Math.min(options.boxData.max.x, toMove.x + options.boxData.moveBy);
        break;
    case 3:
        toMove.y = Math.max(options.boxData.min.y, toMove.y - options.boxData.moveBy);
        break;
    case 4:
        toMove.y = Math.min(options.boxData.max.y, toMove.y + options.boxData.moveBy);
        break;
    }
    options.box.x = toMove.x;
    options.box.y = toMove.y;
}

function updateRaf() {
    if(options.keyDown !== null) {
        let toMove = {
            x: options.rafBox.x,
            y: options.rafBox.y,
        }
        switch (actionMap[options.keyDown]) {
            case 1:
                toMove.x = Math.max(options.boxData.min.x, toMove.x - options.boxData.rafMoveBy);
                break;
            case 2:
                toMove.x = Math.min(options.boxData.max.x, toMove.x + options.boxData.rafMoveBy);
                break;
            case 3:
                toMove.y = Math.max(options.boxData.min.y, toMove.y - options.boxData.rafMoveBy);
                break;
            case 4:
                toMove.y = Math.min(options.boxData.max.y, toMove.y + options.boxData.rafMoveBy);
                break;
        }
        options.rafBox.x = toMove.x;
        options.rafBox.y = toMove.y;
        compositior(rafContext, rafLayers, options);
        _drawDirectionText(rafContext, options.keyDown);
        requestAnimationFrame(updateRaf);
    }
}

function compositior(context, array) {
    let aSize = array.length;
    let i = 0;
    while(i<aSize) {
        options[array[i++]].draw(context);
    }
}

function _handleKeyDown(event) {
    
    let direction = keyMap[event.key];
    if(options.keyDown !== direction) {
        options.keyDown = direction;
    }
    if (direction) {
        event.preventDefault();
        move(direction, options.box);
        compositior(context, layers, options);
        _drawDirectionText(context, direction);
    }
    
    if(options.updateStarted === false) {
        updateRaf();
        options.updateStarted = true;
    }
}

function _handleKeyUp(event) {
    let direction = keyMap[event.key];
    if (direction === options.keyDown) {
        event.preventDefault();
        options.keyDown = null;
        options.updateStarted = false;
    }
}

function _handleTouchStart(event) {
    event.preventDefault();
    // event.stopPropagation();
    touchLog.start.x = event.touches[0].pageX;
    touchLog.start.y = event.touches[0].pageY;
    touchLog.moveFlag = false;
    touchLog.preventPullDownRefresh = window.pageYOffset == 0;
}

function _handleTouchMove(event) {
    let d = "";
    touchLog.move.x = event.touches[0].pageX - touchLog.start.x;
    touchLog.move.y = event.touches[0].pageY - touchLog.start.y;
    if (touchLog.preventPullDownRefresh) {
        // To suppress pull-to-refresh it is sufficient to preventDefault the first overscrolling touchmove.
        touchLog.preventPullDownRefresh = false;
        if (touchLog.move.y > 0) {
            event.preventDefault();
        }
    }
    let xFlag = (Math.abs(touchLog.move.x) > Math.abs(touchLog.move.y));
    if (Math.abs(touchLog.move.x) > 30 || Math.abs(touchLog.move.y) > 30) {
        touchLog.moveFlag = true;
        if (xFlag) {
            if (touchLog.move.x > 0) {
                d = "right";
            } else {
                d = "left";
            }

        } else {
            if (touchLog.move.y > 0) {
                d = "down";
            } else {
                d = "up";
            }
        }
        touchLog.start.x = event.touches[0].pageX;
        touchLog.start.y = event.touches[0].pageY;
        touchLog.move.x = 0;
        touchLog.move.y = 0;
    }
    if (d) {
        // move callback
        move(d, options.box);
        compositior(context, layers, options);
        _drawDirectionText(context, d);

        if(options.keyDown !== d) {
            options.keyDown = d;
            if(options.updateStarted === false) {
                updateRaf();
                options.updateStarted = true;
            }
        }
    }

}

function _handleTouchEnd(event) {

    if (!touchLog.moveFlag) {
        // jump callback
    }

    touchLog = {
        start: { x: 0, y: 0 },
        move: { x: 0, y: 0 },
        moveFlag: false
    }

    options.keyDown = null;
    options.updateStarted = false;
}

function _drawDirectionText(context, direction)
{
	context.font = "30px Sans-Serif";
	context.textAlign = "center";
	context.fillText(direction.toUpperCase(), canvas.width/2, canvas.height/2); 
}


// function checkBoundary(to, options) {
//     let pass = false;
//     try {
//         if (to.x <= options.max.x && to.x >= options.min.x) {
//             if (to.y <= options.max.y && to.y >= options.min.y) {
//                 pass = true;
//             }
//         }

//         return pass;
//     } catch (e) {
//         console.log(e);
//         return pass;
//     }
// }

// function draw(ctx, options) {
//     if (options.fillStyle) {
//         ctx.fillStyle = options.fillStyle;
//     }
//     ctx.fillRect(options.x, options.y, options.w, options.h);
// }