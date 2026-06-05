import type { EventData } from '../data';

export type BotEntry = {
  name: string;
  points: number;
};

export class BotSimulator {
  private bots: BotEntry[] = [];
  private tickTimer = 0;
  private tickSecOverride: number | null = null;

  constructor(private data: EventData) {}

  private _b(key: string, def: number): number {
    const v = this.data.botSimulator.get(key);
    return v === undefined || Number.isNaN(v) ? def : v;
  }

  start(botCount: number, namePool: string[], tickSec?: number) {
    const shuffled = [...namePool].sort(() => Math.random() - 0.5);
    const unique = [...new Set(shuffled)];
    this.bots = [];

    const initMult = this._b('bot_init_rank_mult', 250);
    const initBase = this._b('bot_init_base', 10);
    const initRand = this._b('bot_init_rand', 40);
    for (let i = 0; i < botCount; i++) {
      const rankFactor = 1.0 - (i / botCount);
      const initialPoints = Math.floor(rankFactor * initMult + initBase + Math.random() * initRand);
      this.bots.push({ name: unique[i] ?? `봇${i + 1}`, points: initialPoints });
    }
    this.tickTimer = 0;
    this.tickSecOverride = tickSec ?? null;
  }

  tick(dt: number, playerPoints: number) {
    const rawTick = Number(this.data.tournament.get('tick_sec') ?? 200);
    const tickCap = this._b('tick_sec_cap', 15);
    const tickSec = this.tickSecOverride ?? Math.min(tickCap, rawTick);
    const capRatioBase = Number(this.data.tournament.get('player_cap_ratio') ?? 0.72);
    const growth = Number(this.data.tournament.get('growth_ratio') ?? 0.45);
    const vMin = Number(this.data.tournament.get('variance_min') ?? 0.85);
    const vMax = Number(this.data.tournament.get('variance_max') ?? 1.0);
    const floorRatio = Number(this.data.tournament.get('bot_floor_ratio') ?? 0.25);

    this.tickTimer += dt;
    if (this.tickTimer < tickSec) return;
    this.tickTimer = 0;

    const effectivePoints = Math.max(this._b('bot_effective_points_floor', 300), playerPoints);
    const baseGain = Math.max(1, Math.floor(effectivePoints * growth * 0.02 + 1));

    const growthTop = this._b('bot_growth_rank_top_mult', 1.6);
    const growthSpan = this._b('bot_growth_rank_span', 1.3);

    for (let i = 0; i < this.bots.length; i++) {
      const b = this.bots[i];
      const ratioFactor = growthTop - (i / this.bots.length) * growthSpan;
      const botCapRatio = capRatioBase * ratioFactor;

      const cap = Math.max(5, Math.floor(effectivePoints * botCapRatio));
      const floor = Math.floor(playerPoints * floorRatio * Math.max(0.1, ratioFactor * 0.6));

      const variance = vMin + Math.random() * (vMax - vMin);
      let gain = Math.floor(baseGain * variance * ratioFactor);

      b.points = Math.min(cap, b.points + gain);
      if (b.points < floor) b.points = floor;
    }
  }

  getRankedRows(playerName: string, playerPoints: number) {
    const rows = [
      { rank: 0, name: playerName, points: playerPoints, isPlayer: true },
      ...this.bots.map(b => ({ rank: 0, name: b.name, points: b.points, isPlayer: false })),
    ];
    rows.sort((a, b) => b.points - a.points);
    rows.forEach((r, i) => { r.rank = i + 1; });
    const player = rows.find(r => r.isPlayer);
    return { rows, playerRank: player?.rank ?? 0 };
  }
}
