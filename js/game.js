'use strict'

const MINE = '💣'
const EMPTY = ' '
const FLAG = '🚩'

//Model
var gBoard
var gMineCounter

const gGame = {
    isOn: false,
    coveredCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

const gLevel = {
    SIZE: 4,
    MINES: 2,
}

function onInit() {
    gGame.isOn = true
    gGame.coveredCount = gLevel.SIZE ** 2
    console.log('covered cells at beginning of game:', gGame.coveredCount);

    gMineCounter = gLevel.MINES
    //Dom
    var elCounter = document.querySelector('h2.counter span')
    elCounter.innerText = gMineCounter

    gBoard = buildBoard()
    renderBoard(gBoard)

    var restartButton = document.querySelector('.restart')
    restartButton.innerText = '😃'

    var elH2 = document.querySelector('.modal h2')
    elH2.style.display = 'none'
}

function buildBoard() {
    const board = createMat(gLevel.SIZE, gLevel.SIZE)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {

            board[i][j] = {
                minesAroundCount: 4,
                isCovered: true,
                isMine: false,
                isMarked: false,
            }
        }
    }
    // setRandMines(gLevel.MINES)
    board[2][2].isMine = true
    board[0][3].isMine = true
    console.table(board)

    setMinesNegsCount(0, 3, board)
    return board
}

// function setRandMines(mines) {
//     for (var i = 0; i < mines; i++) {
//         var emptyCell = getEmptyCells(gBoard)
//         gBoard[emptyCell.i][emptyCell.j].isMine = true
//         console.log(`mine added at ${emptyCell.i}, ${emptyCell.j}`);
//         renderCell(emptyCell, MINE);
//     }
// }

// // location is an object like this - { i: 2, j: 7 }
// function renderCell(location, value) {
//     // Select the elCell and set the value
//     const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
//     elCell.innerHTML = value
// }


// function getEmptyCells(board) {
//     var emptyCells = [] //arrange empty cells coordinates in an array
//     for (var i = 0; i < board.length; i++) {
//         for (var j = 0; j < board[i].length; j++) {
//             if (board[i][j] === null) {
//                 emptyCells.push({ i, j })// short for  { i: i, j: j }
//             }
//         }
//     }

//     var randomIdx = getRandomInt(0, emptyCells.length - 1) // gives an index from the emptyCells array. in the array the indx represents an object
//     console.log('random location for mine1:', randomIdx);


//     return emptyCells[randomIdx]
// }


function setMinesNegsCount(cellI, cellJ, board) {
    var minesAroundCount = 0
    var currCell = board[cellI][cellJ]
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine === true) minesAroundCount++
            currCell.minesAroundCount = minesAroundCount
        }
    }

    console.log('Number of mines nearby', minesAroundCount);
    // console.log(currCell); //object with number of mines

    // var elSpan = document.querySelector('h2 span') -> changes after flag
    // elSpan.innerText = minesAroundCount
    return minesAroundCount
}

function renderBoard(board) { //show the board visually using html
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var renderedCellNums = setMinesNegsCount(i, j, board)
            // console.log('rendered cell nums:', renderedCellNums);

            if (renderedCellNums === 0) {
                renderedCellNums = EMPTY
            }
            var cellClass = getClassName({ i: i, j: j }) // cell-i-j

            currCell.isMine ? cellClass += ' mine' : cellClass += ' safe'

            strHTML += `<td data-i="${i}" data-j="${j}" onclick="onCellClicked(this, ${i}, ${j})" class="cell ${cellClass}" >` //clicked cell
            strHTML += `<span class="cell-content" style="visibility: hidden;">`
            if (currCell.isMine) {
                strHTML += MINE
            } else {
                strHTML += renderedCellNums
            }

            strHTML += '</span>'
            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board-table')
    elBoard.innerHTML = strHTML

}

function onCellClicked(elCell, i, j) {
    elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) //spefic cell that was clicked
    console.log('clicked cell:', elCell); // html info
    //model
    var currCell = gBoard[i][j]

    if (currCell.minesAroundCount === 0 && currCell.isCovered) {
        uncoverNeighbors(i, j, gBoard)
    }

    if (currCell.isMine) {
        elCell.style.backgroundColor = 'red'
        console.log('elCell after color red:', elCell);// not working!!
        gameOver() // lose one life or Game over

    } else {
        uncover(elCell, i, j)
        gGame.coveredCount--
    }

    console.log('remaining covered cells:', gGame.coveredCount);

}

function uncover(elCell, i, j) { // left click
    console.log('uncovered cell:', elCell);
    //model
    gBoard[i][j].isCovered = false

    //Dom
    var elCellContent = elCell.querySelector('.cell-content')
    elCellContent.style.visibility = 'visible'
    elCell.style.backgroundColor = 'yellow'
    //making all mines red - need to fix
    if (gBoard[i][j].isMine) {
        elCell.style.backgroundColor = 'red'
    }
}

function uncoverNeighbors(cellI, cellJ, mat) { //uncover neghibor cells to empty cells
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            var cell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) // get the html details in order to uncover
            if (mat[i][j].isCovered)
                gGame.coveredCount-- //don't count a cell that has been uncovered already
            uncover(cell, i, j)

        }
    }
}

function uncoverAll(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            var cell = board[i][j]
            var cell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) // get the html details in order to uncover
            uncover(cell, i, j)
        }
    }
    gGame.coveredCount = 0
}

function onCellMarked(i, j) { //flags
    // Dom right-click event
    console.log('Cell marked at:', i, j);
    //Dom
    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) //spefic cell that was clicked
    console.log('elCell:', elCell);

    // Mark the cell by changing its content
    if (gBoard[i][j].isMarked) {
        elCell.innerText = EMPTY
        gGame.markedCount--
    } else {
        elCell.innerText = FLAG
        gGame.markedCount++
    }
    elCell.classList.toggle('marked')

    //model
    gBoard[i][j].isMarked = true
    console.log('total marked cells:', gGame.markedCount);
    gMineCounter--
    console.log('mines left after flag:', gMineCounter);
    //Dom
    var elCounter = document.querySelector('h2.counter span')
    elCounter.innerText = gMineCounter
}

function gameOver() {
    gGame.isOn = false
    //DOM
    var elH2 = document.querySelector('.modal h2')
    elH2.innerText = 'Game Over'
    elH2.style.display = 'block'
    uncoverAll(gBoard)
    var restartButton = document.querySelector('.restart')
    restartButton.innerText = '😩'
}

//game ends in victory when all mines are flagged and all the other cells are shown
// lose when a mine is uncovered, uncover all cells + change button innerText to cry face


function isVictory() {
    if (gGame.markedCount === gLevel.MINES && //number of flags = number of mines
        gGame.coveredCount === gLevel.MINES) { // only mines remain covered/ flagged
        var elH2 = document.querySelector('.modal h2')
        elH2.innerText = 'You Win!'
    }
    return
}

function expandUncover(board, elCell, i, j) {

}

function onRestartGame(elBtn) {
    console.log('Restarting the game...');
    // elBtn.innerText = (!isVictory) ? '😃' : '😩'
    onInit()
}


function getClassName(location) {
    const cellClass = `cell-${location.i}-${location.j}`
    return cellClass
}

