import React, { useState } from 'react';
import { Search, ShoppingCart, Calendar, Phone, ChevronDown, User, ArrowUpRight } from 'lucide-react';


// Mock Data for Customer Sales
const CUSTOMER_SALES_DATA = [
{ id: 'c1', name: 'Alice Johnson', phone: '+1 (555) 101-2020', totalPurchases: 2, totalValue: 280000, lastPurchase: '2023-10-15', frequentModel: 'Sport Bike X1' },
{ id: 'c2', name: 'Mark Smith', phone: '+1 (555) 303-4040', totalPurchases: 1, totalValue: 85000, lastPurchase: '2023-09-22', frequentModel: 'Scooter Z' },
{ id: 'c3', name: 'David Lee', phone: '+1 (555) 505-6060', totalPurchases: 3, totalValue: 450000, lastPurchase: '2023-11-01', frequentModel: 'Cruiser 500' },
{ id: 'c4', name: 'Sarah Wilson', phone: '+1 (555) 707-8080', totalPurchases: 1, totalValue: 150000, lastPurchase: '2023-08-10', frequentModel: 'Sport Bike X1' },
{ id: 'c5', name: 'Michael Brown', phone: '+1 (555) 909-0000', totalPurchases: 2, totalValue: 170000, lastPurchase: '2023-10-05', frequentModel: 'Scooter Z' }];


const CUSTOMER_PURCHASE_HISTORY = [
{ customerId: 'c1', model: 'Sport Bike X1', date: '2023-10-15', amount: 150000 },
{ customerId: 'c1', model: 'Scooter Z', date: '2023-05-20', amount: 130000 }, // Price varies by configuration
{ customerId: 'c3', model: 'Cruiser 500', date: '2023-11-01', amount: 200000 },
{ customerId: 'c3', model: 'Sport Bike X1', date: '2023-06-15', amount: 150000 },
{ customerId: 'c3', model: 'Scooter Z', date: '2023-01-10', amount: 100000 }];


export function CustomerSalesDetails() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = CUSTOMER_SALES_DATA.filter((c) =>
  c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  c.phone.includes(searchTerm)
  );

  const getCustomerHistory = (id) => {
    return CUSTOMER_PURCHASE_HISTORY.filter((h) => h.customerId === id);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Customers</p>
              <h3 className="text-2xl font-bold text-slate-800">{CUSTOMER_SALES_DATA.length}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Repeat Buyers</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {CUSTOMER_SALES_DATA.filter((c) => c.totalPurchases > 1).length}
              </h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <ArrowUpRight size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Purchase Value</p>
              <h3 className="text-2xl font-bold text-slate-800">$185k</h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ShoppingCart size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Customer Sales Directory</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} />
              
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Total Buys</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Total Value</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Last Visit</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) =>
                <tr
                  key={customer.id}
                  className={`hover:bg-blue-50 transition-colors cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedCustomer(customer)}>
                  
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{customer.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone size={10} /> {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {customer.totalPurchases}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      ${customer.totalValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {customer.lastPurchase}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${selectedCustomer?.id === customer.id ? '-rotate-90' : ''}`} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail View */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-[600px] overflow-y-auto">
          {selectedCustomer ?
          <div className="space-y-6">
              <div className="text-center pb-6 border-b border-slate-100">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl mx-auto mb-3">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-slate-800">{selectedCustomer.name}</h2>
                <p className="text-slate-500 text-sm">{selectedCustomer.phone}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Spending Summary</h4>
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Lifetime Value</p>
                      <p className="font-bold text-slate-800">${selectedCustomer.totalValue.toLocaleString()}</p>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Favorite Model</p>
                      <p className="font-bold text-slate-800">{selectedCustomer.frequentModel}</p>
                   </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Purchase History</h4>
                <div className="space-y-3">
                  {getCustomerHistory(selectedCustomer.id).map((history, idx) =>
                <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:border-blue-200 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{history.model}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar size={10} /> {history.date}
                        </p>
                      </div>
                      <span className="font-medium text-green-600 text-sm">
                        +${history.amount.toLocaleString()}
                      </span>
                    </div>
                )}
                </div>
              </div>
            </div> :

          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
              <User size={48} className="mb-4 opacity-20" />
              <p>Select a customer to view detailed purchase history</p>
            </div>
          }
        </div>
      </div>
    </div>);

}