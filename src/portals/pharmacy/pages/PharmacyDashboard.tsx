import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  ArrowRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { usePharmaLoopStore } from '../../../services/store';
import { StatCard } from '../../../components/shared/StatCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const PharmacyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { pharmacies, holds } = usePharmaLoopStore();

  const pharmacy = pharmacies[0];
  const inventory = pharmacy?.inventory || [];
  const activeHolds = holds.filter(h => h.status === 'ACTIVE');
  const lowStockCount = inventory.filter(i => i.stock_status === 'LOW_STOCK' || i.stock_status === 'OUT_OF_STOCK').length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <span>Verified Provider Portal</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              POS Webhook Online
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
            Pharmacy Inventory & Reservations Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock broadcast to patients, 60-minute reservation queue management, and inventory analytics.
          </p>
        </div>

        <button 
          onClick={() => navigate('/pharmacy/inventory')}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all shrink-0"
        >
          + Add New Inventory SKU
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total SKUs In Stock"
          value={inventory.length}
          subtitle="Managed in system"
          icon={Package}
          color="teal"
        />
        <StatCard 
          title="Active 60m Holds"
          value={activeHolds.length}
          subtitle="Reserved by patients"
          icon={Clock}
          color="amber"
        />
        <StatCard 
          title="Low / Out of Stock"
          value={lowStockCount}
          subtitle="Needs restock alert"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard 
          title="Today's Revenue"
          value="$1,420.50"
          subtitle="+14% vs last week"
          icon={DollarSign}
          color="emerald"
        />
      </div>

      {/* Active Holds & Reservations Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">Active Patient Reservation Holds</h3>
            <p className="text-xs text-slate-500">60-minute guaranteed stock locks awaiting pickup</p>
          </div>
          <button 
            onClick={() => navigate('/pharmacy/holds')}
            className="text-xs font-semibold text-slate-900 hover:underline"
          >
            View All Holds →
          </button>
        </div>

        {activeHolds.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">No active holds currently pending.</div>
        ) : (
          <div className="space-y-3">
            {activeHolds.map((hold) => (
              <div key={hold.holdId} className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-slate-900">Hold #{hold.holdId}</span>
                      <StatusBadge status="RESERVED" />
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">
                      Medication: <span className="font-bold">{hold.medicationName}</span> ({hold.quantity} Qty)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Patient: {hold.patientName || 'Amina Mugisha'} ({hold.patientPhone || '+250 788 123 456'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => alert(`✅ Reservation #${hold.holdId} FULFILLED! Item handed over.`)}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Fulfill Pickup</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inventory Overview List Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-heading font-bold text-lg text-slate-900">Stock Inventory Quick Rail</h3>
          <button 
            onClick={() => navigate('/pharmacy/inventory')}
            className="text-xs font-semibold text-slate-900 hover:underline"
          >
            Manage Full Inventory →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Medication Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Unit Price</th>
                <th className="py-2.5 px-3">Stock Quantity</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">{item.medication_name}</td>
                  <td className="py-3 px-3 text-slate-500">{item.category || 'General'}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">${item.unit_price.toFixed(2)}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{item.stock_quantity} units</td>
                  <td className="py-3 px-3"><StatusBadge status={item.stock_status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
