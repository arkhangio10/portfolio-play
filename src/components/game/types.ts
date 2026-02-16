// ============ Game Types & Interfaces ============

export interface Vec2 {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayer: boolean;
  damage: number;
  width: number;
  height: number;
}

export type PowerUpType = 'health' | 'rapidfire' | 'shield' | 'spread' | 'nuke';

export interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  type: PowerUpType;
  speed: number;
  pulse: number; // animation timer
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  shootCooldown: number;
  lastShot: number;
  scanning: boolean;
  invincible: number;
  // Power-up effects
  shieldTimer: number;
  rapidFireTimer: number;
  spreadShotTimer: number;
}

export interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  type: 'normal' | 'superposition';
  // Superposition: ghost positions
  ghostA?: Vec2;
  ghostB?: Vec2;
  realGhost: 'A' | 'B';
  shootCooldown: number;
  lastShot: number;
  // Entanglement
  linkedEnemy?: number; // index
  // Tunneling
  phasing?: boolean;
  phaseTimer?: number;
  // Visibility (Level 1)
  visible: boolean;
}

export interface Boss {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  name: string;
  phase: number;
  shootCooldown: number;
  lastShot: number;
  // Level-specific
  positions?: Vec2[]; // For Hydra (Level 5)
  realPosition?: number;
  phasing?: boolean;
  phaseTimer?: number;
  blurAmount?: number;
  twinHp?: number; // Twin Frigates
  interferenceZones?: { x: number; y: number; radius: number }[];
}

export interface LevelConfig {
  level: number;
  name: string;
  mechanic: string;
  bossName: string;
  quantumLog: string;
  enemyCount: number;
  bgColor: string;
}

export type GameState = 'menu' | 'playing' | 'boss' | 'paused' | 'gameover' | 'levelcomplete' | 'victory';

export interface GameData {
  state: GameState;
  score: number;
  level: number;
  decoherence: number; // 0-100, like a quantum coherence meter
  player: Player;
  enemies: Enemy[];
  boss: Boss | null;
  bullets: Bullet[];
  particles: Particle[];
  powerUps: PowerUp[];
  screenShake: number;
  scanlineOffset: number;
}
