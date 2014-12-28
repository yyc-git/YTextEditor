var canvas = document.getElementById("textEditor"),
    context = canvas.getContext("2d"),
    textarea = $("textarea"),
    blinkingInterval = null,
    BLANK_OFF = 500,
    BLANK_ON = 500,
    line = null,

    fontSelect = document.getElementById("fontSelect"),
    sizeSelect = document.getElementById("sizeSelect"),
    cursor = new TextCursor();


function getMousePosInCanvas(e) {
    var x = e.x || e.clientX,
        y = e.y || e.clientY,
        box = canvas.getBoundingClientRect();

    return {
        x: x - box.left * (canvas.width / box.width),
        y: y - box.top * (canvas.height / box.height)
    };
}

function saveImageData() {
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
}


function setFont() {
    context.font = sizeSelect.value + "px " + fontSelect.value;
}

function blinkCursor(x, y) {
    clearInterval(blinkingInterval);

    blinkingInterval = setInterval(function (e) {
        cursor.erase(context, imageData);

        setTimeout(function () {
            if (cursor.left === x && cursor.top + cursor.getHeight(context) === y) {
                cursor.draw(context, x, y);
            }
        }, BLANK_OFF);
    }, BLANK_ON + BLANK_OFF);
}

function moveCursor(x, y) {
    cursor.erase(context, imageData);
    saveImageData();
    context.putImageData(imageData, 0, 0);

    cursor.draw(context, x, y);
    blinkCursor(x, y);
}

function isTypingChinese(keyCode) {
    return keyCode === 229;
}

function hasChinese() {
    return textarea.val().match(/[\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b]+/) !== null;
}

function insertChinese() {
    insertToLine(textarea.val());
}

function eraseTextarea() {
    textarea.val("");
}

function isBackspace(keyCode) {
    return keyCode === 8;
}

function insertToLine(key) {
    context.save();

    line.erase(context, imageData);
    line.insert(key);

    moveCursor(line.left + line.getWidth(context), line.bottom);

    line.draw(context);

    context.restore();
}

function getCursorPos() {
    var box = canvas.getBoundingClientRect();

    return {
        x: cursor.left + box.left * (canvas.width / box.width),
        y: cursor.top + box.top * (canvas.height / box.height)
    };
}

function setTextareaPos() {
    var cursorPos = getCursorPos();

    textarea.css({
        "left": cursorPos.x,
        "top": cursorPos.y + cursor.getHeight(context)
    });
}


fontSelect.onchange = function () {
    setFont();
    //将焦点移到textarea中，如果已经为中文输入法，则可继续保持中文输入状态
    textarea.focus();
};
sizeSelect.onchange = function () {
    setFont();
    textarea.focus();
};

cursor.fillStyle = "rgba(0,0,255,0.5)";

context.fillStyle = "rgba(0,0,255,0.5)";

cursor.width = 2;

context.lineWidth = 2.0;
setFont();

saveImageData();


$(function () {
    /*!
     轮询判断是否已输入完中文
     */
    setInterval(function () {
        if (hasChinese()) {
            insertChinese();
            eraseTextarea();
        }
    }, 50);

    canvas.onmousedown = function (e) {
        var pos = getMousePosInCanvas(e);

        line = new TextLine(pos.x, pos.y);
        moveCursor(pos.x, pos.y);

        setTimeout(function () {
            textarea.val("");
            textarea.focus();
        }, 0);
    };

    $(document).on("keydown", function (e) {
        if (isTypingChinese(e.keyCode)) {
            setTextareaPos();
            return;
        }

        eraseTextarea();

        if (isBackspace(e.keyCode)) {
            context.save();

            line.erase(context, imageData);
            line.removeCharacterBeforeCaret();

            moveCursor(line.left + line.getWidth(context), line.bottom);

            line.draw(context);

            context.restore();

            e.preventDefault();
        }
    });

    $(document).on("keypress", function (e) {
        insertToLine(String.fromCharCode(e.which));
    });

    $("#clear").on("click", function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
    });
});
