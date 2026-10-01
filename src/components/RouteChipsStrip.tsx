import { ROUTE_CHIPS, RouteChip, ZONES } from '../data/goaData';
import { ChevronRight, Navigation, Sparkles } from 'lucide-react';

interface RouteChipsStripProps {
  activeChipId: string | null;
  onSelectRouteChip: (chip: (typeof ROUTE_CHIPS)[0]) => void;
  onSelectZone: (zoneId: string | null) => void;
}

export default function RouteChipsStrip({
  activeChipId,
  onSelectRouteChip,
}: RouteChipsStripProps) {
  return (
    <div className="w-full overflow-x-auto py-2 px-4 no-scrollbar flex items-center gap-2.5 z-[400]">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/70 border border-amber-600/40 rounded-full px-3 py-1.5 shrink-0 backdrop-blur-md shadow-sm">
        <Navigation className="w-3.5 h-3.5 text-amber-400" />
        <span className="uppercase tracking-wider text-[11px]">Key Routes</span>
      </div>

      {ROUTE_CHIPS.map((chip) => {
        const isActive = activeChipId === chip.id;
        const zone = ZONES.find((z) => z.id === chip.zoneId);

        return (
          <button
            key={chip.id}
            onClick={() => onSelectRouteChip(chip)}
            className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer border backdrop-blur-md shadow-md ${
              isActive
                ? 'bg-teal-500 text-stone-950 border-teal-300 font-bold shadow-teal-500/20 scale-[1.02]'
                : 'bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-white border-stone-700/80 hover:border-stone-500'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: zone?.color || '#14b8a6' }}
            />
            <span>{chip.label}</span>
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                isActive ? 'text-stone-950 stroke-[3]' : 'text-stone-400'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
