'use client';

import { useRef, useEffect } from 'react';

const CELL_SIZE = 60;
const HOVER_COLOR = 'rgba(255, 149, 0, 0.88)';
const FADED_COLOR = 'rgba(255, 149, 0, 0.06)';
const FADE_RATE = 5.5;

interface Neighbor {
  row: number;
  col: number;
  opacity: number;
}

export default function HeroGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let numRows = 0;
    let numCols = 0;
    let currentRow = -2;
    let currentCol = -2;
    let allNeighbors: Neighbor[] = [];
    let animationId: number;
    let mouseX = -1;
    let mouseY = -1;

    function resize() {
      const rect = container!.getBoundingClientRect();
      canvas!.width = rect.width;
      canvas!.height = rect.height;
      numRows = Math.ceil(rect.height / CELL_SIZE);
      numCols = Math.ceil(rect.width / CELL_SIZE);
    }

    function getRandomNeighbors(row: number, col: number): Neighbor[] {
      const neighbors: Neighbor[] = [];
      for (let dR = -1; dR <= 1; dR++) {
        for (let dC = -1; dC <= 1; dC++) {
          const nR = row + dR;
          const nC = col + dC;
          if (!(dR === 0 && dC === 0) && nR >= 0 && nR < numRows && nC >= 0 && nC < numCols && Math.random() < 0.5) {
            neighbors.push({ row: nR, col: nC, opacity: 255 });
          }
        }
      }
      return neighbors;
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      // Base grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = FADED_COLOR;
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }

      // Mouse cell
      const rect = container!.getBoundingClientRect();
      const row = Math.floor((mouseY - rect.top) / CELL_SIZE);
      const col = Math.floor((mouseX - rect.left) / CELL_SIZE);

      if (row !== currentRow || col !== currentCol) {
        currentRow = row;
        currentCol = col;
        allNeighbors.push(...getRandomNeighbors(row, col));
      }

      // Fading neighbors
      for (const n of allNeighbors) {
        n.opacity = Math.max(0, n.opacity - FADE_RATE);
        ctx.strokeStyle = `rgba(255, 149, 0, ${n.opacity / 255})`;
        ctx.strokeRect(n.col * CELL_SIZE, n.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      allNeighbors = allNeighbors.filter(n => n.opacity > 0);

      // Highlight current cell
      if (row >= 0 && row < numRows && col >= 0 && col < numCols) {
        ctx.strokeStyle = HOVER_COLOR;
        ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }

      animationId = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
