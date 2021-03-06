// Requires hexagon.js, HexGameState.js, HexGameBoard.js

/**
 * The menu for the hexagon game
 */
class HexMenu {
  /**
   * Creates a new hexagon game menu
   */
  constructor() {
    this._currentBoard = null;

    this._container = document.createElement('div');
    this._container.style.width = `${window.innerWidth}px`;
    this._container.style.height = `${window.innerHeight}px`;
    this._container.style.position = 'absolute';
    this._container.style.left = '0px';
    this._container.style.top = '0px';
    this._container.style.zIndex = '10';
    this._container.style.fontFamily = 'Merriweather';
    this._container.setAttribute('class', 'hex-menu');

    this._innerContainer = document.createElement('div');
    this._innerContainer.setAttribute('class', 'hex-menu-inner');
    this._container.appendChild(this._innerContainer);

    this._heading = document.createElement('h1');
    this._heading.setAttribute('class', 'hex-menu-heading');
    this._heading.innerHTML = 'Hexagon';
    this._innerContainer.appendChild(this._heading);

    this._continueButton = document.createElement('input');
    this._continueButton.setAttribute('class', 'hex-menu-button');
    this._continueButton.setAttribute('type', 'button');
    this._continueButton.setAttribute('value', 'Continue');
    this._continueButton.style.display = 'none';
    this._continueButton.addEventListener('click', () => this.continue());
    this._innerContainer.appendChild(this._continueButton);

    this._explA = document.createElement('p');
    this._explA.setAttribute('class', 'hex-menu-text');
    this._explA.innerHTML = 'Choose one of the maps below to start playing Hexagon.';
    this._innerContainer.appendChild(this._explA);

    this._boardContainer = document.createElement('div');
    this._boardContainer.setAttribute('class', 'hex-menu-map-container')
    this._boardDivs = [];
    this._boardCans = [];
    this._boardCons = [];
    for (let i = -1; i < DEFAULT_BOARDS.length; i++) {
      this._boardDivs[i + 1] = document.createElement('div');
      this._boardDivs[i + 1].setAttribute('class', 'hex-menu-map');
      this._boardDivs[i + 1].addEventListener('click', () => this.selectMap(i));

      let bName = document.createElement('div');
      bName.setAttribute('class', 'hex-menu-map-name');
      bName.innerHTML = i == -1 ? 'Random' : DEFAULT_BOARDS[i].name;
      this._boardDivs[i + 1].appendChild(bName);

      this._boardCans[i + 1] = document.createElement('canvas');
      this._boardCons[i + 1] = this._boardCans[i + 1].getContext('2d');
      drawSmallMap(this._boardCans[i + 1], this._boardCons[i + 1],
        i == -1 ? { board: [[0, X, 0, X], [0, 0, X, 0], [0, X, X, X], [X, X, 0, 0]] } : DEFAULT_BOARDS[i]);
      this._boardDivs[i + 1].appendChild(this._boardCans[i + 1]);

      this._boardContainer.appendChild(this._boardDivs[i + 1]);
    }
    this._innerContainer.appendChild(this._boardContainer);
    
    this._explB = document.createElement('p');
    this._explB.setAttribute('class', 'hex-menu-text');
    this._explB.innerHTML = `The rules are simple:
    <ul>
      <li>The game is played in turns.</li>
      <li>The first player places the numbers 1, 2, and so on by clicking on the board.</li>
      <li>The second player places the numbers -1, -2, and so on by clicking on the board.</li>
      <li>The first player wins if the sum of all numbers on fields bordering on empty fields is smaller than 0.</li>
      <li>The second player wins if the sum of all numbers on fields bordering on empty fields is greater than 0.</li>
      <li>Otherwise, the game ends in a draw.</li>
    </ul>
    The following additional commands are available:
    <ul>
      <li>Click: make move</li>
      <li>Mouse wheel and [+], [-] keys: zoom</li>
      <li>Drag mouse: move board</li>
      <li>[z] or [u] key: undo last move</li>
      <li>[h] key: hint &ndash; try to brute force the winner in 20s (using a C++ program that was compiled to
        <a href="https://webassembly.org/" target="_blank">WebAssembly</a>). If the game can be solved, P1, P2 and D indicators
        will appear on the game board to mark which moves would lead to player 1 winning, player 2 winning or a draw, respectively.
        If brute force yields no solution within 20s, random sampling is used to predict the outcome of the game. In this case,
        numbers will appear on the game board, inidicating the average outcome (between -1 and 1).<br />
        <b>Note:</b> The page will be unresponsive until the time limit is reached or a solution was found.</li>
      <li>[m] key: open menu</li>
    </ul>`;
    this._innerContainer.appendChild(this._explB);

    document.body.appendChild(this._container);
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Adapts the menu to the window size
   */
  resize() {
    this._container.style.width = `${window.innerWidth}px`;
    this._container.style.height = `${window.innerHeight}px`;
  }

  /**
   * Select a map to play
   * @param {number} idx the index of the map
   */
  selectMap(idx) {
    if (this._currentBoard) this._currentBoard.shutDown();
    this._currentBoard = new HexGameBoard(idx, this);
    this._container.style.display = 'none';
    this._continueButton.style.display = 'block';
  }

  /**
   * Continue playing the map
   */
  continue() {
    if (this._currentBoard) {
      this._currentBoard.reactivate();
      this._container.style.display = 'none';
    }
  }

  /**
   * Open this menu
   */
  openMenu() {
    this._container.style.display = 'block';
  }

  /**
   * Redraws the game board
   */
  redraw() {
    if (this._currentBoard) this._currentBoard.redraw();
  }
}