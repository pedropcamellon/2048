/**
 * @fileoverview Core game logic for the 2048 game
 */

/**
 * @typedef {Object} MoveResult
 * @property {boolean} moved - Whether any tiles were moved
 * @property {number} score - Score gained from the move
 */

/**
 * Represents the core game state and logic
 */
class GameLogic {
    /**
     * Initialize the game state
     */
    constructor() {
        /** @type {number} */
        this.score = 0;
        /** @type {HTMLElement} */
        this.scoreDisplay = document.getElementById('score');
        this.init();
    }

    /**
     * Initialize the game board
     */
    init() {
        const gridContainer = document.querySelector('.grid-container');
        for (let i = 0; i < 16; i++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            gridContainer.appendChild(tile);
        }
        this.generateTile();
        this.generateTile();
    }

    /**
     * Generate a new tile with value 2 or 4
     */
    generateTile() {
        const tiles = document.querySelectorAll('.tile');
        let emptyTiles = [];
        tiles.forEach((tile, index) => {
            if (!tile.innerText) emptyTiles.push(index);
        });
        if (emptyTiles.length > 0) {
            const randomIndex = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            tiles[randomIndex].innerText = Math.random() < 0.9 ? 2 : 4;
        }
    }

    /**
     * Update the game display with new grid values
     * @param {number[][]} grid - The current game grid
     */
    updateDisplay(grid) {
        const tiles = document.querySelectorAll('.tile');
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tile = tiles[i * 4 + j];
                const value = grid[i][j];
                tile.innerText = value || '';
                tile.className = 'tile' + (value ? ` tile-${value}` : '');
            }
        }
    }

    /**
     * Reset the game state
     */
    reset() {
        this.score = 0;
        this.scoreDisplay.innerText = '0';
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.innerText = '';
            tile.className = 'tile';
        });
        this.generateTile();
        this.generateTile();
    }

    /**
     * Check if the game is over
     * @param {number[][]} grid - The current game grid
     * @returns {boolean} - Whether the game is over
     */
    isGameOver(grid) {
        const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        for (const direction of directions) {
            const tempGrid = grid.map(row => [...row]);
            if (this.makeMove(tempGrid, direction).moved) {
                return false;
            }
        }
        return true;
    }

    /**
     * Make a move in the specified direction
     * @param {number[][]} grid - The current game grid
     * @param {string} direction - The direction to move ('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight')
     * @returns {MoveResult} - The result of the move
     */
    makeMove(grid, direction) {
        let moved = false;
        let score = 0;
        const size = grid.length;

        const mergeAndMove = (line) => {
            line = line.filter(cell => cell !== 0);
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2;
                    score += line[i];
                    line.splice(i + 1, 1);
                }
            }
            while (line.length < size) {
                line.push(0);
            }
            return line;
        };

        const rotateGrid = (grid) => {
            const newGrid = Array(size).fill().map(() => Array(size).fill(0));
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    newGrid[j][size - 1 - i] = grid[i][j];
                }
            }
            return newGrid;
        };

        let tempGrid = grid.map(row => [...row]);

        switch (direction) {
            case 'ArrowLeft':
                for (let i = 0; i < size; i++) {
                    const oldRow = [...tempGrid[i]];
                    tempGrid[i] = mergeAndMove(tempGrid[i]);
                    if (oldRow.some((val, idx) => val !== tempGrid[i][idx])) moved = true;
                }
                break;

            case 'ArrowRight':
                for (let i = 0; i < size; i++) {
                    const oldRow = [...tempGrid[i]];
                    tempGrid[i] = mergeAndMove([...tempGrid[i]].reverse()).reverse();
                    if (oldRow.some((val, idx) => val !== tempGrid[i][idx])) moved = true;
                }
                break;

            case 'ArrowUp':
                tempGrid = rotateGrid(rotateGrid(rotateGrid(tempGrid)));
                for (let i = 0; i < size; i++) {
                    const oldRow = [...tempGrid[i]];
                    tempGrid[i] = mergeAndMove(tempGrid[i]);
                    if (oldRow.some((val, idx) => val !== tempGrid[i][idx])) moved = true;
                }
                tempGrid = rotateGrid(tempGrid);
                break;

            case 'ArrowDown':
                tempGrid = rotateGrid(tempGrid);
                for (let i = 0; i < size; i++) {
                    const oldRow = [...tempGrid[i]];
                    tempGrid[i] = mergeAndMove(tempGrid[i]);
                    if (oldRow.some((val, idx) => val !== tempGrid[i][idx])) moved = true;
                }
                tempGrid = rotateGrid(rotateGrid(rotateGrid(tempGrid)));
                break;
        }

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                grid[i][j] = tempGrid[i][j];
            }
        }

        return { moved, score };
    }
}

export default GameLogic;
