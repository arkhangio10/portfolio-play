import { GameData, Player, Enemy, Boss, Bullet, Particle, LevelConfig } from './types';
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
  for (let i = 0; i < data.length; i += 16) { // skip pixels for performance
    const noise = (Math.random() - 0.5) * intensity;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
}

// ============ Entity Renderers ============

function drawPlayer(ctx: CanvasRenderingContext2D, p: Player) {
  if (p.invincible > 0 && Math.floor(p.invincible * 10) % 2 === 0) return;
  
  const cx = p.x + p.width / 2;
  const cy = p.y + p.height / 2;
  
  // Ship body - angular fighter shape
  ctx.fillStyle = '#00ff88';
  ctx.beginPath();
  ctx.moveTo(cx, p.y);
  ctx.lineTo(p.x + p.width, p.y + p.height);
  ctx.lineTo(cx, p.y + p.height - 8);
  ctx.lineTo(p.x, p.y + p.height);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  pixelRect(ctx, cx - 3, p.y + 10, 6, 8, '#00ffcc');
  
  // Engine glow
  const glowSize = 4 + Math.random() * 4;
  pixelRect(ctx, cx - 4, p.y + p.height - 2, 8, glowSize, '#88ff00');
  pixelRect(ctx, cx - 2, p.y + p.height, 4, glowSize + 2, '#ffff00');

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

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, level: number) {
  if (!e.visible && level === 1) {
    // Invisible - draw faint shimmer
    ctx.fillStyle = 'rgba(180, 0, 255, 0.05)';
    pixelRect(ctx, e.x, e.y, e.width, e.height, 'rgba(180, 0, 255, 0.05)');
    return;
  }

  if (e.type === 'superposition' && e.ghostA && e.ghostB) {
    // Draw both ghosts
    drawGhostEnemy(ctx, e.ghostA.x, e.ghostA.y, e.width, e.height, 'A', e.phasing);
    drawGhostEnemy(ctx, e.ghostB.x, e.ghostB.y, e.width, e.height, 'B', e.phasing);
  } else {
    drawSolidEnemy(ctx, e.x, e.y, e.width, e.height, e.phasing);
  }
}

function drawGhostEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string, phasing?: boolean) {
  ctx.globalAlpha = phasing ? 0.2 : 0.5;
  
  // Enemy body
  ctx.fillStyle = '#bb00ff';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h);
  ctx.lineTo(x, y);
  ctx.lineTo(x + w / 2, y + 6);
  ctx.lineTo(x + w, y);
  ctx.closePath();
  ctx.fill();

  // Core
  pixelRect(ctx, x + w / 2 - 3, y + h / 2 - 3, 6, 6, '#ff00ff');
  
  ctx.globalAlpha = 1;
}

function drawSolidEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, phasing?: boolean) {
  ctx.globalAlpha = phasing ? 0.3 : 1;
  
  ctx.fillStyle = '#cc00ff';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h);
  ctx.lineTo(x, y);
  ctx.lineTo(x + w / 2, y + 6);
  ctx.lineTo(x + w, y);
  ctx.closePath();
  ctx.fill();

  pixelRect(ctx, x + w / 2 - 3, y + h / 2 - 3, 6, 6, '#ff44ff');
  ctx.globalAlpha = 1;
}

function drawBoss(ctx: CanvasRenderingContext2D, b: Boss, level: number, playerSpeed: number) {
  const blur = level === 6 ? (b.blurAmount || 0) : 0;
  
  if (level === 5 && b.positions) {
    // Hydra - draw all positions
    b.positions.forEach((pos, i) => {
      ctx.globalAlpha = i === b.realPosition ? 0.8 : 0.3;
      drawBossShape(ctx, pos.x, pos.y, b.width, b.height, b.name);
    });
    ctx.globalAlpha = 1;
  } else if (level === 3 && b.phasing) {
    ctx.globalAlpha = 0.15;
    drawBossShape(ctx, b.x, b.y, b.width, b.height, b.name);
    ctx.globalAlpha = 1;
  } else if (blur > 0) {
    // Uncertainty blur effect
    for (let i = 0; i < 5; i++) {
      const ox = (Math.random() - 0.5) * blur * 2;
      const oy = (Math.random() - 0.5) * blur * 2;
      ctx.globalAlpha = 0.2;
      drawBossShape(ctx, b.x + ox, b.y + oy, b.width, b.height, b.name);
    }
    ctx.globalAlpha = 1;
    drawBossShape(ctx, b.x, b.y, b.width, b.height, b.name);
  } else {
    drawBossShape(ctx, b.x, b.y, b.width, b.height, b.name);
  }

  // Interference safe zones (Level 4)
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
  }
}

function drawBossShape(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, name: string) {
  // Large menacing ship
  ctx.fillStyle = '#8800cc';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h);
  ctx.lineTo(x, y + h / 3);
  ctx.lineTo(x + w * 0.2, y);
  ctx.lineTo(x + w * 0.8, y);
  ctx.lineTo(x + w, y + h / 3);
  ctx.closePath();
  ctx.fill();

  // Details
  pixelRect(ctx, x + w / 2 - 8, y + h / 2 - 8, 16, 16, '#ff00ff');
  pixelRect(ctx, x + w / 2 - 4, y + h / 2 - 4, 8, 8, '#ffffff');

  // Wings
  ctx.fillStyle = '#6600aa';
  pixelRect(ctx, x - 10, y + h / 3, 15, h / 2, '#6600aa');
  pixelRect(ctx, x + w - 5, y + h / 3, 15, h / 2, '#6600aa');
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
  
  // Quantum State header
  ctx.font = '14px "Courier New", monospace';
  ctx.fillStyle = '#ff4444';
  ctx.fillText(`QUANTUM STATE: ${level.name}`, 12, 24);
  ctx.fillStyle = '#00ff88';
  ctx.fillText(`DECOHERENCE: ${Math.floor(game.decoherence)}%`, 12, 44);

  // Score
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

  // Mechanic hint
  ctx.fillStyle = '#888888';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText(`[${level.mechanic.toUpperCase()}]`, 12, 60);
}

// ============ Screens ============

function drawMenu(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#050808';
  ctx.fillRect(0, 0, w, h);

  // Static noise
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const brightness = Math.random() * 30;
    ctx.fillStyle = `rgba(${brightness}, ${brightness + 10}, ${brightness}, 0.5)`;
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.textAlign = 'center';
  
  // Title
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillStyle = '#00ff88';
  ctx.fillText('EVENT HORIZON', w / 2, h / 2 - 80);
  
  ctx.font = '16px "Courier New", monospace';
  ctx.fillStyle = '#bb00ff';
  ctx.fillText('THE DECOHERENCE', w / 2, h / 2 - 55);

  // Subtitle
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#446644';
  ctx.fillText('A QUANTUM PHYSICS SPACE SHOOTER', w / 2, h / 2 - 30);

  // Controls
  ctx.font = '12px "Courier New", monospace';
  ctx.fillStyle = '#888888';
  ctx.fillText('WASD / ARROWS — MOVE', w / 2, h / 2 + 20);
  ctx.fillText('SPACE — SHOOT', w / 2, h / 2 + 40);
  ctx.fillText('E — QUANTUM SCAN', w / 2, h / 2 + 60);

  // Start
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

  // Quantum Data Log
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillStyle = '#00ff88';
  ctx.fillText('— QUANTUM DATA LOG —', w / 2, 130);

  // Word-wrap the log text
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
  // Apply screen shake
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

  // Background
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

  // Game entities
  game.particles.forEach(p => drawParticle(ctx, p));
  game.bullets.forEach(b => drawBullet(ctx, b));
  game.enemies.forEach(e => drawEnemy(ctx, e, game.level));
  if (game.boss) drawBoss(ctx, game.boss, game.level, game.player.speed);
  drawPlayer(ctx, game.player);

  // HUD
  drawHUD(ctx, game, w, h);

  // Overlays
  drawScanlines(ctx, w, h, game.scanlineOffset);
  if (Math.random() < 0.3) drawNoise(ctx, w, h, 8);

  if (game.screenShake > 0) ctx.restore();

  // State overlays
  if (game.state === 'gameover') drawGameOver(ctx, w, h, game);
  if (game.state === 'levelcomplete') drawLevelComplete(ctx, w, h, game);
  if (game.state === 'victory') drawVictory(ctx, w, h, game);
}
