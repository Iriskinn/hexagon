// Requires hexagon.js, AbstractHexState.js

/**
 * Calculates the sums on the empty field
 * @param {number[][]} board the current board state
 * @return {any[]} an array - at index 0: an array with the sums for each field / at index 1: the overall sum
 */
function calcSums(board) {
  let retBoard = [];
  let retSum = 0;
  for (let yc = 0; yc < board.length; yc++) {
    retBoard[yc] = [];
    for (let xc = 0; xc < board[yc].length; xc++)
      retBoard[yc][xc] = board[yc][xc] !== 0 ? NaN : 0;
  }
  for (let yc = 0; yc < board.length; yc++) {
    for (let xc = 0; xc < board[yc].length; xc++) {
      if (!isNaN(board[yc][xc])) {
        let addNewVal = false;
        let neighb = getNeighbors([xc, yc], board.length);
        for (let i = 0; i < neighb.length; i++) {
          let [x2, y2] = neighb[i];
          if (x2 >= 0 && x2 < board[0].length && y2 >= 0 && y2 < board.length && !isNaN(retBoard[y2][x2])) {
            retBoard[y2][x2] += board[yc][xc];
            addNewVal = true;
          }
        }
        if (addNewVal) retSum += board[yc][xc];
      }
    }
  }
  return [retBoard, retSum];
}

/**
 * Represents a game state of the Hexagon game. This class supports the general game: an arbitrary number of fields can remain empty in the end,
 * the sum of all fields neighboring empty fields is used to determine the winner.
 */
class HexGameState extends AbstractHexState {
  /**
   * Constructs a new game state
   * @param {object|number} init either an object representing the board layout and move number or one of the preset board layouts (see DEFAULT_BOARDS)
   */
  constructor(init) {
    super(init);
    this._totalMoves = 0;
    this._currentMove = 0;
    this._board = [];
    this._name = '';
    this._fieldVals = [];
    this._sum = 0;
    if (typeof init === 'number') {
      this._totalMoves = DEFAULT_BOARDS[init].moves;
      this._board = DEFAULT_BOARDS[init].board;
      this._name = DEFAULT_BOARDS[init].name;
    } else {
      this._totalMoves = init.moves;
      this._board = init.board;
      if (init.name) this._name = init.name;
      if (init.currentMove) this._currentMove = init.currentMove;
      if (init.fieldVals && (typeof init.sum === 'number')) { this._fieldVals = init.fieldVals; this._sum = init.sum; }
    }
    if (this._fieldVals.length == 0) {
      let [fV, s] = calcSums(this._board);
      this._fieldVals = fV;
      this._sum = s;
    }
  }

  /**
   * The current board position
   * @return {number[][]} the board: NaN fields cannot be played, 0 fields are empty, other numbers represent the numbers that were played so far
   */
  get board() {
    return this._board;
  }

  /**
   * The current sums on empty fields of the board
   * @return {number[][]} the field values: NaN for non-empty fields, otherwise the sum of the values on neighboring fields
   */
  get fieldVals() {
    return this._fieldVals;
  }

  /**
   * The number of total moves per player
   * @return {number} the total moves
   */
  get totalMoves() {
    return this._totalMoves;
  }

  /**
   * The current move number
   * @return {number} the current move
   */
  get currentMove() {
    return this._currentMove;
  }

  /**
   * The current sum of all numbers bordering on empty fields, or the sum of the values of empty fields in fieldVals
   * @return {number} the current sum
   */
  get sum() {
    return this._sum;
  }

  /**
   * The name of the game board
   * @return {string} the name
   */
  get name() {
    return this._name;
  }

  /**
   * Perform a move
   * @param {number} x the x coordinate of the field the next number should be placed on
   * @param {number} y the y coordinate of the field the next number should be placed on
   * @return {boolean|HexGameState} false if the move was invalid, the new game state if it was valid
   */
  play(x, y) {
    if (Math.floor(this._currentMove / 2) >= this._totalMoves) return false;
    if (x < 0 || x >= this._board[0].length) return false;
    if (y < 0 || y >= this._board.length) return false;
    y = this._board.length - y - 1;
    if (this._board[y][x] !== 0) return false;

    let nextNumber = (1 + Math.floor(this._currentMove / 2)) * (this._currentMove % 2 ? -1 : 1);
    let newBoard = []; let nfv = [];
    for (let yc = 0; yc < this._board.length; yc++) {
      newBoard[yc] = []; nfv[yc] = [];
      for (let xc = 0; xc < this._board[yc].length; xc++) {
        newBoard[yc][xc] = yc == y && xc == x ? nextNumber : this._board[yc][xc];
        nfv[yc][xc] = yc == y && xc == x ? NaN : this._fieldVals[yc][xc];
      }
    }

    let ns = this._sum;
    let addNewVal = false;
    let neighb = getNeighbors([x, y], this._board.length);
    for (let i = 0; i < neighb.length; i++) {
      let [x2, y2] = neighb[i];
      if (x2 >= 0 && x2 < this._board[0].length && y2 >= 0 && y2 < this._board.length && !isNaN(this._board[y2][x2])) {
        if (!isNaN(nfv[y2][x2])) {
          nfv[y2][x2] += nextNumber;
          addNewVal = true;
        }
        let removeVal = true;
        let neighb2 = getNeighbors([x2, y2], this._board.length);
        for (let k = 0; k < neighb2.length; k++) {
          let [x3, y3] = neighb2[k];
          if (x3 >= 0 && x3 < this._board[0].length && y3 >= 0 && y3 < this._board.length && !isNaN(nfv[y3][x3])) {
            removeVal = false;
            break;
          }
        }
        if (removeVal) ns -= this._board[y2][x2];
      }
    }
    if (addNewVal) ns += nextNumber;

    return new HexGameState({ name: this._name, moves: this._totalMoves, currentMove: this._currentMove + 1, board: newBoard, fieldVals: nfv, sum: ns });
  }

  /**
   * Check who won the game
   * @return {number} -1: player 1 (minimizer) won / 1: player 2 (maximizer) won / 0: draw / NaN: game not over yet
   */
  checkWinner() {
    if (Math.floor(this._currentMove / 2) < this._totalMoves) return NaN;
    if (this._sum < 0) return -1;
    if (this._sum > 0) return 1;
    return 0;
  }
}