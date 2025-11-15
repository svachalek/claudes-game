# Platform Climber

A browser-based platformer game inspired by Mario, built with Phaser.js. Climb as high as you can without falling!

## Features

- **Mario-style controls**: Responsive left/right movement and jumping
- **Vertical platforming**: Climb higher and higher platforms
- **Simple retro art style**: Programmatically generated graphics
- **Score tracking**: Your height is your score
- **Infinite platforms**: Platforms generated all the way up
- **Screen wrapping**: Walk off one side to appear on the other

## How to Play

### Controls
- **Arrow Keys** (Left/Right): Move the player
- **Arrow Up or Space**: Jump (only when on a platform)
- **R**: Restart after game over

### Objective
Climb as high as possible by jumping from platform to platform. Don't fall off the bottom of the screen!

## Running the Game

### Option 1: Simple HTTP Server (Python)
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Option 2: Simple HTTP Server (Node.js)
```bash
npx http-server
```

### Option 3: Any Web Server
Simply serve the directory with any web server and open `index.html`.

## Technical Details

- **Engine**: Phaser 3.70.0
- **Physics**: Arcade Physics
- **Player Gravity**: 800 (feels like Mario)
- **Jump Velocity**: -500
- **Movement Speed**: 200 pixels/second
- **Platform Height Range**: 10,000 pixels upward

## Game Mechanics

- Player has Mario-style physics with tight controls
- Can only jump when touching a platform (no double jumps)
- Platforms are randomly generated at various heights
- Camera follows the player upward
- Game over when falling below the starting point
- Score increases based on maximum height reached

## Future Enhancements

Potential features to add:
- Moving platforms
- Power-ups
- Enemies
- Better sprite graphics
- Sound effects and music
- High score persistence
- Difficulty progression
- Special platform types (breakable, bouncy, etc.)

## File Structure

```
.
├── index.html    # Main HTML file
├── game.js       # Game logic and Phaser scenes
└── README.md     # This file
```

Enjoy climbing!
