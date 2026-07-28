import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Save, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { usePharmaLoopStore, store } from '../../../services/store';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export const InventoryManagement: React.FC = () => {
  const { pharmacies } = usePharmaLoopStore();
  const pharmacy = pharmacies[0];
  const inventory = pharmacy?.inventory || [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);

  // Form state for adding new SKU
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newGenericName, setNewGenericName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newCategory, setNewCategory] = useState('Antibiotics');

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditQty(item.stock_quantity);
    setEditPrice(item.unit_price);
  };

  const saveEdit = (itemId: string) => {
    store.updateInventoryItem(pharmacy.id, itemId, editQty, editPrice);
    setEditingId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName || !newPrice || !newQty) return;

    store.addInventoryItem(pharmacy.id, {
      medication_name: newMedName,
      generic_name: newGenericName || newMedName,
      unit_price: parseFloat(newPrice),
      stock_quantity: parseInt(newQty, 10),
      stock_status: parseInt(newQty, 10) === 0 ? 'OUT_OF_STOCK' : parseInt(newQty, 10) < 15 ? 'LOW_STOCK' : 'IN_STOCK',
      category: newCategory
    });

    setShowAddForm(false);
    setNewMedName('');
    setNewGenericName('');
    setNewPrice('');
    setNewQty('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <Package className="w-4 h-4 text-slate-700" />
            <span>Pharmacy Real-time Inventory Catalog</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
            Inventory & Stock Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Inline stock editing automatically broadcasts availability updates to patients searching nearby.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New SKU</span>
        </button>
      </div>

      {/* Add SKU Modal Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="font-heading font-bold text-lg text-white">Add New Medication SKU</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-mono mb-1">Medication Name</label>
              <input
                type="text"
                value={newMedName}
                onChange={e => setNewMedName(e.target.value)}
                placeholder="e.g. Ciprofloxacin 500mg"
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-mono mb-1">Generic Name</label>
              <input
                type="text"
                value={newGenericName}
                onChange={e => setNewGenericName(e.target.value)}
                placeholder="e.g. Ciprofloxacin"
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-mono mb-1">Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
              >
                <option value="Antibiotics">Antibiotics</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Analgesics">Analgesics</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-mono mb-1">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                placeholder="15.50"
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-mono mb-1">Initial Stock Quantity</label>
              <input
                type="number"
                value={newQty}
                onChange={e => setNewQty(e.target.value)}
                placeholder="50"
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Save SKU & Publish Stock
            </button>
          </div>
        </form>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-3">Medication Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Unit Price ($)</th>
                <th className="py-3 px-3">Stock Quantity</th>
                <th className="py-3 px-3">Stock Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {item.medication_name}
                      <span className="block text-[10px] text-slate-400 font-mono">Generic: {item.generic_name}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">{item.category || 'General'}</td>
                    
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={e => setEditPrice(parseFloat(e.target.value))}
                          className="w-20 p-1 border border-slate-300 rounded font-mono text-xs"
                        />
                      ) : (
                        `$${item.unit_price.toFixed(2)}`
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editQty}
                          onChange={e => setEditQty(parseInt(e.target.value, 10))}
                          className="w-20 p-1 border border-slate-300 rounded font-mono text-xs"
                        />
                      ) : (
                        `${item.stock_quantity} units`
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <StatusBadge status={item.stock_status} size="sm" />
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs inline-flex items-center gap-1 shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
