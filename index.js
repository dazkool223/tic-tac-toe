let human = "o";
let system = "x";

let humanwin = 0;
let syswin = 0;
let tieCount = 0;

let gameWon;
let boardState = [[0, 1, 2, 3, 4, 5, 6, 7, 8]];
let currentMove = 0;
let emptyBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];

function setPlayer() {
  let checkbox = document.getElementById("player");
  if (checkbox.checked) {
    human = "x";
    system = "o";
  } else {
    human = "o";
    system = "x";
  }
  document.getElementById(
    "youAre"
  ).innerHTML = `You are ${human.toUpperCase()}`;
}
var origBoard;
const winCombos = [
  //horizontal
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  //vertical
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  //slant
  [0, 4, 8],
  [6, 4, 2],
];

const cells = document.querySelectorAll(".cell");
startGame();

function startGame() {
  document.querySelector(".endgame").style.display = "none";
  document.getElementById("player").disabled = false;
  origBoard = Array.from(Array(9).keys());
  for (var i = 0; i < cells.length; i++) {
    cells[i].innerText = ""; //clear
    cells[i].style.removeProperty("background-color");
    cells[i].addEventListener("click", turnClick);
  }
  document.querySelector(".syswin").innerHTML = syswin;
  document.querySelector(".humanwin").innerHTML = humanwin;
  document.querySelector(".tieCount").innerHTML = tieCount;
  document.getElementById("undo").disabled = false;
  document.getElementById("redo").disabled = false;
}

function reset() {
  if (!gameWon) {
    syswin++;
    document.querySelector(".syswin").innerHTML = syswin;
  }
  boardState.length = 1;
  currentMove = 0;
  startGame();
}

function setBoard(board) {
  for (let i = 0; i < board.length; i++) {
    document.getElementById(i).innerHTML =
      typeof board[i] == "number" ? "" : board[i];
  }
}

// let undoStack = [];
function undo() {
  // undoStack.push(boardState.pop());
  if (currentMove > 0) {
    currentMove--;
    setBoard(boardState[currentMove]);
  }
}

function redo() {
  if (currentMove < boardState.length - 1) {
    currentMove++;
    setBoard(boardState[currentMove]);
  }
}

function turnClick(square) {
  // disabling player change when game is started
  document.getElementById("player").disabled = true;

  // check if the currentmove is occured by doing undo
  if (currentMove < boardState.length - 1) {
    let diff = boardState.length - currentMove;
    boardState.splice(-1 * diff, diff);
  }
  // check if the position is playable or not
  if (typeof origBoard[square.target.id] == "number") {
    // pass in the ID that clicking
    turn(square.target.id, human);
    //After the player takes a turn, check to see if there is a tie
    if (!checkTie()) turn(minimax(origBoard, system).index, system);
    currentMove++;
    boardState.push([...origBoard]);
  }
  console.log(boardState);
}

function turn(squareId, objectPlayer) {
  origBoard[squareId] = objectPlayer; //shows the player who has clicked the cell
  document.getElementById(squareId).innerText = objectPlayer; //put more string in the cell with the ID just called

  gameWon = checkWin(origBoard, objectPlayer); //check win
  if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
  let plays = board.reduce(
    (a, e, i) => (e === player ? a.concat(i) : a),
    []
  ); /* Use the minify method which will go through every element in the board array. And the concat function will not change the current array, but it will return a new array that will contain the values of the arrays passed in.
    // a is the final value to be returned
    // e is the element in the board array we are running through and indexing*/

  let gameWon = null;
  /* entries: Returns the enumerable property array of [key, value] pairs with the given object, similar to using the for ... in iteration. */
  for (let [index, win] of winCombos.entries()) {
    if (win.every((elem) => plays.indexOf(elem) > -1)) {
      //In essence the every function has the same effect as using a loop to loop through all elements of the array.
      //The indexOf function will look for an element in the array based on the value of the element, it returns the position (key) of the element if found, and -1 if it is not found.
      //if the player satisfies any array of values in winCombos
      gameWon = { index: index, player: player };
      break;
    }
  }
  return gameWon;
}

//create highlights all cells that make up a victory and prevents the user from entering any more boxes
function gameOver(gameWon) {
  for (let index of winCombos[gameWon.index]) {
    document.getElementById(index).style.backgroundColor =
      gameWon.player == human ? "blue" : "red";
  }
  for (var i = 0; i < cells.length; i++) {
    cells[i].removeEventListener("click", turnClick, false);
  }

  declareWinner(gameWon.player == human ? "You win!" : "You lose.");
  incrementWins(gameWon.player);

  document.getElementById("undo").disabled = true;
  document.getElementById("redo").disabled = true;
}

function incrementWins(player) {
  if (player == human) {
    humanwin++;
    document.querySelector(".humanwin").innerHTML = humanwin;
  } else {
    syswin++;
    document.querySelector(".syswin").innerHTML = syswin;
  }
}
function declareWinner(whoWin) {
  document.querySelector(".endgame").style.display = "block";
  document.querySelector(".whowin").innerHTML = whoWin;
}

function emptySquares() {
  //filter every element from the board array
  return origBoard.filter((s) => typeof s == "number");
}

function checkTie() {
  if (emptySquares().length == 0) {
    for (var i = 0; i < cells.length; i++) {
      cells[i].style.backgroundColor = "pink";
      cells[i].removeEventListener("click", turnClick, false);
    }
    declareWinner("Tie Game!");
    tieCount++;
    document.querySelector(".tieCount").innerHTML = tieCount;
    return true;
  }
  return false;
}

function minimax(newBoard, player) {
  //  find the indexes of the available spots in the board and set them to a variable called availSpots
  var availSpots = emptySquares();

  // check terminal states
  if (checkWin(newBoard, human)) {
    return { score: -10 }; // O win
  } else if (checkWin(newBoard, system)) {
    return { score: 10 }; // X win
  } else if (availSpots.length === 0) {
    return { score: 0 }; // tie
  }
  // Next, you need to collect the scores from each of the empty spots to evaluate later.
  var moves = [];
  //  Therefore, make an array called moves and loop through empty spots while collecting each move’s index and score in an object called move.
  for (var i = 0; i < availSpots.length; i++) {
    var move = {};
    // Then, set the index number of the empty spot that was stored as a number in the origBoard to the index property of the move object
    move.index = newBoard[availSpots[i]];
    // set the empty spot on the newboard to the current player
    newBoard[availSpots[i]] = player;

    // store the object resulted from the minimax function call that includes a score property to the score property of the move object.
    if (player == system) {
      var result = minimax(newBoard, human);
      move.score = result.score;
    } else {
      var result = minimax(newBoard, system);
      move.score = result.score;
    }

    newBoard[availSpots[i]] = move.index;

    // minimax reset new board to what it was before and pushes the move object to the moves aray
    moves.push(move);
  }

  // Then, the minimax algorithm needs to evaluate the best move in the moves array
  var bestMove;
  // It should choose the move with the highest score when AI is playing and the move with the lowest score when the human is playing. So...
  if (player === system) {
    // If the player is system, it sets a variable called bestScore to a very low number and loops through the moves array,
    var bestScore = -10000;
    for (var i = 0; i < moves.length; i++) {
      // if a move has a higher score than bestScore, the algorithm stores that move
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i; // In case there are moves with similar score, only the first one will be stored.
      }
    }
  } else {
    var bestScore = 10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}
