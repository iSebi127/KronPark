import React, { useMemo, useState } from 'react';
import ParkingSpot from './ParkingSpot';
import ParkingLegend from './ParkingLegend';

export default function ParkingGrid({ rows = 5, cols = 12, lane, map = {}, labelToId = {}, onSelect }) {
  const [selected, setSelected] = useState(null);


  const grid = useMemo(() => {
    const g = [];
    let logicalR = 0;

    for (let r = 0; r < rows; r++) {
      const isRoadRow = lane && lane.type === 'row' && lane.index === r;
      let logicalC = 0;

      for (let c = 0; c < cols; c++) {
        const isRoadCol = lane && lane.type === 'col' && lane.index === c;

        if (isRoadRow || isRoadCol) {
          g.push({ r, c, label: `road-${r}-${c}`, isRoad: true });
        } else {
          const rowLetter = String.fromCharCode(65 + logicalR);
          const label = `${rowLetter}${logicalC + 1}`;
          g.push({ r, c, label, isRoad: false });
          logicalC++;
        }
      }
      if (!isRoadRow) logicalR++;
    }
    return g;
  }, [rows, cols, lane]);

  function getStatus(label) {
    return map && map[label] ? map[label] : 'free';
  }

  function handleClick(cell) {
    const status = getStatus(cell.label);
    if (status !== 'free') return;
    setSelected(cell.label);
    onSelect && onSelect(cell.label);
  }

  const Arrow = ({ dir = 'right' }) => {
    const rot = dir === 'right' ? 0 : dir === 'left' ? 180 : dir === 'down' ? 90 : -90;
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-300 opacity-70 transform" style={{ transform: `rotate(${rot}deg)` }}>
        <path fill="currentColor" d="M12 2l7 7h-4v9h-6v-9H5z" />
      </svg>
    );
  };

  return (
    <div className="w-full p-4">
      <div className="mx-auto max-w-[1100px]">
        <div className="bg-slate-950 rounded-xl p-4 shadow-xl border-2 border-cyan-900">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-cyan-200">Parking Layout</h3>
            <div className="text-sm text-slate-400">Click a free spot to select</div>
          </div>

          <div className="rounded-md border border-cyan-800 overflow-hidden" style={{ padding: 4 }}>
            <div
              className="grid bg-transparent"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(32px, 1fr))`, gridAutoRows: '32px', gap: '6px' }}
              role="grid"
            >
              {grid.map((cell) => {
                const { label, isRoad } = cell;

                if (isRoad) {
                  return (
                    <div key={label} className="flex items-center justify-center" role="presentation">
                      <div className="w-full h-full bg-slate-900/60 rounded-sm flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-800/20 to-slate-900/40" />
                        <div className="relative z-10 flex items-center gap-1 text-cyan-300">
                          <Arrow dir={lane.direction || 'right'} />
                        </div>
                      </div>
                    </div>
                  );
                }

                const status = getStatus(label);
                const hasRealSpot = Boolean(labelToId && labelToId[label]);
                
                if (status === 'occupied' && !hasRealSpot) {
                  return <div key={label} className="w-full h-full" />;
                }

                return (
                  <div key={label} role="gridcell" className="flex items-center justify-center">
                    <ParkingSpot
                      spot={{ id: label, status: status, type: 'standard' }}
                      isSelected={selected === label}
                      onClick={() => handleClick(cell)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex gap-4">
            <ParkingLegend />
          </div>
        </div>
      </div>
    </div>
  );
}