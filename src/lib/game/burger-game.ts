export const GAME_FPS = 30;
export const GAME_MAX_TICKS = 90 * GAME_FPS;
export type FallingBurger = { id: number; x: number; y: number };
export type BurgerGame = { tick: number; score: number; misses: number; seed: number; next: number; burgers: FallingBurger[]; over: boolean };
export function newBurgerGame(seed: number): BurgerGame {
  return { tick: 0, score: 0, misses: 0, seed: seed >>> 0, next: 1, burgers: [], over: false };
}
export function stepBurgerGame(game: BurgerGame, basket: number): void {
  if (game.over) return;
  game.tick++;
  const level = Math.floor(game.tick / (GAME_FPS * 12));
  if (game.tick >= game.next) {
    game.seed = (Math.imul(game.seed, 1664525) + 1013904223) >>> 0;
    game.burgers.push({ id: game.tick, x: 60 + (game.seed / 4294967296) * 880, y: -45 });
    game.next = game.tick + Math.max(9, 34 - level * 4);
  }
  const speed = 4 * 1.2 ** Math.floor(game.tick / (GAME_FPS * 3));
  game.burgers = game.burgers.filter(burger => {
    burger.y += speed;
    if (burger.y < 875) return true;
    if (Math.abs(burger.x - basket) <= 108) game.score += 10;
    else game.misses++;
    return false;
  });
  game.over = game.misses >= 3 || game.tick >= GAME_MAX_TICKS;
}
export function replayBurgerGame(seed: number, moves: unknown): BurgerGame {
  if (!Array.isArray(moves) || moves.length < 1 || moves.length > GAME_MAX_TICKS) throw new Error("Invalid game");
  const game = newBurgerGame(seed);
  for (const x of moves) {
    if (game.over || !Number.isInteger(x) || x < 100 || x > 900) throw new Error("Invalid moves");
    stepBurgerGame(game, x);
  }
  if (!game.over) throw new Error("Game not finished");
  return game;
}
export function gameNickname(value: unknown): string {
  if (typeof value !== "string") throw new Error("יש להזין כינוי");
  const name = value.trim().normalize("NFKC");
  if (!/^[\p{L}\p{N} ._'׳-]{2,20}$/u.test(name)) throw new Error("הכינוי צריך להכיל 2–20 אותיות או ספרות");
  return name;
}

export function gamePhone(value: unknown): string {
  if (typeof value !== "string" || value.length > 30) throw new Error("יש להזין מספר טלפון תקין");
  const phone = value.replace(/[\s()-]/g, "").replace(/^\+972/, "0");
  if (!/^0(?:5\d{8}|[23489]\d{7}|7\d{8})$/.test(phone)) throw new Error("יש להזין מספר טלפון ישראלי תקין");
  return phone;
}
