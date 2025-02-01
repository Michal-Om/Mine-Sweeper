'use strict';

function createMat(ROWS, COLS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}


function getClassName(location) {
    const cellClass = `cell-${location.i}-${location.j}`
    return cellClass
}

function updateTimer() {

    const elTimer = document.querySelector('.timer')
    if (gMilliseconds === 100) {
        gMilliseconds = 0
        gSeconds++
    }
    if (gSeconds === 60) {
        gSeconds = 0
        gMinutes++
    }
    //add zero if minutes are one digit
    var formattedMinutes = gMinutes < 10 ? '0' + gMinutes : gMinutes
    var formattedSeconds = gSeconds < 10 ? '0' + gSeconds : gSeconds
    var formattedMilliseconds
    if (gMilliseconds < 10) {
        formattedMilliseconds = '00' + gMilliseconds
    } else if (gMilliseconds < 100) {
        formattedMilliseconds = '0' + gMilliseconds
    } else {
        formattedMilliseconds = gMilliseconds
    }

    elTimer.innerText = `${formattedMinutes}: ${formattedSeconds}: ${formattedMilliseconds}`

    gMilliseconds++
}


setTimeout(() => {
    clearInterval(gTimerIntervalId)
}, 80000)


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

