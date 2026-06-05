/**
 * Prize Drop Game Control Bridge
 * Connects declarative UI actions to imperative Game Core methods.
 */

export interface GameActions {
  select_drop_position: (index: number) => void;
  hold_drop: (index: number) => void;
  release_drop: (index: number) => void;
  select_multiplier: () => void;
}

let gameInstance: GameActions | null = null;

/**
 * Register the game instance to the bridge
 */
export function registerGameInstance(instance: GameActions) {
  gameInstance = instance;
}

/**
 * Dispatch an action to the registered game instance
 */
export function dispatchGameAction<K extends keyof GameActions>(
  action: K,
  ...args: Parameters<GameActions[K]>
) {
  if (!gameInstance) {
    console.warn(`Game action "${action}" dispatched before game was ready.`);
    return;
  }
  (gameInstance[action] as any)(...args);
}
