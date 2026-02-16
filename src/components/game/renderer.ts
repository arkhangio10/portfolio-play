import { GameData, Player, Enemy, Boss, Bullet, Particle, PowerUp, PowerUpType, LevelConfig } from './types';
import { LEVELS } from './levels';

// ============ Retro Pixel Drawing Helpers ============

function pixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

function drawScanlines(ctx: CanvasRenderingContext2D, w: number, h: number, offset: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  for (let y = offset % 4; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }
}

function drawNoise(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 16) {
    const noise = (Math.random() - 0.5) * intensity;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
}

// ============ Entity Renderers ============

function drawPlayer(ctx: CanvasRenderingContext2D, p: Player) {
  if (p.invincible > 0 && p.shieldTimer <= 0 && Math.floor(p.invincible * 10) % 2 === 0) return;
  
  const cx = p.x + p.width / 2;
  const s = 1.3;

  // Shield bubble
  if (p.shieldTimer > 0) {
    ctx.strokeStyle = `rgba(0, 170, 255, ${0.3 + Math.sin(Date.now() / 200) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, p.y + p.height / 2, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0, 170, 255, 0.05)';
    ctx.fill();
  }

  // Main fuselage
  pixelRect(ctx, cx - 3 * s, p.y + 2 * s, 6 * s, 20 * s, '#1a5c2a');
  pixelRect(ctx, cx - 2 * s, p.y + 3 * s, 4 * s, 16 * s, '#22aa44');

  // Nose
  pixelRect(ctx, cx - 2 * s, p.y, 4 * s, 4 * s, '#00ff66');
  pixelRect(ctx, cx - 1 * s, p.y - 2 * s, 2 * s, 3 * s, '#88ffaa');

  // Cockpit
  pixelRect(ctx, cx - 2 * s, p.y + 6 * s, 4 * s, 5 * s, '#115533');
  pixelRect(ctx, cx - 1 * s, p.y + 7 * s, 2 * s, 3 * s, '#00ccaa');

  // Left wing
  ctx.fillStyle = '#33cc55';
  ctx.beginPath();
  ctx.moveTo(cx - 3 * s, p.y + 10 * s);
  ctx.lineTo(cx - 14 * s, p.y + 22 * s);
  ctx.lineTo(cx - 12 * s, p.y + 24 * s);
  ctx.lineTo(cx - 3 * s, p.y + 18 * s);
  ctx.closePath();
  ctx.fill();
  pixelRect(ctx, cx - 12 * s, p.y + 21 * s, 4 * s, 2 * s, '#7744aa');
  pixelRect(ctx, cx - 10 * s, p.y + 19 * s, 3 * s, 2 * s, '#55dd77');

  // Right wing
  ctx.fillStyle = '#33cc55';
  ctx.beginPath();
  ctx.moveTo(cx + 3 * s, p.y + 10 * s);
  ctx.lineTo(cx + 14 * s, p.y + 22 * s);
  ctx.lineTo(cx + 12 * s, p.y + 24 * s);
  ctx.lineTo(cx + 3 * s, p.y + 18 * s);
  ctx.closePath();
  ctx.fill();
  pixelRect(ctx, cx + 8 * s, p.y + 21 * s, 4 * s, 2 * s, '#7744aa');
  pixelRect(ctx, cx + 7 * s, p.y + 19 * s, 3 * s, 2 * s, '#55dd77');

  // Wing tips
  pixelRect(ctx, cx - 15 * s, p.y + 22 * s, 3 * s, 3 * s, '#9955cc');
  pixelRect(ctx, cx + 12 * s, p.y + 22 * s, 3 * s, 3 * s, '#9955cc');

  // Engine exhausts
  const flicker = 2 + Math.random() * 4;
  const exhaustColor = p.rapidFireTimer > 0 ? '#ffaa00' : '#88ff00';
  pixelRect(ctx, cx - 4 * s, p.y + 22 * s, 2 * s, flicker * s, exhaustColor);
  pixelRect(ctx, cx - 1 * s, p.y + 22 * s, 2 * s, (flicker + 2) * s, '#ffff44');
  pixelRect(ctx, cx + 2 * s, p.y + 22 * s, 2 * s, flicker * s, exhaustColor);

  // Spread shot indicator
  if (p.spreadShotTimer > 0) {
    pixelRect(ctx, cx - 10 * s, p.y + 10 * s, 2 * s, 2 * s, '#ff00ff');
    pixelRect(ctx, cx + 8 * s, p.y + 10 * s, 2 * s, 2 * s, '#ff00ff');
  }

  // Scanning beam
  if (p.scanning) {
    ctx.fillStyle = 'rgba(0, 255, 200, 0.08)';
    ctx.beginPath();
    ctx.moveTo(cx - 4, p.y);
    ctx.lineTo(cx - 120, p.y - 300);
    ctx.lineTo(cx + 120, p.y - 300);
    ctx.lineTo(cx + 4, p.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 4, p.y);
    ctx.lineTo(cx - 120, p.y - 300);
    ctx.moveTo(cx + 4, p.y);
    ctx.lineTo(cx + 120, p.y - 300);
    ctx.stroke();
  }
}

// ============ Improved Enemy Ships ============

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, level: number, now: number) {
  if (!e.visible && level === 1) {
    ctx.fillStyle = 'rgba(180, 0, 255, 0.05)';
    pixelRect(ctx, e.x, e.y, e.width, e.height, 'rgba(180, 0, 255, 0.05)');
    return;
  }

  if (e.type === 'superposition' && e.ghostA && e.ghostB) {
    drawDetailedEnemy(ctx, e.ghostA.x, e.ghostA.y, e.width, e.height, e.phasing ? 0.15 : 0.45, now);
    drawDetailedEnemy(ctx, e.ghostB.x, e.ghostB.y, e.width, e.height, e.phasing ? 0.15 : 0.45, now);
  } else {
    drawDetailedEnemy(ctx, e.x, e.y, e.width, e.height, e.phasing ? 0.25 : 1, now);
  }
}

function drawDetailedEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha: number, now: number) {
  ctx.globalAlpha = alpha;
  const cx = x + w / 2;
  const cy = y + h / 2;

  // Main hull (inverted V shape — pointed down toward player)
  ctx.fillStyle = '#6a00aa';
  ctx.beginPath();
  ctx.moveTo(cx, y + h + 4); // bottom tip
  ctx.lineTo(x - 4, y + 2);
  ctx.lineTo(x + 4, y);
  ctx.lineTo(x + w - 4, y);
  ctx.lineTo(x + w + 4, y + 2);
  ctx.closePath();
  ctx.fill();

  // Inner hull detail
  ctx.fillStyle = '#9933dd';
  ctx.beginPath();
  ctx.moveTo(cx, y + h);
  ctx.lineTo(x + 4, y + 4);
  ctx.lineTo(x + w - 4, y + 4);
  ctx.closePath();
  ctx.fill();

  // Cockpit eye (glowing red core)
  const pulse = Math.sin(now / 300) * 0.3 + 0.7;
  pixelRect(ctx, cx - 4, cy - 4, 8, 6, '#330022');
  pixelRect(ctx, cx - 3, cy - 3, 6, 4, `rgba(255, 0, 80, ${pulse})`);
  pixelRect(ctx, cx - 1, cy - 2, 2, 2, '#ffffff');

  // Left wing strut
  ctx.fillStyle = '#5500aa';
  pixelRect(ctx, x - 6, y + 4, 8, 3, '#5500aa');
  pixelRect(ctx, x - 8, y + 3, 4, 5, '#8833cc');
  // Wing cannon
  pixelRect(ctx, x - 8, y + 8, 2, 4, '#ff44ff');

  // Right wing strut
  pixelRect(ctx, x + w - 2, y + 4, 8, 3, '#5500aa');
  pixelRect(ctx, x + w + 4, y + 3, 4, 5, '#8833cc');
  pixelRect(ctx, x + w + 6, y + 8, 2, 4, '#ff44ff');

  // Engine glow at top (they fly downward)
  const ef = 2 + Math.random() * 3;
  pixelRect(ctx, cx - 3, y - ef, 2, ef, '#cc44ff');
  pixelRect(ctx, cx + 1, y - ef, 2, ef, '#cc44ff');

  // Entanglement link indicator (subtle line)
  ctx.globalAlpha = 1;
}

// ============ Boss ============

function drawBoss(ctx: CanvasRenderingContext2D, b: Boss, level: number, playerSpeed: number, now: number) {
  const blur = level === 6 ? (b.blurAmount || 0) : 0;
  
  if (level === 5 && b.positions) {
    b.positions.forEach((pos, i) => {
      ctx.globalAlpha = i === b.realPosition ? 0.8 : 0.3;
      drawBossShape(ctx, pos.x, pos.y, b.width, b.height, b.name, now);
    });
    ctx.globalAlpha = 1;
  } else if (level === 3 && b.phasing) {
    ctx.globalAlpha = 0.15;
    drawBossShape(ctx, b.x, b.y, b.width, b.height, b.name, now);
    ctx.globalAlpha = 1;
  } else if (blur > 0) {
    for (let i = 0; i < 5; i++) {
      const ox = (Math.random() - 0.5) * blur * 2;
      const oy = (Math.random() - 0.5) * blur * 2;
      ctx.globalAlpha = 0.2;
      drawBossShape(ctx, b.x + ox, b.y + oy, b.width, b.height, b.name, now);
    }
    ctx.globalAlpha = 1;
    drawBossShape(ctx, b.x, b.y, b.width, b.height, b.name, now);
  } else {
    drawBossShape(ctx, b.x, b.y, b.width, b.height, b.name, now);
  }

  // Interference safe zones
  if (level === 4 && b.interferenceZones) {
    b.interferenceZones.forEach(zone => {
      ctx.strokeStyle = 'rgba(0, 255, 100, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(0, 255, 100, 0.05)';
      ctx.fill();
    });
  }

  // Boss HP bar
  if (b.hp > 0) {
    const barW = 200;
    const barX = b.x + b.width / 2 - barW / 2;
    const barY = b.y - 20;
    pixelRect(ctx, barX, barY, barW, 6, '#220033');
    pixelRect(ctx, barX, barY, barW * (b.hp / b.maxHp), 6, '#ff00ff');
    pixelRect(ctx, barX, barY, barW * (b.hp / b.maxHp), 2, '#ff88ff');
    // Boss name
    ctx.font = '9px "Courier New", monospace';
    ctx.fillStyle = '#ff88ff';
    ctx.textAlign = 'center';
    ctx.fillText(b.name.toUpperCase(), b.x + b.width / 2, barY - 4);
    ctx.textAlign = 'left';
  }
}

function drawBossShape(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, name: string, now: number) {
  const cx = x + w / 2;

  // Main hull — large angular dreadnought
  ctx.fillStyle = '#5500aa';
  ctx.beginPath();
  ctx.moveTo(cx, y + h + 8);
  ctx.lineTo(x - 15, y + h * 0.3);
  ctx.lineTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w + 15, y + h * 0.3);
  ctx.closePath();
  ctx.fill();

  // Inner armor plating
  ctx.fillStyle = '#7722cc';
  ctx.beginPath();
  ctx.moveTo(cx, y + h);
  ctx.lineTo(x + 10, y + 6);
  ctx.lineTo(x + w - 10, y + 6);
  ctx.closePath();
  ctx.fill();

  // Bridge section
  pixelRect(ctx, cx - 12, y + 8, 24, 14, '#440088');
  pixelRect(ctx, cx - 8, y + 10, 16, 10, '#6633bb');

  // Central eye/core
  const pulse = Math.sin(now / 250) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(255, 0, 255, ${pulse})`;
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.4, 8, 0, Math.PI * 2);
  ctx.fill();
  pixelRect(ctx, cx - 3, y + h * 0.4 - 3, 6, 6, '#ffffff');

  // Left wing structure
  ctx.fillStyle = '#4400aa';
  pixelRect(ctx, x - 18, y + h * 0.25, 20, 6, '#4400aa');
  pixelRect(ctx, x - 22, y + h * 0.3, 10, h * 0.4, '#5511bb');
  // Wing cannon
  pixelRect(ctx, x - 24, y + h * 0.5, 4, 10, '#ff44ff');
  const ef1 = 2 + Math.random() * 4;
  pixelRect(ctx, x - 23, y + h * 0.5 + 10, 2, ef1, '#ff88ff');

  // Right wing structure
  pixelRect(ctx, x + w - 2, y + h * 0.25, 20, 6, '#4400aa');
  pixelRect(ctx, x + w + 12, y + h * 0.3, 10, h * 0.4, '#5511bb');
  pixelRect(ctx, x + w + 20, y + h * 0.5, 4, 10, '#ff44ff');
  const ef2 = 2 + Math.random() * 4;
  pixelRect(ctx, x + w + 21, y + h * 0.5 + 10, 2, ef2, '#ff88ff');

  // Top engine exhausts
  const ef3 = 3 + Math.random() * 5;
  pixelRect(ctx, cx - 8, y - ef3, 3, ef3, '#9944ff');
  pixelRect(ctx, cx + 5, y - ef3, 3, ef3, '#9944ff');

  // Armor detail lines
  ctx.strokeStyle = '#8844dd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 5, y + 4);
  ctx.lineTo(cx, y + h - 5);
  ctx.moveTo(x + w - 5, y + 4);
  ctx.lineTo(cx, y + h - 5);
  ctx.stroke();
}

// ============ Power-Up Renderer ============

function getPowerUpColor(type: PowerUpType): string {
  switch (type) {
    case 'health': return '#00ff44';
    case 'rapidfire': return '#ffaa00';
    case 'shield': return '#00aaff';
    case 'spread': return '#ff00ff';
    case 'nuke': return '#ff3333';
  }
}

function getPowerUpLabel(type: PowerUpType): string {
  switch (type) {
    case 'health': return '+HP';
    case 'rapidfire': return 'RPD';
    case 'shield': return 'SHD';
    case 'spread': return 'SPR';
    case 'nuke': return 'NUK';
  }
}

function drawPowerUp(ctx: CanvasRenderingContext2D, pu: PowerUp) {
  const cx = pu.x + pu.width / 2;
  const cy = pu.y + pu.height / 2;
  const color = getPowerUpColor(pu.type);
  const pulseSize = Math.sin(pu.pulse) * 2;

  // Outer glow
  ctx.globalAlpha = 0.3 + Math.sin(pu.pulse) * 0.15;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, 12 + pulseSize, 0, Math.PI * 2);
  ctx.fill();

  // Pill body (rounded rectangle)
  ctx.globalAlpha = 1;
  const r = 6 + pulseSize * 0.5;
  ctx.fillStyle = '#111122';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Inner icon
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
  ctx.fill();

  // Symbol
  ctx.font = 'bold 7px "Courier New", monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(getPowerUpLabel(pu.type), cx, cy + 1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Sparkle particles around it
  for (let i = 0; i < 3; i++) {
    const angle = pu.pulse + (Math.PI * 2 / 3) * i;
    const sx = cx + Math.cos(angle) * (14 + pulseSize);
    const sy = cy + Math.sin(angle) * (14 + pulseSize);
    pixelRect(ctx, sx, sy, 2, 2, color);
  }
}

function drawBullet(ctx: CanvasRenderingContext2D, b: Bullet) {
  if (b.isPlayer) {
    pixelRect(ctx, b.x, b.y, b.width, b.height, '#00ff88');
    pixelRect(ctx, b.x + 1, b.y, b.width - 2, b.height, '#aaffcc');
  } else {
    pixelRect(ctx, b.x, b.y, b.width, b.height, '#ff00ff');
    pixelRect(ctx, b.x + 1, b.y + 1, b.width - 2, b.height - 2, '#ff88ff');
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.globalAlpha = p.life / p.maxLife;
  pixelRect(ctx, p.x, p.y, p.size, p.size, p.color);
  ctx.globalAlpha = 1;
}

// ============ HUD ============

function drawHUD(ctx: CanvasRenderingContext2D, game: GameData, w: number, h: number) {
  const level = LEVELS[game.level - 1];
  
  ctx.font = '14px "Courier New", monospace';
  ctx.fillStyle = '#ff4444';
  ctx.fillText(`QUANTUM STATE: ${level.name}`, 12, 24);
  ctx.fillStyle = '#00ff88';
  ctx.fillText(`DECOHERENCE: ${Math.floor(game.decoherence)}%`, 12, 44);

  ctx.fillStyle = '#ffffff';
  ctx.fillText(`SCORE: ${game.score}`, w - 160, 24);
  ctx.fillText(`LEVEL: ${game.level}/6`, w - 160, 44);

  // Player HP bar
  const hpW = 150;
  pixelRect(ctx, 12, h - 30, hpW, 10, '#220000');
  pixelRect(ctx, 12, h - 30, hpW * (game.player.hp / game.player.maxHp), 10, '#00ff88');
  pixelRect(ctx, 12, h - 30, hpW * (game.player.hp / game.player.maxHp), 3, '#88ffaa');
  
  ctx.fillStyle = '#00ff88';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('MEASUREMENT FIGHTER', 12, h - 36);

  // Active power-up indicators
  let puX = 170;
  const puY = h - 28;
  if (game.player.shieldTimer > 0) {
    pixelRect(ctx, puX, puY, 28, 8, '#003366');
    ctx.fillStyle = '#00aaff';
    ctx.font = '7px "Courier New", monospace';
    ctx.fillText(`SHD ${Math.ceil(game.player.shieldTimer)}s`, puX + 2, puY + 7);
    puX += 34;
  }
  if (game.player.rapidFireTimer > 0) {
    pixelRect(ctx, puX, puY, 28, 8, '#332200');
    ctx.fillStyle = '#ffaa00';
    ctx.font = '7px "Courier New", monospace';
    ctx.fillText(`RPD ${Math.ceil(game.player.rapidFireTimer)}s`, puX + 2, puY + 7);
    puX += 34;
  }
  if (game.player.spreadShotTimer > 0) {
    pixelRect(ctx, puX, puY, 28, 8, '#330033');
    ctx.fillStyle = '#ff00ff';
    ctx.font = '7px "Courier New", monospace';
    ctx.fillText(`SPR ${Math.ceil(game.player.spreadShotTimer)}s`, puX + 2, puY + 7);
    puX += 34;
  }

  // Mechanic hint
  ctx.fillStyle = '#888888';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText(`[${level.mechanic.toUpperCase()}]`, 12, 60);
}

// ============ Screens ============

function drawMenu(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#050808';
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 800; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const brightness = Math.random() * 30;
    ctx.fillStyle = `rgba(${brightness}, ${brightness + 10}, ${brightness}, 0.5)`;
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.textAlign = 'center';
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillStyle = '#00ff88';
  ctx.fillText('EVENT HORIZON', w / 2, h / 2 - 80);
  
  ctx.font = '16px "Courier New", monospace';
  ctx.fillStyle = '#bb00ff';
  ctx.fillText('THE DECOHERENCE', w / 2, h / 2 - 55);

  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#446644';
  ctx.fillText('A QUANTUM PHYSICS SPACE SHOOTER', w / 2, h / 2 - 30);

  ctx.font = '12px "Courier New", monospace';
  ctx.fillStyle = '#888888';
  ctx.fillText('WASD / ARROWS — MOVE', w / 2, h / 2 + 20);
  ctx.fillText('SPACE — SHOOT', w / 2, h / 2 + 40);
  ctx.fillText('E — QUANTUM SCAN', w / 2, h / 2 + 60);

  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.fillStyle = Math.sin(Date.now() / 300) > 0 ? '#00ff88' : '#006633';
  ctx.fillText('[ PRESS ENTER OR TAP TO START ]', w / 2, h / 2 + 110);

  ctx.textAlign = 'left';
  drawScanlines(ctx, w, h, Math.floor(Date.now() / 50) % 4);
}

function drawGameOver(ctx: CanvasRenderingContext2D, w: number, h: number, game: GameData) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, w, h);

  const level = LEVELS[game.level - 1];
  
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.fillStyle = '#ff0044';
  ctx.fillText('DECOHERENCE COMPLETE', w / 2, 60);

  ctx.font = '14px "Courier New", monospace';
  ctx.fillStyle = '#ff8888';
  ctx.fillText(`WAVE FUNCTION COLLAPSED — LEVEL ${game.level}`, w / 2, 90);

  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillStyle = '#00ff88';
  ctx.fillText('— QUANTUM DATA LOG —', w / 2, 130);

  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#88ccaa';
  const words = level.quantumLog.split(' ');
  let line = '';
  let y = 160;
  const maxW = w - 80;
  words.forEach(word => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line.trim(), w / 2, y);
      line = word + ' ';
      y += 16;
    } else {
      line = test;
    }
  });
  if (line) ctx.fillText(line.trim(), w / 2, y);

  ctx.font = '12px "Courier New", monospace';
  ctx.fillStyle = '#888888';
  ctx.fillText(`FINAL SCORE: ${game.score}`, w / 2, h - 60);
  
  ctx.fillStyle = Math.sin(Date.now() / 300) > 0 ? '#00ff88' : '#006633';
  ctx.fillText('[ PRESS ENTER TO RETRY ]', w / 2, h - 30);
  ctx.textAlign = 'left';
}

function drawLevelComplete(ctx: CanvasRenderingContext2D, w: number, h: number, game: GameData) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, w, h);

  const level = LEVELS[game.level - 1];

  ctx.textAlign = 'center';
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillStyle = '#00ff88';
  ctx.fillText(`LEVEL ${game.level} COMPLETE`, w / 2, h / 2 - 60);

  ctx.font = '14px "Courier New", monospace';
  ctx.fillStyle = '#bb00ff';
  ctx.fillText(`${level.bossName} DEFEATED`, w / 2, h / 2 - 30);

  ctx.fillStyle = '#ffffff';
  ctx.fillText(`SCORE: ${game.score}`, w / 2, h / 2 + 10);

  if (game.level < 6) {
    ctx.font = '12px "Courier New", monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText(`NEXT: ${LEVELS[game.level].name}`, w / 2, h / 2 + 40);
    
    ctx.fillStyle = Math.sin(Date.now() / 300) > 0 ? '#00ff88' : '#006633';
    ctx.fillText('[ PRESS ENTER TO CONTINUE ]', w / 2, h / 2 + 70);
  }
  ctx.textAlign = 'left';
}

function drawVictory(ctx: CanvasRenderingContext2D, w: number, h: number, game: GameData) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillStyle = '#00ff88';
  ctx.fillText('COHERENCE RESTORED', w / 2, h / 2 - 80);

  ctx.font = '16px "Courier New", monospace';
  ctx.fillStyle = '#bb00ff';
  ctx.fillText('THE UNIVERSE IS OBSERVED', w / 2, h / 2 - 50);

  ctx.font = '14px "Courier New", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`FINAL SCORE: ${game.score}`, w / 2, h / 2);

  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#88ccaa';
  ctx.fillText('You have mastered all six quantum principles.', w / 2, h / 2 + 40);
  ctx.fillText('The wave function of reality has been collapsed.', w / 2, h / 2 + 58);

  ctx.fillStyle = Math.sin(Date.now() / 300) > 0 ? '#00ff88' : '#006633';
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('[ PRESS ENTER TO RESTART ]', w / 2, h / 2 + 100);
  ctx.textAlign = 'left';
}

// ============ Main Render ============

export function render(ctx: CanvasRenderingContext2D, game: GameData, w: number, h: number) {
  if (game.screenShake > 0) {
    ctx.save();
    ctx.translate(
      (Math.random() - 0.5) * game.screenShake * 4,
      (Math.random() - 0.5) * game.screenShake * 4
    );
  }

  if (game.state === 'menu') {
    drawMenu(ctx, w, h);
    if (game.screenShake > 0) ctx.restore();
    return;
  }

  const level = LEVELS[game.level - 1];
  ctx.fillStyle = level.bgColor;
  ctx.fillRect(0, 0, w, h);

  // Stars
  for (let i = 0; i < 60; i++) {
    const sx = ((i * 137.5 + game.scanlineOffset * (0.2 + (i % 3) * 0.1)) % w);
    const sy = ((i * 97.3 + game.scanlineOffset * (0.3 + (i % 2) * 0.2)) % h);
    const bright = 40 + (i % 4) * 20;
    ctx.fillStyle = `rgb(${bright}, ${bright + 10}, ${bright})`;
    ctx.fillRect(sx, sy, 1 + (i % 2), 1 + (i % 2));
  }

  const now = Date.now();

  // Game entities
  game.particles.forEach(p => drawParticle(ctx, p));
  game.bullets.forEach(b => drawBullet(ctx, b));
  game.powerUps.forEach(pu => drawPowerUp(ctx, pu));
  game.enemies.forEach(e => drawEnemy(ctx, e, game.level, now));
  if (game.boss) drawBoss(ctx, game.boss, game.level, game.player.speed, now);
  drawPlayer(ctx, game.player);

  drawHUD(ctx, game, w, h);

  drawScanlines(ctx, w, h, game.scanlineOffset);
  if (Math.random() < 0.3) drawNoise(ctx, w, h, 8);

  if (game.screenShake > 0) ctx.restore();

  if (game.state === 'gameover') drawGameOver(ctx, w, h, game);
  if (game.state === 'levelcomplete') drawLevelComplete(ctx, w, h, game);
  if (game.state === 'victory') drawVictory(ctx, w, h, game);
}
