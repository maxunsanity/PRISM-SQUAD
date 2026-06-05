import { loadGameData } from './loadGameData';
import { registerGameInstance } from './gameControlBridge';
import { PrizeDrop } from './PrizeDrop';

/**
 * Initializes the game core and data.
 */
export async function bootstrapGame() {
  console.log('--- Prize Drop Bootstrapping ---');
  
  try {
    // 1. Load CSV data
    const gameData = await loadGameData();
    console.log('Game Data Loaded:', gameData);

    // 2. Initialize Game Core
    const viewport = document.getElementById('game-viewport');
    if (!viewport) throw new Error('game-viewport not found');

    const game = new PrizeDrop(viewport, gameData);
    
    // 3. Register instance to bridge
    registerGameInstance(game);

    console.log('Game Bootstrapped Successfully.');
    return { game, gameData };
  } catch (error) {
    console.error('Failed to bootstrap game:', error);
    throw error;
  }
}
