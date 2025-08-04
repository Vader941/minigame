// Main Arcade Game Selector
class MiniGamesArcade {
    constructor() {
        this.stats = this.loadArcadeStats();
        this.initializeArcade();
    }
    
    initializeArcade() {
        this.updateArcadeStats();
        this.setupGameCards();
    }
    
    setupGameCards() {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.animateCard(card, true));
            card.addEventListener('mouseleave', () => this.animateCard(card, false));
        });
    }
    
    animateCard(card, isHover) {
        if (isHover) {
            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        }
    }
    
    loadArcadeStats() {
        const saved = localStorage.getItem('arcadeStats');
        return saved ? JSON.parse(saved) : {
            totalGamesPlayed: 0,
            favoriteGame: 'None',
            totalPlayTime: 0,
            gameStats: {
                battleship: { played: 0, timeSpent: 0 },
                snake: { played: 0, timeSpent: 0 },
                tetris: { played: 0, timeSpent: 0 },
                memory: { played: 0, timeSpent: 0 },
                2048: { played: 0, timeSpent: 0 },
                go: { played: 0, timeSpent: 0 }
            }
        };
    }
    
    saveArcadeStats() {
        localStorage.setItem('arcadeStats', JSON.stringify(this.stats));
    }
    
    updateArcadeStats() {
        document.getElementById('totalGamesPlayed').textContent = this.stats.totalGamesPlayed;
        document.getElementById('favoriteGame').textContent = this.stats.favoriteGame;
        document.getElementById('totalPlayTime').textContent = this.formatPlayTime(this.stats.totalPlayTime);
    }
    
    formatPlayTime(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        }
    }
    
    incrementGameStats(gameName) {
        this.stats.totalGamesPlayed++;
        this.stats.gameStats[gameName].played++;
        
        // Update favorite game
        let maxPlayed = 0;
        let favorite = 'None';
        
        Object.keys(this.stats.gameStats).forEach(game => {
            if (this.stats.gameStats[game].played > maxPlayed) {
                maxPlayed = this.stats.gameStats[game].played;
                favorite = this.capitalizeGame(game);
            }
        });
        
        this.stats.favoriteGame = favorite;
        this.saveArcadeStats();
        this.updateArcadeStats();
    }
    
    capitalizeGame(gameName) {
        const gameNames = {
            battleship: 'Battleship',
            snake: 'Snake',
            tetris: 'Tetris',
            memory: 'Memory Cards',
            2048: '2048',
            go: 'Go'
        };
        return gameNames[gameName] || gameName;
    }
}

// Game Navigation Functions
function playGame(gameName) {
    // Track game selection
    if (window.arcade) {
        window.arcade.incrementGameStats(gameName);
    }
    
    // Navigate to the specific game
    const gameUrls = {
        battleship: 'games/battleship.html',
        snake: 'games/snake.html',
        tetris: 'games/tetris.html',
        memory: 'games/memory.html',
        2048: 'games/2048.html',
        go: 'games/go.html'
    };
    
    if (gameUrls[gameName]) {
        // Direct navigation without delay
        window.location.href = gameUrls[gameName];
    } else {
        // Game not implemented yet
        alert(`🚧 ${gameName.charAt(0).toUpperCase() + gameName.slice(1)} is coming soon! 🚧`);
    }
}

// Initialize arcade when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.arcade = new MiniGamesArcade();
    
    // Add some visual flair
    setTimeout(() => {
        document.querySelector('.games-grid').style.animation = 'fadeInUp 0.8s ease-out';
    }, 200);
});

// Add some CSS animations via JavaScript for better UX
document.head.insertAdjacentHTML('beforeend', `
<style>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.games-grid {
    animation: fadeInUp 0.8s ease-out;
}

.game-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.play-btn {
    transition: all 0.2s ease;
}

.play-btn:hover {
    transform: scale(1.05);
}
</style>
`);
