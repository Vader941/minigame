// Snake Game Implementation
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        
        // Game settings
        this.gridSize = 20;
        this.canvasSize = 400;
        this.gridCount = this.canvasSize / this.gridSize;
        
        // Game state
        this.gameRunning = false;
        this.gameOver = false;
        this.score = 0;
        this.speed = 1;
        this.soundEnabled = true;
        
        // Snake
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        
        // Food
        this.food = { x: 15, y: 15 };
        
        // Timing
        this.lastTime = 0;
        this.gameSpeed = 150; // milliseconds between moves
        
        // High score
        this.highScore = this.loadHighScore();
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.setupEventListeners();
        this.updateUI();
        this.setDifficulty('medium');
        this.drawGame();
    }
    
    setupEventListeners() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && !this.gameOver) return;
            
            switch(e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: -1 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: 1 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: -1, y: 0 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: 1, y: 0 };
                    }
                    e.preventDefault();
                    break;
                case 'Space':
                    if (this.gameOver) {
                        this.resetGame();
                    }
                    e.preventDefault();
                    break;
            }
        });
        
        // Difficulty selector
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.setDifficulty(e.target.value);
        });
        
        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });
        
        // Touch controls for mobile
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        let startX, startY;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!startX || !startY) return;
            
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 30 && this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 }; // Right
                } else if (deltaX < -30 && this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 }; // Left
                }
            } else {
                // Vertical swipe
                if (deltaY > 30 && this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 }; // Down
                } else if (deltaY < -30 && this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 }; // Up
                }
            }
            
            startX = null;
            startY = null;
        });
    }
    
    setDifficulty(level) {
        const difficulties = {
            easy: { speed: 200, scoreMultiplier: 1 },
            medium: { speed: 150, scoreMultiplier: 2 },
            hard: { speed: 100, scoreMultiplier: 3 },
            extreme: { speed: 70, scoreMultiplier: 5 }
        };
        
        const difficulty = difficulties[level];
        this.gameSpeed = difficulty.speed;
        this.scoreMultiplier = difficulty.scoreMultiplier;
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.speed = 1;
        
        this.generateFood();
        this.hideOverlay();
        this.updateUI();
        this.playSound('start');
        
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastTime > this.gameSpeed) {
            this.update();
            this.draw();
            this.lastTime = currentTime;
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (!this.gameRunning || this.gameOver) return;
        
        // Update direction
        this.direction = { ...this.nextDirection };
        
        // Move snake
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.gridCount || 
            head.y < 0 || head.y >= this.gridCount) {
            this.endGame();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10 * this.scoreMultiplier;
            this.speed = Math.floor(this.score / 50) + 1;
            this.generateFood();
            this.playSound('eat');
            
            // Add visual feedback
            document.getElementById('score').classList.add('pulse');
            setTimeout(() => {
                document.getElementById('score').classList.remove('pulse');
            }, 500);
        } else {
            this.snake.pop();
        }
        
        this.updateUI();
    }
    
    draw() {
        this.drawGame();
    }
    
    drawGame() {
        // Clear canvas
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Draw grid lines
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.gridCount; i++) {
            const pos = i * this.gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvasSize);
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvasSize, pos);
            this.ctx.stroke();
        }
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Snake head
                this.ctx.fillStyle = '#27ae60';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 1,
                    segment.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
                
                // Draw eyes
                this.ctx.fillStyle = '#2c3e50';
                const eyeSize = 3;
                const eyeOffset = 6;
                
                if (this.direction.x === 1) { // Right
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffset + 4, segment.y * this.gridSize + 4, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffset + 4, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                } else if (this.direction.x === -1) { // Left
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffset - 2, segment.y * this.gridSize + 4, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffset - 2, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                } else if (this.direction.y === -1) { // Up
                    this.ctx.fillRect(segment.x * this.gridSize + 4, segment.y * this.gridSize + eyeOffset - 2, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + eyeOffset - 2, eyeSize, eyeSize);
                } else if (this.direction.y === 1) { // Down
                    this.ctx.fillRect(segment.x * this.gridSize + 4, segment.y * this.gridSize + eyeOffset + 4, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + eyeOffset + 4, eyeSize, eyeSize);
                }
            } else {
                // Snake body
                const alpha = Math.max(0.3, 1 - (index * 0.05));
                this.ctx.fillStyle = `rgba(46, 204, 113, ${alpha})`;
                this.ctx.fillRect(
                    segment.x * this.gridSize + 2,
                    segment.y * this.gridSize + 2,
                    this.gridSize - 4,
                    this.gridSize - 4
                );
            }
        });
        
        // Draw food
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Add shine to food
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2 - 3,
            this.food.y * this.gridSize + this.gridSize / 2 - 3,
            3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.gridCount),
                y: Math.floor(Math.random() * this.gridCount)
            };
        } while (this.snake.some(segment => 
            segment.x === this.food.x && segment.y === this.food.y
        ));
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.showOverlay('New High Score!', `Amazing! You scored ${this.score} points!`, 'Play Again');
            this.playSound('highScore');
        } else {
            this.showOverlay('Game Over!', `Final Score: ${this.score}`, 'Try Again');
            this.playSound('gameOver');
        }
        
        this.updateUI();
    }
    
    resetGame() {
        this.gameOver = false;
        this.startGame();
    }
    
    showOverlay(title, message, buttonText) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        document.getElementById('startBtn').textContent = buttonText;
        this.overlay.style.display = 'flex';
    }
    
    hideOverlay() {
        this.overlay.style.display = 'none';
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('speed').textContent = this.speed;
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('soundToggle');
        btn.textContent = this.soundEnabled ? '🔊 ON' : '🔇 OFF';
        btn.classList.toggle('active', this.soundEnabled);
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const sounds = {
            start: { freq: 440, duration: 0.1 },
            eat: { freq: 660, duration: 0.1 },
            gameOver: { freq: 220, duration: 0.5 },
            highScore: { freq: 880, duration: 0.3 }
        };
        
        const sound = sounds[type];
        if (!sound) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
        oscillator.type = type === 'eat' ? 'sine' : 'square';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
    }
    
    loadHighScore() {
        return parseInt(localStorage.getItem('snakeHighScore')) || 0;
    }
    
    saveHighScore() {
        localStorage.setItem('snakeHighScore', this.highScore.toString());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
