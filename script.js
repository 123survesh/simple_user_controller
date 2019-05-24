var canvas = document.getElementById('container');
var context = canvas.getContext('2d');

var actionMap = {
    left: 1,
    right: 2,
    up: 3,
    down: 4,
    jump: 5
}
var keyMap = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    ' ': 'jump'
}
var options = {};

var touchLog = {
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
    h: 360,
    w: 640,
    border: 10,
}

options.canvas.draw = function (context) {
    context.clearRect(0, 0, options.canvas.w, options.canvas.h);

    context.lineWidth = options.canvas.border;
    context.strokeRect(0, 0, options.canvas.w, options.canvas.h);

}

options.box = {
    x: options.canvas.border,
    y: options.canvas.border,
    h: 25,
    w: 25,
    fillStyle: '#ff9933',
    min: {
        x: options.canvas.border,
        y: options.canvas.border
    },
    max: {
        x: options.canvas.w - (options.canvas.border + 25),
        y: options.canvas.h - (options.canvas.border + 25)
    },
}

options.box.draw = function (context) {
    context.lineWidth = 1;
    context.fillStyle = options.box.fillStyle;
    context.fillRect(options.box.x, options.box.y, options.box.w, options.box.h);
}

var layers = [];

layers.push('canvas');
layers.push('box');

canvas.height = options.canvas.h;
canvas.width = options.canvas.w;

compositior(context, layers, options);


addListeners();
function addListeners()
{
	document.addEventListener("keydown", _handleKeyDown);
	document.addEventListener("touchstart", _handleTouchStart);
	document.addEventListener("touchend", _handleTouchEnd);
	document.addEventListener("touchcancel", _handleTouchEnd);
	document.addEventListener("touchmove", _handleTouchMove);
}


function move(direction, options) {
    var action = actionMap[direction];
    var distance = 5;
    var toMove = {
        x: options.x,
        y: options.y
    }
    switch (action) {
    case 1:
        toMove.x = toMove.x - distance;
        break;
    case 2:
        toMove.x = toMove.x + distance;
        break;
    case 3:
        toMove.y = toMove.y - distance;
        break;
    case 4:
        toMove.y = toMove.y + distance;
        break;
    }
    if (checkBoundary(toMove, options)) {
        options.x = toMove.x;
        options.y = toMove.y;
    }
}

function checkBoundary(to, options) {
    var pass = false;
    try {
        if (to.x <= options.max.x && to.x >= options.min.x) {
            if (to.y <= options.max.y && to.y >= options.min.y) {
                pass = true;
            }
        }

        return pass;
    } catch (e) {
        console.log(e);
        return pass;
    }
}

function draw(ctx, options) {
    if (options.fillStyle) {
        ctx.fillStyle = options.fillStyle;
    }
    ctx.fillRect(options.x, options.y, options.w, options.h);
}

function compositior(context, array, options) {
    var aSize = array.length;
    for (var i = 0; i < aSize; ++i) {
        options[array[i]].draw(context);
    }
}

function _handleKeyDown(event) {
    var direction = keyMap[event.key];
    if (direction) {
        event.preventDefault();
        move(direction, options.box);
        compositior(context, layers, options);
    }
}

function _handleTouchStart(event) {
    event.preventDefault();
    // event.stopPropagation();
    touchLog.start.x = event.touches[0].pageX;
    touchLog.start.y = event.touches[0].pageY;
    touchLog.moveFlag = false;
}

function _handleTouchMove(event) {
    var d = "";
    touchLog.move.x = event.touches[0].pageX - touchLog.start.x;
    touchLog.move.y = event.touches[0].pageY - touchLog.start.y;
    var xFlag = (Math.abs(touchLog.move.x) > Math.abs(touchLog.move.y));
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
}