type ActionHandler = (payload?: unknown) => void;
const _handlers: Record<string, ActionHandler> = {};
export function registerAction(name: string, fn: ActionHandler): void { _handlers[name] = fn; }
export function dispatchAction(name: string, payload?: unknown): void { _handlers[name]?.(payload); }
export const gameControlBridge = { register: registerAction, dispatch: dispatchAction };
