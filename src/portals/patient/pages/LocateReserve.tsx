import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Clock, 
  Filter, 
  CheckCircle2, 
  Building2, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { usePharmaLoopStore, store } from '../../../services/store';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const LocateReserve: React.FC = () => {
  const navigate = useNavigate();
  const { pharmacies, holds } = usePharmaLoopStore();
  const [searchQuery, setSearchQuery] = useState('Amoxicillin');
  const [radiusKm, setRadiusKm] = useState(10);
  const [filterInStockOnly, setFilterInStockOnly] = useState(true);

  const activeHold = holds.find(h => h.status === 'ACTIVE');

  // Filter inventory across pharmacies
  const filteredResults = pharmacies.map(pharm => {
    const matchingItems = (pharm.inventory || []).filter(item => {
      const matchesName = item.medication_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.generic_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = filterInStockOnly ? item.stock_status !== 'OUT_OF_STOCK' : true;
      return matchesName && matchesStock;
    });

    return {
      ...pharm,
      matchingInventory: matchingItems,
      distanceKm: (Math.random() * 2 + 0.5).toFixed(1) // Simulated distance
    };
  }).filter(p => p.matchingInventory.length > 0);

  const handleHoldClick = (pharmacyId: string, inventoryId: string, medName: string) => {
    const hold = store.createHold(pharmacyId, inventoryId, medName, 1, "Amina Mugisha");
    alert(`✅ 60-Minute Reservation Locked!\n\nHold ID: #${hold.holdId}\nMedication: ${medName}\nPharmacy: Central Care Pharmacy\nExpires At: ${new Date(hold.expiresAt).toLocaleTimeString()}`);
    navigate(`/patient/pharmacy/${pharmacyId}`);
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
            onClick={() => setFilterInStockOnly(!filterInStockOnly)}
            className={`px-4 py-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
              filterInStockOnly 
                ? 'bg-teal-50 border-teal-300 text-[#00685f]' 
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>In-Stock Only</span>
          </button>
        </div>
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
                  {pharm.address} • <span className="font-semibold text-slate-700">{pharm.distanceKm} km away</span>
                </p>
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
                      onClick={() => handleHoldClick(pharm.id, item.id, item.medication_name)}
                      disabled={item.stock_status === 'OUT_OF_STOCK'}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                        item.stock_status === 'OUT_OF_STOCK'
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-[#00685f] hover:bg-[#005049] text-white'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Reserve 60-Min Hold</span>
                    </button>

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
