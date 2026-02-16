import React, { useRef, useEffect, useCallback, useState } from 'react';
import { initGame, startLevel, update } from './engine';
import { render } from './renderer';
import { GameData } from './types';

const CANVAS_W = 640;
const CANVAS_H = 560;

const EventHorizonGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameData>(initGame(CANVAS_W, CANVAS_H));
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [, forceRender] = useState(0);

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
  }, [handleAction]);

  useEffect(() => {
    const loop = (time: number) => {
      const dt = Math.min((time - (lastTimeRef.current || time)) / 1000, 0.05);
      lastTimeRef.current = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Map lowercase keys to expected format
      const mappedKeys = new Set<string>();
      keysRef.current.forEach(k => {
        if (k === 'arrowleft') mappedKeys.add('ArrowLeft');
        else if (k === 'arrowright') mappedKeys.add('ArrowRight');
        else if (k === 'arrowup') mappedKeys.add('ArrowUp');
        else if (k === 'arrowdown') mappedKeys.add('ArrowDown');
        else if (k === ' ') mappedKeys.add(' ');
        else mappedKeys.add(k);
      });

      gameRef.current = update(gameRef.current, dt, mappedKeys, CANVAS_W, CANVAS_H, time);
      render(ctx, gameRef.current, CANVAS_W, CANVAS_H);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Touch controls for mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const g = gameRef.current;
    if (g.state !== 'playing' && g.state !== 'boss') {
      handleAction();
      return;
    }
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    keysRef.current.add(' '); // auto-shoot on touch
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

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="border-2 border-[hsl(120,100%,25%)] shadow-[0_0_30px_rgba(0,255,100,0.3)] cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        tabIndex={0}
      />
      <div className="flex gap-6 text-xs font-mono text-[hsl(120,40%,50%)]">
        <span>WASD/↑↓←→ Move</span>
        <span>SPACE Shoot</span>
        <span>E Scan</span>
        <span>ENTER Start</span>
      </div>
    </div>
  );
};

export default EventHorizonGame;
