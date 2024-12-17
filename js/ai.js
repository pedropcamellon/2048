/**
 * @fileoverview AI player implementation using Monte Carlo Tree Search
 */

/**
 * AI player using Monte Carlo Tree Search algorithm
 */
class MonteCarloAI {
    /**
     * Create an AI player
     * @param {number} numSimulations - Number of simulations to run for each move
     */
    constructor(numSimulations = 100) {
        /** @type {number} */
        this.numSimulations = numSimulations;
    }

    /**
     * Get the best move for the current game state
     * @param {number[][]} grid - The current game grid
     * @returns {string} - The best move direction
     */
    getBestMove(grid) {
        const moves = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        let bestScore = -1;
        let bestMove = moves[0];

        for (const move of moves) {
            let totalScore = 0;
            
            for (let i = 0; i < this.numSimulations; i++) {
                const simulationGrid = this.copyGrid(grid);
                const score = this.simulateMove(simulationGrid, move);
                totalScore += score;
            }

            const averageScore = totalScore / this.numSimulations;
            if (averageScore > bestScore) {
                bestScore = averageScore;
                bestMove = move;
            }
        }

        return bestMove;
    }

    /**
     * Create a deep copy of the grid
     * @param {number[][]} grid - The grid to copy
     * @returns {number[][]} - A deep copy of the grid
     * @private
     */
    copyGrid(grid) {
        return grid.map(row => [...row]);
    }

    /**
     * Simulate a move and subsequent random moves
     * @param {number[][]} grid - The current game grid
     * @param {string} move - The initial move to simulate
     * @returns {number} - The score for this simulation
     * @private
     */
    simulateMove(grid, move) {
        const tempGrid = this.copyGrid(grid);
        let score = 0;
        let depth = 0;
        const maxDepth = 10;

        const moveResult = this.makeMove(tempGrid, move);
        if (!moveResult.moved) return 0;
        score += moveResult.score;

        while (depth < maxDepth && this.hasEmptyCell(tempGrid)) {
            const randomMove = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'][Math.floor(Math.random() * 4)];
            const result = this.makeMove(tempGrid, randomMove);
            if (!result.moved) break;
            score += result.score;
            depth++;
        }

        score += this.evaluateGrid(tempGrid);

        return score;
    }

    /**
     * Make a move on the grid
     * @param {number[][]} grid - The current game grid
     * @param {string} direction - The direction to move
     * @returns {{moved: boolean, score: number}} - The result of the move
     * @private
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

        let tempGrid = this.copyGrid(grid);

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

    /**
     * Check if the grid has any empty cells
     * @param {number[][]} grid - The game grid to check
     * @returns {boolean} - Whether there are any empty cells
     * @private
     */
    hasEmptyCell(grid) {
        return grid.some(row => row.some(cell => cell === 0));
    }

    /**
     * Evaluate the current grid state
     * @param {number[][]} grid - The game grid to evaluate
     * @returns {number} - The evaluation score
     * @private
     */
    evaluateGrid(grid) {
        let score = 0;
        const size = grid.length;

        // Reward higher values
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                score += grid[i][j];
            }
        }

        // Reward empty cells
        score += this.countEmptyCells(grid) * 10;

        // Reward monotonicity
        score += this.evaluateMonotonicity(grid) * 20;

        return score;
    }

    /**
     * Count the number of empty cells in the grid
     * @param {number[][]} grid - The game grid
     * @returns {number} - Number of empty cells
     * @private
     */
    countEmptyCells(grid) {
        return grid.reduce((count, row) => 
            count + row.reduce((rowCount, cell) => 
                rowCount + (cell === 0 ? 1 : 0), 0), 0);
    }

    /**
     * Evaluate the monotonicity of the grid
     * @param {number[][]} grid - The game grid
     * @returns {number} - Monotonicity score
     * @private
     */
    evaluateMonotonicity(grid) {
        let score = 0;
        const size = grid.length;

        // Check rows
        for (let i = 0; i < size; i++) {
            let increasing = 0;
            let decreasing = 0;
            for (let j = 1; j < size; j++) {
                if (grid[i][j] > grid[i][j-1]) increasing++;
                if (grid[i][j] < grid[i][j-1]) decreasing++;
            }
            score += Math.max(increasing, decreasing);
        }

        // Check columns
        for (let j = 0; j < size; j++) {
            let increasing = 0;
            let decreasing = 0;
            for (let i = 1; i < size; i++) {
                if (grid[i][j] > grid[i-1][j]) increasing++;
                if (grid[i][j] < grid[i-1][j]) decreasing++;
            }
            score += Math.max(increasing, decreasing);
        }

        return score;
    }
}

export default MonteCarloAI;
