"use strict";

const boardContainer = document.querySelector(".board-container");
const info = document.querySelector(".info");

const GameBoard = () => {
  const rows = 3;
  const columns = 3;
  let board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let c = 0; c < columns; c++) {
      board[i].push(Cell());
    }
  }

  const updateBoard = (piece, cell) => {
    cell.addPiece(piece);
  };

  const getBoard = () => board;

  const printBoard = () => {
    let modBoard = board.map((row) => {
      return row.map((col) => col.getCellValue());
    });
    return modBoard;
  };

  const availableCellsLength = () => {
    let availableCells = board.flat().filter((cell) => {
      return cell.getCellValue() === " ";
    });
    return availableCells.length;
  };

  const availableCells = () => {
    let availableCells = board.flat().filter((cell) => {
      return cell.getCellValue() === " ";
    });
    return availableCells;
  };

  return {
    updateBoard,
    getBoard,
    printBoard,
    availableCells,
    availableCellsLength,
  };
};

// This will be the object of per cell of the tic tac toe
const Cell = () => {
  let value = " ";
  const addPiece = (piece) => {
    value = piece;
  };

  const getCellValue = () => value;
  return { addPiece, getCellValue };
};

// This function will determine the computer move
const computerMove = (board) => {
  if (!board.availableCellsLength === 0) return;

  let availableCells = board.availableCells();
  let compMove =
    availableCells[Math.floor(Math.random() * availableCells.length)];

  return compMove;
};

const GameController = (player1, player2) => {
  let player1st = {
    piece: "X",
    player: player1,
    score: 0,
  };

  let player2nd = {
    piece: "O",
    player: player2,
    score: 0,
  };

  let players = [player1st, player2nd];
  let activePlayer = player1st;
  let board = GameBoard();

  const swtichTurn = () => {
    activePlayer = activePlayer === player2nd ? player1st : player2nd;

    // Call immediately computer move if its computer move after User end his turn
    if (
      activePlayer.player === "comp" &&
      board.availableCellsLength() != 0 &&
      !someoneWins()
    ) {
      round(computerMove(board));
    }
  };

  // Check if someone already wins
  const someoneWins = () => {
    let boardToCheck = board.printBoard().flat();
    let cellsToCheck = [
      boardToCheck.slice(0, 3),
      boardToCheck.slice(3, 6),
      boardToCheck.slice(6, 9),
      [boardToCheck[0], boardToCheck[3], boardToCheck[6]],
      [boardToCheck[1], boardToCheck[4], boardToCheck[7]],
      [boardToCheck[2], boardToCheck[5], boardToCheck[8]],
      [boardToCheck[0], boardToCheck[4], boardToCheck[8]],
      [boardToCheck[2], boardToCheck[4], boardToCheck[6]],
    ];

    let isUserWins = cellsToCheck.find((item) => {
      return item.every((element) => element === "X");
    });

    let isCompWins = cellsToCheck.find((item) => {
      return item.every((element) => element === "O");
    });

    let someoneWin = isUserWins || isCompWins ? true : false;
    return someoneWin;
  };

  // Check if its a draw
  const isDraw = () => {
    if (!someoneWins() && board.availableCellsLength() === 0) return true;
    return false;
  };

  //
  const round = (cell) => {
    board.updateBoard(activePlayer.piece, cell);
    if (someoneWins()) {
      addScore();
      activePlayer = player1st;
      return;
    }
    if (isDraw()) return;

    swtichTurn();
  };

  const addScore = () => {
    activePlayer.score += 1;
  };

  const isGameOver = () => {
    return players.some((player) => player.score === 2);
  };

  const resetCell = () => {
    board
      .getBoard()
      .flat()
      .forEach((cell) => cell.addPiece(" "));
  };

  if (player1st.player === "comp") {
    console.log("here");
    round(computerMove(board));
  }

  return {
    round,
    getBoard: board.getBoard(),
    activePlayer,
    someoneWins,
    isDraw,
    resetCell,
    players,
    isGameOver,
  };
};

const ScreenController = () => {
  const userScore = document.querySelector(".score-user");
  const compScore = document.querySelector(".score-comp");
  let game = GameController("user", "comp");

  const UpdateScreen = () => {
    boardContainer.innerHTML = "";

    // Create HTML buttons as cells
    game.getBoard.forEach((row, index) => {
      const rowContainer = document.createElement("div");
      let rowIndex = index;
      rowContainer.classList.add("row");
      row.forEach((col, index) => {
        const columnData = document.createElement("button");
        const cellText = document.createElement("p");
        let colIndex = index;
        cellText.classList.add("btn-text");
        columnData.classList.add("btn");
        columnData.dataset.locRow = rowIndex;
        columnData.dataset.locColumn = colIndex;
        cellText.textContent = col.getCellValue();
        columnData.appendChild(cellText);
        rowContainer.appendChild(columnData);
      });
      boardContainer.appendChild(rowContainer);

      // Update the screen based on the state of the game
      if (game.someoneWins() || game.isDraw()) {
        info.classList.add("active");
        if (game.someoneWins()) {
          userScore.textContent = game.players[0].score;
          compScore.textContent = game.players[1].score;
          info.textContent = "Next Round?";
        }
        if (game.isGameOver()) {
          info.textContent = "Play Again?";
        }
      }
    });
  };
  // Table click event
  const clickMoveHandler = function (e) {
    if (!e.target.dataset.locRow) return;

    // To Determine the location of the clicked element
    const locationRow = e.target.dataset.locRow * 1;
    const locationCol = e.target.dataset.locColumn * 1;

    // To selected the board object of the seleected element in the HTML
    const selectedCell = game.getBoard[locationRow][locationCol];

    // If the selected element already seleced, choice is invalid
    if (!(selectedCell.getCellValue() === " ")) {
      console.log("not available");
      return;
    }

    // If round or the game is over, clicking the table is no longer valid
    if (game.someoneWins() || game.isGameOver()) return;

    // Continue with the game round
    game.round(selectedCell);
    // Update the screen after the round ends
    UpdateScreen();
  };

  // Next Round and Play again Click handler
  const clickNextRoundHandler = function (e) {
    game.resetCell();
    info.classList.remove("active");
    if (game.isGameOver()) {
      game.players.forEach((player) => (player.score = 0));
      userScore.textContent = game.players[0].score;
      compScore.textContent = game.players[1].score;
    }
    UpdateScreen();
  };

  UpdateScreen();
  boardContainer.addEventListener("click", clickMoveHandler);
  info.addEventListener("click", clickNextRoundHandler);
};

ScreenController();
