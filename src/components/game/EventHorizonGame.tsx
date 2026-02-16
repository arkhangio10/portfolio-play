import React, { useRef, useEffect, useCallback, useState } from 'react';
import { initGame, startLevel, update } from './engine';
import { render } from './renderer';
import { GameData } from './types';
import { Pause, Play } from 'lucide-react';

const CANVAS_W = 640;
const CANVAS_H = 560;

const EventHorizonGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameData>(initGame(CANVAS_W, CANVAS_H));
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [, forceRender] = useState(0);

  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (g.state !== 'playing' && g.state !== 'boss' && g.state !== 'paused') return;
    
    if (g.state === 'paused') {
      gameRef.current = { ...g, state: pausedRef.current ? 'playing' : 'boss' };
      pausedRef.current = false;
      setIsPaused(false);
    } else {
      pausedRef.current = g.state === 'playing';
      gameRef.current = { ...g, state: 'paused' };
      setIsPaused(true);
    }
    forceRender(n => n + 1);
  }, []);

  const handleAction = useCallback(() => {
    const g = gameRef.current;
    if (g.state === 'menu') {
      gameRef.current = startLevel({ ...g, level: 1, score: 0 }, CANVAS_W, CANVAS_H);
    } else if (g.state === 'gameover' || g.state === 'victory') {
      gameRef.current = startLevel({ ...initGame(CANVAS_W, CANVAS_H), state: 'playing', level: 1 }, CANVAS_W, CANVAS_H);
    } else if (g.state === 'levelcomplete') {
      gameRef.current = startLevel({ ...g, level: g.level + 1 }, CANVAS_W, CANVAS_H);
    }
    forceRender(n => n + 1);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key === 'Enter') handleAction();
      if (e.key === 'Escape' || e.key === 'p') togglePause();
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleAction, togglePause]);

  useEffect(() => {
    const loop = (time: number) => {
      const dt = Math.min((time - (lastTimeRef.current || time)) / 1000, 0.05);
      lastTimeRef.current = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const g = gameRef.current;

      if (g.state !== 'paused') {
        const mappedKeys = new Set<string>();
        keysRef.current.forEach(k => {
          if (k === 'arrowleft') mappedKeys.add('ArrowLeft');
          else if (k === 'arrowright') mappedKeys.add('ArrowRight');
          else if (k === 'arrowup') mappedKeys.add('ArrowUp');
          else if (k === 'arrowdown') mappedKeys.add('ArrowDown');
          else if (k === ' ') mappedKeys.add(' ');
          else mappedKeys.add(k);
        });
        gameRef.current = update(g, dt, mappedKeys, CANVAS_W, CANVAS_H, time);
      }

      // Always render (even when paused, to show pause overlay)
      render(ctx, gameRef.current, CANVAS_W, CANVAS_H);

      // Draw pause overlay
      if (gameRef.current.state === 'paused') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.textAlign = 'center';
        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.fillStyle = '#00ff88';
        ctx.fillText('PAUSED', CANVAS_W / 2, CANVAS_H / 2 - 10);
        ctx.font = '12px "Courier New", monospace';
        ctx.fillStyle = '#888888';
        ctx.fillText('Press ESC or P to resume', CANVAS_W / 2, CANVAS_H / 2 + 20);
        ctx.textAlign = 'left';
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Touch controls
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const g = gameRef.current;
    if (g.state !== 'playing' && g.state !== 'boss') {
      if (g.state !== 'paused') handleAction();
      return;
    }
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    keysRef.current.add(' ');
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    keysRef.current.delete('a');
    keysRef.current.delete('d');
    keysRef.current.delete('w');
    keysRef.current.delete('s');
    if (dx < -15) keysRef.current.add('a');
    if (dx > 15) keysRef.current.add('d');
    if (dy < -15) keysRef.current.add('w');
    if (dy > 15) keysRef.current.add('s');
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = () => {
    touchStartRef.current = null;
    keysRef.current.delete(' ');
    keysRef.current.delete('a');
    keysRef.current.delete('d');
    keysRef.current.delete('w');
    keysRef.current.delete('s');
  };

  const showPauseBtn = gameRef.current.state === 'playing' || gameRef.current.state === 'boss' || gameRef.current.state === 'paused';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="border-2 border-[hsl(120,100%,25%)] shadow-[0_0_30px_rgba(0,255,100,0.3)] cursor-crosshair max-w-full"
          style={{ imageRendering: 'pixelated' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          tabIndex={0}
        />
        {showPauseBtn && (
          <button
            onClick={togglePause}
            className="absolute top-3 right-3 p-2 bg-[hsl(0,0%,0%,0.6)] border border-[hsl(120,100%,30%)] text-[hsl(120,100%,50%)] hover:bg-[hsl(120,100%,15%,0.4)] transition-colors rounded"
            title={isPaused ? 'Resume (ESC)' : 'Pause (ESC)'}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        )}
      </div>
      <div className="flex gap-6 text-xs font-mono text-[hsl(120,40%,50%)]">
        <span>WASD/↑↓←→ Move</span>
        <span>SPACE Shoot</span>
        <span>E Scan</span>
        <span>ESC Pause</span>
      </div>
    </div>
  );
};

export default EventHorizonGame;
