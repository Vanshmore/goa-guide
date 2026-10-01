import { Place, ZONES } from '../data/goaData';
import {
  ExternalLink,
  Navigation,
  Star,
  Clock,
  Lightbulb,
  Banknote,
  CheckCircle2,
  Bookmark,
  X,
  Share2,
} from 'lucide-react';
import { useState } from 'react';

interface PlaceDetailCardProps {
  place: Place;
  onClose: () => void;
  isBookmarked: boolean;
  isVisited: boolean;
  onToggleBookmark: (placeId: string) => void;
  onToggleVisited: (placeId: string) => void;
}

export default function PlaceDetailCard({
  place,
  onClose,
  isBookmarked,
  isVisited,
  onToggleBookmark,
  onToggleVisited,
}: PlaceDetailCardProps) {
  const [copied, setCopied] = useState(false);
  const zone = ZONES.find((z) => z.id === place.zoneId);

  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place.name + ', Goa'
  )}`;

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coords[0]},${place.coords[1]}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${place.name} - Goa Guide`,
          text: `Check out ${place.name} in Goa! ${place.description}`,
          url: googleMapsSearchUrl,
        });
      } catch {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(`${place.name} - Goa: ${googleMapsSearchUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-stone-900/95 border border-stone-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] md:max-h-[500px]">
      {/* Image Preview with Badges */}
      <div className="relative w-full md:w-5/12 h-48 md:h-auto min-h-[190px] shrink-0 overflow-hidden bg-stone-950">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover brightness-95 hover:scale-105 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://upload.wikimedia.org/wikipedia/commons/8/81/Sunset_at_Calangute.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-black/30 md:bg-gradient-to-r md:from-transparent md:to-stone-900/90" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
          {place.mustVisit && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-stone-950 rounded-full font-bold text-xs shadow-lg">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Must Visit</span>
            </div>
          )}
          <div className="px-2.5 py-1 bg-stone-900/80 backdrop-blur-md border border-white/20 text-stone-200 text-xs font-medium rounded-full capitalize">
            {place.category}
          </div>
        </div>

        {/* Zone Tag in Image bottom for mobile */}
        {zone && (
          <div className="absolute bottom-3 left-3 md:hidden flex items-center gap-1.5 text-xs font-semibold text-stone-200 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
            <span>{zone.shortName}</span>
          </div>
        )}

        {/* Close Button Mobile */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Details Container */}
      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="hidden md:flex items-center gap-2 text-xs font-medium text-stone-400 mb-1">
                {zone && (
                  <>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
                    <span className="text-stone-300 font-semibold">{zone.shortName}</span>
                    <span aria-hidden="true">·</span>
                  </>
                )}
                <span className="capitalize">{place.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-stone-400">
                  {place.coords[0].toFixed(3)}°N, {place.coords[1].toFixed(3)}°E
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                {place.name}
              </h2>
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
                title="Share spot"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-stone-300 text-sm leading-relaxed mb-4">{place.description}</p>

          {/* Clean Tags (Zero-Pill Discipline: unboxed text with subtle separators) */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-stone-400 mb-4 pb-3 border-b border-stone-800/80">
            {place.tags.map((tag, i) => (
              <span key={tag} className="flex items-center gap-2">
                <span className="text-stone-300 font-medium">#{tag}</span>
                {i < place.tags.length - 1 && <span className="text-stone-600">·</span>}
              </span>
            ))}
          </div>

          {/* Rich Tips Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5 text-xs">
            {/* Best Time */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-800/50 border border-stone-800 text-stone-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold text-stone-400 block uppercase tracking-wider">
                  Best Time
                </span>
                <span>{place.bestTime}</span>
              </div>
            </div>

            {/* Cost / Entry */}
            {place.costInfo && (
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-800/50 border border-stone-800 text-stone-300">
                <Banknote className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 block uppercase tracking-wider">
                    Cost / Entry
                  </span>
                  <span>{place.costInfo}</span>
                </div>
              </div>
            )}

            {/* Insider Tip */}
            <div className="sm:col-span-2 flex items-start gap-2.5 p-2.5 rounded-xl bg-teal-950/30 border border-teal-800/40 text-stone-200">
              <Lightbulb className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold text-teal-300 block uppercase tracking-wider">
                  Local Insider Tip
                </span>
                <span className="text-stone-300">{place.insiderTip}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Google Maps, Directions, Trip Checklist */}
        <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            {/* Open in Google Maps */}
            <a
              href={googleMapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in Google Maps</span>
            </a>

            {/* Directions */}
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-xs rounded-xl border border-stone-700 transition-colors cursor-pointer"
              title="Get directions in Google Maps"
            >
              <Navigation className="w-4 h-4 text-teal-400" />
              <span>Directions</span>
            </a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Bookmark / Bucket List */}
            <button
              onClick={() => onToggleBookmark(place.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-stone-800 hover:bg-stone-750 text-stone-300 border-stone-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            {/* Mark Visited */}
            <button
              onClick={() => onToggleVisited(place.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isVisited
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-stone-800 hover:bg-stone-750 text-stone-300 border-stone-700'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isVisited ? 'fill-current' : ''}`} />
              <span>{isVisited ? 'Visited' : 'Mark Visited'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
