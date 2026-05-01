import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// layout: { spots: [ { id, status, bounds: [[y1,x1],[y2,x2]] }, ... ] }
export default function ParkingLotModal({ lot, layout, onClose, onReserve }) {
  const spots = layout?.spots || [];
  const containerRef = useRef(null);

  // local mutable copy of spots status so UI updates without parent
  const [spotsState, setSpotsState] = useState(() => (spots || []).map(s => ({ ...s })));
  useEffect(() => { setSpotsState((spots || []).map(s => ({ ...s }))); }, [layout]);

  // selected spot for confirmation
  const [selectedSpot, setSelectedSpot] = useState(null);

  // pan/zoom state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  // prevent background scrolling and support Escape to close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
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

  // compute normalized positions inside a base drawing area (baseW x baseH)
  const baseW = 1400; // larger base for better detail
  const baseH = 820;
  const normalized = useMemo(() => {
    const width = bbox.maxX - bbox.minX || 1;
    const height = bbox.maxY - bbox.minY || 1;
    const scaleX = baseW / width;
    const scaleY = baseH / height;
    const s = Math.min(scaleX, scaleY);
    const offsetX = (baseW - width * s) / 2;
    const offsetY = (baseH - height * s) / 2;

    // create a more 'parking-like' arrangement by nudging alternate rows slightly
    return spotsState.map(sp => {
      const a = sp.bounds?.[0];
      const b = sp.bounds?.[1];
      if (!a || !b) return null;
      const y1 = Number(a[0]);
      const x1 = Number(a[1]);
      const y2 = Number(b[0]);
      const x2 = Number(b[1]);
      if (![y1, x1, y2, x2].every(Number.isFinite)) return null;
      let left = (x1 - bbox.minX) * s + offsetX;
      let top = (y1 - bbox.minY) * s + offsetY;
      let w = Math.max(10, (x2 - x1) * s);
      let h = Math.max(10, (y2 - y1) * s);

      // small extra spacing to make rows clearer
      top += Math.round((y1 % 2) * 1.5);

      return { ...sp, left, top, w, h };
    }).filter(Boolean);
  }, [spotsState, bbox]);

  // derive horizontal separator lines (group rows by top coordinate)
  const separators = useMemo(() => {
    if (!normalized.length) return [];
    // cluster by top (within 16 px)
    const tops = normalized.map(s => s.top).sort((a,b)=>a-b);
    const rows = [];
    for (const t of tops) {
      const found = rows.find(r => Math.abs(r - t) < 16);
      if (!found) rows.push(t);
    }
    return rows;
  }, [normalized]);

  // helpers for pan/zoom math
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      // only when wheel over drawing area
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const delta = -e.deltaY;
      const zoomFactor = Math.exp(delta * 0.0016); // slightly faster
      const oldScale = scale;
      const newScale = clamp(oldScale * zoomFactor, 0.35, 5);
      if (newScale === oldScale) return;
      // newTranslate = t*(newS/oldS) + screen*(1 - newS/oldS)
      const ratio = newScale / oldScale;
      const newTx = translate.x * ratio + cx * (1 - ratio);
      const newTy = translate.y * ratio + cy * (1 - ratio);
      setScale(newScale);
      setTranslate({ x: newTx, y: newTy });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [scale, translate]);

  // mouse pan handlers
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onDown = (e) => {
      // only left mouse
      if (e.button !== 0) return;
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { ...translate };
      el.style.cursor = 'grabbing';
    };
    const onMove = (e) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setTranslate({ x: translateStart.current.x + dx, y: translateStart.current.y + dy });
    };
    const onUp = () => {
      isPanning.current = false;
      if (el) el.style.cursor = 'grab';
    };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    // touch support (basic)
    let lastTouch = null;
    const onTouchStart = (t) => {
      if (t.touches.length === 1) {
        lastTouch = { x: t.touches[0].clientX, y: t.touches[0].clientY };
      }
    };
    const onTouchMove = (t) => {
      if (!lastTouch || t.touches.length !== 1) return;
      const dx = t.touches[0].clientX - lastTouch.x;
      const dy = t.touches[0].clientY - lastTouch.y;
      lastTouch = { x: t.touches[0].clientX, y: t.touches[0].clientY };
      setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    };
    const onTouchEnd = () => { lastTouch = null; };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // set initial cursor
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
    if (status === 'free') return '#16a34a'; // green
    if (status === 'occupied') return '#dc2626'; // red
    if (status === 'reserved') return '#f59e0b'; // amber
    return '#64748b';
  }

  // modal styles and structure
  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75" />
      <div className="relative bg-slate-900 w-full max-w-[1400px] rounded-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{lot?.name || 'Parcare'}</h2>
            <p className="text-sm text-slate-400">Folosește scroll pentru zoom și trage cu mouse-ul pentru a naviga</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setScale(1); setTranslate({ x: 0, y: 0 }); }} className="px-3 py-1 bg-slate-800 rounded text-slate-200">Reset</button>
            <button onClick={onClose} className="px-3 py-1 bg-red-600 rounded text-white">Închide</button>
          </div>
        </div>

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
              {/* transform group: pan/zoom */}
              <div style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, transformOrigin: '0 0', position: 'absolute', left: 0, top: 0 }}>
                {/* parking separators (thicker dashed lines) */}
                {separators.map((y, i) => (
                  <div key={i} style={{ position: 'absolute', left: 40, top: y + 4, width: baseW - 80, height: 3, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 8px, transparent 8px 16px)', borderRadius: 2 }} />
                ))}

                {/* subtle parking area boundary */}
                <rect x={20} y={20} width={baseW-40} height={baseH-40} style={{ fill: 'none', stroke: 'rgba(255,255,255,0.03)' }} />

                {/* lane markings (subtle) */}
                <svg width={baseW} height={baseH} style={{ display: 'block', position: 'absolute', left: 0, top: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0%" x2="100%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
                    </linearGradient>
                  </defs>
                  <rect x={0} y={0} width={baseW} height={baseH} fill="none" />
                </svg>

                {/* spots */}
                {normalized.map(spot => {
                  const rowIndex = separators.findIndex(r => Math.abs(r - spot.top) < 18);
                  const angled = rowIndex % 2 === 1;
                  const rotateDeg = angled ? -12 : 0;
                  const transformStyle = angled ? `rotate(${rotateDeg}deg)` : 'none';
                  const transformOrigin = 'center center';
                  return (
                    <div key={spot.id} style={{ position: 'absolute', left: spot.left, top: spot.top, width: spot.w, height: spot.h, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: transformStyle, transformOrigin }}>
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

        {/* Confirmation dialog */}
        {selectedSpot !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75" />
            <div className="relative bg-slate-800 rounded-lg p-5 shadow-xl max-w-sm w-full">
              <h3 className="text-lg font-semibold text-white mb-4">Confirmare rezervare</h3>
              <p className="text-sm text-slate-400 mb-4">
                Ești pe cale să rezervi locul {selectedSpot}. Continuă?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSpotsState(prev => prev.map(s => s.id === selectedSpot ? { ...s, status: 'reserved' } : s));
                    onReserve(selectedSpot);
                    setSelectedSpot(null);
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-600 rounded text-white"
                >
                  Rezervă
                </button>
                <button
                  onClick={() => setSelectedSpot(null)}
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
