import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Loader2, Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import api from '../../api/api';

const fetchParts = () => api.get('/parts').then(r => r.data);

export default function CustomerPartsPage() {
  const navigate = useNavigate();
  const { data: parts = [], isLoading } = useQuery({ queryKey: ['parts'], queryFn: fetchParts });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Available Parts</h1>
        <p className="text-sm text-slate-500 mt-0.5">Browse our inventory of parts and accessories</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading…
        </div>
      ) : parts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Package size={36} className="mb-2 opacity-30" />
          <p className="text-sm">No parts available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parts.filter(p => p.stockQuantity > 0).map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-slate-800">{p.name}</p>
                {p.isLowStock && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                    <AlertTriangle size={9} /> Low
                  </span>
                )}
              </div>
              <div className="space-y-2 flex-grow">
                {p.description && <p className="text-xs text-slate-500">{p.description}</p>}
                {p.category && <span className="inline-flex text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.category}</span>}
                <p className="text-lg font-bold text-blue-600">NPR {Number(p.sellingPrice).toLocaleString()}</p>
                <p className="text-xs text-slate-400">In stock: {p.stockQuantity} units</p>
              </div>
              <button 
                onClick={() => navigate(`/customer/request-part?name=${encodeURIComponent(p.name)}`)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <ShoppingCart size={16} /> Request to Buy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
