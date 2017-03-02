document.addEventListener('DOMContentLoaded', () => {

  // sets up canvas variables; sets width to window
  const canvas = document.querySelector('.board');
  const context = canvas.getContext('2d');
  canvas.height = `${window.innerWidth}`;
  canvas.width = `${window.innerWidth}`;
  context.globalAlpha=0.8;

  // sets up board variables
  var board = [];
  var game = {
    rows: 50,
    columns: 50,
    speed: 300,
    density: 1.2,
    pxWide: canvas.width,
    pxHigh: canvas.height,
    cellColor: '#FF4136',
    background: 'rgb(250, 250, 250)',
  };

  // // pixel ratio adjuster via https://github.com/jondavidjohn/hidpi-canvas-polyfill
  // var getPixelRatio = function(context) {
  //   var backingStore = context.backingStorePixelRatio ||
  //         context.webkitBackingStorePixelRatio ||
  //         context.mozBackingStorePixelRatio ||
  //         context.msBackingStorePixelRatio ||
  //         context.oBackingStorePixelRatio ||
  //         context.backingStorePixelRatio || 1;

  //   return (window.devicePixelRatio || 1) / backingStore;
  // };

  const dotMargin = 1;
  const numRows = game.rows;
  const numCols = game.columns;

  const canvasWidth = canvas.width // / getPixelRatio(context);
  const canvasHeight = canvas.height // / getPixelRatio(context);

// // implementation of offscreen canvas is still shaky, but would speed up performance
// board.offscreenCanvas = document.createElement("canvas");
// board.offscreenCanvas.width = canvasHeight;
// board.offscreenCanvas.height = canvasWidth;
// board.offscreenContext = board.offscreenCanvas.getContext("2d");

  // adapted from http://cobwwweb.com/mutlicolored-dotted-grid-canvas
  // Because we don't know which direction (x vs. y) is the limiting sizing
  // factor, we'll calculate both first.
  const dotWidth = ((canvasWidth - (2 * dotMargin)) / numCols) - dotMargin;
  const dotHeight = ((canvasHeight - (2 * dotMargin)) / numRows) - dotMargin;
  // Now, we use the limiting dimension to set the diameter.
  if( dotWidth > dotHeight )
  {
    var dotDiameter = dotHeight;
    var xMargin = (canvasWidth - ((2 * dotMargin) + (numCols * dotDiameter))) / numCols;
    var yMargin = dotMargin;
  }
  else
  { var dotDiameter = dotWidth;
    var xMargin = dotMargin;
    var yMargin = (canvasHeight - ((2 * dotMargin) + (numRows * dotDiameter))) / numRows;
  }
  // Radius is still half of the diameter, because ... math.
  var dotRadius = Math.abs(dotDiameter) * 0.5;



  // initializes a new board, and randomly seeds it with new 'life' i.e. red squares / 1's
  function initBoard () {

   for (var r=0; r < game.rows; r++) {
        board.push([]);
   };

   for (var row = 0; row < game.rows; row++) {
    for (var column = 0; column < game.columns; column++) {
      var randNum = Math.floor(Math.random()*game.density);
      // var randNum = 1; //for testing
      board[row].push(randNum);
    }
  }
}

  // creates and returns an array full of 0's
  function clearBoard() {
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
    var sum = 0;
    xBound = game.columns - 1;
    yBound = game.rows - 1;
    var b = board;

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
      context.fillStyle = game.background;
      context.fillRect( 0, 0, canvasWidth, canvasHeight)
      context.fillStyle = game.cellColor;
      x = 0;
      y = -1;
      yBound = 0;
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
         // calculates the dot positioning
          var xPos = (x * (dotDiameter + xMargin)) + dotMargin + (xMargin / 2) + dotRadius;
          var yPos = (y * (dotDiameter + yMargin)) + dotMargin + (yMargin / 2) + dotRadius;
          // Basic rules of the Game of Life:
          // If the cell is alive, then it stays alive only if it has  2 or 3 live neighbors.
          if ((cellVal === 1) && (( neighbors <= 3 ) && (neighbors >= 2))) {
           state = 1;
           drawDot(xPos, yPos, dotRadius);
         // If the cell is dead, then it becomes alive only if it has 3 live neighbors.
         } else if ((cellVal === 0) && (neighbors === 3)) {
           state = 1;
            drawDot(xPos, yPos, dotRadius);
         } else {
           state = 0;
           // context.clearRect( xPos, yPos, dotRadius*2, dotRadius*2);
         };
         x++;
         return state;
       });
      });
      // board.render(board.offscreenContext);
    }

  // // pixel ratio adjuster via https://github.com/jondavidjohn/hidpi-canvas-polyfill
  // var getPixelRatio = function(context) {
  //   var backingStore = context.backingStorePixelRatio ||
  //         context.webkitBackingStorePixelRatio ||
  //         context.mozBackingStorePixelRatio ||
  //         context.msBackingStorePixelRatio ||
  //         context.oBackingStorePixelRatio ||
  //         context.backingStorePixelRatio || 1;
  //   return (window.devicePixelRatio || 1) / backingStore;
  // };

  // draws each 'dot' - currently changed to a rectangle.
  function drawDot(x, y, radius, color) {
    context.fillRect(x, y, radius*2, radius*2);
    // context.beginPath();
    // context.arc(x, y, radius, 0, 2 * Math.PI, false);
    // context.fill();
  }

 initBoard();
 var gameOfLife = setInterval(lifeGen, game.speed);

});
