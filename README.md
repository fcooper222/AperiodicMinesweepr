# Aperiodic Minesweeper

A web application that lets users play the classic game of Minesweeper on a grid made of the aperiodic monotile (Hat Tile).

## Quick Setup
The webpage can be viewed easily by simply navigating to the page

```
https://aperiodic-minesweepr.vercel.app
```
## Local Setup

The webpage can also be viewed locally by following the steps below.

1. Install Node.js and npm

### Windows:
1. Go to https://nodejs.org/
2. Download the LTS version
3. Run the installer and follow the wizard
4. Verify installation by opening command prompt and typing:
```
node -v
npm -v
```

### macOS:
1. Go to https://nodejs.org/
2. Download the LTS version for macOS
3. Run the downloaded .pkg file and follow instructions
4. Verify installation in terminal with `node -v` and `npm -v`

### Linux (Ubuntu/Debian):
```
sudo apt update
sudo apt install nodejs npm
```


1. Install http-server:
```
npm install -g http-server
```

2. Run the server in project directory:
```
http-server
```

3. Open in browser:
```
http://localhost:8080/src/index.html
```
## How to play the game

The game follows the original rules of minesweeper and can be played by pressing the START GAME button in the top left of the page. 

If the game has ended, press RESET to clear the grid, then START GAME to begin another game.

The frequency of mines can also be toggled using the TOGGLE DIFFICULTY button.

If the performance is subpar, the game can be put in low performance mode by pressing the 3D MODE button on the right. 

The colour of the grid can be changed to whatever colour you like by toggling the SELECT UNEXPLORED COLOUR and the SELECT EXPLORED COLOUR buttons.

Preset colour schemes are also available on the right. 

If you want to clear the local scores, press the CLEAR LEADERBOARD button.

