const row = 20;
const col = 10;
const player1 = 1;
const player2 = 2;
const board1 = document.getElementById('board1');
const board2 = document.getElementById('board2');
let gameOver = false;
const setSound = new Audio('sounds/setSound.wav');
const attackSound = new Audio('sounds/attackSound.mp3');
const clearSound = new Audio('sounds/clearSound.mp3');

// Player objects
const players = {
    1: {
        board: board1,
        tetrisArray: [],
        currentBlock: null,
        fallingBlock: null,
        nextBlock: null,
        blockOrientation: 0,
        attackScore: 0
    },
    2: {
        board: board2,
        tetrisArray: [],
        currentBlock: null,
        fallingBlock: null,
        nextBlock: null,
        blockOrientation: 0,
        attackScore: 0
    }
};

// Creates grid for both players
function createGrid(player) {
    const { board } = players[player];
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid');
            cell.id = player + '-' + i + '-' + j;
            board.appendChild(cell);
        }
    }
}

// Creates 2D array
function setArray(player) {
    const { tetrisArray } = players[player];
    for (let i = 0; i < row; i++) {
        tetrisArray[i] = [];
        for (let j = 0; j < col; j++) {
            // 0 = empty cell
            tetrisArray[i][j] = 0;
        }
    }
}

// Displays block on top of screen
function createBlock(player) {
    const { currentBlock } = players[player];
    // Draw the currentBlock
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            const cellId = `${player}-${i}-${j}`;
            const cell = document.getElementById(cellId);
            if (currentBlock.some(([row, col]) => row === i && col === j)) {
                cell.classList.remove('grid');
                cell.classList.add(getBlockClass(currentBlock));
            }
        }
    }
}

// Updates array as piece is falling on board 1 = falling block, 2 = set block
function updateArray(player, isSettingBlock = false) {
    const { tetrisArray, fallingBlock, currentBlock } = players[player];

    // Clear the previous fallingBlock positions in the tetrisArray
    tetrisArray.forEach((row, i) =>
        row.forEach((cell, j) => {
            if (cell === 1) {
                tetrisArray[i][j] = 0;
            }
        })
    );

    // Update the tetrisArray with the fallingBlock positions (1) or set block positions (2)
    fallingBlock.forEach(([row, col]) => {
        if (isSettingBlock){
            tetrisArray[row][col] = getBlockClass(currentBlock);
        }
        else {
            tetrisArray[row][col] = 1;
        }
    });

}

function startFalling(player) {
    if (gameOver) {
        return;
    }
    const { tetrisArray, fallingBlock } = players[player];

    // Calculate the new positions of the falling block cells
    let newPositions = fallingBlock.map(([row, col]) => [row + 1, col]);

    // Check if any of the new positions are invalid or collide with occupied cells
    const canMoveDown = newPositions.every(([newRow, newCol]) => {
        // Check if the new position is within the tetrisArray
        if (newRow >= tetrisArray.length) {
            return false;
        }

        // Check if a set block (2) is found
        if (tetrisArray[newRow][newCol] !== 0 && tetrisArray[newRow][newCol] !== 1) {
            return false;
        }

        // if no collisions return true
        return true;
    });

    if (canMoveDown) {
        clearPreviousBlock(player);
        // Update the fallingBlock with the new positions
        players[player].fallingBlock = newPositions;

        // Update the game board with the new position of the falling block
        updateArray(player);
        renderFalling(player);

        checkGameOver(player); // Call checkGameOver after updating the board

        // continue falling
        setTimeout(() => startFalling(player), 500);
    } else {
        // Block is set and cannot move

        setSound.currentTime = 0; 
        setSound.play();
        // Update the tetrisArray with the fallingBlock position 2
        updateArray(player, true);

        checkLineBreak(player);

        // Clear the fallingBlock
        players[player].fallingBlock = null;

        // Generate a new block 
        getCurrentBlock(player);
        // Generate a new preview block after rendering the current block
        getNextBlock(player);

        // Start falling for the next block after
        setTimeout(() => startFalling(player), 500);
    }
}

// Modified function to handle push down action for only the current player
function pushDown(player) {
    if (gameOver) {
        return;
    }
    const { fallingBlock } = players[player];

    // Keep track of whether the push down action should affect only the current player
    let onlyCurrentPlayer = true;

    // Check if the falling block for the current player can move down
    const { tetrisArray } = players[player];
    let newPositions = fallingBlock.map(([row, col]) => [row + 1, col]);
    const canMoveDown = newPositions.every(([newRow, newCol]) => {
        if (newRow >= tetrisArray.length || (tetrisArray[newRow][newCol] !== 0 && tetrisArray[newRow][newCol] !== 1)) {
            onlyCurrentPlayer = false;
            return false;
        }
        return true;
    });

    // If the current player's falling block can move down, apply the push down action
    if (canMoveDown && onlyCurrentPlayer) {
        clearPreviousBlock(player);
        players[player].fallingBlock = newPositions;
        updateArray(player);
        renderFalling(player);
    }
    //set block
    else{
        setSound.currentTime = 0; 
        setSound.play();
        updateArray(player, true);
        checkLineBreak(player);
        players[player].fallingBlock = null;
        getCurrentBlock(player);
        getNextBlock(player);

        checkGameOver(player); // Call checkGameOver after updating the board
    }
}


// Clears falling block from screen
function clearPreviousBlock(player) {
    const { fallingBlock } = players[player];

    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            const cellId = `${player}-${i}-${j}`;
            const cell = document.getElementById(cellId);
            if (fallingBlock && fallingBlock.some(([row, col]) => row === i && col === j)) {
                cell.classList.remove(getBlockClass(players[player].currentBlock));
                cell.classList.add('grid');
            }
        }
    }
}

// Renders block falling on screen.
function renderFalling(player) {
    const { fallingBlock, currentBlock } = players[player];

    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            const cellId = `${player}-${i}-${j}`;
            const cell = document.getElementById(cellId);
            if (fallingBlock.some(([row, col]) => row === i && col === j)) {
                cell.classList.remove('grid');
                cell.classList.add(getBlockClass(currentBlock));
            }
        }
    }
}

function checkLineBreak(player){
    const {tetrisArray, attackScore} = players[player];
    linesCleared =0;
    for (let i = tetrisArray.length - 1; i >= 0; i--) {
        //checks if each cell is occupied
        const isLineBreak = tetrisArray[i].every((cell) => cell !== 0 && cell !== 1 && cell !== 'attackblock');

        if (isLineBreak) {
            // Remove the full each element from row
            tetrisArray.splice(i, 1);
            linesCleared++;
        }
    }
    // Add a new empty array for each line cleared
    for (let i = 0; i < linesCleared; i++) {
        tetrisArray.unshift(new Array(col).fill(0));
    }
    
    // Update the game board if any lines were cleared
    if (linesCleared > 0) {
        clearSound.currentTime = 0; 
        clearSound.play();
        players[player].attackScore += linesCleared;
        //updateScore(player);
        updateBoard(player);
    }
    
}

function updateBoard(player){
    const { tetrisArray, board, } = players[player];
    // Clear current board
    board.innerHTML = '';
    console.log('Updating board with tetrisArray:', JSON.stringify(tetrisArray));


    // Redraw the game board based on the updated tetrisArray
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid');
            cell.id = `${player}-${i}-${j}`;
            //checks array to get previous block classes
            const blockClass = tetrisArray[i][j];
            console.log(`Cell (${i}, ${j}) - blockClass: ${blockClass}`);

            if (blockClass !== 0 && blockClass !== 1) {
                cell.classList.remove('grid');
                cell.classList.add(blockClass);
            }
            board.appendChild(cell);
        }
    }
}  

function addAttackLine(player) {
    const { tetrisArray } = players[player];
   
    attackSound.currentTime = 0; 
    attackSound.play();

    //check if blocks in first row
    const topRowHasBlocks = tetrisArray[0].some((cell) => cell !== 0 && cell !==1);
    if (topRowHasBlocks) {
        // If there are blocks in the top row, end the game
        gameOver = true;
        //endGame();
    } 
    else {

        // Remove the top row
        tetrisArray.shift();

        // Add a new row of blocks at the bottom
        const attackLine = new Array(col).fill('attackblock');
        tetrisArray.push(attackLine);

        updateBoard(player);
        checkGameOver(player);
    }
}

// Function to handle game over
function endGame(winner) {
    gameOver = true;
    const winnerMessage = document.getElementById('winner-message');
    winnerMessage.textContent = `Player ${winner} wins!`;
    document.getElementById('game-over-overlay').classList.remove('hidden');
}

function checkGameOver(player) {
    const { tetrisArray } = players[player];
    const topRowHasBlocks = tetrisArray[0].some(cell => cell !== 0 && cell !== 1);

    // Check if the game over condition is met and it hasn't been triggered before
    if (topRowHasBlocks) {
        endGame(player === 1 ? 2 : 1);
    }
}

function getBlockClass(shape) {
    if (shape === block) {
        return 'block'; // Apply the 'block' class
    }

    const shapeString = JSON.stringify(shape);

    if (shapeString === JSON.stringify(lblock)) {
        return 'lblock';
    } else if (shapeString === JSON.stringify(sblock)) {
        return 'sblock';
    } else if (shapeString === JSON.stringify(tblock)) {
        return 'tblock';
    } else if (shapeString === JSON.stringify(iblock)) {
        return 'iblock';
    } else if (shapeString === JSON.stringify(jblock)) {
        return 'jblock';
    } else if (shapeString === JSON.stringify(zblock)) {
        return 'zblock';
    } else {
        return 'block'; // Default class
    }
}

// Define the Tetris blocks
const block = [
    [0, 4],
    [0, 5],
    [1, 4],
    [1, 5]
];

const lblock = [
    [0, 4],
    [1, 4],
    [2, 4],
    [2, 5]
];

const sblock = [
    [0, 3],
    [0, 4],
    [1, 4],
    [1, 5],
];

const tblock = [
    [0, 4],
    [1, 3],
    [1, 4],
    [1, 5]
];

const iblock = [
    [0, 3],
    [0, 4],
    [0, 5],
    [0, 6]
];

const jblock = [
    [0, 3],
    [1, 3],
    [1, 4],
    [1, 5]
];

const zblock = [
    [0, 5],
    [0, 4],
    [1, 4],
    [1, 3]
];

// Function to render the next block in the preview container
function renderPreview(player, nextBlock) {
    const previewElement = document.getElementById(`preview${player}`);
    previewElement.innerHTML = ''; // Clear previous preview content

    // Create preview cells for the next block
    nextBlock.forEach(([row, col]) => {
        const cell = document.createElement('div');
        cell.classList.add('preview-cell');
        cell.classList.add(getBlockClass(nextBlock)); // Apply color based on block type
        cell.style.gridColumn = col + 1; // Adjust column index for CSS grid
        cell.style.gridRow = row + 1; // Adjust row index for CSS grid
        previewElement.appendChild(cell);
    });
}

// Modify getCurrentBlock to generate both falling and preview blocks
function getCurrentBlock(player) {
    const { fallingBlock, currentBlock, nextBlock, tetrisArray, blockOrientation } = players[player];

    players[player].currentBlock = nextBlock;
    players[player].fallingBlock = nextBlock;

    // Check tetris array.
    const canFit = nextBlock.every(([row, col]) => tetrisArray[row][col] === 0 || tetrisArray[row][col] === 1);

    // Continue game
    if (canFit) {
        players[player].blockOrientation = 0;
        createBlock(player);
        getNextBlock(player);
    } else {
        console.log("Game over!");
        gameOver = true;
        endGame(player === 1 ? 2 : 1); // Call endGame() with the winner
    }

    createBlock(player);
}

// Modify getNextBlock to generate a new preview block
function getNextBlock(player) {
    const blocks = [block, lblock, sblock, tblock, iblock, jblock, zblock];
    const randomIndex = Math.floor(Math.random() * blocks.length);
    const nextBlock = blocks[randomIndex];

    // Store the generated block in nextBlock
    players[player].nextBlock = nextBlock;

    // Render the next block in the preview container
    renderPreview(player, nextBlock);
}

function moveBlockLeft(player) {
    const { fallingBlock, tetrisArray } = players[player];
    // Check for collision with end of array or set block
    const canMoveLeft = fallingBlock.every(([row, col]) => col > 0 && (tetrisArray[row][col - 1] === 0 || tetrisArray[row][col - 1] === 1));

    if (canMoveLeft) {
        // Check for collision with end of array or set block
        clearPreviousBlock(player);
        players[player].fallingBlock = fallingBlock.map(([row, col]) => [row, col - 1]);
        renderFalling(player);
    }
}

function moveBlockRight(player) {
    const { fallingBlock, tetrisArray } = players[player];
    // Check for collision with end of array or set block
    const canMoveRight = fallingBlock.every(([row, col]) => col < 9 && (tetrisArray[row][col + 1] === 0 || tetrisArray[row][col + 1] === 1));
    // Update piece and board
    if (canMoveRight) {
        clearPreviousBlock(player);
        players[player].fallingBlock = fallingBlock.map(([row, col]) => [row, col + 1]);
        renderFalling(player);
    }
}


function rotateBlock(player) {
    const { fallingBlock, currentBlock, tetrisArray, blockOrientation } = players[player];
    
    let offsets;
    switch (getBlockClass(currentBlock)) {
        case 'lblock':
            // Rotation logic for L-block
            switch (blockOrientation) {
                case 0:
                    offsets = [[1, 1], [0, 0], [-1, -1], [0, -2]];
                    
                    break;
                case 1:
                    offsets = [[1, -1], [0, 0], [-1, 1], [-2, 0]];
                    
                    break;
                case 2:
                    offsets = [[-1, -1], [0, 0], [1, 1], [0, 2]];
                    break;
                case 3:
                    offsets = [[-1, 1], [0, 0], [1, -1], [2, 0]]; 
                    break;
            }
            break;
        case 'sblock':
            // Rotation logic for S-block
            switch (blockOrientation) {
                case 0:
                    offsets = [[0, 2], [1, 1], [0, 0], [1, -1]];
                    break;
                case 1:
                    offsets = [[2, 0], [1, -1], [0, 0], [-1, -1]];
                    break;
                case 2:
                    offsets = [[0, -2], [-1, -1], [0, 0], [-1, 1]];
                    break;
                case 3:
                    offsets = [[-2, 0], [-1, 1], [0, 0], [1, 1]];
                    break;
            }
            break;
        case 'tblock':
            // Rotation logic for T-block 
            switch (blockOrientation) {
                case 0:
                    offsets = [[1, 1], [-1, 1], [0, 0], [1, -1]];
                    break;
                case 1:
                    offsets = [[1, -1], [1, 1], [0, 0], [-1, -1]];
                    break;
                case 2:
                    offsets = [[-1, -1], [1, -1], [0, 0], [-1, 1]];
                    break;
                case 3:
                    offsets = [[-1, 1], [-1, -1], [0, 0], [1, 1]];
                    break;
            }
            break;
        case 'iblock':
            // Rotation logic for I-block
            switch (blockOrientation) {
                case 0:
                    offsets = [[-1, 1], [0, 0], [1, -1], [2, -2]];
                    break;
                case 1:
                    offsets = [[1, 1], [0, 0], [-1, -1], [-2, -2]];
                    break;
                case 2:
                    offsets = [[1, -1], [0, 0], [-1, 1], [-2, 2]];
                    break;
                case 3:
                    offsets = [[-1, -1], [0, 0], [1, 1], [2, 2]];
                    break;
            }
            break;
        case 'jblock':
            // Rotation logic for J-block
            switch (blockOrientation) {
                case 0:
                    offsets = [[0, 2], [-1, 1], [0, 0], [1, -1]];
                    break;
                case 1:
                    offsets = [[2, 0], [1, 1], [0, 0], [-1, -1]];
                    break;
                case 2:
                    offsets = [[0, -2], [1, -1], [0, 0], [-1, 1]];
                    break;
                case 3:
                    offsets = [[-2, 0], [-1, -1], [0, 0], [1, 1]];
                    break;
            }
            break;
        case 'zblock':
            // Rotation logic for Z-block
            switch (blockOrientation) {
                case 0:
                    offsets = [[2, 0], [1, 1], [0, 0], [-1, 1]];
                    break;
                case 1:
                    offsets = [[0, -2], [1, -1], [0, 0], [1, 1]];
                    break;
                case 2:
                case 2:
                    offsets = [[-2, 0], [-1, -1], [0, 0], [1, -1],];
                    break;
                case 3:
                    offsets = [[0, 2], [-1, 1], [0, 0], [-1, -1]];
            }
            break;
        default:
            return;
    }
    
    const newPositions = fallingBlock.map(([row, col], index) => {
        const [rowOffset, colOffset] = offsets[index];
        const newRow = row + rowOffset;
        const newCol = col + colOffset;
        return [newRow, newCol];
    });
    
    //check if rotatin doesnt cause collisions
    const canRotate = newPositions.every(([newRow, newCol]) =>
        newRow >= 0 &&
        newRow < tetrisArray.length &&
        newCol >= 0 &&
        newCol < tetrisArray[0].length &&
        (tetrisArray[newRow][newCol] === 0 || tetrisArray[newRow][newCol] === 1)
    );
    
    if (canRotate) {
        players[player].blockOrientation++;
        if (players[player].blockOrientation > 3){
            players[player].blockOrientation = 0;
        }
        clearPreviousBlock(player);
        players[player].fallingBlock = newPositions;
        renderFalling(player);
    }
}

// Check arrow keys for player 1 movement
function handlePlayer1Movement(event) {
    if (event.key === 'a') {
        moveBlockLeft(player1);
    }
    if (event.key === 'd') {
        moveBlockRight(player1);
    }
    if (event.key === 's') { // Add 's' key for pushing down for Player 1
        pushDown(player1);
    }
    if (event.key === 'c') {
        addAttackLine(player2);
        players[player1].attackScore -= 5; 
    }
}

function handlePlayer2Movement(event) {
    if (event.key === 'ArrowLeft') {
        moveBlockLeft(player2);
        event.preventDefault();
    }
    if (event.key === 'ArrowRight') {
        moveBlockRight(player2);
        event.preventDefault();
    }
    if (event.key === 'ArrowDown') { // Add 'ArrowDown' key for pushing down for Player 2
        pushDown(player2);
        event.preventDefault();
    }
    if (event.key === '0' && players[player2].attackScore >= 5) {
        addAttackLine(player1);
        players[player2].attackScore -= 5; 
    }
}

// Event listener for game start
document.getElementById('start-button').addEventListener('click', () => {
    setArray(player1);
    setArray(player2);
    createGrid(player1);
    createGrid(player2);
    getNextBlock(player1);
    getNextBlock(player2);
    getCurrentBlock(player1);
    getCurrentBlock(player2);
    startFalling(player1);
    startFalling(player2);
    // Add event listeners for player 1 and player 2 movement, rotation, and pushing down
    document.addEventListener('keydown', handlePlayer1Movement);
    document.addEventListener('keydown', handlePlayer1Rotation);
    document.addEventListener('keydown', handlePlayer2Movement);
    document.addEventListener('keydown', handlePlayer2Rotation);
    document.getElementById('start-overlay').classList.add('hidden');
});

// Function to handle rotation for Player 1
function handlePlayer1Rotation(event) {
    if (event.key === 'w') { // Rotate clockwise for Player 1
        rotateBlock(player1);
    }
}

// Function to handle rotation for Player 2
function handlePlayer2Rotation(event) {
    if (event.key === 'ArrowUp') { // Rotate clockwise for Player 2
        rotateBlock(player2);
        event.preventDefault();
    } 
}

