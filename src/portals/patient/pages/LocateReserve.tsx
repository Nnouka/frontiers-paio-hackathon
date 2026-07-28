import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Clock, 
  Filter, 
  CheckCircle2, 
  ShieldCheck,
  ChevronRight,
  LocateFixed,
  Navigation,
  Loader2
} from 'lucide-react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { apiCreateHold, apiSearchPharmacies } from '../../../services/apiClient';
import { usePharmaLoopStore, store } from '../../../services/store';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import type { GeoLocation, PharmacySearchResult } from '@shared/types/contracts';

const DEMO_FALLBACK_COORDS: GeoLocation = { latitude: -1.9441, longitude: 30.0619 };

function getCurrentPosition(): Promise<GeoLocation> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEMO_FALLBACK_COORDS);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(DEMO_FALLBACK_COORDS),
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}

function estimateRouteMinutes(distanceKm: number): number {
  const averageUrbanSpeedKmH = 25;
  return Math.max(2, Math.round((distanceKm / averageUrbanSpeedKmH) * 60));
}

export const LocateReserve: React.FC = () => {
  const navigate = useNavigate();
  const { holds } = usePharmaLoopStore();
  const [searchQuery, setSearchQuery] = useState('Amoxicillin');
  const [radiusKm, setRadiusKm] = useState(10);
  const [filterInStockOnly, setFilterInStockOnly] = useState(true);
  const [searchResults, setSearchResults] = useState<PharmacySearchResult[]>([]);
  const [searchCenter, setSearchCenter] = useState<GeoLocation>(DEMO_FALLBACK_COORDS);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingHold, setIsCreatingHold] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: 'frontiers-maps-script',
    googleMapsApiKey: mapsApiKey
  });

  const activeHold = holds.find(h => h.status === 'ACTIVE');

  const runSearch = useCallback(async () => {
    setIsSearching(true);
    setErrorMessage(null);

    try {
      const position = await getCurrentPosition();
      setSearchCenter(position);

      const response = await apiSearchPharmacies({
        query: searchQuery,
        latitude: position.latitude,
        longitude: position.longitude,
        radiusKm
      });

      setSearchResults(response.pharmacies);
      setActiveMarkerId(response.pharmacies[0]?.id ?? null);
    } catch (err) {
      console.error('[LocateReserve] Search error:', err);
      setErrorMessage('Unable to fetch live pharmacy results. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [radiusKm, searchQuery]);

  useEffect(() => {
    void runSearch();
  }, [runSearch]);

  const filteredResults = useMemo(() => {
    return searchResults
      .map((pharm) => {
        const matchingItems = (pharm.matchingInventory || []).filter((item) => {
          const matchesStock = filterInStockOnly ? item.stock_status !== 'OUT_OF_STOCK' : true;
          return matchesStock;
        });

        return {
          ...pharm,
          matchingInventory: matchingItems
        };
      })
      .filter((p) => p.matchingInventory.length > 0);
  }, [filterInStockOnly, searchResults]);

  const handleHoldClick = async (pharmacyId: string, inventoryId: string, medName: string) => {
    setIsCreatingHold(inventoryId);
    setErrorMessage(null);
    try {
      const response = await apiCreateHold({
        pharmacyId,
        inventoryId,
        quantity: 1,
        patientName: 'Amina Mugisha'
      });

      const hold = response.hold;
      store.createHold(pharmacyId, inventoryId, medName, 1, 'Amina Mugisha');

      alert(
        `✅ 60-Minute Reservation Locked!\n\nHold ID: #${hold.holdId}\nMedication: ${medName}\nExpires At: ${new Date(hold.expiresAt).toLocaleTimeString()}`
      );
      navigate(`/patient/pharmacy/${pharmacyId}`);
    } catch (err) {
      console.error('[LocateReserve] Hold creation error:', err);
      setErrorMessage('Could not place hold right now. Please retry.');
    } finally {
      setIsCreatingHold(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#00685f]">
          <span>Real-time Stock Search</span>
          <span className="bg-teal-100 text-[#00685f] px-2 py-0.5 rounded-full text-[10px]">
            Geohash Engine
          </span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
          Locate Prescribed Medication & Hold
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Verify pharmacy inventory in real time and place a guaranteed 60-minute reservation hold before traveling.
        </p>

        {/* Search Bar & Filters */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medication name (e.g. Amoxicillin, Metformin, Warfarin)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 focus:border-[#00685f]"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Max Radius: {radiusKm} km</span>
            <input
              type="range"
              min="1"
              max="25"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full accent-[#00685f]"
            />
          </div>

          <button
            onClick={() => void runSearch()}
            disabled={isSearching}
            className="px-4 py-3 rounded-xl text-xs font-semibold border bg-[#00685f] text-white border-[#00685f] hover:bg-[#005049] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
            <span>{isSearching ? 'Searching...' : 'Search Nearby'}</span>
          </button>

          <button
            onClick={() => setFilterInStockOnly(!filterInStockOnly)}
            className={`px-4 py-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 md:col-span-4 ${
              filterInStockOnly 
                ? 'bg-teal-50 border-teal-300 text-[#00685f]' 
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>In-Stock Only</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl px-3 py-2 text-xs font-medium">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span>Interactive Map</span>
          <span>Center: {searchCenter.latitude.toFixed(3)}, {searchCenter.longitude.toFixed(3)}</span>
        </div>

        {!mapsApiKey && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-900">
            Add VITE_GOOGLE_MAPS_API_KEY in .env to render the live map.
          </div>
        )}

        {mapsApiKey && isMapLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '320px', borderRadius: '12px' }}
            center={{ lat: searchCenter.latitude, lng: searchCenter.longitude }}
            zoom={12}
            options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
          >
            {filteredResults.map((pharm) => (
              <MarkerF
                key={pharm.id}
                position={{ lat: pharm.location.latitude, lng: pharm.location.longitude }}
                onClick={() => setActiveMarkerId(pharm.id)}
              />
            ))}

            {activeMarkerId && (() => {
              const current = filteredResults.find((p) => p.id === activeMarkerId);
              if (!current) return null;
              return (
                <InfoWindowF
                  position={{ lat: current.location.latitude, lng: current.location.longitude }}
                  onCloseClick={() => setActiveMarkerId(null)}
                >
                  <div className="min-w-[170px] text-xs text-slate-800">
                    <div className="font-bold text-slate-900">{current.name}</div>
                    <div className="text-slate-600">{current.distanceKm.toFixed(1)} km • ~{estimateRouteMinutes(current.distanceKm)} min</div>
                    <div className="text-slate-600">{current.matchingInventory[0]?.medication_name || 'Medication result'}</div>
                  </div>
                </InfoWindowF>
              );
            })()}
          </GoogleMap>
        )}
      </div>

      {/* Active Hold Notification if present */}
      {activeHold && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-900">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Active Hold Active: #{activeHold.holdId} for {activeHold.medicationName}</span>
          </div>
          <button 
            onClick={() => navigate(`/patient/pharmacy/${activeHold.pharmacyId}`)}
            className="text-xs font-bold text-[#00685f] hover:underline"
          >
            View Reservation Details →
          </button>
        </div>
      )}

      {/* Search Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
          <span>Matching Pharmacies ({filteredResults.length} Found)</span>
          <span>Updated Real-Time via Inventory Webhooks</span>
        </div>

        {!isSearching && filteredResults.length === 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-sm text-slate-500">
            No matching inventory in the current radius. Increase radius or adjust medication name.
          </div>
        )}

        {filteredResults.map((pharm) => (
          <div key={pharm.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4">
            {/* Pharmacy Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-lg text-slate-900">{pharm.name}</h3>
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Verified Pharmacy
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {pharm.address} • <span className="font-semibold text-slate-700">{pharm.distanceKm.toFixed(1)} km away</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Approx route time: {estimateRouteMinutes(pharm.distanceKm)} min</p>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 60m Hold Guarantee
                </span>
              </div>
            </div>

            {/* Inventory Items matched */}
            <div className="space-y-3">
              {pharm.matchingInventory.map((item) => (
                <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-sm text-slate-900">{item.medication_name}</h4>
                      <StatusBadge status={item.stock_status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Generic: {item.generic_name} • Category: {item.category || 'Prescription'}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="font-heading font-extrabold text-base text-slate-900">
                        ${item.unit_price.toFixed(2)}
                      </span>
                      <span className="font-mono text-xs text-slate-600">
                        {item.stock_quantity} units available
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => void handleHoldClick(pharm.id, item.id, item.medication_name)}
                      disabled={item.stock_status === 'OUT_OF_STOCK' || isCreatingHold === item.id}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                        item.stock_status === 'OUT_OF_STOCK' || isCreatingHold === item.id
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-[#00685f] hover:bg-[#005049] text-white'
                      }`}
                    >
                      {isCreatingHold === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                      <span>{isCreatingHold === item.id ? 'Placing hold...' : 'Reserve 60-Min Hold'}</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${pharm.location.latitude},${pharm.location.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition-all shrink-0"
                      title="Open directions"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => navigate(`/patient/pharmacy/${pharm.id}`)}
                      className="p-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition-all shrink-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
