import { GameData, Player, Enemy, Boss, Bullet, Particle, PowerUp, PowerUpType, GameState } from './types';
import { LEVELS } from './levels';

// ============ Factory Functions ============

export function createPlayer(canvasW: number, canvasH: number): Player {
  return {
    x: canvasW / 2 - 16,
    y: canvasH - 60,
    width: 32,
    height: 36,
    hp: 100,
    maxHp: 100,
    speed: 4,
    shootCooldown: 150,
    lastShot: 0,
    scanning: false,
    invincible: 0,
    shieldTimer: 0,
    rapidFireTimer: 0,
    spreadShotTimer: 0,
  };
}

export function createEnemy(canvasW: number, level: number, index: number): Enemy {
  const x = 30 + Math.random() * (canvasW - 80);
  const y = -30 - Math.random() * 200 - index * 60;
  const isSuperposition = level >= 2 || Math.random() > 0.4;

  const e: Enemy = {
    x, y,
    width: 28, height: 28,
    hp: 20 + level * 5,
    maxHp: 20 + level * 5,
    speed: 0.5 + level * 0.15 + Math.random() * 0.3,
    type: isSuperposition ? 'superposition' : 'normal',
    realGhost: Math.random() > 0.5 ? 'A' : 'B',
    shootCooldown: 2000 + Math.random() * 2000,
    lastShot: 0,
    visible: level !== 1,
  };

  if (e.type === 'superposition') {
    const offset = 30 + Math.random() * 50;
    e.ghostA = { x: e.x - offset, y: e.y };
    e.ghostB = { x: e.x + offset, y: e.y };
  }

  if (level >= 3) {
    e.phasing = false;
    e.phaseTimer = Math.random() * 3000;
  }

  return e;
}

export function createBoss(level: number, canvasW: number): Boss {
  const cfg = LEVELS[level - 1];
  const boss: Boss = {
    x: canvasW / 2 - 50,
    y: -100,
    width: 100,
    height: 70,
    hp: 200 + level * 100,
    maxHp: 200 + level * 100,
    speed: 1 + level * 0.2,
    name: cfg.bossName,
    phase: 0,
    shootCooldown: 800 - level * 50,
    lastShot: 0,
  };

  if (level === 3) { boss.phasing = false; boss.phaseTimer = 0; }
  if (level === 4) {
    boss.interferenceZones = [
      { x: canvasW * 0.25, y: canvasW * 0.6, radius: 40 },
      { x: canvasW * 0.75, y: canvasW * 0.5, radius: 35 },
    ];
  }
  if (level === 5) {
    boss.positions = [
      { x: canvasW * 0.1, y: 60 },
      { x: canvasW * 0.4, y: 40 },
      { x: canvasW * 0.6, y: 80 },
      { x: canvasW * 0.8, y: 50 },
    ];
    boss.realPosition = Math.floor(Math.random() * 4);
  }
  if (level === 6) { boss.blurAmount = 0; }

  return boss;
}

function spawnParticles(particles: Particle[], x: number, y: number, count: number, color: string) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 0.5 + Math.random() * 0.5,
      maxLife: 1,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function spawnPowerUp(x: number, y: number): PowerUp | null {
  const roll = Math.random();
  if (roll > 0.30) return null; // 30% chance to drop
  
  const types: PowerUpType[] = ['health', 'rapidfire', 'shield', 'spread', 'nuke'];
  const weights = [0.30, 0.25, 0.20, 0.15, 0.10]; // health most common, nuke rare
  let r = Math.random();
  let type: PowerUpType = 'health';
  for (let i = 0; i < types.length; i++) {
    r -= weights[i];
    if (r <= 0) { type = types[i]; break; }
  }

  return {
    x, y,
    width: 16,
    height: 16,
    type,
    speed: 1.5,
    pulse: Math.random() * Math.PI * 2,
  };
}

// ============ Game Init ============

export function initGame(canvasW: number, canvasH: number): GameData {
  return {
    state: 'menu',
    score: 0,
    level: 1,
    decoherence: 0,
    player: createPlayer(canvasW, canvasH),
    enemies: [],
    boss: null,
    bullets: [],
    particles: [],
    powerUps: [],
    screenShake: 0,
    scanlineOffset: 0,
  };
}

export function startLevel(game: GameData, canvasW: number, canvasH: number): GameData {
  const lvl = game.level;
  const cfg = LEVELS[lvl - 1];
  const enemies: Enemy[] = [];

  for (let i = 0; i < cfg.enemyCount; i++) {
    const e = createEnemy(canvasW, lvl, i);
    if (lvl === 2 && i % 2 === 1) {
      e.linkedEnemy = i - 1;
      enemies[i - 1].linkedEnemy = i;
    }
    enemies.push(e);
  }

  return {
    ...game,
    state: 'playing',
    player: createPlayer(canvasW, canvasH),
    enemies,
    boss: null,
    bullets: [],
    particles: [],
    powerUps: [],
    decoherence: 0,
  };
}

// ============ Update Logic ============

export function update(game: GameData, dt: number, keys: Set<string>, canvasW: number, canvasH: number, now: number): GameData {
  if (game.state !== 'playing' && game.state !== 'boss') return game;

  const g = { ...game };
  g.scanlineOffset += dt * 30;
  g.screenShake = Math.max(0, g.screenShake - dt * 5);

  // Player movement
  const p = { ...g.player };
  let dx = 0, dy = 0;
  if (keys.has('ArrowLeft') || keys.has('a')) dx -= 1;
  if (keys.has('ArrowRight') || keys.has('d')) dx += 1;
  if (keys.has('ArrowUp') || keys.has('w')) dy -= 1;
  if (keys.has('ArrowDown') || keys.has('s')) dy += 1;
  
  const playerMoveSpeed = Math.sqrt(dx * dx + dy * dy);
  p.x = Math.max(0, Math.min(canvasW - p.width, p.x + dx * p.speed));
  p.y = Math.max(canvasH * 0.3, Math.min(canvasH - p.height, p.y + dy * p.speed));
  p.scanning = keys.has('e');
  if (p.invincible > 0) p.invincible -= dt;
  if (p.shieldTimer > 0) p.shieldTimer -= dt;
  if (p.rapidFireTimer > 0) p.rapidFireTimer -= dt;
  if (p.spreadShotTimer > 0) p.spreadShotTimer -= dt;
  g.player = p;

  // Shooting
  const shootCD = p.rapidFireTimer > 0 ? 60 : p.shootCooldown;
  const bullets = [...g.bullets];
  if (keys.has(' ') && now - p.lastShot > shootCD) {
    const cx = p.x + p.width / 2 - 2;
    bullets.push({
      x: cx, y: p.y - 4,
      vx: 0, vy: -8,
      isPlayer: true, damage: 10,
      width: 4, height: 10,
    });
    // Spread shot
    if (p.spreadShotTimer > 0) {
      bullets.push({
        x: cx - 8, y: p.y,
        vx: -2, vy: -7,
        isPlayer: true, damage: 7,
        width: 3, height: 8,
      });
      bullets.push({
        x: cx + 8, y: p.y,
        vx: 2, vy: -7,
        isPlayer: true, damage: 7,
        width: 3, height: 8,
      });
    }
    g.player = { ...g.player, lastShot: now };
  }

  // Update bullets
  const activeBullets: Bullet[] = [];
  bullets.forEach(b => {
    b.x += b.vx * dt * 60;
    b.y += b.vy * dt * 60;
    if (b.y > -20 && b.y < canvasH + 20 && b.x > -20 && b.x < canvasW + 20) {
      activeBullets.push(b);
    }
  });
  g.bullets = activeBullets;

  // Update particles
  g.particles = g.particles
    .map(p => ({ ...p, x: p.x + p.vx * dt * 60, y: p.y + p.vy * dt * 60, life: p.life - dt }))
    .filter(p => p.life > 0);

  // Update power-ups
  g.powerUps = g.powerUps
    .map(pu => ({ ...pu, y: pu.y + pu.speed * dt * 60, pulse: pu.pulse + dt * 5 }))
    .filter(pu => pu.y < canvasH + 30);

  // Power-up collection
  g.powerUps = g.powerUps.filter(pu => {
    const hit = pu.x < g.player.x + g.player.width && pu.x + pu.width > g.player.x &&
                pu.y < g.player.y + g.player.height && pu.y + pu.height > g.player.y;
    if (hit) {
      spawnParticles(g.particles, pu.x + pu.width / 2, pu.y + pu.height / 2, 12, getPowerUpColor(pu.type));
      g.screenShake = 1;
      switch (pu.type) {
        case 'health':
          g.player = { ...g.player, hp: Math.min(g.player.maxHp, g.player.hp + 30) };
          break;
        case 'rapidfire':
          g.player = { ...g.player, rapidFireTimer: 8 };
          break;
        case 'shield':
          g.player = { ...g.player, shieldTimer: 6, invincible: 6 };
          break;
        case 'spread':
          g.player = { ...g.player, spreadShotTimer: 10 };
          break;
        case 'nuke':
          // Destroy all enemies on screen
          g.enemies.forEach(e => {
            spawnParticles(g.particles, e.x + e.width / 2, e.y + e.height / 2, 10, '#ff00ff');
            g.score += 50;
          });
          g.enemies = [];
          if (g.boss) {
            g.boss = { ...g.boss, hp: g.boss.hp - 100 };
            spawnParticles(g.particles, g.boss.x + g.boss.width / 2, g.boss.y + g.boss.height / 2, 20, '#ffff00');
          }
          g.screenShake = 8;
          break;
      }
      g.score += 25;
      return false;
    }
    return true;
  });

  // Update enemies
  if (g.state === 'playing') {
    g.enemies = g.enemies.map((e, idx) => {
      const ne = { ...e };
      ne.y += ne.speed * dt * 60;

      if (ne.type === 'superposition' && ne.ghostA && ne.ghostB) {
        ne.ghostA = { x: ne.x - 40 + Math.sin(now / 500 + idx) * 20, y: ne.y };
        ne.ghostB = { x: ne.x + 40 + Math.cos(now / 500 + idx) * 20, y: ne.y };
      }

      if (g.level === 1 && !ne.visible && p.scanning) {
        const dist = Math.hypot(ne.x + ne.width / 2 - (p.x + p.width / 2), ne.y + ne.height / 2 - p.y);
        if (dist < 150) ne.visible = true;
      }

      if (ne.phaseTimer !== undefined) {
        ne.phaseTimer! -= dt * 1000;
        if (ne.phaseTimer! <= 0) {
          ne.phasing = !ne.phasing;
          ne.phaseTimer = 1000 + Math.random() * 2000;
        }
      }

      if (ne.visible && now - ne.lastShot > ne.shootCooldown && ne.y > 0) {
        ne.lastShot = now;
        g.bullets.push({
          x: ne.x + ne.width / 2 - 2, y: ne.y + ne.height,
          vx: (Math.random() - 0.5) * 1, vy: 4,
          isPlayer: false, damage: 8 + g.level * 2,
          width: 4, height: 8,
        });
      }

      return ne;
    });

    // Bullet-enemy collisions
    g.bullets = g.bullets.filter(b => {
      if (!b.isPlayer) return true;
      
      for (let i = 0; i < g.enemies.length; i++) {
        const e = g.enemies[i];
        if (e.hp <= 0) continue;
        if (e.phasing) continue;

        if (e.type === 'superposition' && e.ghostA && e.ghostB) {
          const hitA = b.x < e.ghostA.x + e.width && b.x + b.width > e.ghostA.x &&
                       b.y < e.ghostA.y + e.height && b.y + b.height > e.ghostA.y;
          const hitB = b.x < e.ghostB.x + e.width && b.x + b.width > e.ghostB.x &&
                       b.y < e.ghostB.y + e.height && b.y + b.height > e.ghostB.y;

          if (hitA || hitB) {
            const hitCorrect = (hitA && e.realGhost === 'A') || (hitB && e.realGhost === 'B');
            if (hitCorrect) {
              g.enemies[i] = { ...e, hp: e.hp - b.damage };
              g.score += 10;
              spawnParticles(g.particles, b.x, b.y, 5, '#00ff88');
              if (g.enemies[i].hp <= 0) {
                spawnParticles(g.particles, e.x, e.y, 15, '#bb00ff');
                g.score += 50;
                // Chance to drop power-up
                const pu = spawnPowerUp(e.x, e.y);
                if (pu) g.powerUps.push(pu);
              }
            } else {
              g.player = { ...g.player, hp: g.player.hp - (g.player.shieldTimer > 0 ? 3 : 10) };
              g.screenShake = 3;
              spawnParticles(g.particles, b.x, b.y, 5, '#ff0044');
              g.decoherence = Math.min(100, g.decoherence + 5);
            }
            return false;
          }
        } else {
          if (!e.visible && g.level === 1) continue;
          const hit = b.x < e.x + e.width && b.x + b.width > e.x &&
                      b.y < e.y + e.height && b.y + b.height > e.y;
          if (hit) {
            g.enemies[i] = { ...e, hp: e.hp - b.damage };
            g.score += 10;
            spawnParticles(g.particles, b.x, b.y, 5, '#00ff88');

            if (g.level === 2 && e.linkedEnemy !== undefined && g.enemies[e.linkedEnemy]) {
              g.enemies[e.linkedEnemy] = { ...g.enemies[e.linkedEnemy], hp: g.enemies[e.linkedEnemy].hp - b.damage };
              spawnParticles(g.particles, g.enemies[e.linkedEnemy].x, g.enemies[e.linkedEnemy].y, 3, '#ff88ff');
            }

            if (g.enemies[i].hp <= 0) {
              spawnParticles(g.particles, e.x, e.y, 15, '#bb00ff');
              g.score += 50;
              const pu = spawnPowerUp(e.x, e.y);
              if (pu) g.powerUps.push(pu);
            }
            return false;
          }
        }
      }
      return true;
    });

    g.enemies = g.enemies.filter(e => e.hp > 0 && e.y < canvasH + 50);

    if (g.enemies.length === 0 && !g.boss) {
      g.boss = createBoss(g.level, canvasW);
      g.state = 'boss';
    }
  }

  // Boss logic
  if (g.state === 'boss' && g.boss) {
    const boss = { ...g.boss };

    if (boss.y < 30) {
      boss.y += 1;
    } else {
      boss.x += Math.sin(now / 1000) * boss.speed * dt * 60;
      boss.x = Math.max(0, Math.min(canvasW - boss.width, boss.x));

      if (now - boss.lastShot > boss.shootCooldown) {
        boss.lastShot = now;
        const cx = boss.x + boss.width / 2;
        const cy = boss.y + boss.height;
        
        for (let a = -1; a <= 1; a++) {
          g.bullets.push({
            x: cx - 2, y: cy,
            vx: a * 2, vy: 5,
            isPlayer: false, damage: 12 + g.level * 3,
            width: 5, height: 10,
          });
        }

        if (g.level === 4) {
          for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i + now / 500;
            g.bullets.push({
              x: cx, y: cy,
              vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3 + 1,
              isPlayer: false, damage: 10,
              width: 4, height: 4,
            });
          }
        }
      }

      if (g.level === 3) {
        boss.phaseTimer = (boss.phaseTimer || 0) - dt * 1000;
        if (boss.phaseTimer <= 0) {
          boss.phasing = !boss.phasing;
          boss.phaseTimer = 800 + Math.random() * 1500;
        }
      }

      if (g.level === 5 && boss.positions) {
        if (Math.random() < dt * 0.5) {
          boss.realPosition = Math.floor(Math.random() * 4);
        }
      }

      if (g.level === 6) {
        boss.blurAmount = playerMoveSpeed * 25;
      }
    }

    // Boss bullet collision
    g.bullets = g.bullets.filter(b => {
      if (!b.isPlayer) return true;
      if (boss.phasing) return true;

      if (g.level === 5 && boss.positions && boss.realPosition !== undefined) {
        const rp = boss.positions[boss.realPosition];
        const hit = b.x < rp.x + boss.width && b.x + b.width > rp.x &&
                    b.y < rp.y + boss.height && b.y + b.height > rp.y;
        if (hit) {
          boss.hp -= b.damage;
          g.score += 20;
          spawnParticles(g.particles, b.x, b.y, 8, '#00ff88');
          g.screenShake = 2;
          boss.realPosition = Math.floor(Math.random() * 4);
          return false;
        }
        for (let i = 0; i < boss.positions.length; i++) {
          if (i === boss.realPosition) continue;
          const fp = boss.positions[i];
          const fhit = b.x < fp.x + boss.width && b.x + b.width > fp.x &&
                       b.y < fp.y + boss.height && b.y + b.height > fp.y;
          if (fhit) {
            g.player = { ...g.player, hp: g.player.hp - (g.player.shieldTimer > 0 ? 2 : 5) };
            g.decoherence = Math.min(100, g.decoherence + 3);
            spawnParticles(g.particles, b.x, b.y, 5, '#ff0044');
            return false;
          }
        }
        return true;
      }

      let hitBox = { x: boss.x, y: boss.y, w: boss.width, h: boss.height };
      if (g.level === 6 && boss.blurAmount && boss.blurAmount > 5) {
        const shrink = Math.min(boss.blurAmount, 30);
        hitBox.x += shrink / 2;
        hitBox.y += shrink / 2;
        hitBox.w -= shrink;
        hitBox.h -= shrink;
        if (hitBox.w < 10) hitBox.w = 10;
        if (hitBox.h < 10) hitBox.h = 10;
      }

      const hit = b.x < hitBox.x + hitBox.w && b.x + b.width > hitBox.x &&
                  b.y < hitBox.y + hitBox.h && b.y + b.height > hitBox.y;
      if (hit) {
        boss.hp -= b.damage;
        g.score += 20;
        spawnParticles(g.particles, b.x, b.y, 8, '#00ff88');
        g.screenShake = 2;
        return false;
      }
      return true;
    });

    // Boss defeated — drop guaranteed power-up
    if (boss.hp <= 0) {
      spawnParticles(g.particles, boss.x + boss.width / 2, boss.y + boss.height / 2, 40, '#ff00ff');
      g.screenShake = 8;
      g.score += 500;
      // Drop 2-3 power-ups from boss
      for (let i = 0; i < 3; i++) {
        const pu = spawnPowerUp(boss.x + boss.width / 2 + (i - 1) * 30, boss.y + boss.height / 2);
        if (pu || i === 0) {
          g.powerUps.push(pu || {
            x: boss.x + boss.width / 2 + (i - 1) * 30,
            y: boss.y + boss.height / 2,
            width: 16, height: 16,
            type: 'health' as PowerUpType,
            speed: 1.5, pulse: 0,
          });
        }
      }
      g.boss = null;
      if (g.level >= 6) {
        g.state = 'victory';
      } else {
        g.state = 'levelcomplete';
      }
      return g;
    }

    g.boss = boss;
  }

  // Player-bullet collision
  g.bullets = g.bullets.filter(b => {
    if (b.isPlayer) return true;
    if (g.player.invincible > 0) return true;

    if (g.level === 4 && g.boss?.interferenceZones) {
      for (const zone of g.boss.interferenceZones) {
        const dist = Math.hypot(g.player.x + g.player.width / 2 - zone.x, g.player.y + g.player.height / 2 - zone.y);
        if (dist < zone.radius) return false;
      }
    }

    const hit = b.x < g.player.x + g.player.width && b.x + b.width > g.player.x &&
                b.y < g.player.y + g.player.height && b.y + b.height > g.player.y;
    if (hit) {
      const dmg = g.player.shieldTimer > 0 ? Math.floor(b.damage * 0.3) : b.damage;
      g.player = { ...g.player, hp: g.player.hp - dmg, invincible: 0.5 };
      g.screenShake = 3;
      g.decoherence = Math.min(100, g.decoherence + 3);
      spawnParticles(g.particles, g.player.x + g.player.width / 2, g.player.y, 8, '#ff4444');
      return false;
    }
    return true;
  });

  // Player death
  if (g.player.hp <= 0) {
    g.state = 'gameover';
    spawnParticles(g.particles, g.player.x + g.player.width / 2, g.player.y + g.player.height / 2, 30, '#00ff88');
    g.screenShake = 10;
  }

  return g;
}

function getPowerUpColor(type: PowerUpType): string {
  switch (type) {
    case 'health': return '#00ff44';
    case 'rapidfire': return '#ffaa00';
    case 'shield': return '#00aaff';
    case 'spread': return '#ff00ff';
    case 'nuke': return '#ff0000';
  }
}
