const row = 20;
const col = 10; 
const tetrisArray1 = [[],[]];
const tetrisArray2 = [[],[]];
const board1=document.getElementById('board1');
const board2=document.getElementById('board2');

//creates grid for both players
function createGrid(surface){
  for(let i=0; i < row; i++){
    for(let j = 0; j < col; j++){
      const cell = document.createElement('div');
      cell.classList.add('grid');
      cell.id = i + '-' + j;
      surface.appendChild(cell);
    }
  }
}

//creates 2d array 
function setArray(boardArray){
  for(let i=0; i < row; i++){
    boardArray[i] = [];
    for(let j = 0; j < col; j++){
      //false = empty cell
      boardArray[i][j] = false;
    }
  }
}

//test function for displaying block on grid
function createBlock(surface, shape){
  block.forEach(([row, col]) => {
    const cellId = `${row}-${col}`;
    const cell = document.getElementById(cellId);
    cell.classList.remove('grid');
    cell.classList.add('block');
  });
}
function redrawShape(surface, shape) {
    // Remove the 'block' class from all cells
    surface.querySelectorAll('.block').forEach(cell => {
        cell.classList.remove('block');
    });

    // Add the 'block' class to cells occupied by the falling block
    shape.forEach(([row, col]) => {
        const cellId = `${row}-${col}`;
        const cell = document.getElementById(cellId);
        cell.classList.add(getBlockClass(shape));
    });
}

function updateAndRedraw(surface, shape) {
  // Remove the 'block' class from all cells
  surface.querySelectorAll('.block').forEach(cell => {
      cell.classList.remove('block');
  });
// Update the position of the shape
  for (let i = 0; i < shape.length; i++) {
      const cell = shape[i];
      cell[0]++; // Move the cell down by one row
      const newRow = cell[0];
      const newCol = cell[1];
      
      // Check if the new position is within the grid bounds
      if (newRow >= 0 && newRow < row && newCol >= 0 && newCol < col) {
          // Update the cell's position and redraw it
          const newCellId = `${newRow}-${newCol}`;
          const newCell = document.getElementById(newCellId);
          newCell.classList.add('block');
      } else {
          // If the new position is outside the grid bounds, stop the block from moving further
          clearInterval(surface.getAttribute('data-interval-id'));
          break;
      }
  }
}
function startFalling(surface, shape) {
  // Calculate the initial column position for the block to start in the center
  const initialCol = Math.floor((col - shape[0].length) / 2);
  
  // Set the initial row position to 0 (top of the grid)
  const initialRow = 0;

  // Update the position of each cell in the shape to start at the calculated position
  shape.forEach(cell => {
      cell[0] += initialRow;
      cell[1] += initialCol;
  });

  // Redraw the shape in the new position
  redrawShape(surface, shape);

  // Start falling
  const intervalId = setInterval(() => {
      updateAndRedraw(surface, shape);
  }, 1000); // Adjust the interval (in milliseconds) for the speed of falling
  
  return intervalId;
}


//define the l shape block
const lblock = [
    [0,4],
    [1,4],
    [2,4],
    [2,5]
];
//define the s block
const sblock = [
    [0,4],
    [0,5],
    [1,3],
    [1,4],
];

//define the t block
const tblock = [
    [0, 4],
    [1, 3],
    [1, 4],
    [1, 5]
];
const iblock=[
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
    [0,4],
    [0,5],
    [1,3],
    [1,4]
];

createGrid(board1);
createGrid(board2);
setArray(tetrisArray1);
setArray(tetrisArray2);
//for viewing array contents using inspect element
console.log(tetrisArray1);
console.log(tetrisArray2);
//test block tetrimino
const block = [
  [0, 4], [0, 5],
  [1, 4], [1, 5]
];
createBlock(board1, block);
createBlock(board1, lblock);
createBlock(board1, sblock);
createBlock(board2, tblock);
createBlock(board2, iblock);
createBlock(board2, jblock);
createBlock(board2, zblock);
