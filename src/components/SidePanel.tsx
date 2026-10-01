import { useState, useMemo } from 'react';
import {
  Place,
  Zone,
  ZONES,
  Itinerary,
  ITINERARIES,
  TRAVEL_TIPS,
} from '../data/goaData';
import {
  Search,
  Star,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Bookmark,
  Calendar,
  Compass,
  Info,
  ChevronRight,
  Sparkles,
  X,
  Share2,
} from 'lucide-react';

interface SidePanelProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string | null) => void;
  activeItinerary: Itinerary | null;
  onSelectItinerary: (itinerary: Itinerary | null) => void;
  bookmarkedIds: string[];
  visitedIds: string[];
  onToggleBookmark: (id: string) => void;
  onToggleVisited: (id: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

type TabType = 'places' | 'itineraries' | 'mytrip' | 'tips';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'must-visit', label: '⭐ Must Visit' },
  { id: 'beach', label: 'Beaches' },
  { id: 'food', label: 'Food & Cafes' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'photo', label: 'Photo Spots' },
  { id: 'trek', label: 'Treks & Secret' },
  { id: 'culture', label: 'Culture & Forts' },
];

export default function SidePanel({
  places,
  selectedPlace,
  onSelectPlace,
  selectedZoneId,
  onSelectZone,
  activeItinerary,
  onSelectItinerary,
  bookmarkedIds,
  visitedIds,
  onToggleBookmark,
  onToggleVisited,
  isOpenMobile,
  onCloseMobile,
}: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('places');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedTrip, setCopiedTrip] = useState(false);

  // Filtered Places logic
  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // Zone filter
      if (selectedZoneId && place.zoneId !== selectedZoneId) {
        return false;
      }

      // Category filter
      if (selectedCategory === 'must-visit') {
        if (!place.mustVisit) return false;
      } else if (selectedCategory !== 'all') {
        if (place.category !== selectedCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = place.name.toLowerCase().includes(query);
        const matchesDesc = place.description.toLowerCase().includes(query);
        const matchesTag = place.tags.some((t) => t.toLowerCase().includes(query));
        const matchesZone = ZONES.find((z) => z.id === place.zoneId)
          ?.name.toLowerCase()
          .includes(query);

        if (!matchesName && !matchesDesc && !matchesTag && !matchesZone) {
          return false;
        }
      }

      return true;
    });
  }, [places, selectedZoneId, selectedCategory, searchQuery]);

  // Saved / My Trip Places
  const myTripPlaces = useMemo(() => {
    const ids = Array.from(new Set([...bookmarkedIds, ...visitedIds]));
    return places.filter((p) => ids.includes(p.id));
  }, [places, bookmarkedIds, visitedIds]);

  const copyTripSummary = () => {
    if (myTripPlaces.length === 0) return;
    const summary = myTripPlaces
      .map(
        (p, idx) =>
          `${idx + 1}. ${p.name} (${p.category.toUpperCase()}) ${
            visitedIds.includes(p.id) ? '✅ Visited' : '📌 Bucket List'
          }\nGoogle Maps: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            p.googleQuery
          )}`
      )
      .join('\n\n');

    const fullText = `🌴 My Goa Trip Checklist (${visitedIds.length}/${myTripPlaces.length} Visited)\n\n${summary}`;
    navigator.clipboard.writeText(fullText);
    setCopiedTrip(true);
    setTimeout(() => setCopiedTrip(false), 2200);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[600] w-full sm:w-[420px] bg-stone-900/95 backdrop-blur-xl border-r border-stone-800 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Top Header */}
      <div className="p-4 border-b border-stone-800/80 bg-stone-950/40">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-amber-400 flex items-center justify-center shadow-md shadow-teal-500/20">
              <Compass className="w-5 h-5 text-stone-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Goa Guide <span className="text-teal-400 font-normal text-xs">· Interactive Map</span>
              </h1>
              <p className="text-[11px] text-stone-400 font-medium">
                Color-coded zones, curated beaches & cliff routes
              </p>
            </div>
          </div>

          {/* Close for mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Segmented Controls) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-stone-950/60 rounded-xl border border-stone-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('places')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'places'
                ? 'bg-teal-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Places
          </button>
          <button
            onClick={() => setActiveTab('itineraries')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'itineraries'
                ? 'bg-teal-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>Routes</span>
            {activeItinerary && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
          </button>
          <button
            onClick={() => setActiveTab('mytrip')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'mytrip'
                ? 'bg-teal-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>My Trip</span>
            {myTripPlaces.length > 0 && (
              <span
                className={`text-[10px] px-1 rounded-full ${
                  activeTab === 'mytrip' ? 'bg-stone-900 text-white' : 'bg-stone-800 text-amber-300'
                }`}
              >
                {myTripPlaces.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'tips'
                ? 'bg-teal-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Tips
          </button>
        </div>
      </div>

      {/* Tab 1: PLACES */}
      {activeTab === 'places' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search & Filters */}
          <div className="p-3 border-b border-stone-800 space-y-2.5 bg-stone-900/60">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search beach, cafe, fort, lagoon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-stone-950 border border-stone-700/80 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Zone Filter Dropdown / Row */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400 font-medium">Zone:</span>
              <select
                value={selectedZoneId || 'all'}
                onChange={(e) => onSelectZone(e.target.value === 'all' ? null : e.target.value)}
                className="bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-teal-500 max-w-[280px] truncate"
              >
                <option value="all">All Zones (Full Goa)</option>
                {ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.shortName}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors font-medium cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Places List Counter */}
          <div className="px-4 py-2 bg-stone-950/40 border-b border-stone-800/50 flex items-center justify-between text-[11px] text-stone-400">
            <span>
              Showing <strong className="text-stone-200">{filteredPlaces.length}</strong> of{' '}
              {places.length} places
            </span>
            {selectedZoneId && (
              <button
                onClick={() => onSelectZone(null)}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                Clear Zone
              </button>
            )}
          </div>

          {/* Scrollable Places List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredPlaces.length === 0 ? (
              <div className="py-12 text-center text-stone-500 space-y-2">
                <MapPin className="w-8 h-8 mx-auto stroke-1 opacity-50" />
                <p className="text-sm font-medium">No places found matching your filter</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    onSelectZone(null);
                  }}
                  className="text-xs text-teal-400 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredPlaces.map((place) => {
                const isSelected = selectedPlace?.id === place.id;
                const isSaved = bookmarkedIds.includes(place.id);
                const isDone = visitedIds.includes(place.id);
                const zone = ZONES.find((z) => z.id === place.zoneId);

                return (
                  <div
                    key={place.id}
                    onClick={() => {
                      onSelectPlace(place);
                    }}
                    className={`group p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                      isSelected
                        ? 'bg-stone-800 border-teal-500 ring-1 ring-teal-500 shadow-lg'
                        : 'bg-stone-950/70 hover:bg-stone-800/80 border-stone-800/90 hover:border-stone-700'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-stone-900">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://upload.wikimedia.org/wikipedia/commons/8/81/Sunset_at_Calangute.jpg';
                        }}
                      />
                      {place.mustVisit && (
                        <div className="absolute top-1 left-1 bg-amber-500 text-stone-950 p-0.5 rounded-full shadow">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Zone & Category header */}
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mb-0.5">
                          {zone && (
                            <>
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: zone.color }}
                              />
                              <span className="truncate">{zone.shortName}</span>
                              <span aria-hidden="true">·</span>
                            </>
                          )}
                          <span className="capitalize">{place.category}</span>
                        </div>

                        {/* Name */}
                        <h2 className="text-sm font-bold text-white truncate group-hover:text-teal-400 transition-colors">
                          {place.name}
                        </h2>

                        {/* Description snippet */}
                        <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                          {place.description}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-800/50 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBookmark(place.id);
                            }}
                            className={`p-1 rounded hover:bg-stone-750 transition-colors ${
                              isSaved ? 'text-amber-400' : 'text-stone-500 hover:text-stone-300'
                            }`}
                            title="Save to My Trip"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleVisited(place.id);
                            }}
                            className={`p-1 rounded hover:bg-stone-750 transition-colors ${
                              isDone ? 'text-emerald-400' : 'text-stone-500 hover:text-stone-300'
                            }`}
                            title="Mark as Visited"
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            place.googleQuery
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[11px] text-teal-400 hover:underline"
                        >
                          <span>Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: ITINERARIES */}
      {activeTab === 'itineraries' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Curated Day Itineraries</span>
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              Select an itinerary to draw route lines and highlight sequential stops directly on the map.
            </p>
          </div>

          <div className="space-y-3">
            {ITINERARIES.map((itinerary) => {
              const isActive = activeItinerary?.id === itinerary.id;

              return (
                <div
                  key={itinerary.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isActive
                      ? 'bg-stone-800/90 border-teal-500 ring-1 ring-teal-500'
                      : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: itinerary.color }}
                        />
                        <span>{itinerary.duration}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-stone-300">{itinerary.zoneHighlight}</span>
                      </div>
                      <h3 className="text-base font-bold text-white">{itinerary.title}</h3>
                      <p className="text-xs text-stone-400 mt-0.5">{itinerary.subtitle}</p>
                    </div>
                  </div>

                  {/* Route Steps Preview */}
                  <div className="my-3 space-y-2 border-l-2 border-stone-800 pl-3 ml-2">
                    {itinerary.stops.map((stop, idx) => {
                      const place = places.find((p) => p.id === stop.placeId);
                      return (
                        <div
                          key={stop.placeId}
                          onClick={() => {
                            if (place) onSelectPlace(place);
                          }}
                          className="cursor-pointer group flex items-start gap-2 text-xs"
                        >
                          <span className="font-mono text-[10px] text-amber-400 font-semibold shrink-0 pt-0.5">
                            {stop.timeEstimate}
                          </span>
                          <div>
                            <span className="font-semibold text-stone-200 group-hover:text-teal-400 transition-colors">
                              {idx + 1}. {place?.name || stop.placeId}
                            </span>
                            <span className="block text-[11px] text-stone-500">{stop.activity}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      onSelectItinerary(isActive ? null : itinerary);
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isActive
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                    }`}
                  >
                    <span>{isActive ? 'Hide Route on Map' : 'Show Route on Map'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: MY TRIP CHECKLIST */}
      {activeTab === 'mytrip' && (
        <div className="flex-1 flex flex-col min-h-0 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>My Goa Trip List</span>
              </h2>
              <p className="text-xs text-stone-400">
                {visitedIds.length} of {myTripPlaces.length} places explored
              </p>
            </div>

            {myTripPlaces.length > 0 && (
              <button
                onClick={copyTripSummary}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg border border-stone-700 transition-colors"
                title="Copy trip checklist for WhatsApp or Notes"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedTrip ? 'Copied!' : 'Share'}</span>
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {myTripPlaces.length > 0 && (
            <div className="w-full bg-stone-950 rounded-full h-2 mb-4 overflow-hidden border border-stone-800">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{
                  width: `${(visitedIds.length / myTripPlaces.length) * 100}%`,
                }}
              />
            </div>
          )}

          {/* Places in checklist */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {myTripPlaces.length === 0 ? (
              <div className="py-14 text-center text-stone-500 space-y-2">
                <Bookmark className="w-8 h-8 mx-auto stroke-1 opacity-50" />
                <p className="text-sm font-medium">Your trip list is currently empty</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Click the bookmark icon on any beach, cafe, or fort in the Places list to build your custom Goa itinerary!
                </p>
                <button
                  onClick={() => setActiveTab('places')}
                  className="px-3 py-1.5 bg-teal-500 text-stone-950 text-xs font-bold rounded-lg cursor-pointer mt-2"
                >
                  Explore Places
                </button>
              </div>
            ) : (
              myTripPlaces.map((place) => {
                const isDone = visitedIds.includes(place.id);

                return (
                  <div
                    key={place.id}
                    onClick={() => onSelectPlace(place)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isDone
                        ? 'bg-stone-950/40 border-stone-800/80 opacity-75'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisited(place.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          isDone ? 'text-emerald-400' : 'text-stone-500 hover:text-stone-300'
                        }`}
                      >
                        <CheckCircle2 className={`w-5 h-5 ${isDone ? 'fill-emerald-400/20' : ''}`} />
                      </button>

                      <div className="min-w-0">
                        <h3
                          className={`text-xs font-bold truncate ${
                            isDone ? 'line-through text-stone-500' : 'text-white'
                          }`}
                        >
                          {place.name}
                        </h3>
                        <span className="text-[11px] text-stone-400 capitalize">
                          {place.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(place.id);
                        }}
                        className="p-1.5 text-stone-500 hover:text-amber-400 transition-colors"
                        title="Remove bookmark"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 4: TIPS & LOCAL GUIDE */}
      {activeTab === 'tips' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-400" />
              <span>Goa Practical Travel Guide</span>
            </h2>
            <p className="text-xs text-stone-400">
              Essential tips on scooters, ferry shortcuts, water sports pricing, and safety.
            </p>
          </div>

          <div className="space-y-3">
            {TRAVEL_TIPS.map((tip, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5"
              >
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  {tip.category}
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
