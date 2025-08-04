// Battleship Game - Naval Combat Simulator
class BattleshipGame {
    constructor() {
        this.gameState = 'setup'; // setup, battle, gameOver
        this.currentPlayer = 'player';
        this.soundEnabled = true;
        
        // Game data
        this.playerGrid = this.createGrid();
        this.enemyGrid = this.createGrid();
        this.playerShips = [];
        this.enemyShips = [];
        this.playerFleet = this.createFleet();
        this.enemyFleet = this.createFleet();
        
        // Statistics
        this.stats = this.loadStats();
        
        // Game tracking
        this.playerHits = 0;
        this.playerMisses = 0;
        this.enemyHits = 0;
        this.enemyMisses = 0;
        this.shotsRemaining = 5;
        
        // Ship definitions
        this.shipTypes = {
            carrier: { size: 5, name: 'Carrier' },
            battleship: { size: 4, name: 'Battleship' },
            cruiser: { size: 3, name: 'Cruiser' },
            submarine: { size: 3, name: 'Submarine' },
            destroyer: { size: 2, name: 'Destroyer' }
        };
        
        this.initializeGame();
    }
    
    createGrid() {
        return Array(10).fill().map(() => Array(10).fill(null));
    }
    
    createFleet() {
        return {
            carrier: { size: 5, hits: 0, sunk: false, positions: [] },
            battleship: { size: 4, hits: 0, sunk: false, positions: [] },
            cruiser: { size: 3, hits: 0, sunk: false, positions: [] },
            submarine: { size: 3, hits: 0, sunk: false, positions: [] },
            destroyer: { size: 2, hits: 0, sunk: false, positions: [] }
        };
    }
    
    initializeGame() {
        this.setupEventListeners();
        this.createSetupGrid();
        this.updateStatistics();
        this.generateEnemyFleet();
    }
    
    setupEventListeners() {
        // Setup phase buttons
        document.getElementById('randomPlacementBtn').addEventListener('click', () => this.randomPlacement());
        document.getElementById('clearShipsBtn').addEventListener('click', () => this.clearShips());
        document.getElementById('startBattleBtn').addEventListener('click', () => this.startBattle());
        
        // Game controls
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('soundToggleBtn').addEventListener('click', () => this.toggleSound());
        
        // Drag and drop for ships
        this.setupDragAndDrop();
    }
    
    setupDragAndDrop() {
        const ships = document.querySelectorAll('.ship.draggable');
        ships.forEach(ship => {
            // Make ships draggable
            ship.draggable = true;
            ship.addEventListener('dragstart', (e) => this.handleDragStart(e));
            ship.addEventListener('dragend', (e) => this.handleDragEnd(e));
            
            // Add click event for rotation (clicking the ship itself)
            ship.addEventListener('click', (e) => {
                // Only rotate if clicking the ship itself, not the rotate button
                if (!e.target.classList.contains('rotate-btn')) {
                    this.rotateShip(e);
                }
            });
            
            // Add rotate button functionality
            const rotateBtn = ship.querySelector('.rotate-btn');
            if (rotateBtn) {
                rotateBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.rotateShip({ currentTarget: ship });
                });
            }
        });
    }
    
    createSetupGrid() {
        const grid = document.getElementById('playerSetupGrid');
        grid.innerHTML = '';
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Enable drop functionality
                cell.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                });
                cell.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    cell.classList.add('drag-over');
                });
                cell.addEventListener('dragleave', (e) => {
                    cell.classList.remove('drag-over');
                });
                cell.addEventListener('drop', (e) => this.handleDrop(e));
                
                grid.appendChild(cell);
            }
        }
    }
    
    createBattleGrids() {
        // Player grid
        const playerGrid = document.getElementById('playerGrid');
        playerGrid.innerHTML = '';
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.playerGrid[row][col]) {
                    cell.classList.add('ship');
                }
                
                playerGrid.appendChild(cell);
            }
        }
        
        // Enemy grid
        const enemyGrid = document.getElementById('enemyGrid');
        enemyGrid.innerHTML = '';
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => this.playerShoot(row, col));
                
                enemyGrid.appendChild(cell);
            }
        }
    }
    
    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    }
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }
    
    handleDrop(e) {
        e.preventDefault();
        const shipId = e.dataTransfer.getData('text/plain');
        const ship = document.getElementById(shipId);
        const cell = e.target.closest('.grid-cell');
        
        // Remove drag over effect
        document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('drag-over'));
        
        if (cell && ship && !ship.classList.contains('placed')) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const shipType = ship.dataset.type;
            const shipSize = parseInt(ship.dataset.size);
            const isVertical = ship.classList.contains('vertical');
            
            if (this.canPlaceShip(row, col, shipSize, isVertical)) {
                this.placeShip(row, col, shipType, shipSize, isVertical);
                ship.classList.add('placed');
                ship.draggable = false;
                this.checkAllShipsPlaced();
            } else {
                // Show feedback for invalid placement
                cell.classList.add('invalid-drop');
                setTimeout(() => {
                    cell.classList.remove('invalid-drop');
                }, 500);
            }
        }
        
        ship.classList.remove('dragging');
    }
    
    rotateShip(e) {
        e.stopPropagation(); // Prevent event bubbling
        const ship = e.currentTarget;
        
        if (!ship.classList.contains('placed')) {
            ship.classList.toggle('vertical');
            const visual = ship.querySelector('.ship-visual');
            
            if (ship.classList.contains('vertical')) {
                visual.style.flexDirection = 'column';
                visual.style.alignItems = 'center';
            } else {
                visual.style.flexDirection = 'row';
                visual.style.alignItems = 'stretch';
            }
        }
    }
    
    canPlaceShip(row, col, size, isVertical) {
        if (isVertical) {
            if (row + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (this.playerGrid[row + i][col]) return false;
            }
        } else {
            if (col + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (this.playerGrid[row][col + i]) return false;
            }
        }
        return true;
    }
    
    placeShip(row, col, type, size, isVertical) {
        const positions = [];
        
        if (isVertical) {
            for (let i = 0; i < size; i++) {
                this.playerGrid[row + i][col] = type;
                positions.push({ row: row + i, col: col });
                const cell = document.querySelector(`#playerSetupGrid .grid-cell[data-row="${row + i}"][data-col="${col}"]`);
                cell.classList.add('ship');
            }
        } else {
            for (let i = 0; i < size; i++) {
                this.playerGrid[row][col + i] = type;
                positions.push({ row: row, col: col + i });
                const cell = document.querySelector(`#playerSetupGrid .grid-cell[data-row="${row}"][data-col="${col + i}"]`);
                cell.classList.add('ship');
            }
        }
        
        this.playerFleet[type].positions = positions;
    }
    
    randomPlacement() {
        this.clearShips();
        
        Object.keys(this.shipTypes).forEach(type => {
            const size = this.shipTypes[type].size;
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                const isVertical = Math.random() < 0.5;
                
                if (this.canPlaceShip(row, col, size, isVertical)) {
                    this.placeShip(row, col, type, size, isVertical);
                    placed = true;
                    
                    const ship = document.getElementById(type);
                    ship.classList.add('placed');
                    ship.style.pointerEvents = 'none';
                }
                attempts++;
            }
        });
        
        this.checkAllShipsPlaced();
    }
    
    clearShips() {
        this.playerGrid = this.createGrid();
        this.playerFleet = this.createFleet();
        
        // Reset ship elements
        const ships = document.querySelectorAll('.ship.draggable');
        ships.forEach(ship => {
            ship.classList.remove('placed', 'vertical');
            ship.draggable = true;
            const visual = ship.querySelector('.ship-visual');
            visual.style.flexDirection = 'row';
        });
        
        // Clear grid display
        const cells = document.querySelectorAll('#playerSetupGrid .grid-cell');
        cells.forEach(cell => {
            cell.classList.remove('ship', 'drag-over', 'invalid-drop');
        });
        
        document.getElementById('startBattleBtn').disabled = true;
    }
    
    checkAllShipsPlaced() {
        const allPlaced = Object.keys(this.shipTypes).every(type => 
            this.playerFleet[type].positions.length > 0
        );
        
        document.getElementById('startBattleBtn').disabled = !allPlaced;
    }
    
    generateEnemyFleet() {
        this.enemyGrid = this.createGrid();
        this.enemyFleet = this.createFleet();
        
        Object.keys(this.shipTypes).forEach(type => {
            const size = this.shipTypes[type].size;
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                const isVertical = Math.random() < 0.5;
                
                if (this.canPlaceEnemyShip(row, col, size, isVertical)) {
                    this.placeEnemyShip(row, col, type, size, isVertical);
                    placed = true;
                }
                attempts++;
            }
        });
    }
    
    canPlaceEnemyShip(row, col, size, isVertical) {
        if (isVertical) {
            if (row + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (this.enemyGrid[row + i][col]) return false;
            }
        } else {
            if (col + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (this.enemyGrid[row][col + i]) return false;
            }
        }
        return true;
    }
    
    placeEnemyShip(row, col, type, size, isVertical) {
        const positions = [];
        
        if (isVertical) {
            for (let i = 0; i < size; i++) {
                this.enemyGrid[row + i][col] = type;
                positions.push({ row: row + i, col: col });
            }
        } else {
            for (let i = 0; i < size; i++) {
                this.enemyGrid[row][col + i] = type;
                positions.push({ row: row, col: col + i });
            }
        }
        
        this.enemyFleet[type].positions = positions;
    }
    
    startBattle() {
        this.gameState = 'battle';
        
        // Hide setup area, show battle area
        document.getElementById('setupArea').style.display = 'none';
        document.getElementById('battleArea').style.display = 'block';
        
        // Update phase indicator
        document.getElementById('setupPhase').classList.remove('active');
        document.getElementById('battlePhase').classList.add('active');
        
        // Create battle grids
        this.createBattleGrids();
        this.updateFleetStatus();
        this.updateBattleInfo();
        
        this.playSound('start');
    }
    
    playerShoot(row, col) {
        if (this.gameState !== 'battle' || this.currentPlayer !== 'player' || this.shotsRemaining <= 0) {
            return;
        }
        
        const cell = document.querySelector(`#enemyGrid .grid-cell[data-row="${row}"][data-col="${col}"]`);
        
        if (cell.classList.contains('hit') || cell.classList.contains('miss')) {
            return; // Already shot here
        }
        
        this.shotsRemaining--;
        
        if (this.enemyGrid[row][col]) {
            // Hit!
            const shipType = this.enemyGrid[row][col];
            cell.classList.add('hit');
            cell.innerHTML = '💥';
            cell.classList.add('hit-animation');
            
            this.enemyFleet[shipType].hits++;
            this.playerHits++;
            
            this.playSound('hit');
            
            // Check if ship is sunk
            if (this.enemyFleet[shipType].hits >= this.enemyFleet[shipType].size) {
                this.enemyFleet[shipType].sunk = true;
                this.markShipAsSunk('enemy', shipType);
                this.playSound('sink');
            }
            
            // Check for victory
            if (this.checkVictory('player')) {
                this.endGame('player');
                return;
            }
        } else {
            // Miss
            cell.classList.add('miss');
            cell.innerHTML = '💦';
            cell.classList.add('miss-animation');
            this.playerMisses++;
            this.playSound('miss');
        }
        
        this.updateBattleInfo();
        
        // Check if player has more shots
        if (this.shotsRemaining <= 0) {
            this.currentPlayer = 'enemy';
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }
    
    enemyTurn() {
        if (this.gameState !== 'battle' || this.currentPlayer !== 'enemy') {
            return;
        }
        
        const remainingShips = Object.values(this.enemyFleet).filter(ship => !ship.sunk).length;
        let shotsToFire = remainingShips;
        
        document.getElementById('currentTurn').textContent = "Enemy's Turn";
        
        const fireShot = () => {
            if (shotsToFire <= 0) {
                this.currentPlayer = 'player';
                this.shotsRemaining = Object.values(this.playerFleet).filter(ship => !ship.sunk).length;
                this.updateBattleInfo();
                return;
            }
            
            const target = this.getEnemyTarget();
            const cell = document.querySelector(`#playerGrid .grid-cell[data-row="${target.row}"][data-col="${target.col}"]`);
            
            if (this.playerGrid[target.row][target.col]) {
                // Hit!
                const shipType = this.playerGrid[target.row][target.col];
                cell.classList.add('hit');
                cell.innerHTML = '💥';
                cell.classList.add('hit-animation');
                
                this.playerFleet[shipType].hits++;
                this.enemyHits++;
                
                this.playSound('hit');
                
                // Check if ship is sunk
                if (this.playerFleet[shipType].hits >= this.playerFleet[shipType].size) {
                    this.playerFleet[shipType].sunk = true;
                    this.markShipAsSunk('player', shipType);
                    this.playSound('sink');
                }
                
                // Check for defeat
                if (this.checkVictory('enemy')) {
                    this.endGame('enemy');
                    return;
                }
            } else {
                // Miss
                cell.classList.add('miss');
                cell.innerHTML = '💦';
                cell.classList.add('miss-animation');
                this.enemyMisses++;
                this.playSound('miss');
            }
            
            shotsToFire--;
            
            if (shotsToFire > 0) {
                setTimeout(fireShot, 800);
            } else {
                setTimeout(() => {
                    this.currentPlayer = 'player';
                    this.shotsRemaining = Object.values(this.playerFleet).filter(ship => !ship.sunk).length;
                    this.updateBattleInfo();
                }, 1000);
            }
        };
        
        setTimeout(fireShot, 500);
    }
    
    getEnemyTarget() {
        // Smart AI that targets adjacent cells after a hit
        const hits = [];
        const playerCells = document.querySelectorAll('#playerGrid .grid-cell.hit');
        
        playerCells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if (!cell.classList.contains('sunk')) {
                hits.push({ row, col });
            }
        });
        
        // If there are recent hits, target adjacent cells
        if (hits.length > 0) {
            const directions = [
                { row: -1, col: 0 }, { row: 1, col: 0 },
                { row: 0, col: -1 }, { row: 0, col: 1 }
            ];
            
            for (let hit of hits) {
                for (let dir of directions) {
                    const newRow = hit.row + dir.row;
                    const newCol = hit.col + dir.col;
                    
                    if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
                        const targetCell = document.querySelector(
                            `#playerGrid .grid-cell[data-row="${newRow}"][data-col="${newCol}"]`
                        );
                        
                        if (!targetCell.classList.contains('hit') && !targetCell.classList.contains('miss')) {
                            return { row: newRow, col: newCol };
                        }
                    }
                }
            }
        }
        
        // Random target if no strategic options
        let row, col;
        do {
            row = Math.floor(Math.random() * 10);
            col = Math.floor(Math.random() * 10);
        } while (document.querySelector(`#playerGrid .grid-cell[data-row="${row}"][data-col="${col}"]`)
                .classList.contains('hit') || 
                document.querySelector(`#playerGrid .grid-cell[data-row="${row}"][data-col="${col}"]`)
                .classList.contains('miss'));
        
        return { row, col };
    }
    
    markShipAsSunk(player, shipType) {
        const fleet = player === 'player' ? this.playerFleet : this.enemyFleet;
        const gridId = player === 'player' ? 'playerGrid' : 'enemyGrid';
        
        fleet[shipType].positions.forEach(pos => {
            const cell = document.querySelector(
                `#${gridId} .grid-cell[data-row="${pos.row}"][data-col="${pos.col}"]`
            );
            cell.classList.add('sunk');
            cell.classList.add('sink-animation');
            cell.innerHTML = '☠️';
        });
        
        this.updateFleetStatus();
    }
    
    checkVictory(player) {
        const fleet = player === 'player' ? this.enemyFleet : this.playerFleet;
        return Object.values(fleet).every(ship => ship.sunk);
    }
    
    endGame(winner) {
        this.gameState = 'gameOver';
        
        // Update phase indicator
        document.getElementById('battlePhase').classList.remove('active');
        document.getElementById('gameOverPhase').classList.add('active');
        
        // Update statistics
        if (winner === 'player') {
            this.stats.gamesWon++;
            this.playSound('victory');
            alert('🎉 Victory! You have defeated the enemy fleet!');
        } else {
            this.stats.gamesLost++;
            this.playSound('defeat');
            alert('💀 Defeat! Your fleet has been destroyed!');
        }
        
        this.stats.totalShots += this.playerHits + this.playerMisses;
        this.saveStats();
        this.updateStatistics();
    }
    
    updateBattleInfo() {
        const playerShipsRemaining = Object.values(this.playerFleet).filter(ship => !ship.sunk).length;
        const enemyShipsRemaining = Object.values(this.enemyFleet).filter(ship => !ship.sunk).length;
        
        document.getElementById('currentTurn').textContent = 
            this.currentPlayer === 'player' ? 'Your Turn' : "Enemy's Turn";
        document.getElementById('shotsRemaining').textContent = 
            `Shots Remaining: ${this.shotsRemaining}`;
        document.getElementById('playerHits').textContent = this.playerHits;
        document.getElementById('playerMisses').textContent = this.playerMisses;
        document.getElementById('enemyShipsSunk').textContent = 
            `${5 - enemyShipsRemaining}/5`;
    }
    
    updateFleetStatus() {
        // Player fleet status
        const playerStatus = document.getElementById('playerFleetStatus');
        playerStatus.innerHTML = '';
        
        Object.keys(this.playerFleet).forEach(type => {
            const ship = this.playerFleet[type];
            const status = document.createElement('div');
            status.className = `ship-status ${ship.sunk ? 'sunk' : ''}`;
            status.textContent = this.shipTypes[type].name;
            playerStatus.appendChild(status);
        });
        
        // Enemy fleet status
        const enemyStatus = document.getElementById('enemyFleetStatus');
        enemyStatus.innerHTML = '';
        
        Object.keys(this.enemyFleet).forEach(type => {
            const ship = this.enemyFleet[type];
            const status = document.createElement('div');
            status.className = `ship-status ${ship.sunk ? 'sunk' : ''}`;
            status.textContent = this.shipTypes[type].name;
            enemyStatus.appendChild(status);
        });
    }
    
    updateStatistics() {
        const totalGames = this.stats.gamesWon + this.stats.gamesLost;
        const winRate = totalGames > 0 ? Math.round((this.stats.gamesWon / totalGames) * 100) : 0;
        const accuracy = this.stats.totalShots > 0 ? 
            Math.round((this.playerHits / this.stats.totalShots) * 100) : 0;
        
        document.getElementById('gamesWon').textContent = this.stats.gamesWon;
        document.getElementById('gamesLost').textContent = this.stats.gamesLost;
        document.getElementById('winRate').textContent = `${winRate}%`;
        document.getElementById('totalShots').textContent = this.stats.totalShots;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    }
    
    loadStats() {
        const saved = localStorage.getItem('battleshipStats');
        return saved ? JSON.parse(saved) : {
            gamesWon: 0,
            gamesLost: 0,
            totalShots: 0
        };
    }
    
    saveStats() {
        localStorage.setItem('battleshipStats', JSON.stringify(this.stats));
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const sounds = {
            hit: { freq: 200, duration: 0.3 },
            miss: { freq: 100, duration: 0.2 },
            sink: { freq: 150, duration: 0.5 },
            start: { freq: 440, duration: 0.1 },
            victory: { freq: 523, duration: 0.8 },
            defeat: { freq: 131, duration: 1.0 }
        };
        
        const sound = sounds[type];
        if (!sound) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
        oscillator.type = type === 'victory' ? 'sine' : 'square';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('soundToggleBtn');
        btn.textContent = this.soundEnabled ? '🔊 Sound' : '🔇 Sound';
    }
    
    newGame() {
        // Reset game state
        this.gameState = 'setup';
        this.currentPlayer = 'player';
        this.playerGrid = this.createGrid();
        this.enemyGrid = this.createGrid();
        this.playerFleet = this.createFleet();
        this.enemyFleet = this.createFleet();
        this.playerHits = 0;
        this.playerMisses = 0;
        this.enemyHits = 0;
        this.enemyMisses = 0;
        this.shotsRemaining = 5;
        
        // Reset UI
        document.getElementById('setupArea').style.display = 'block';
        document.getElementById('battleArea').style.display = 'none';
        
        // Reset phase indicator
        document.getElementById('setupPhase').classList.add('active');
        document.getElementById('battlePhase').classList.remove('active');
        document.getElementById('gameOverPhase').classList.remove('active');
        
        // Clear ships and regenerate enemy fleet
        this.clearShips();
        this.generateEnemyFleet();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BattleshipGame();
});
