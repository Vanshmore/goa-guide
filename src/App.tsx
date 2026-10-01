import { useState, useEffect } from 'react';
import {
  PLACES,
  ZONES,
  ROUTE_CHIPS,
  Place,
  Zone,
  Itinerary,
} from './data/goaData';
import GoaMap, { MapTheme } from './components/GoaMap';
import RouteChipsStrip from './components/RouteChipsStrip';
import PlaceDetailCard from './components/PlaceDetailCard';
import SidePanel from './components/SidePanel';
import {
  Menu,
  Sparkles,
  Layers,
  MapPin,
  Compass,
  Star,
  Bookmark,
  Share2,
} from 'lucide-react';

export default function App() {
  const [places] = useState<Place[]>(PLACES);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null);
  const [activeRouteChipId, setActiveRouteChipId] = useState<string | null>(null);
  const [mapTheme, setMapTheme] = useState<MapTheme>('street');
  const [showZones, setShowZones] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Resize listener when sidebar toggles so Leaflet redraws smoothly
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 320);
    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  // FlyTo trigger payload
  const [flyToTrigger, setFlyToTrigger] = useState<{
    target: [number, number] | [[number, number], [number, number]];
    zoom?: number;
    id: number;
  } | null>(null);

  // Local storage for Bookmarks & Visited
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('goa_guide_bookmarks');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default initial bookmarks
    return ['purple-martini', 'cabo-de-rama-fort', 'cola-beach'];
  });

  const [visitedIds, setVisitedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('goa_guide_visited');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['baga-beach'];
  });

  useEffect(() => {
    try {
      localStorage.setItem('goa_guide_bookmarks', JSON.stringify(bookmarkedIds));
    } catch {
      // ignore
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('goa_guide_visited', JSON.stringify(visitedIds));
    } catch {
      // ignore
    }
  }, [visitedIds]);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPlace(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle Bookmark
  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Visited
  const handleToggleVisited = (id: string) => {
    setVisitedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select Place handler
  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setFlyToTrigger({
      target: place.coords,
      zoom: 14,
      id: Date.now(),
    });
  };

  // Select Route Chip
  const handleSelectRouteChip = (chip: (typeof ROUTE_CHIPS)[0]) => {
    setActiveRouteChipId(chip.id);
    setSelectedZoneId(chip.zoneId);

    // If chip specifies a target anchor spot
    const targetPlace = places.find((p) => p.id === chip.targetPlaceId);
    if (targetPlace) {
      setSelectedPlace(targetPlace);
    }

    setFlyToTrigger({
      target: chip.bounds,
      id: Date.now(),
    });
  };

  // Select Zone
  const handleSelectZone = (zoneId: string | null) => {
    setSelectedZoneId(zoneId);
    if (zoneId) {
      const zone = ZONES.find((z) => z.id === zoneId);
      if (zone) {
        setFlyToTrigger({
          target: zone.bounds,
          id: Date.now(),
        });
      }
    } else {
      setActiveRouteChipId(null);
    }
  };

  // Select Itinerary
  const handleSelectItinerary = (itinerary: Itinerary | null) => {
    setActiveItinerary(itinerary);
    if (itinerary && itinerary.stops.length > 0) {
      const firstStop = places.find((p) => p.id === itinerary.stops[0].placeId);
      if (firstStop) {
        setSelectedPlace(firstStop);
      }
    }
  };

  const mustVisitCount = places.filter((p) => p.mustVisit).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-950 text-stone-100 font-sans">
      {/* Mobile Backdrop when sidebar is open on small screens */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-[550] bg-black/60 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Side Panel (Collapsible via Back button on both Desktop and Mobile) */}
      <SidePanel
        places={places}
        selectedPlace={selectedPlace}
        onSelectPlace={handleSelectPlace}
        selectedZoneId={selectedZoneId}
        onSelectZone={handleSelectZone}
        activeItinerary={activeItinerary}
        onSelectItinerary={handleSelectItinerary}
        bookmarkedIds={bookmarkedIds}
        visitedIds={visitedIds}
        onToggleBookmark={handleToggleBookmark}
        onToggleVisited={handleToggleVisited}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Map View Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Top Navbar overlay */}
        <header className="absolute top-3 left-3 z-[400] flex items-center gap-2">
          {/* Reopen Sidebar Button (Visible whenever sidebar is closed) */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-stone-900/95 hover:bg-stone-800 text-stone-100 rounded-xl shadow-xl border border-stone-700/80 backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95 group"
              aria-label="Open sidebar"
              title="Open Explorer Sidebar"
            >
              <Menu className="w-4 h-4 text-teal-400 group-hover:rotate-90 transition-transform" />
              <span className="text-xs font-bold">Explore Places</span>
            </button>
          )}

          {/* Quick Stats Pill */}
          <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 bg-stone-900/90 border border-stone-700/70 rounded-full backdrop-blur-md shadow-md text-xs">
            <div className="flex items-center gap-1.5 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>{places.length} Curated Spots</span>
            </div>
            <span className="text-stone-600">·</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{mustVisitCount} Must-Visits</span>
            </div>
            <span className="text-stone-600">·</span>
            <div className="flex items-center gap-1.5 text-stone-300">
              <Bookmark className="w-3.5 h-3.5 text-teal-400" />
              <span>{bookmarkedIds.length} Saved</span>
            </div>
          </div>
        </header>

        {/* The Interactive Map */}
        <div className="flex-1 w-full h-full relative">
          <GoaMap
            places={places}
            selectedPlace={selectedPlace}
            onSelectPlace={handleSelectPlace}
            selectedZoneId={selectedZoneId}
            onSelectZone={handleSelectZone}
            activeItinerary={activeItinerary}
            mapTheme={mapTheme}
            setMapTheme={setMapTheme}
            showZones={showZones}
            setShowZones={setShowZones}
            flyToTrigger={flyToTrigger}
          />
        </div>

        {/* Place Detail Modal Dialog (Proper z-index above map controls, with backdrop click) */}
        {selectedPlace && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            {/* Click outside on backdrop to dismiss */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => setSelectedPlace(null)}
              aria-label="Close modal backdrop"
            />

            {/* Modal Card */}
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto">
              <PlaceDetailCard
                place={selectedPlace}
                onClose={() => setSelectedPlace(null)}
                isBookmarked={bookmarkedIds.includes(selectedPlace.id)}
                isVisited={visitedIds.includes(selectedPlace.id)}
                onToggleBookmark={handleToggleBookmark}
                onToggleVisited={handleToggleVisited}
              />
            </div>
          </div>
        )}

        {/* Bottom Route Chips Strip */}
        <div className="absolute inset-x-0 bottom-0 z-[400] bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent pt-4 pb-2">
          <RouteChipsStrip
            activeChipId={activeRouteChipId}
            onSelectRouteChip={handleSelectRouteChip}
            onSelectZone={handleSelectZone}
          />
        </div>
      </main>
    </div>
  );
}
