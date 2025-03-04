// jest.config.js
module.exports = {
    // Root directory
    rootDir: './',
  
    // Test environment - 'jsdom' for browser-like environment
    testEnvironment: 'jsdom',
  
    // File patterns Jest should look for
    testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  
    // Module name mapping
    moduleNameMapper: {
      // Map specific class files
      '^hat$': '<rootDir>/hat.js',
      '^geometry$': '<rootDir>/geometry.js',
      '^build$': '<rootDir>/src/build.js',
      '^Tile$': '<rootDir>/src/tiles.js',
      '^TileArray$': '<rootDir>/src/tiles.js',
      
      // Map utility functions
      
      // Map game functions
      
      // Generic root path mapping
      '^@/(.*)$': '<rootDir>/src/$1',
      
      // Map specific functions
      '^decideColour$': '<rootDir>/src/game/rendering.js',
      '^transPt$': '<rootDir>/src/utils/transform.js',
      '^mul$': '<rootDir>/src/utils/transform.js',
      
      // Map any static assets
      '\\.(png|jpg|svg)$': '<rootDir>/__mocks__/fileMock.js',
      '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js'
    },
  
    // Setup global mocks and configurations
    setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  
    // Automatically clear mock calls between every test
    clearMocks: true,
  
    // Collect coverage information
    collectCoverage: true,
    coverageDirectory: 'coverage',
    
    // Transform files if using modern JS features
    transform: {
      '^.+\\.js$': 'babel-jest'
    },
    
    // Make Jest understand globals
    globals: {
      // P5.js globals
      'createCanvas': true,
      'background': true,
      'fill': true,
      'stroke': true,
      'beginShape': true,
      'endShape': true,
      'vertex': true,
      'CLOSE': true,
      'loadImage': true,
      'image': true,
      'ellipse': true,
      'strokeWeight': true,
      'textAlign': true,
      'CENTER': true,
      'text': true,
      'textSize': true,
      
      // Game-specific globals
      'translation_vector': true,
      'hat_outline': true,
      'adjacency_radius': true,
      'isGameRunning': true,
      'is3DMode': true,
      'score': true,
      'updateScore': true,
      'handleGameOver': true,
      'tileArr': true,
      'exploredColour': true,
      'unexploredColour': true,
      'selectedColour': true,
      'explored3DColour': true
    }
  };