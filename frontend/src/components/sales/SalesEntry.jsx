import React from 'react';
import { useForm } from 'react-hook-form';
import { Bike, DollarSign, Calendar, User, Save } from 'lucide-react';

import { useToast } from '../ui/Toast';

export function SalesEntry() {
  const { register, handleSubmit, reset } = useForm();
  const { addToast } = useToast();

  const onSubmit = (data) => {
    console.log(data);
    addToast('Sales record saved successfully!', 'success');
    reset();
  };

  const INCENTIVE_DATA = [
  { range: '0-80%', rate: 0, current: false },
  { range: '81-100%', rate: 2, current: false },
  { range: '101-120%', rate: 4, current: true }, // Hypothetical current status
  { range: '120%+', rate: 6, current: false }];


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Bike className="text-blue-600" />
            New Sales Entry
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    {...register('customerName', { required: true })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="John Doe" />
                  
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Bike Model</label>
                <div className="relative">
                  <Bike className="absolute left-3 top-3 text-slate-400" size={18} />
                  <select
                    {...register('model', { required: true })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none">
                    
                    <option value="">Select Model...</option>
                    <option value="sport-x1">Sport Bike X1</option>
                    <option value="cruiser-500">Cruiser 500</option>
                    <option value="scooter-z">Scooter Z</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Sale Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="number"
                    {...register('amount', { required: true })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="0.00" />
                  
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="date"
                    {...register('date', { required: true })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                  
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                
                <Save size={18} />
                Record Sale
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 bg-slate-50">
                  <th className="p-3 font-semibold rounded-tl-lg">Customer</th>
                  <th className="p-3 font-semibold">Model</th>
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold text-right rounded-tr-lg">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {[1, 2, 3, 4].map((i) =>
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-800 font-medium">Robert Fox</td>
                    <td className="p-3 text-slate-600">Cruiser 500</td>
                    <td className="p-3 text-slate-500">Oct {10 + i}, 2023</td>
                    <td className="p-3 text-slate-800 font-bold text-right">$2,200</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-xl text-white shadow-lg">
          <h3 className="text-lg font-bold mb-1">Your Performance</h3>
          <p className="text-indigo-200 text-sm mb-6">October 2023</p>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-indigo-100">Target Achieved</span>
                <span className="font-bold">112%</span>
              </div>
              <div className="h-2 bg-indigo-900/40 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 w-[100%] rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <p className="text-xs text-indigo-200">Current Incentive</p>
                <p className="text-2xl font-bold mt-1">4%</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <p className="text-xs text-indigo-200">Bonus Earned</p>
                <p className="text-2xl font-bold mt-1">$450</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Incentive Structure</h3>
          <div className="space-y-3">
            {INCENTIVE_DATA.map((item, idx) =>
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-lg border ${item.current ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' : 'bg-white border-slate-100'}`}>
              
                <div>
                  <p className={`font-semibold ${item.current ? 'text-blue-800' : 'text-slate-700'}`}>{item.range}</p>
                  <p className="text-xs text-slate-500">Target Completion</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${item.current ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {item.rate}% Comm.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

}