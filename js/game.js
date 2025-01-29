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
    gGame.markedCount = 0
    gGame.coveredCount = gLevel.SIZE ** 2
    console.log('covered cells at beginning of game:', gGame.coveredCount);

    gMineCounter = gLevel.MINES
    //Dom
    var elCounter = document.querySelector('h2.counter span')
    elCounter.innerText = gMineCounter

    gBoard = buildBoard(gLevel.SIZE)

    renderBoard(gBoard)
    // setRandMines(gLevel.MINES)

    var restartButton = document.querySelector('.restart')
    restartButton.innerText = '😃'

    var elH2 = document.querySelector('.modal h2')
    elH2.style.display = 'none'
}
function buildBoard(size) {
    const board = createMat(size, size)

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

    board[2][2].isMine = true
    board[0][3].isMine = true
    console.table(board)
    // setMinesNegsCount(0, 3, board)
    return board
}

function chooseLevel(level) {
    switch (level) {
        case 'beginner':
            gLevel.SIZE = 4
            gLevel.MINES = 2
            break
        case 'medium':
            gLevel.SIZE = 8
            gLevel.MINES = 14
            break
        case 'expert':
            gLevel.SIZE = 12
            gLevel.MINES = 32
            break
        default:
            console.log('invalid level');
            return
    }
    onInit()
}

// function setRandMines(mines) {
//     for (var i = 0; i < mines; i++) {
//         var emptyCell = getEmptyCells(gBoard)

//         gBoard[emptyCell.i][emptyCell.j].isMine = true
//         console.log(`mine added at ${emptyCell.i}, ${emptyCell.j}`);

//         renderBoard(gBoard)
//     }
// }

// function getEmptyCells(board) {
//     var emptyCells = [] //arrange empty cells coordinates in an array
//     for (var i = 0; i < board.length; i++) {
//         for (var j = 0; j < board[i].length; j++) {
//             if (board[i][j].isCovered && !board[i][j].isMine)
//                 emptyCells.push({ i, j })// short for  { i: i, j: j }
//         }
//     }
//     var randomIdx = getRandomInt(0, emptyCells.length - 1) // gives an index from the emptyCells array. in the array the indx represents an object
//     // console.log('random idx for mine:', randomIdx);
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
    // console.log('Number of mines nearby', minesAroundCount);
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
        uncover(elCell, i, j)
        gameOver() // lose one life or Game over

    } else {
        uncover(elCell, i, j)
        gGame.coveredCount--
    }

    console.log('remaining covered cells including flags:', gGame.coveredCount);
    isVictory()
}

function uncover(elCell, i, j) { // left click //changes only the visibility
    // console.log('uncovered cell:', elCell);
    //model
    gBoard[i][j].isCovered = false

    //Dom
    var elCellContent = elCell.querySelector('.cell-content')// span disappears after renderCell
    console.log('elCellContent:', elCellContent);
    elCellContent.style.visibility = 'visible'

    //Dom
    elCell.style.backgroundColor = 'yellow'

    if (gBoard[i][j].isMine) {
        elCell.style.backgroundColor = 'red'
    }
}

function expandUncover(i, j) {
    //uncover neghibor cells to empty cells

    console.log('hello expand~~~~~~~');

    for (var rowIdx = i - 1; rowIdx <= i + 1; rowIdx++) {
        if (rowIdx < 0 || rowIdx >= gBoard.length) continue

        for (var colIdx = j - 1; colIdx <= j + 1; colIdx++) {
            if (rowIdx === i && colIdx === j) continue
            if (colIdx < 0 || colIdx >= gBoard[rowIdx].length) continue

            var elNeighbor = document.querySelector(`[data-i="${rowIdx}"][data-j="${colIdx}"]`) // get the html details in order to uncover
            var neighborCell = gBoard[rowIdx][colIdx]
            if (neighborCell.isMine) {
                return
            }
            if (neighborCell.isCovered) {
                uncover(elNeighbor, rowIdx, colIdx)
                gGame.coveredCount-- //don't count a cell that has been uncovered already
            }
            if (neighborCell.minesAroundCount === 0) {
                expandUncover(gBoard, rowIdx, colIdx)
            }

        }
    }

}

function yoohoo() {
    console.log('yoohoo!!');

}


function uncoverNeighbors(cellI, cellJ, mat) { //uncover neghibor cells to empty cells
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue

            var elNeighbor = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) // get the html details in order to uncover
            var neighborCell = mat[i][j]

            console.log('mines around neighbor:', neighborCell.minesAroundCount);
            if (neighborCell.minesAroundCount === 0) {
                console.log(`Neighbor is empty. Expanding uncover for neighbor [${i}, ${j}]`);
                expandUncover(i, j)
                yoohoo()
            }
            if (neighborCell.isCovered) {
                uncover(elNeighbor, i, j)
                gGame.coveredCount-- //don't count a cell that has been uncovered already

            }

        }
    }
}



function uncoverAll(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            var modelCell = board[i][j]
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) // get the html details in order to uncover
            console.log('elCell:', elCell);
            uncover(elCell, i, j)
        }
    }
    gGame.coveredCount = 0
}

function onCellMarked(i, j) { //flags
    if (!gGame.isOn) return

    // Dom right-click event
    console.log('Cell marked at:', i, j);
    //Dom
    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) //spefic cell that was clicked
    console.log('elCell:', elCell);

    // Mark the cell by changing its content
    if (gBoard[i][j].isMarked) {
        elCell.innerText = EMPTY
        gGame.markedCount--
        gMineCounter++
        console.log('mines left after flag:', gMineCounter);
        //Dom
        var elCounter = document.querySelector('h2.counter span')
        elCounter.innerText = gMineCounter
    } else {
        elCell.innerText = FLAG
        gGame.markedCount++
        //model
        gBoard[i][j].isMarked = true

        gMineCounter--
        console.log('mines left after flag:', gMineCounter);
        //Dom
        var elCounter = document.querySelector('h2.counter span')
        elCounter.innerText = gMineCounter
    }
    console.log('total flagged cells:', gGame.markedCount);
    elCell.classList.toggle('marked')
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
    // console.log('remaining covered cells:', gGame.coveredCount);
    console.log('flagged cells count:', gGame.markedCount);



    if (gGame.markedCount === gLevel.MINES && //number of flags = number of mines
        gGame.coveredCount === gLevel.MINES) {
        console.log('You Win!');

        var elH2 = document.querySelector('.modal h2')
        elH2.innerText = 'You Win!'
        elH2.style.display = 'block'
        var restartButton = document.querySelector('.restart')
        restartButton.innerText = '😎'
        gGame.isOn = false

        return true
    }
    return false
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

