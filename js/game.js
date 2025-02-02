'use strict'

const MINE = '💣'
const EMPTY = ' '
const FLAG = '🚩'

const LIFE = '<img src="img/game lives.png" alt="Life">'
const HINT = '<img src="img/bulb4.png" alt="Hint">'

//Model
var gBoard
var gMineCounter
var gLivesCount
var gHintsCount
var gIsFirstClick
var gIsClickAfterHint

//timer
var gMinutes
var gSeconds
var gMilliseconds
var gTimerIntervalId

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
    clearInterval(gTimerIntervalId)

    gGame.isOn = true
    gIsFirstClick = true
    gGame.markedCount = 0
    gGame.coveredCount = gLevel.SIZE ** 2 // all board is covered
    console.log('covered cells at beginning of game:', gGame.coveredCount);
    //lives
    if (gLevel.MINES === 2) {
        gLivesCount = 2
        updateLives(gLivesCount)
    } else {
        gLivesCount = 3
        updateLives(gLivesCount)
    }
    console.log('lives at beginning of game:', gLivesCount);
    //hints
    gHintsCount = 3
    updateHints(gHintsCount)
    gMineCounter = gLevel.MINES
    gIsClickAfterHint = false
    //Dom mine counter
    var elCounter = document.querySelector('h2.counter span')
    elCounter.innerText = gMineCounter

    //timer variables
    gMinutes = 0
    gSeconds = 0
    gMilliseconds = 0
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = '00:00:000';

    //board
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard)

    var restartButton = document.querySelector('.restart')
    restartButton.innerText = '😃'

    var elModal = document.querySelector('.modal')
    elModal.style.display = 'none'

    var elH2 = document.querySelector('.modal h2')
    elH2.style.display = 'none'
}

function buildBoard(size) {  //empty board
    const board = createMat(size, size)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {

            board[i][j] = {
                minesAroundCount: 0,
                isCovered: true,
                isMine: false,
                isMarked: false,
            }
        }
    }
    // board[2][2].isMine = true
    // board[0][3].isMine = true
    console.table(board)
    return board
}
//empty board render
function renderBoard(board) { //show the board visually using html
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j }) // cell-i-j

            // currCell.isMine ? cellClass += ' mine' : cellClass += ' safe'

            strHTML += `<td data-i="${i}" data-j="${j}" onclick="onCellClicked(this, ${i}, ${j})" class="cell ${cellClass}" >` //clicked cell
            strHTML += `<span class="cell-content" style="visibility: hidden;">`

            strHTML += '</span>'
            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board-table')
    elBoard.innerHTML = strHTML
}

function updateLives(lives) { // a number 3 at start
    var elLivesDiv = document.querySelector('.lives')
    elLivesDiv.innerHTML = ''
    for (var i = 0; i < lives; i++) {
        elLivesDiv.innerHTML += LIFE
    }

    console.log('lives left:', lives);
    if (lives === 0) {
        gameOver()
    }
}

function updateHints(hints) {
    var strHTML = '<div class="hints">'
    for (var i = 0; i < hints; i++) {
        strHTML += `<img src="img/bulb4.png" alt="Hint${i + 1}" data-id=${i + 1} onclick= "onHintClicked(this)">`
    }
    strHTML += '</div>'

    const elHintsDiv = document.querySelector('.hints')
    elHintsDiv.innerHTML = strHTML
}

function onHintClicked(elImg) {
    if (gHintsCount === 0) return
    //add condition if elImg has already been clicked
    if (elImg.style.backgroundColor === 'yellow') {
        console.log(`Hint ${elImg.dataset.id} has already been used`); // elImg.dataset.id =>1 / 2/ 3
        return
    }
    //directly access the img element
    gIsClickAfterHint = true
    elImg.style.backgroundColor = 'yellow'

    // gIsClickAfterHint = false
    gHintsCount--
    if (gHintsCount === 0) {
        console.log('No Hints Left');
    }
    console.log('Hints left:', gHintsCount);
}


function setRandMines(mines, firstClickI, firstClickJ) {
    //the function recieves i, j of first click and number of mines on the board
    //model
    console.log('firstClick coordinates for setRandMines:', firstClickI, firstClickJ);

    for (var i = 0; i < mines; i++) {
        var emptyCell = getEmptyCells(gBoard, firstClickI, firstClickJ)
        gBoard[emptyCell.i][emptyCell.j].isMine = true
        console.log(`mine added at ${emptyCell.i}, ${emptyCell.j}`);

        //Dom display mines on the board
        var elCell = document.querySelector(`[data-i="${emptyCell.i}"][data-j="${emptyCell.j}"]`)
        var elCellContent = elCell.querySelector('.cell-content')
        elCellContent.innerText = MINE
        // console.log('elCellContent:', elCellContent);
    }
}

function getEmptyCells(board, firstClickI, firstClickJ) {
    //this function makes an array of empty cells on the board 
    // that are not first click {i, j}, not a mine or neighbors
    var emptyCells = [] //arrange empty cells coordinates in an array
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (i === firstClickI && j === firstClickJ || board[i][j].isMine) continue

            const iAbsDiff = Math.abs(i - firstClickI) // can go one step up or down
            const jAbsDiff = Math.abs(j - firstClickJ) //can go one step left or right

            if (iAbsDiff + jAbsDiff === 1) continue  //vertical and horizontal negs
            if (iAbsDiff === 1 && jAbsDiff === 1) continue //diagonals negs

            emptyCells.push({ i, j })// short for  { i: i, j: j }
        }
    }
    var randomIdx = getRandomInt(0, emptyCells.length - 1) // gives an index from the emptyCells array. 
    //in the array the indx represents an object
    //console.log('random idx for mine:', randomIdx);
    return emptyCells[randomIdx]
}

function setMinesNegsCount(cellI, cellJ, board) { // get a cell and counts the mines around it. updates the object with the number
    var minesAroundCount = 0
    var currCell = board[cellI][cellJ]
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine === true) minesAroundCount++
        }
    }
    currCell.minesAroundCount = minesAroundCount
    // console.log('Number of mines nearby', minesAroundCount);
    return minesAroundCount
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return

    var currCell = gBoard[i][j]
    if (!currCell.isCovered) return
    if (currCell.isMarked) return

    elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) //spefic cell that was clicked
    console.log('clicked cell:', elCell); // html info

    if (gIsFirstClick) {
        console.log('this is your first click:', i, j);

        gTimerIntervalId = setInterval(updateTimer, 10)
        gIsFirstClick = false
        setRandMines(gLevel.MINES, i, j)
    }

    if (gIsClickAfterHint) {
        setTimeout(() => {
            uncover(elCell, i, j);
            uncoverNeighbors(i, j, gBoard);
            console.log('This was your hint!!');
        }, 100);

        setTimeout(() => {
            cover(elCell, i, j);
            coverNeighbors(i, j, gBoard);
            console.log('Hint is over!');
            gIsClickAfterHint = false;
        }, 1400)
    }

    uncover(elCell, i, j)
    gGame.coveredCount--

    //model
    if (currCell.minesAroundCount === 0) {
        uncoverNeighbors(i, j, gBoard)
    }
    if (currCell.isMine) {
        console.log('you have uncovered a mine');
        gGame.markedCount++
        gLivesCount--
        // gGame.coveredCount--
        updateLives(gLivesCount)
        gMineCounter--
        //Dom
        var elCounter = document.querySelector('h2.counter span')
        elCounter.innerText = gMineCounter
    }

    console.log('remaining covered cells including marked:', gGame.coveredCount);
    isVictory()
}

function uncover(elCell, i, j) { // left click //changes only the visibility
    // console.log('uncovered cell:', elCell);
    //model
    var currCell = gBoard[i][j]
    currCell.isCovered = false

    var renderedCellNums = setMinesNegsCount(i, j, gBoard) //gives the number of neighbor mines 
    // console.log('rendered cell nums:', renderedCellNums);

    //Dom: display
    // var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)//?? Not needed?
    var elCellContent = elCell.querySelector('.cell-content')
    elCellContent.style.visibility = 'visible'
    // console.log('elCellContent:', elCellContent);

    if (renderedCellNums === 0) {
        renderedCellNums = EMPTY
    }

    if (!currCell.isMine) {
        elCellContent.innerText = renderedCellNums //display the number
        elCell.style.backgroundColor = 'yellow'
    } else {
        elCell.style.backgroundColor = 'red'
        currCell.isCovered = true // a mine has to be covered always in order to determine victory
    }
}

function cover(elCell, i, j) {
    //model
    gBoard[i][j].isCovered = true
    //Dom
    elCell.style.backgroundColor = 'lemonchiffon'
    var elCellContent = elCell.querySelector('.cell-content')
    elCellContent.innerText = EMPTY
    elCellContent.style.visibility = 'hidden'
}

function coverNeighbors(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue

            var elNeighbor = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) // get the html details in order to uncover the neighbor
            var neighborCell = board[i][j] //model coordinates
            //model
            neighborCell.isCovered = true
            //Dom
            elNeighbor.style.backgroundColor = 'lemonchiffon'
            var elNeighborCellContent = elNeighbor.querySelector('.cell-content')
            elNeighborCellContent.innerText = EMPTY
            elNeighborCellContent.style.visibility = 'hidden'
        }
    }
}

function expandUncover(i, j) {
    if (gIsClickAfterHint) return
    //uncover neghibor cells to empty cells
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

function uncoverNeighbors(cellI, cellJ, board) { //uncover neghibor cells to empty cells. cellI and cellJ represent the original cell being check for neighbors
    console.log('hello uncover neighbors!!');

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue

            var elNeighbor = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) // get the html details in order to uncover the neighbor
            var neighborCell = board[i][j] //model coordinates

            // console.log('mines around neighbor:', neighborCell.minesAroundCount);
            if (neighborCell.minesAroundCount === 0) {
                // console.log(`Neighbor is empty. Expanding uncover for neighbor [${i}, ${j}]`);
                expandUncover(i, j)
            }
            if (neighborCell.isCovered) {//don't count a cell that has been uncovered already
                uncover(elNeighbor, i, j)
                gGame.coveredCount--

            }
        }
    }
}


function uncoverAll(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            var modelCell = board[i][j]
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) // get the html details in order to uncover
            // console.log('elCell:', elCell);
            uncover(elCell, i, j)
        }
    }
    gGame.coveredCount = 0
}

function onCellMarked(i, j) { //flags
    if (!gGame.isOn) return
    if (!gBoard[i][j].isCovered) return
    // Dom right-click event details from dataset
    console.log('Cell marked at:', i, j);
    //Dom
    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) //spefic cell that was clicked
    console.log('elCell:', elCell);

    if (!gBoard[i][j].isMarked) {
        elCell.innerText = FLAG
        gGame.markedCount++
        //model
        gBoard[i][j].isMarked = true
        gMineCounter--
        console.log('mines left after flag:', gMineCounter);
    } else {
        //if the cell is already marked, second right click will remove the flag
        elCell.innerText = EMPTY
        gGame.markedCount--
        gMineCounter++
        gBoard[i][j].isMarked = false
        gGame.coveredCount++
        //Dom
        var elCounter = document.querySelector('h2.counter span')
        elCounter.innerText = gMineCounter //update mine counter display

    }
    //Dom
    var elCounter = document.querySelector('h2.counter span')
    elCounter.innerText = gMineCounter //update mine counter display

    elCell.classList.toggle('marked')
    console.log('elCell after toggle:', elCell);
    console.log('total flagged cells:', gGame.markedCount);

    isVictory()
}

function gameOver() {
    clearInterval(gTimerIntervalId)
    gGame.isOn = false
    uncoverAll(gBoard)
    gGame.secsPassed = gSeconds
    console.log('sec passed:', gSeconds);

    //DOM
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'block'

    var elH2 = document.querySelector('.modal h2')
    elH2.innerText = 'Game Over'
    elH2.style.display = 'block'

    var restartButton = document.querySelector('.restart')
    restartButton.innerText = '😩'
}

//game ends in victory when all mines are flagged and all the other cells are shown
// lose when a mine is uncovered, uncover all cells + change button innerText to cry face

function isVictory() {
    // console.log('remaining covered cells:', gGame.coveredCount);
    console.log('marked cells count:', gGame.markedCount); //2

    var nonMinesCells = gLevel.SIZE ** 2 - gLevel.MINES //number of non mineCells on the board
    console.log('total non mines cells:', nonMinesCells);//14

    var uncoveredCells = getUncoveredCells()
    if (gGame.markedCount === gLevel.MINES && //number of flags === number of mines 
        nonMinesCells === uncoveredCells && gLivesCount > 0) { //14
        console.log('You Win!');
        clearInterval(gTimerIntervalId)
        gGame.secsPassed = gSeconds
        console.log('sec passed:', gSeconds);

        //Dom
        var elModal = document.querySelector('.modal')
        elModal.style.display = 'block'

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

function getUncoveredCells() {
    var uncoveredCells = 0 //should give a number of all cells that are !isCovered
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isCovered) {
                uncoveredCells++
            }
        }
    }
    console.log('total uncovered cells:', uncoveredCells); // on win game expected: 14 or 15
    return uncoveredCells
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

function onRestartGame() {
    console.log('Restarting the game...');
    clearInterval(gTimerIntervalId)
    onInit()
}

function toggleDarkMode() {
    const elBody = document.querySelector('body')
    const elBtn = document.querySelector('.dark-mode')

    if (elBtn.innerText === 'Dark Mode') {
        elBody.style.backgroundImage = 'url("img/dark_mode.png")'
        elBtn.innerText = 'Light Mode'

        const elTimer = document.querySelector('.timer')
        elTimer.style.color = 'yellow'

        const elFooter = document.querySelector('footer')
        elFooter.style.color = 'orangered'

        const elModal = document.querySelector('.modal')
        elModal.style.backgroundColor = 'orangered'

        const elH2Modal = document.querySelector('.modal h2')
        elH2Modal.style.color = 'black'

        const elH1 = document.querySelector('h1')
        elH1.style.color = 'yellow'

        const elH2 = document.querySelector('h2')
        elH2.style.color = 'yellow'

    } else {
        elBody.style.backgroundImage = 'url("img/explosion.jpg")'
        elBtn.innerText = 'Dark Mode'

        const elTimer = document.querySelector('.timer')
        elTimer.style.color = 'black'

        const elFooter = document.querySelector('footer')
        elFooter.style.color = 'black'

        const elModal = document.querySelector('.modal')
        elModal.style.backgroundColor = 'black'

        const elH2Modal = document.querySelector('.modal h2')
        elH2Modal.style.color = 'orange'

        const elH1 = document.querySelector('h1')
        elH1.style.color = 'black'

        const elH2 = document.querySelector('h2')
        elH2.style.color = 'black'

    }
}
