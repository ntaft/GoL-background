document.addEventListener('DOMContentLoaded', () => {

  // sets up canvas variables; sets width to window
  const canvas = document.querySelector('.board');
  const context = canvas.getContext('2d');
  canvas.height = `${window.innerWidth}`;
  canvas.width = `${window.innerWidth}`;
  context.globalAlpha=0.8;

  // sets up board variables
  let board = [];
  let game = {
    rows: 50,
    columns: 50,
    margin: 1,
    speed: 200, // in ms per gen
    density: 1.2,
    pxWide: canvas.width,
    pxHigh: canvas.height,
    cellColor: '#FF4136',
    background: 'rgb(250, 250, 250)',
    generations: 0,
  };
  // variables for onscreen dot
  // adapted from http://cobwwweb.com/mutlicolored-dotted-grid-canvas
  let dot = {
    width: ((game.pxWide - (2 * game.margin)) / game.columns) - game.margin,
    height: ((game.pxHigh - (2 * game.margin)) / game.rows) - game.margin,
    // diameter: this.isWider ? this.height : this.width,
    // xMargin: this.isWider ? (game.pxWide - ((2 * game.margin) + (game.columns * this.diameter))) / game.columns : game.margin,
    // yMargin: !(this.isWider) ? (game.pxHigh - ((2 * game.margin) + (game.rows * this.diameter))) / game.rows : game.margin,
    // radius: Math.abs(this.diameter) * 0.5,
  };

// // implementation of offscreen canvas is still shaky, but might speed up performance...
// board.offscreenCanvas = document.createElement("canvas");
// board.offscreenCanvas.width = game.pxHigh;
// board.offscreenCanvas.height = game.pxWide;
// board.offscreenContext = board.offscreenCanvas.getContext("2d");

  // adapted from http://cobwwweb.com/mutlicolored-dotted-grid-canvas
  // Because we don't know which direction (x vs. y) is the limiting sizing
  // factor, we'll calculate both first.
  // dot.width = ((game.pxWide - (2 * game.margin)) / game.columns) - game.margin;
  // dot.height = ((game.pxHigh - (2 * game.margin)) / game.rows) - game.margin;
  // Uses the limiting dimension to set the diameter.
  if( dot.width > dot.height )
  {
    dot.diameter = dot.height;
    dot.xMargin = (game.pxWide - ((2 * game.margin) + (game.columns * dot.diameter))) / game.columns;
    dot.yMargin = game.margin;
  }
  else
  { dot.diameter = dot.width;
    dot.xMargin = game.margin;
    dot.yMargin = (game.pxHigh - ((2 * game.margin) + (game.rows * dot.diameter))) / game.rows;
  }
  // Radius is still half of the diameter, because ... math.
  dot.radius = Math.abs(dot.diameter) * 0.5;



  // initializes a new board, and randomly seeds it with new 'life' i.e. red squares / 1's
  function initBoard () {
    game.generations = 0;
    board = [];
   for (var r=0; r < game.rows; r++) {
        board.push([]);
   };

   for (var row = 0; row < game.rows; row++) {
    for (var column = 0; column < game.columns; column++) {
      var randNum = Math.floor(Math.random()*game.density);
      board[row].push(randNum);
    }
  }
}

  // creates and returns an array full of 0's
  function zeroBoard() {
    board = [];
  for (var r=0; r < game.rows; r++) {
        board.push([]);
   }
   for (var row = 0; row < game.rows; row++) {
    for (var column = 0; column < game.columns; column++) {
      board[row].push(0);
      }
    }
  }

  // sums up and returns all the neighbors values in the array
  // checks to see if the neighbor position is out of bounds
  function neighborSum (x, y)  {
    let sum = 0;
    xBound = game.columns - 1;
    yBound = game.rows - 1;
    let b = board;

    if ((x === 0) && (y === 0)){
      sum =  b[x+1][y+1]+ b[x+1][y] + b[x][y+1];
    } else if ((x === xBound) && (y === yBound)){
      sum = b[x-1][y]+ b[x-1][y-1] + b[x][y-1];
    } else if ((x === 0) && (y === yBound)){
      sum = b[x][y-1]+ b[x+1][y-1] + b[x+1][y];
    } else if ((x === xBound) && (y === 0)){
      sum = b[x-1][y]+ b[x-1][y+1] + b[x][y+1];
    } else if (x === xBound){
      sum = b[x][y+1] + b[x][y-1] + b[x-1][y+1] + b[x-1][y-1] + b[x-1][y];
    } else if (y === yBound){
      sum = b[x+1][y] + b[x-1][y] + b[x+1][y-1] + b[x][y-1] + b[x-1][y-1];
    } else if (x === 0){
      sum = b[x][y+1] + b[x][y-1] + b[x+1][y+1] + b[x+1][y] + b[x+1][y-1];
    } else if (y === 0){
      sum = b[x+1][y] + b[x-1][y] + b[x+1][y+1] + b[x][y+1] + b[x-1][y+1];
    } else {
      sum = b[x+1][y] + b[x-1][y] + b[x][y+1] + b[x][y-1] + b[x+1][y+1] + b[x-1][y-1]+ b[x+1][y-1]+ b[x-1][y+1];

    }
    return sum;
  }

    function lifeGen() {
      console.log(board);
      clearDots();
      game.generations += 1;
      context.fillStyle = game.cellColor;
      let x = 0,
          y = -1,
          yBound = 0,
          arrLen = board[0].length;
      // using the format array = array.map(items=>items.map(item=>item))
      board = board.map( function (items) {
      y++;
      return items.map( function (cellVal) {
         // resets the board length counter to prevent overflow
         if (x === arrLen) {
           x = 0;
         };
         var neighbors = neighborSum (y, x);
         var state = null;
          // Basic rules of Conway's Game of Life:
          // If the cell is alive, then it stays alive only if it has  2 or 3 live neighbors.
          if ((cellVal === 1) && (( neighbors <= 3 ) && (neighbors >= 2))) {
            state = 1;
            drawDot(x, y, dot.radius);
         // If the cell is dead, then it becomes alive only if it has 3 live neighbors.
         } else if ((cellVal === 0) && (neighbors === 3)) {
            state = 1;
            drawDot(x, y, dot.radius);
         } else {
            state = 0;
         };
         x++;
         return state;
       });
      });
      // board.render(board.offscreenContext);
    }

  // draws each 'dot' - currently in the shape of a rectangle.
  function drawDot(x, y, radius, color) {
    // calculates the dot positioning based on the px margin, px diameter and board position
    const xPos = (x * (dot.diameter + dot.xMargin)) + game.margin + (dot.xMargin / 2) + dot.radius;
    const yPos = (y * (dot.diameter + dot.yMargin)) + game.margin + (dot.yMargin / 2) + dot.radius;
    context.fillRect(xPos, yPos, radius*2, radius*2);
    // context.beginPath();
    // context.arc(x, y, radius, 0, 2 * Math.PI, false);
    // context.fill();
  }
  // overlays the board with a blank rectangle
  function clearDots() {
    context.fillStyle = game.background;
    context.fillRect( 0, 0, game.pxWide, game.pxHigh);
  }

  // button handlers
  document.querySelector('.pause').addEventListener('click', pauseHandler);
  document.querySelector('.reset').addEventListener('click', resetHandler);
  document.querySelector('.clear').addEventListener('click', clearHandler);

  // event listeners for edit functionality
  document.addEventListener('mousedown', toggleCell)
  document.addEventListener('mouseup', () => document.removeEventListener('mousemove', dragCell));

  // pauses / unpauses the animation on click
  function pauseHandler(e) {
    e.stopPropagation();
    if (gameOfLife) {
      clearInterval(gameOfLife);
      gameOfLife = null;
    }
    else {
      gameOfLife = setInterval(lifeGen, game.speed);
    }
  }

  // resets the board to default state
  function resetHandler(e) {
    e.stopPropagation();
    clearInterval(gameOfLife);
    clearDots()
    initBoard();
    if (gameOfLife) gameOfLife = setInterval(lifeGen, game.speed);
    else lifeGen();
  }

  // zeroes out the board to a blank state
  function clearHandler(e) {
    e.stopPropagation();
    zeroBoard();
    clearDots();
  }

  // helper class that gets/sets the cell state and draws to canvas given the px coordinates
  class Cell {
    constructor(xPos, yPos) {
      // converts the on screen position to the 2d array position
      this.x = Math.floor((xPos / (dot.diameter + dot.xMargin)) + game.margin - (dot.xMargin / 2)) - 1;
      this.y = Math.floor((yPos / (dot.diameter + dot.yMargin)) + game.margin - (dot.yMargin / 2)) - 1;
    }
    // getter and setter for the cell state, 0 or 1
    get state() {
      return board[this.y][this.x]
    }
    set state(val) {
      board[this.y][this.x] = val;
    }
    // flips the cell bit to the designated state and draws to canvas
    draw(bit) {
      if (this.state != bit) {
        this.state = bit;
        context.fillStyle = bit ? game.cellColor: game.background
        drawDot(this.x, this.y, dot.radius)
      }
    }
  }

  // toggles the cell state on click; shift removes cells
  function toggleCell(e) {
    let mousePos = new Cell(e.clientX, e.clientY);
    e.shiftKey ? mousePos.draw(0) : mousePos.draw(1)
    document.addEventListener('mousemove', dragCell);
  }

  // toggles cell state on click and drag
  function dragCell(e){
    console.log(e);
    if ((0 < e.clientX && e.clientX < game.pxWide) && (0 < e.clientY && e.clientY < game.pxHigh)) {
      let dragPos = new Cell(e.clientX, e.clientY);
      e.shiftKey ? dragPos.draw(0) : dragPos.draw(1)
    }
  }

  // sets the initial board state and speed
  initBoard();
  let gameOfLife = setInterval(lifeGen, game.speed);

});
