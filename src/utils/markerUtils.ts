import L from 'leaflet';
import { Place } from '../data/goaData';

// SVG icons embedded directly into marker HTML
const CATEGORY_ICONS: Record<string, string> = {
  beach: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
  food: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v19"/><path d="M6 2v19"/><path d="M6 7h4"/><path d="M6 12h4"/></svg>`,
  nightlife: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"/><path d="M12 11v11"/><path d="m19 3-7 8-7-8Z"/></svg>`,
  photo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  trek: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  culture: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/><circle cx="12" cy="10" r="1"/></svg>`,
};

export function createPlaceMarkerIcon(place: Place, isSelected: boolean): L.DivIcon {
  const iconSvg = CATEGORY_ICONS[place.category] || CATEGORY_ICONS.beach;
  const isMustVisit = place.mustVisit;
  const pinClass = isMustVisit ? 'must-visit-pin' : 'teal-pin';
  const selectedClass = isSelected ? 'is-selected' : '';

  const html = `
    <div class="marker-pin-wrapper ${selectedClass}" data-place-id="${place.id}">
      <div class="marker-pulse-ring"></div>
      <div class="marker-pin-head ${pinClass}">
        <div class="marker-icon-inner">
          ${iconSvg}
        </div>
        ${isMustVisit ? `<div class="must-visit-star-badge" title="Must Visit">★</div>` : ''}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-goa-marker',
    html,
    iconSize: [38, 48],
    iconAnchor: [19, 48],
    popupAnchor: [0, -50],
  });
}
