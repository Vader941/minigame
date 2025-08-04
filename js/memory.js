// Memory Cards Game Implementation
class MemoryGame {
    constructor() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        // Game state
        this.moves = 0;
        this.matches = 0;
        this.totalPairs = 0;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.hintsRemaining = 3;
        
        // Game settings
        this.difficulty = 'medium';
        this.theme = 'animals';
        this.soundEnabled = true;
        this.timerEnabled = true;
        
        // Game board
        this.cards = [];
        this.flippedCards = [];
        this.matchedCards = [];
        
        // Best times
        this.bestTimes = this.loadBestTimes();
        
        // Card themes
        this.themes = {
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦'],
            fruits: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝', '🍑', '🍒', '🥭', '🍍', '🥥', '🥑', '🍈', '🍐', '🍅', '🫐'],
            shapes: ['🔴', '🔵', '🟡', '🟢', '🟠', '🟣', '🟤', '⚫', '⚪', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💎', '⭐', '✨'],
            numbers: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭']
        };
        
        // Difficulty settings
        this.difficulties = {
            easy: { rows: 3, cols: 4, name: 'Beginner' },
            medium: { rows: 4, cols: 4, name: 'Intermediate' },
            hard: { rows: 4, cols: 6, name: 'Advanced' },
            expert: { rows: 6, cols: 6, name: 'Expert' }
        };
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.setupEventListeners();
        this.updateUI();
        this.setupGrid();
    }
    
    setupEventListeners() {
        // Game controls
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('overlayStartBtn').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.useHint();
        });
        
        // Settings
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.changeDifficulty(e.target.value);
        });
        
        document.getElementById('theme').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });
        
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });
        
        document.getElementById('showTimer').addEventListener('click', () => {
            this.toggleTimer();
        });
        
        document.getElementById('resetStats').addEventListener('click', () => {
            this.resetStatistics();
        });
    }
    
    setupGrid() {
        const grid = document.getElementById('memoryGrid');
        const settings = this.difficulties[this.difficulty];
        
        grid.className = `memory-grid ${this.difficulty}`;
        this.totalPairs = (settings.rows * settings.cols) / 2;
        
        // Update level info
        document.getElementById('levelName').textContent = settings.name;
        document.getElementById('currentLevel').textContent = this.getLevelNumber();
        
        this.createCards();
    }
    
    createCards() {
        const grid = document.getElementById('memoryGrid');
        const settings = this.difficulties[this.difficulty];
        const totalCards = settings.rows * settings.cols;
        
        // Clear existing cards
        grid.innerHTML = '';
        this.cards = [];
        
        // Get random symbols for this game
        const symbols = this.getRandomSymbols(this.totalPairs);
        const cardData = [...symbols, ...symbols]; // Duplicate for pairs
        
        // Shuffle cards
        this.shuffleArray(cardData);
        
        // Create card elements
        for (let i = 0; i < totalCards; i++) {
            const card = this.createCard(i, cardData[i]);
            grid.appendChild(card);
            this.cards.push({
                id: i,
                symbol: cardData[i],
                element: card,
                isFlipped: false,
                isMatched: false
            });
        }
    }
    
    createCard(id, symbol) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.cardId = id;
        
        card.innerHTML = `
            <div class="card-face card-back">?</div>
            <div class="card-face card-front">${symbol}</div>
        `;
        
        card.addEventListener('click', () => this.flipCard(id));
        
        return card;
    }
    
    getRandomSymbols(count) {
        const themeSymbols = [...this.themes[this.theme]];
        this.shuffleArray(themeSymbols);
        return themeSymbols.slice(0, count);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    startNewGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;
        this.moves = 0;
        this.matches = 0;
        this.hintsRemaining = 3;
        this.flippedCards = [];
        this.matchedCards = [];
        
        this.startTime = Date.now();
        this.elapsedTime = 0;
        
        this.hideOverlay();
        this.setupGrid();
        this.updateUI();
        this.startTimer();
        this.playSound('start');
    }
    
    flipCard(cardId) {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;
        
        const card = this.cards[cardId];
        if (card.isFlipped || card.isMatched) return;
        
        // Flip the card
        card.isFlipped = true;
        card.element.classList.add('flipped');
        this.flippedCards.push(card);
        this.playSound('flip');
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateUI();
            
            // Disable further clicks temporarily
            this.disableAllCards();
            
            setTimeout(() => {
                this.checkForMatch();
            }, 1000);
        }
    }
    
    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.symbol === card2.symbol) {
            // Match found
            this.handleMatch(card1, card2);
        } else {
            // No match
            this.handleNoMatch(card1, card2);
        }
        
        this.flippedCards = [];
        this.enableAllCards();
    }
    
    handleMatch(card1, card2) {
        card1.isMatched = true;
        card2.isMatched = true;
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        
        this.matchedCards.push(card1, card2);
        this.matches++;
        this.playSound('match');
        
        this.updateUI();
        this.updateProgress();
        
        // Check for game completion
        if (this.matches === this.totalPairs) {
            setTimeout(() => {
                this.completeGame();
            }, 500);
        }
    }
    
    handleNoMatch(card1, card2) {
        card1.isFlipped = false;
        card2.isFlipped = false;
        card1.element.classList.remove('flipped');
        card2.element.classList.remove('flipped');
        this.playSound('noMatch');
    }
    
    disableAllCards() {
        this.cards.forEach(card => {
            if (!card.isMatched) {
                card.element.classList.add('disabled');
            }
        });
    }
    
    enableAllCards() {
        this.cards.forEach(card => {
            card.element.classList.remove('disabled');
        });
    }
    
    useHint() {
        if (this.hintsRemaining <= 0 || !this.gameRunning || this.gameOver) return;
        
        this.hintsRemaining--;
        document.getElementById('hintBtn').textContent = `Hint (${this.hintsRemaining})`;
        
        // Find unmatched cards
        const unmatchedCards = this.cards.filter(card => !card.isMatched && !card.isFlipped);
        
        if (unmatchedCards.length >= 2) {
            // Find a pair
            for (let i = 0; i < unmatchedCards.length; i++) {
                for (let j = i + 1; j < unmatchedCards.length; j++) {
                    if (unmatchedCards[i].symbol === unmatchedCards[j].symbol) {
                        // Highlight the pair
                        unmatchedCards[i].element.classList.add('hint-highlight');
                        unmatchedCards[j].element.classList.add('hint-highlight');
                        
                        setTimeout(() => {
                            unmatchedCards[i].element.classList.remove('hint-highlight');
                            unmatchedCards[j].element.classList.remove('hint-highlight');
                        }, 2000);
                        
                        this.playSound('hint');
                        return;
                    }
                }
            }
        }
        
        if (this.hintsRemaining === 0) {
            document.getElementById('hintBtn').disabled = true;
            document.getElementById('hintBtn').textContent = 'No Hints';
        }
    }
    
    completeGame() {
        this.gameRunning = false;
        this.gameOver = true;
        this.stopTimer();
        
        const timeStr = this.formatTime(this.elapsedTime);
        const difficultyBest = this.bestTimes[this.difficulty] || Infinity;
        
        let message = `Congratulations! 🎉\\n\\nTime: ${timeStr}\\nMoves: ${this.moves}`;
        
        if (this.elapsedTime < difficultyBest) {
            this.bestTimes[this.difficulty] = this.elapsedTime;
            this.saveBestTimes();
            message += '\\n\\n🏆 NEW BEST TIME! 🏆';
            this.playSound('newRecord');
        } else {
            this.playSound('gameComplete');
        }
        
        this.showOverlay('Game Complete!', message, 'Play Again');
        this.updateUI();
    }
    
    startTimer() {
        if (!this.timerEnabled) return;
        
        this.timerInterval = setInterval(() => {
            if (this.gameRunning && !this.gamePaused) {
                this.elapsedTime = Date.now() - this.startTime;
                this.updateTimer();
            }
        }, 100);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimer() {
        const timeStr = this.formatTime(this.elapsedTime);
        document.getElementById('timer').textContent = timeStr;
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateProgress() {
        const progress = (this.matches / this.totalPairs) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }
    
    togglePause() {
        if (!this.gameRunning || this.gameOver) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showOverlay('Game Paused', 'Click Resume to continue playing', 'Resume');
        } else {
            this.hideOverlay();
            this.startTime = Date.now() - this.elapsedTime; // Adjust start time
        }
    }
    
    changeDifficulty(newDifficulty) {
        if (this.gameRunning) return;
        
        this.difficulty = newDifficulty;
        this.setupGrid();
    }
    
    changeTheme(newTheme) {
        this.theme = newTheme;
        if (!this.gameRunning) {
            this.createCards();
        }
    }
    
    getLevelNumber() {
        const levels = { easy: 1, medium: 2, hard: 3, expert: 4 };
        return levels[this.difficulty] || 1;
    }
    
    showOverlay(title, message, buttonText) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        document.getElementById('overlayStartBtn').textContent = buttonText;
        document.getElementById('gameOverlay').style.display = 'flex';
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').style.display = 'none';
    }
    
    updateUI() {
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('matches').textContent = `${this.matches}/${this.totalPairs}`;
        
        const bestTime = this.bestTimes[this.difficulty];
        document.getElementById('bestTime').textContent = bestTime ? this.formatTime(bestTime) : '--:--';
        
        document.getElementById('hintBtn').textContent = `Hint (${this.hintsRemaining})`;
        document.getElementById('hintBtn').disabled = this.hintsRemaining === 0;
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('soundToggle');
        btn.textContent = this.soundEnabled ? '🔊 ON' : '🔇 OFF';
        btn.classList.toggle('active', this.soundEnabled);
    }
    
    toggleTimer() {
        this.timerEnabled = !this.timerEnabled;
        const btn = document.getElementById('showTimer');
        btn.textContent = this.timerEnabled ? 'ON' : 'OFF';
        btn.classList.toggle('active', this.timerEnabled);
        
        document.getElementById('timer').style.display = this.timerEnabled ? 'block' : 'none';
    }
    
    resetStatistics() {
        if (confirm('Are you sure you want to reset all best times?')) {
            this.bestTimes = {};
            this.saveBestTimes();
            this.updateUI();
        }
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const sounds = {
            start: { freq: 440, duration: 0.2 },
            flip: { freq: 300, duration: 0.1 },
            match: { freq: 500, duration: 0.3 },
            noMatch: { freq: 200, duration: 0.2 },
            hint: { freq: 600, duration: 0.2 },
            gameComplete: { freq: 660, duration: 0.8 },
            newRecord: { freq: 880, duration: 1.0 }
        };
        
        const sound = sounds[type];
        if (!sound) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
        oscillator.type = type === 'match' || type === 'gameComplete' ? 'sine' : 'square';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
    }
    
    loadBestTimes() {
        const saved = localStorage.getItem('memoryBestTimes');
        return saved ? JSON.parse(saved) : {};
    }
    
    saveBestTimes() {
        localStorage.setItem('memoryBestTimes', JSON.stringify(this.bestTimes));
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
