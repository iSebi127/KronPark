import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ParkingGrid from './ParkingGrid';

// layout: { spots: [ { id, status, bounds: [[y1,x1],[y2,x2]] }, ... ] }
export default function ParkingLotModal({ lot, layout, onClose, onReserve }) {
  const spots = layout?.spots || [];
  const containerRef = useRef(null);

  // responsive canvas size so top/bottom aren't cut off
  const getCanvasSize = () => {
    if (typeof window === 'undefined') return { w: 1100, h: 680 };
    const w = Math.min(1100, Math.max(600, Math.floor(window.innerWidth * 0.78)));
    const h = Math.min(680, Math.max(420, Math.floor(window.innerHeight * 0.7)));
    return { w, h };
  };
  const [canvasSize, setCanvasSize] = useState(getCanvasSize);
  useEffect(() => {
    const onResize = () => setCanvasSize(getCanvasSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const baseW = canvasSize.w;
  const baseH = canvasSize.h;

  // local mutable copy of spots status so UI updates without parent
  const [spotsState, setSpotsState] = useState(() => (spots || []).map(s => ({ ...s })));
  useEffect(() => { setSpotsState((spots || []).map(s => ({ ...s }))); }, [layout]);

  // selected spot for confirmation (detailed view uses spot id)
  const [selectedSpot, setSelectedSpot] = useState(null);
  // selected label when using schematic grid view (e.g. 'A1')
  const [selectedLabel, setSelectedLabel] = useState(null);
  // toggle view mode: 'real' (canvas) or 'schematic' (grid)
  const [viewMode, setViewMode] = useState('real');

  // pan/zoom state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  // prevent background scrolling and support Escape to close
  useEffect(() => {
    const prev = typeof document !== 'undefined' ? document.body.style.overflow : '';
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { if (typeof document !== 'undefined') document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  // compute bounding box
  const bbox = useMemo(() => {
    if (!spotsState.length) return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const s of spotsState) {
      const a = s.bounds?.[0];
      const b = s.bounds?.[1];
      if (!a || !b) continue;
      const y1 = Number(a[0]);
      const x1 = Number(a[1]);
      const y2 = Number(b[0]);
      const x2 = Number(b[1]);
      if (!Number.isFinite(y1) || !Number.isFinite(x1) || !Number.isFinite(y2) || !Number.isFinite(x2)) continue;
      minX = Math.min(minX, x1);
      minY = Math.min(minY, y1);
      maxX = Math.max(maxX, x2);
      maxY = Math.max(maxY, y2);
    }
    if (!isFinite(minX)) return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
    // add small padding
    const padX = (maxX - minX) * 0.06 || 20;
    const padY = (maxY - minY) * 0.06 || 20;
    return { minX: minX - padX, minY: minY - padY, maxX: maxX + padX, maxY: maxY + padY };
  }, [spotsState]);

  // normalized spots
  const normalized = useMemo(() => {
    const width = bbox.maxX - bbox.minX || 1;
    const height = bbox.maxY - bbox.minY || 1;
    const scaleX = baseW / width;
    const scaleY = baseH / height;
    const s = Math.min(scaleX, scaleY);
    const offsetX = (baseW - width * s) / 2;
    const offsetY = (baseH - height * s) / 2;

    return spotsState.map(sp => {
      const a = sp.bounds?.[0];
      const b = sp.bounds?.[1];
      if (!a || !b) return null;
      const y1 = Number(a[0]);
      const x1 = Number(a[1]);
      const y2 = Number(b[0]);
      const x2 = Number(b[1]);
      if (![y1, x1, y2, x2].every(Number.isFinite)) return null;
      const left = (x1 - bbox.minX) * s + offsetX;
      const top = (y1 - bbox.minY) * s + offsetY;
      const w = Math.max(8, (x2 - x1) * s);
      const h = Math.max(8, (y2 - y1) * s);
      return { ...sp, left, top, w, h };
    }).filter(Boolean);
  }, [spotsState, bbox, baseW, baseH]);

  // separators (rows)
  const separators = useMemo(() => {
    if (!normalized.length) return [];
    const tops = normalized.map(s => s.top).sort((a,b) => a - b);
    const rows = [];
    for (const t of tops) {
      const found = rows.find(r => Math.abs(r - t) < 16);
      if (!found) rows.push(t);
    }
    return rows;
  }, [normalized]);

  // initial fit-to-view: center and scale layout so nothing is cut
  const initialFitDone = useRef(false);
  useEffect(() => {
    if (initialFitDone.current) return;
    if (!normalized.length) return;
    // compute bounds in pixel coordinates
    const minX = Math.min(...normalized.map(s => s.left));
    const maxX = Math.max(...normalized.map(s => s.left + s.w));
    const minY = Math.min(...normalized.map(s => s.top));
    const maxY = Math.max(...normalized.map(s => s.top + s.h));
    const widthSpan = Math.max(1, maxX - minX);
    const heightSpan = Math.max(1, maxY - minY);
    // leave some padding (10%)
    const pad = 0.9;
    const scaleX = (baseW * pad) / widthSpan;
    const scaleY = (baseH * pad) / heightSpan;
    const fitScale = Math.min(1, scaleX, scaleY);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const tx = (baseW / 2) - centerX * fitScale;
    const ty = (baseH / 2) - centerY * fitScale;
    setScale(fitScale);
    setTranslate({ x: tx, y: ty });
    initialFitDone.current = true;
  }, [normalized, baseW, baseH]);

  // deterministic road pattern
  function pickPattern(id) {
    if (!id) return 'straight';
    let sum = 0; for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    const patterns = ['straight', 'L', 'U', 'cross'];
    return patterns[sum % patterns.length];
  }

  const roadShapes = useMemo(() => {
    const pattern = pickPattern(lot?.id || '');
    const shapes = [];
    const margin = 40;
    const roadWidth = Math.max(80, Math.min(140, Math.floor(baseH * 0.14)));
    const midY = baseH / 2;
    const midX = baseW / 2;
    if (pattern === 'straight') {
      shapes.push({ type: 'rect', x: margin, y: midY - roadWidth/2, w: baseW - margin*2, h: roadWidth });
    } else if (pattern === 'L') {
      shapes.push({ type: 'rect', x: margin, y: midY - roadWidth/2, w: midX - margin, h: roadWidth });
      shapes.push({ type: 'rect', x: midX - roadWidth/2, y: midY - roadWidth/2, w: roadWidth, h: baseH - midY - margin });
    } else if (pattern === 'U') {
      shapes.push({ type: 'rect', x: margin, y: margin, w: roadWidth, h: baseH - margin*2 });
      shapes.push({ type: 'rect', x: baseW - margin - roadWidth, y: margin, w: roadWidth, h: baseH - margin*2 });
      shapes.push({ type: 'rect', x: margin + roadWidth, y: baseH - margin - roadWidth, w: baseW - (margin+roadWidth)*2, h: roadWidth });
    } else if (pattern === 'cross') {
      shapes.push({ type: 'rect', x: margin, y: midY - roadWidth/2, w: baseW - margin*2, h: roadWidth });
      shapes.push({ type: 'rect', x: midX - roadWidth/2, y: margin, w: roadWidth, h: baseH - margin*2 });
    }
    return shapes;
  }, [lot?.id, baseW, baseH]);

  // arrange spots around roads: group by row and place left/right along road
  const arranged = useMemo(() => {
    if (!normalized.length) return [];
    const arr = normalized.map(s => ({ ...s }));

    // helper functions
    const rectCenter = (r) => ({ x: r.x + r.w/2, y: r.y + r.h/2 });
    const dist2 = (a,b) => { const dx = a.x-b.x; const dy = a.y-b.y; return dx*dx+dy*dy; };
    function rectsOverlap(a, b) { return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y); }
    function inBounds(rect) { return rect.x >= 8 && rect.y >= 8 && rect.x + rect.w <= baseW - 8 && rect.y + rect.h <= baseH - 8; }

    // prepare map of items grouped by nearest road index (roadShapes index), -1 = no road
    const roadToItems = {};
    const noRoadItems = [];
    for (let i = 0; i < arr.length; i++) {
      const s = arr[i];
      const center = { x: s.left + s.w/2, y: s.top + s.h/2 };
      if (!roadShapes || !roadShapes.length) { noRoadItems.push({ spot: s, idx: i }); continue; }
      let bestIdx = -1; let bestD = Infinity;
      for (let r = 0; r < roadShapes.length; r++) {
        const rs = roadShapes[r];
        const rc = rectCenter(rs);
        const d = dist2(center, rc);
        if (d < bestD) { bestD = d; bestIdx = r; }
      }
      if (bestIdx === -1) { noRoadItems.push({ spot: s, idx: i }); }
      else { roadToItems[bestIdx] = roadToItems[bestIdx] || []; roadToItems[bestIdx].push({ spot: s, idx: i }); }
    }

    // slot generators (reuse existing logic) but ensure enough slots
    function genHorizontalSlots(road, spotW0, spotH0, spacing, minCount) {
      // Try to fit all spots in layers adjacent to the road (prefer closest layer).
      // If not enough, progressively reduce spot size (spotScale) down to 0.6 to fit.
      let spotW = spotW0;
      let spotH = spotH0;
      const minScale = 0.6;
      let spotScale = 1;
      const roadRect = { x: road.x, y: road.y, w: road.w, h: road.h };
      while (spotScale >= minScale) {
        const slots = [];
        const startX = Math.max(road.x + 8, 8);
        const endX = Math.min(road.x + road.w - 8, baseW - 8);
        const slotWidth = Math.max(1, Math.round(spotW * spotScale + spacing));
        const slotsPerLine = Math.max(1, Math.floor((endX - startX + spacing) / slotWidth));
        // only generate the first two layers (closest to road) to keep direct access
        const maxLayers = 2;
        for (let layer = 0; layer < maxLayers && slots.length < minCount; layer++) {
          for (let s = 0; s < slotsPerLine && slots.length < minCount; s++) {
            const x = startX + s * slotWidth;
            const yAbove = Math.round(road.y - (layer + 1) * (spotH * spotScale + spacing) - 4);
            const yBelow = Math.round(road.y + road.h + layer * (spotH * spotScale + spacing) + 4);
            const rectAbove = { x: Math.max(8, Math.min(baseW - Math.round(spotW * spotScale) - 8, x)), y: yAbove, w: Math.round(spotW * spotScale), h: Math.round(spotH * spotScale) };
            const rectBelow = { x: Math.max(8, Math.min(baseW - Math.round(spotW * spotScale) - 8, x)), y: yBelow, w: Math.round(spotW * spotScale), h: Math.round(spotH * spotScale) };
            if (rectAbove.y + rectAbove.h <= roadRect.y - 4 && inBounds(rectAbove) && !rectsOverlap(rectAbove, roadRect)) slots.push(rectAbove);
            if (slots.length < minCount && rectBelow.y >= roadRect.y + roadRect.h + 4 && inBounds(rectBelow) && !rectsOverlap(rectBelow, roadRect)) slots.push(rectBelow);
          }
        }
        if (slots.length >= minCount) return slots;
        // reduce scale and retry
        spotScale *= 0.85;
      }
      // last fallback: produce as many as possible at smallest scale
      const fallbackSlots = [];
      const startX = Math.max(road.x + 8, 8);
      const slotWidth = Math.max(1, Math.round(spotW * minScale + spacing));
      for (let x = startX; x < road.x + road.w && fallbackSlots.length < minCount; x += slotWidth) {
        const rectAbove = { x: Math.max(8, Math.min(baseW - Math.round(spotW * minScale) - 8, x)), y: Math.round(road.y - (spotH * minScale) - 8), w: Math.round(spotW * minScale), h: Math.round(spotH * minScale) };
        if (inBounds(rectAbove) && !rectsOverlap(rectAbove, roadRect)) fallbackSlots.push(rectAbove);
        if (fallbackSlots.length >= minCount) break;
        const rectBelow = { x: Math.max(8, Math.min(baseW - Math.round(spotW * minScale) - 8, x)), y: Math.round(road.y + road.h + 8), w: Math.round(spotW * minScale), h: Math.round(spotH * minScale) };
        if (inBounds(rectBelow) && !rectsOverlap(rectBelow, roadRect)) fallbackSlots.push(rectBelow);
      }
      return fallbackSlots;
    }

    function genVerticalSlots(road, spotW0, spotH0, spacing, minCount) {
      let spotW = spotW0;
      let spotH = spotH0;
      const minScale = 0.6;
      let spotScale = 1;
      const roadRect = { x: road.x, y: road.y, w: road.w, h: road.h };
      while (spotScale >= minScale) {
        const slots = [];
        const startY = Math.max(road.y + 8, 8);
        const endY = Math.min(road.y + road.h - 8, baseH - 8);
        const slotHeight = Math.max(1, Math.round(spotH * spotScale + spacing));
        const slotsPerLine = Math.max(1, Math.floor((endY - startY + spacing) / slotHeight));
        const maxLayers = 2;
        for (let layer = 0; layer < maxLayers && slots.length < minCount; layer++) {
          for (let s = 0; s < slotsPerLine && slots.length < minCount; s++) {
            const y = startY + s * slotHeight;
            const xLeft = Math.round(road.x - (layer + 1) * (spotW * spotScale + spacing) - 4);
            const xRight = Math.round(road.x + road.w + layer * (spotW * spotScale + spacing) + 4);
            const rectLeft = { x: xLeft, y: Math.max(8, Math.min(baseH - Math.round(spotH * spotScale) - 8, y)), w: Math.round(spotW * spotScale), h: Math.round(spotH * spotScale) };
            const rectRight = { x: xRight, y: Math.max(8, Math.min(baseH - Math.round(spotH * spotScale) - 8, y)), w: Math.round(spotW * spotScale), h: Math.round(spotH * spotScale) };
            if (rectLeft.x + rectLeft.w <= roadRect.x - 4 && inBounds(rectLeft) && !rectsOverlap(rectLeft, roadRect)) slots.push(rectLeft);
            if (slots.length < minCount && rectRight.x >= roadRect.x + roadRect.w + 4 && inBounds(rectRight) && !rectsOverlap(rectRight, roadRect)) slots.push(rectRight);
          }
        }
        if (slots.length >= minCount) return slots;
        spotScale *= 0.85;
      }
      // fallback
      const fallback = [];
      const startY = Math.max(road.y + 8, 8);
      const slotHeight = Math.max(1, Math.round(spotH0 * minScale + spacing));
      for (let y = startY; y < road.y + road.h && fallback.length < minCount; y += slotHeight) {
        const rectLeft = { x: Math.max(8, Math.round(road.x - spotW0 * minScale - 8)), y: Math.max(8, Math.min(baseH - Math.round(spotH0 * minScale) - 8, y)), w: Math.round(spotW0 * minScale), h: Math.round(spotH0 * minScale) };
        if (inBounds(rectLeft) && !rectsOverlap(rectLeft, roadRect)) fallback.push(rectLeft);
        if (fallback.length >= minCount) break;
        const rectRight = { x: Math.min(baseW - Math.round(spotW0 * minScale) - 8, Math.round(road.x + road.w + 8)), y: rectLeft.y, w: rectLeft.w, h: rectLeft.h };
        if (inBounds(rectRight) && !rectsOverlap(rectRight, roadRect)) fallback.push(rectRight);
      }
      return fallback;
    }

    // for every road cluster, create slots and assign
    Object.keys(roadToItems).forEach(key => {
      const idx = Number(key);
      const items = roadToItems[idx];
      if (!items || !items.length) return;
      // stable order
      items.sort((a,b) => a.spot.left - b.spot.left);
      const road = roadShapes[idx];
      const spacing = 10;
      const spotW = Math.max(8, Math.round(Math.max(...items.map(it => it.spot.w || 40))));
      const spotH = Math.max(8, Math.round(Math.max(...items.map(it => it.spot.h || 20))));
      const isHorizontal = road.w >= road.h;
      const slots = isHorizontal ? genHorizontalSlots(road, spotW, spotH, spacing, items.length) : genVerticalSlots(road, spotW, spotH, spacing, items.length);

      for (let i = 0; i < items.length; i++) {
        const { spot, idx: arrIdx } = items[i];
        if (i < slots.length) {
          arr[arrIdx].left = slots[i].x;
          arr[arrIdx].top = slots[i].y;
        } else {
          // if not enough slots, place further away in a grid region off the road
          const extraX = Math.max(16, road.x + road.w + 24 + (i - slots.length) * (spotW + spacing));
          arr[arrIdx].left = Math.min(extraX, baseW - spotW - 8);
          arr[arrIdx].top = Math.min(Math.max(8, spot.top), baseH - spotH - 8);
        }
      }
    });

    // assign no-road items in center fallback evenly
    if (noRoadItems.length) {
      const spacing = 10;
      const centerStart = Math.max(40, (baseW - noRoadItems.length * (noRoadItems[0].spot.w || 40)) / 2);
      for (let i = 0; i < noRoadItems.length; i++) {
        const { spot, idx } = noRoadItems[i];
        arr[idx].left = Math.min(Math.max(8, centerStart + i * ((spot.w || 40) + spacing)), baseW - (spot.w || 40) - 8);
        arr[idx].top = Math.min(Math.max(8, spot.top), baseH - (spot.h || 20) - 8);
      }
    }

    return arr;
  }, [normalized, separators, roadShapes, baseW, baseH]);

  // choose which array to render: arranged if available, otherwise normalized
  const renderSpots = (arranged && arranged.length) ? arranged : normalized;

  // pan/zoom helpers
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const delta = -e.deltaY;
      const zoomFactor = Math.exp(delta * 0.0016);
      const oldScale = scale;
      const newScale = clamp(oldScale * zoomFactor, 0.35, 5);
      if (newScale === oldScale) return;
      const ratio = newScale / oldScale;
      const newTx = translate.x * ratio + cx * (1 - ratio);
      const newTy = translate.y * ratio + cy * (1 - ratio);
      setScale(newScale);
      setTranslate({ x: newTx, y: newTy });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [scale, translate]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onDown = (e) => { if (e.button !== 0) return; isPanning.current = true; panStart.current = { x: e.clientX, y: e.clientY }; translateStart.current = { ...translate }; el.style.cursor = 'grabbing'; };
    const onMove = (e) => { if (!isPanning.current) return; const dx = e.clientX - panStart.current.x; const dy = e.clientY - panStart.current.y; setTranslate({ x: translateStart.current.x + dx, y: translateStart.current.y + dy }); };
    const onUp = () => { isPanning.current = false; if (el) el.style.cursor = 'grab'; };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    let lastTouch = null;
    const onTouchStart = (t) => { if (t.touches.length === 1) lastTouch = { x: t.touches[0].clientX, y: t.touches[0].clientY }; };
    const onTouchMove = (t) => { if (!lastTouch || t.touches.length !== 1) return; const dx = t.touches[0].clientX - lastTouch.x; const dy = t.touches[0].clientY - lastTouch.y; lastTouch = { x: t.touches[0].clientX, y: t.touches[0].clientY }; setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy })); };
    const onTouchEnd = () => { lastTouch = null; };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    el.style.cursor = 'grab';
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [translate]);

  function colorForStatus(status) {
    if (status === 'free') return '#16a34a';
    if (status === 'occupied') return '#dc2626';
    if (status === 'reserved') return '#f59e0b';
    return '#64748b';
  }

  function renderRoads() {
    return (
      <svg width={baseW} height={baseH} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
        <defs>
          <pattern id="lane" width="8" height="16" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="rgba(255,255,255,0.06)" />
          </pattern>
          <filter id="road-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#000" floodOpacity="0.6" />
          </filter>
        </defs>
        {roadShapes.map((sh, i) => (
          <g key={i} filter="url(#road-shadow)">
            <rect x={sh.x} y={sh.y} width={sh.w} height={sh.h} rx={8} fill="#0b1220" stroke="rgba(255,255,255,0.03)" />
            {/* central dashed lane */}
            <rect x={sh.x + 8} y={sh.y + sh.h/2 - 2} width={sh.w - 16} height={4} fill="url(#lane)" opacity={0.9} />
          </g>
        ))}
      </svg>
    );
  }

  // create a schematic grid mapping when schematic view is active
  const schematic = useMemo(() => {
    const items = spotsState || [];
    const n = items.length || 0;
    // default small grid when no spots
    if (n === 0) return { rows: 3, cols: 3, map: {}, labelToId: {} };

    // fixed rows to allow more complex shapes (top..bottom)
    const rows = 5;
    // reduce maximum columns to prevent schematic buttons overlapping on narrow screens
    const maxCols = 18;

    // start with a conservative column estimate and grow until we can place all spots adjacent to roads
    let cols = Math.max(6, Math.ceil(n / 3));
    if (cols > maxCols) cols = maxCols;

    const pattern = pickPattern(lot?.id || '');

    function buildRoadMask(rows, cols, pattern) {
      const mask = new Set();
      const midR = Math.floor(rows / 2);
      const midC = Math.floor(cols / 2);

      if (pattern === 'straight') {
        for (let c = 0; c < cols; c++) mask.add(`${midR},${c}`);
      } else if (pattern === 'L') {
        for (let r = 0; r <= midR; r++) mask.add(`${r},0`);
        for (let c = 0; c < cols; c++) mask.add(`${midR},${c}`);
      } else if (pattern === 'U') {
        for (let r = 0; r < rows - 1; r++) {
          mask.add(`${r},0`);
          mask.add(`${r},${cols - 1}`);
        }
        const bottom = rows - 1;
        for (let c = 0; c < cols; c++) mask.add(`${bottom},${c}`);
      } else if (pattern === 'cross') {
        for (let c = 0; c < cols; c++) mask.add(`${midR},${c}`);
        for (let r = 0; r < rows; r++) mask.add(`${r},${midC}`);
      } else {
        for (let c = 0; c < cols; c++) mask.add(`${midR},${c}`);
      }

      return mask;
    }

    function adjacentToRoad(r, c, roadMask) {
      const checks = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
      for (const [rr, cc] of checks) {
        if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue;
        if (roadMask.has(`${rr},${cc}`)) return true;
      }
      return false;
    }

    // grow cols until we have enough adjacent non-road cells for all spots or hit max
    let roadMask = buildRoadMask(rows, cols, pattern);
    function countAvailable(cols, roadMask) {
      let avail = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (roadMask.has(`${r},${c}`)) continue;
          if (adjacentToRoad(r, c, roadMask)) avail++;
        }
      }
      return avail;
    }

    while (cols < maxCols) {
      roadMask = buildRoadMask(rows, cols, pattern);
      const avail = countAvailable(cols, roadMask);
      if (avail >= n) break;
      cols += 1;
    }

    // Build map and labelToId
    const map = {};
    const labelToId = {};
    const rowLetters = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

    // collect adjacent cells in a stable order (left->right, top->bottom)
    const adjacentCells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r},${c}`;
        if (roadMask.has(key)) continue;
        if (adjacentToRoad(r, c, roadMask)) adjacentCells.push({ r, c });
      }
    }

    // assign spots to adjacent cells (one spot per adjacent cell). We try to place all spots; if not enough cells remain placeholders.
    const assignMap = {};
    for (let i = 0; i < adjacentCells.length; i++) {
      const cell = adjacentCells[i];
      const label = `${rowLetters[cell.r]}${cell.c + 1}`;
      if (i < n) {
        assignMap[label] = items[i].status || 'occupied';
        labelToId[label] = items[i].id;
      } else {
        assignMap[label] = 'occupied';
        labelToId[label] = null;
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const label = `${rowLetters[r]}${c + 1}`;
        const key = `${r},${c}`;
        if (roadMask.has(key)) {
          map[label] = 'road';
          labelToId[label] = null;
        } else if (assignMap.hasOwnProperty(label)) {
          map[label] = assignMap[label];
        } else {
          map[label] = 'occupied';
          labelToId[label] = null;
        }
      }
    }

    return { rows, cols, map, labelToId };
  }, [spotsState, lot?.id]);

  // helper: reserve by spot id
  function reserveById(spotId) {
    if (!spotId) return;
    setSpotsState(prev => prev.map(s => s.id === spotId ? { ...s, status: 'reserved' } : s));
    onReserve && onReserve(spotId);
  }

  // unified confirmation handler for both views
  function handleConfirmReserve() {
    if (viewMode === 'schematic') {
      const mapped = schematic.labelToId[selectedLabel];
      if (!mapped) return; // safety
      reserveById(mapped);
      setSelectedLabel(null);
    } else {
      if (!selectedSpot) return;
      reserveById(selectedSpot);
      setSelectedSpot(null);
    }
  }

  // helper to get display status for selected item
  const selectedDetail = useMemo(() => {
    if (viewMode === 'schematic') {
      const id = schematic.labelToId[selectedLabel];
      const spot = spotsState.find(s => s.id === id);
      return spot ? { id: spot.id, status: spot.status, label: selectedLabel } : null;
    }
    // real view
    const spot = spotsState.find(s => s.id === selectedSpot);
    return spot ? { id: spot.id, status: spot.status, label: spot.id } : null;
  }, [viewMode, selectedLabel, selectedSpot, schematic, spotsState]);

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75" />
      <div className="relative bg-slate-900 w-full max-w-[1200px] rounded-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{lot?.name || 'Parcare'}</h2>
            <p className="text-sm text-slate-400">Folosește scroll pentru zoom și trage cu mouse-ul pentru a naviga</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setScale(1); setTranslate({ x: 0, y: 0 }); }} className="px-3 py-1 bg-slate-800 rounded text-slate-200">Reset</button>
            <button onClick={() => { onClose && onClose(); window.location.href = '/map'; }} className="px-3 py-1 bg-red-600 rounded text-white">Ieșire pagină</button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <button className={`px-3 py-1 rounded ${viewMode === 'real' ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-300'}`} onClick={() => setViewMode('real')}>Realistic View</button>
          <button className={`px-3 py-1 rounded ${viewMode === 'schematic' ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-300'}`} onClick={() => setViewMode('schematic')}>Schematic Grid</button>
        </div>

        {viewMode === 'schematic' ? (
          // schematic grid rendering using ParkingGrid
          <div className="bg-slate-800 rounded-lg p-4">
            <ParkingGrid
              rows={schematic.rows}
              cols={schematic.cols}
              lane={{ type: 'row', index: Math.floor(schematic.rows/2), direction: 'right' }}
              map={schematic.map}
              labelToId={schematic.labelToId}
               onSelect={(label) => { setSelectedLabel(label); }}
             />
            <div className="mt-3 text-sm text-slate-300">
              {selectedLabel ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-400">Loc selectat</div>
                    <div className="text-lg font-bold text-white">{selectedLabel}</div>
                    <div className="text-sm text-slate-400">{(() => {
                      const id = schematic.labelToId[selectedLabel];
                      const spot = spotsState.find(s => s.id === id);
                      return spot ? `Status: ${spot.status}` : 'Loc inactiv';
                    })()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleConfirmReserve} disabled={!schematic.labelToId[selectedLabel] || (spotsState.find(s=>s.id===schematic.labelToId[selectedLabel])?.status!=='free')} className="px-4 py-2 bg-blue-600 rounded text-white">Rezervă →</button>
                    <button onClick={() => setSelectedLabel(null)} className="px-4 py-2 bg-slate-700 rounded text-slate-200">Anulează</button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400">Selectează un loc din grilă pentru a-l rezerva</div>
              )}
            </div>
          </div>
        ) : (
          // REAL (canvas) view: keep existing implementation
          <div className="bg-slate-800 rounded-lg p-2" style={{ overflow: 'hidden' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <div
                ref={containerRef}
                style={{
                  width: baseW,
                  height: baseH,
                  background: 'linear-gradient(180deg, #071217 0%, #0b1220 100%)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                  touchAction: 'none',
                  userSelect: 'none',
                  boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6)'
                }}
              >

                <div style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, transformOrigin: '0 0', position: 'absolute', left: 0, top: 0 }}>

                  {/* draw road shapes first so parking spots overlay them */}
                  {renderRoads()}

                  {/* parking area boundary */}
                  <div style={{ position: 'absolute', left: 20, top: 20, width: baseW - 40, height: baseH - 40, border: '1px solid rgba(255,255,255,0.03)', borderRadius: 8 }} />

                  {/* spots */}
                  {renderSpots.map(spot => {
                    return (
                      <div key={spot.id} style={{ position: 'absolute', left: spot.left, top: spot.top, width: spot.w, height: spot.h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                          onClick={() => setSelectedSpot(spot.id)}
                          title={`${spot.id} — ${spot.status}`}
                          disabled={spot.status !== 'free'}
                          style={{
                            width: '100%',
                            height: '100%',
                            background: colorForStatus(spot.status),
                            border: '1px solid rgba(0,0,0,0.3)',
                            boxSizing: 'border-box',
                            borderRadius: 6,
                            color: '#041014',
                            fontWeight: 800,
                            fontSize: 12,
                            cursor: spot.status === 'free' ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textShadow: '0 1px 0 rgba(255,255,255,0.06)',
                            outline: 'none',
                            transition: 'transform 120ms, box-shadow 120ms',
                            boxShadow: '0 6px 18px rgba(2,6,23,0.6) inset',
                          }}
                          onMouseEnter={(e) => { if (spot.status === 'free') e.currentTarget.style.transform = 'scale(1.03)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                        >
                          {spot.id}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation dialog (shared) */}
        {( (viewMode === 'schematic' && selectedLabel !== null) || (viewMode !== 'schematic' && selectedSpot !== null) ) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75" />
            <div className="relative bg-slate-800 rounded-lg p-5 shadow-xl max-w-sm w-full">
              <h3 className="text-lg font-semibold text-white mb-4">Confirmare rezervare</h3>
              <p className="text-sm text-slate-400 mb-4">Ești pe cale să rezervi locul <span className="font-mono text-white">{selectedDetail?.label || (viewMode === 'schematic' ? selectedLabel : selectedSpot)}</span>{selectedDetail?.status ? ` — Status: ${selectedDetail.status}` : ''}. Continuă?</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    handleConfirmReserve();
                  }}
                  className="px-4 py-2 bg-green-600 rounded text-white"
                >
                  Rezervă
                </button>
                <button
                  onClick={() => {
                    if (viewMode === 'schematic') setSelectedLabel(null);
                    else setSelectedSpot(null);
                  }}
                  className="px-4 py-2 bg-red-600 rounded text-white"
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
