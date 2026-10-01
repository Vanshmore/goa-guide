import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Place, Zone, ZONES, Itinerary } from '../data/goaData';
import { createPlaceMarkerIcon } from '../utils/markerUtils';
import { Layers, Compass, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export type MapTheme = 'street' | 'dark' | 'satellite';

interface GoaMapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string | null) => void;
  activeItinerary: Itinerary | null;
  mapTheme: MapTheme;
  setMapTheme: (theme: MapTheme) => void;
  showZones: boolean;
  setShowZones: (val: boolean) => void;
  flyToTrigger: { target: [number, number] | [[number, number], [number, number]]; zoom?: number; id: number } | null;
}

export default function GoaMap({
  places,
  selectedPlace,
  onSelectPlace,
  selectedZoneId,
  onSelectZone,
  activeItinerary,
  mapTheme,
  setMapTheme,
  showZones,
  setShowZones,
  flyToTrigger,
}: GoaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  // Helper to get tile configuration without needing any API keys
  const getTileConfig = (theme: MapTheme) => {
    if (theme === 'satellite') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        options: {
          attribution: '&copy; Esri, Maxar, Earthstar Geographics',
          maxZoom: 18,
        },
      };
    }
    if (theme === 'dark') {
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
        },
      };
    }
    // 'street' - Warm, vibrant Humanitarian OpenStreetMap with beach and road details
    return {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      },
    };
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Goa Center & Bounds
    const initialCenter: [number, number] = [15.35, 73.95];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 11,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false,
      maxBounds: [
        [14.65, 73.35],
        [15.95, 74.55],
      ],
      maxBoundsViscosity: 0.8,
    });

    mapInstanceRef.current = map;

    // Layer groups
    zonesLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Initial tile layer
    const config = getTileConfig(mapTheme);
    tileLayerRef.current = L.tileLayer(config.url, config.options).addTo(map);

    // Invalidate size on window resize
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer on Theme Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = getTileConfig(mapTheme);
    tileLayerRef.current = L.tileLayer(config.url, config.options).addTo(map);
  }, [mapTheme]);

  // Update Zones Layer
  useEffect(() => {
    const layer = zonesLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    if (!showZones) return;

    ZONES.forEach((zone: Zone) => {
      const isSelected = selectedZoneId === zone.id;
      const polygon = L.polygon(zone.polygon, {
        color: zone.borderColor,
        fillColor: zone.color,
        fillOpacity: isSelected ? 0.35 : 0.18,
        weight: isSelected ? 3.5 : 2,
        dashArray: isSelected ? undefined : '6, 6',
      });

      // Zone tooltip on hover
      polygon.bindTooltip(
        `<div style="font-family: inherit; font-size: 12px; font-weight: 600; color: #fff; background: rgba(24, 24, 27, 0.95); padding: 5px 9px; border-radius: 6px; border: 1px solid ${zone.borderColor}">
          ${zone.shortName}
        </div>`,
        { sticky: true, opacity: 1, direction: 'top' }
      );

      polygon.on('click', () => {
        onSelectZone(isSelected ? null : zone.id);
        const map = mapInstanceRef.current;
        if (map) {
          map.fitBounds(zone.bounds, { padding: [40, 40], maxZoom: 13, duration: 1 });
        }
      });

      layer.addLayer(polygon);
    });
  }, [showZones, selectedZoneId, onSelectZone]);

  // Update Route / Itinerary Layer
  useEffect(() => {
    const layer = routeLayerRef.current;
    const map = mapInstanceRef.current;
    if (!layer || !map) return;

    layer.clearLayers();

    if (!activeItinerary) return;

    const stopCoordinates: [number, number][] = [];
    activeItinerary.stops.forEach((stop, index) => {
      const place = places.find((p) => p.id === stop.placeId);
      if (place) {
        stopCoordinates.push(place.coords);

        // Add numbered badge
        const numberIcon = L.divIcon({
          className: 'itinerary-step-badge',
          html: `
            <div style="background: ${activeItinerary.color}; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
              ${index + 1}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const badgeMarker = L.marker(place.coords, { icon: numberIcon, zIndexOffset: 2000 });
        badgeMarker.bindTooltip(
          `<div style="font-size: 11px; font-weight: 600;">Stop ${index + 1}: ${place.name} (${stop.timeEstimate})</div>`,
          { direction: 'top', offset: [0, -12] }
        );
        layer.addLayer(badgeMarker);
      }
    });

    if (stopCoordinates.length > 1) {
      // Draw smooth route line
      const polyline = L.polyline(stopCoordinates, {
        color: activeItinerary.color,
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      });
      layer.addLayer(polyline);

      // Fit map to show all itinerary stops
      const bounds = L.latLngBounds(stopCoordinates);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, duration: 1.2 });
    }
  }, [activeItinerary, places]);

  // Update Markers
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const icon = createPlaceMarkerIcon(place, isSelected);

      const marker = L.marker(place.coords, {
        icon,
        zIndexOffset: isSelected ? 1000 : place.mustVisit ? 500 : 100,
      });

      marker.on('click', () => {
        onSelectPlace(place);
        const map = mapInstanceRef.current;
        if (map) {
          map.panTo(place.coords, { animate: true, duration: 0.6 });
        }
      });

      // Hover Tooltip
      const categoryLabel = place.category.toUpperCase();
      marker.bindTooltip(
        `<div style="padding: 2px 4px; font-size: 12px; font-weight: 600; line-height: 1.3;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span>${place.name}</span>
            ${place.mustVisit ? '<span style="color: #f59e0b;">★</span>' : ''}
          </div>
          <div style="font-size: 10px; font-weight: 400; opacity: 0.75; text-transform: capitalize;">${categoryLabel} · ${place.tags[0] || ''}</div>
        </div>`,
        { direction: 'top', offset: [0, -42], opacity: 0.95 }
      );

      layer.addLayer(marker);
    });
  }, [places, selectedPlace, onSelectPlace]);

  // Handle FlyTo triggers from Route Chips or Search
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !flyToTrigger) return;

    const { target, zoom } = flyToTrigger;
    if (Array.isArray(target) && target.length === 2 && Array.isArray(target[0])) {
      // Bounds
      map.fitBounds(target as [[number, number], [number, number]], {
        padding: [60, 60],
        maxZoom: 14,
        duration: 1.2,
      });
    } else {
      // LatLng
      map.flyTo(target as [number, number], zoom || 14, {
        duration: 1.2,
      });
    }
  }, [flyToTrigger]);

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([15.35, 73.95], 11, { duration: 1 });
      onSelectZone(null);
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Map DOM Target with optional dark theme styling */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 ${mapTheme === 'dark' ? 'theme-dark' : ''}`}
      />

      {/* Floating Map Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-[500] flex flex-col items-end gap-2">
        {/* Reset View */}
        <button
          onClick={handleResetView}
          className="p-2.5 bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl shadow-lg border border-stone-700/60 backdrop-blur-md transition-all cursor-pointer flex items-center justify-center group"
          title="Reset Map to Full Goa View"
          aria-label="Reset Map"
        >
          <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        </button>

        {/* Zoom In/Out */}
        <div className="flex flex-col bg-stone-900/90 rounded-xl shadow-lg border border-stone-700/60 backdrop-blur-md overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2 text-stone-300 hover:text-white hover:bg-stone-800/80 transition-colors cursor-pointer border-b border-stone-800 flex items-center justify-center"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-stone-300 hover:text-white hover:bg-stone-800/80 transition-colors cursor-pointer flex items-center justify-center"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle Zone Polygons */}
        <button
          onClick={() => setShowZones(!showZones)}
          className={`p-2.5 rounded-xl shadow-lg border backdrop-blur-md transition-all cursor-pointer flex items-center justify-center ${
            showZones
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-stone-900/90 text-stone-400 border-stone-700/60 hover:text-stone-200'
          }`}
          title={showZones ? 'Hide Colored Zones' : 'Show Colored Zones'}
          aria-label="Toggle Zones"
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* 3-way Map Theme Switcher: Street, Dark, Satellite (Zero API keys needed!) */}
        <div className="flex items-center p-1 bg-stone-900/95 rounded-xl shadow-lg border border-stone-700/80 backdrop-blur-md text-[11px] font-semibold">
          <button
            onClick={() => setMapTheme('street')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              mapTheme === 'street'
                ? 'bg-teal-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Warm Street & Beach Map (Free OSM)"
          >
            Street
          </button>
          <button
            onClick={() => setMapTheme('dark')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              mapTheme === 'dark'
                ? 'bg-teal-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Night Mode Map"
          >
            Dark
          </button>
          <button
            onClick={() => setMapTheme('satellite')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              mapTheme === 'satellite'
                ? 'bg-teal-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Satellite Aerial Map"
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Zone Legend Indicator (Top Left inside map, subtle) */}
      {selectedZoneId && (
        <div className="absolute top-4 left-4 z-[500] max-w-xs bg-stone-900/95 border border-stone-700/80 backdrop-blur-md rounded-xl p-3 shadow-xl flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">Active Zone</div>
            <div className="text-sm font-bold text-white truncate">
              {ZONES.find((z) => z.id === selectedZoneId)?.name}
            </div>
          </div>
          <button
            onClick={() => onSelectZone(null)}
            className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
