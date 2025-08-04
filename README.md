# 🎮 Minigames Arcade

A comprehensive collection of classic games built with vanilla HTML, CSS, and JavaScript. This arcade features 6 fully-featured games with professional UI, responsive design, and local storage for statistics.

![Minigames Arcade](https://img.shields.io/badge/Games-6-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🚀 Live Demo

Open `index.html` in your browser or serve the files with any HTTP server to start playing!

## 🎯 Featured Games

### 🚢 Battleship - Naval Strategy
- **Single-player vs AI** with intelligent targeting system
- **Drag-and-drop ship placement** with rotation controls
- **Smart AI opponent** that adapts to your play style
- **Sound effects and animations** for immersive gameplay
- **Win/loss statistics** tracking

**Controls:**
- Drag ships to position them on your board
- Click rotate buttons to change ship orientation
- Click enemy grid squares to fire shots
- First to sink all enemy ships wins!

### 🐍 Snake - Classic Arcade
- **Smooth movement controls** with collision detection
- **Food collection system** with progressive difficulty
- **Score tracking** and high score persistence
- **Responsive game boundaries** that scale with screen size
- **Game over detection** with restart functionality

**Controls:**
- Arrow keys or WASD to move
- Eat food to grow longer and score points
- Avoid walls and your own tail
- Try to beat your high score!

### 🧩 Tetris - Block Puzzle Classic
- **Complete 7-piece system** (I, O, T, S, Z, J, L tetrominoes)
- **Wall kick rotation** with collision detection
- **Line clearing mechanics** with score multipliers
- **Progressive difficulty** - speed increases with level
- **Ghost piece preview** (toggleable)
- **Hard drop functionality** with space bar
- **Sound effects** for all game actions

**Controls:**
- ←→ Arrow keys: Move pieces left/right
- ↓ Arrow key: Soft drop (faster fall)
- ↑ Arrow key: Rotate piece
- Space: Hard drop (instant placement)
- P: Pause/unpause game

### 🧠 Memory Cards - Brain Training
- **4 difficulty levels**: Easy (4×3) to Expert (6×6)
- **Multiple themes**: Animals, Fruits, Shapes, Numbers
- **Timer system** with best time tracking
- **Hint system** with limited uses (3 hints per game)
- **Move counter** and efficiency tracking
- **Smooth card flip animations**

**Controls:**
- Click cards to flip them over
- Match pairs of identical cards
- Use hints sparingly to reveal matching pairs
- Complete all pairs in minimum moves and time

### 🔢 2048 - Number Puzzle
- **Classic 4×4 grid** with optional 5×5 and 6×6 modes
- **Smooth tile animations** with merge effects
- **Undo system** (3 undos per game)
- **Touch/swipe controls** for mobile devices
- **Multiple color themes**: Classic, Neon, Pastel, Dark
- **Progress tracking** toward the 2048 goal
- **Score system** with best score persistence

**Controls:**
- Arrow keys or WASD: Move tiles
- Swipe on mobile: Touch controls
- Space: Start new game
- U: Undo last move

### 囲碁 Go - Ancient Strategy
- **Multiple board sizes**: 9×9, 13×13, 19×19
- **Stone capture mechanics** with Ko rule implementation
- **Territory calculation** for game scoring
- **Handicap system** for balanced gameplay
- **Pass and resignation** options
- **Coordinate display** (toggleable)

**Controls:**
- Click intersections to place stones
- Pass button to skip your turn
- Resign button to concede the game
- Capture opponent stones by surrounding them

## 🛠️ Technical Features

### Architecture
- **Modular Design**: Each game is self-contained with its own HTML, CSS, and JS files
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Clean Code Structure**: Object-oriented JavaScript with clear separation of concerns
- **No Dependencies**: Pure vanilla JavaScript, HTML5, and CSS3

### File Structure
```
minigame/
├── index.html              # Main arcade selector
├── style.css              # Main arcade styles
├── js/
│   ├── main.js            # Arcade logic and navigation
│   ├── battleship.js      # Battleship game engine
│   ├── snake.js           # Snake game engine
│   ├── tetris.js          # Tetris game engine
│   ├── memory.js          # Memory cards game engine
│   ├── 2048.js            # 2048 game engine
│   └── go.js              # Go game engine
├── css/
│   ├── battleship.css     # Battleship-specific styles
│   ├── snake.css          # Snake-specific styles
│   ├── tetris.css         # Tetris-specific styles
│   ├── memory.css         # Memory cards-specific styles
│   ├── 2048.css           # 2048-specific styles
│   └── go.css             # Go-specific styles
└── games/
    ├── battleship.html    # Battleship game page
    ├── snake.html         # Snake game page
    ├── tetris.html        # Tetris game page
    ├── memory.html        # Memory cards game page
    ├── 2048.html          # 2048 game page
    └── go.html            # Go game page
```

### Data Persistence
- **Local Storage**: High scores, best times, and game statistics
- **Settings Persistence**: Sound preferences, theme choices, and difficulty settings
- **Cross-Game Statistics**: Tracks total games played, favorite game, and total play time

### Browser Compatibility
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile Support**: iOS Safari 12+, Chrome Mobile 60+
- **HTML5 Features**: Canvas API, Local Storage, Audio API
- **CSS3 Features**: Grid Layout, Flexbox, Animations, Transforms

## 🎨 Design Features

### Visual Design
- **Modern UI/UX**: Clean, intuitive interfaces with consistent styling
- **Color Themes**: Each game has its own distinct visual identity
- **Smooth Animations**: CSS transitions and keyframe animations
- **Responsive Typography**: Scales appropriately across devices
- **Accessibility**: High contrast ratios and keyboard navigation support

### Audio System
- **Sound Effects**: Contextual audio feedback for all game actions
- **Web Audio API**: Programmatically generated sounds (no external files)
- **Volume Control**: Toggle sound on/off for each game
- **Performance Optimized**: Minimal audio latency and memory usage

## 📱 Mobile Optimization

### Touch Controls
- **Swipe Gestures**: 2048 supports swipe navigation
- **Touch-Friendly**: Large buttons and touch targets
- **Responsive Grid**: Game boards scale to fit mobile screens
- **Orientation Support**: Works in both portrait and landscape modes

### Performance
- **Lightweight**: No external dependencies or large assets
- **Fast Loading**: Minimal file sizes with optimized code
- **Smooth Scrolling**: Optimized for mobile browsers
- **Battery Efficient**: Minimal resource usage during gameplay

## 🔧 Development

### Setup
1. Clone the repository
2. Open `index.html` in a modern web browser
3. Or serve with any HTTP server (Python, Node.js, etc.)

```bash
# Option 1: Python HTTP Server
python3 -m http.server 8000

# Option 2: Node.js HTTP Server (if you have http-server installed)
npx http-server

# Option 3: VS Code Live Server extension
# Right-click index.html and select "Open with Live Server"
```

### Adding New Games
1. Create HTML file in `games/` directory
2. Create CSS file in `css/` directory  
3. Create JavaScript file in `js/` directory
4. Add game card to main `index.html`
5. Update `js/main.js` gameUrls object

### Customization
- **Themes**: Modify CSS custom properties for easy color scheme changes
- **Difficulty**: Adjust game constants in JavaScript files
- **UI Elements**: Update HTML structure and CSS for visual changes
- **Sound Effects**: Modify frequency and duration parameters in audio functions

## 🏆 Game Statistics

### Tracked Metrics
- **Individual Game Stats**: High scores, best times, games played
- **Arcade Overview**: Total games played, favorite game, total play time
- **Achievement System**: Win streaks, personal bests, milestones
- **Progress Tracking**: Level completion, skill improvement over time

### Data Export
All statistics are stored in browser Local Storage and can be:
- Backed up by copying localStorage data
- Reset individually per game or globally
- Transferred between devices manually

## 🤝 Contributing

### Bug Reports
- Use browser developer tools to check for console errors
- Include browser version and operating system
- Describe steps to reproduce the issue
- Provide screenshots if applicable

### Feature Requests
- Suggest new games or improvements to existing ones
- Propose UI/UX enhancements
- Request additional difficulty levels or game modes
- Share ideas for new statistics or achievements

### Code Contributions
- Follow existing code style and structure
- Test thoroughly across different browsers
- Ensure mobile compatibility
- Document new features in README

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎮 Enjoy Playing!

Start your gaming session by opening the arcade and choosing your favorite game. Each game offers hours of entertainment with progressively challenging gameplay and achievement systems to keep you engaged.

**Happy Gaming!** 🎉