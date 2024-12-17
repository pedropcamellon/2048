/**
 * @fileoverview Main game controller that handles user input and game flow
 */

import GameLogic from './gameLogic.js';
import MonteCarloAI from './ai.js';

/**
 * Main game controller class
 */
class Game {
    /**
     * Initialize the game
     */
    constructor() {
        /** @type {GameLogic} */
        this.gameLogic = new GameLogic();
        /** @type {MonteCarloAI} */
        this.ai = new MonteCarloAI(100);
        /** @type {boolean} */
        this.isAIPlaying = false;
        /** @type {number|null} */
        this.aiInterval = null;

        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for keyboard and buttons
     * @private
     */
    initializeEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('ai-button').addEventListener('click', this.toggleAI.bind(this));
        document.getElementById('reset-button').addEventListener('click', this.resetGame.bind(this));
    }

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} event - The keyboard event
     * @private
     */
    handleKeyPress(event) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            this.makeMove(event.key);
        }
    }

    /**
     * Make a move in the specified direction
     * @param {string} direction - The direction to move
     * @private
     */
    makeMove(direction) {
        const grid = this.getCurrentGrid();
        const result = this.gameLogic.makeMove(grid, direction);
        
        if (result.moved) {
            this.gameLogic.updateDisplay(grid);
            this.gameLogic.generateTile();
            this.gameLogic.score += result.score;
            document.getElementById('score').innerText = this.gameLogic.score;

            if (this.gameLogic.isGameOver(grid)) {
                this.handleGameOver();
            }
        }
    }

    /**
     * Get the current game grid
     * @returns {number[][]} - The current game grid
     * @private
     */
    getCurrentGrid() {
        const tiles = Array.from(document.querySelectorAll('.tile'));
        const grid = [];
        for (let i = 0; i < 4; i++) {
            grid[i] = [];
            for (let j = 0; j < 4; j++) {
                grid[i][j] = parseInt(tiles[i * 4 + j].innerText) || 0;
            }
        }
        return grid;
    }

    /**
     * Toggle AI player on/off
     * @private
     */
    toggleAI() {
        const aiButton = document.getElementById('ai-button');
        if (!this.isAIPlaying) {
            this.isAIPlaying = true;
            aiButton.textContent = 'STOP (AI)';
            this.aiInterval = setInterval(this.makeAIMove.bind(this), 500);
        } else {
            this.stopAI();
        }
    }

    /**
     * Stop the AI player
     * @private
     */
    stopAI() {
        this.isAIPlaying = false;
        document.getElementById('ai-button').textContent = 'PLAY (AI)';
        if (this.aiInterval) {
            clearInterval(this.aiInterval);
            this.aiInterval = null;
        }
    }

    /**
     * Make an AI move
     * @private
     */
    makeAIMove() {
        const grid = this.getCurrentGrid();
        
        if (this.gameLogic.isGameOver(grid)) {
            this.handleGameOver();
            return;
        }

        const bestMove = this.ai.getBestMove(grid);
        this.makeMove(bestMove);
    }

    /**
     * Handle game over state
     * @private
     */
    handleGameOver() {
        this.stopAI();
        alert('Game Over! Final Score: ' + this.gameLogic.score);
    }

    /**
     * Reset the game
     * @private
     */
    resetGame() {
        this.stopAI();
        this.gameLogic.reset();
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
