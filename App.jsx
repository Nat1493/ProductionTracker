import React, { useState } from 'react';
import { Plus, Calendar, Package, TrendingUp, X, Edit2, Save, Settings, Trash2, Target } from 'lucide-react';

const App = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: 'ORD-001',
      client: 'Fashion Hub Ltd',
      garmentType: 'T-Shirts',
      quantity: 5000,
      lineAssigned: 'Line 1',
      startDate: '2025-10-08',
      endDate: '2025-10-15',
      status: 'In Production',
      color: '#3B82F6'
    },
    {
      id: 2,
      orderNumber: 'ORD-002',
      client: 'StyleCo',
      garmentType: 'Dresses',
      quantity: 2000,
      lineAssigned: 'Line 2',
      startDate: '2025-10-09',
      endDate: '2025-10-20',
      status: 'In Production',
      color: '#10B981'
    }
  ]);

  const [productionLines, setProductionLines] = useState([
    { id: 1, name: 'Line 1', dailyTarget: 800 },
    { id: 2, name: 'Line 2', dailyTarget: 800 },
    { id: 3, name: 'Line 3', dailyTarget: 600 },
    { id: 4, name: 'Line 4', dailyTarget: 600 },
    { id: 5, name: 'Line 5', dailyTarget: 500 }
  ]);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showLineManager, setShowLineManager] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newLineName, setNewLineName] = useState('');
  const [newLineTarget, setNewLineTarget] = useState(800);

  const [newOrder, setNewOrder] = useState({
    orderNumber: '',
    client: '',
    garmentType: '',
    quantity: '',
    lineAssigned: productionLines[0]?.name || 'Line 1',
    startDate: '',
    endDate: '',
    status: 'Pending',
    color: '#8B5CF6'
  });

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  const handleAddOrder = () => {
    if (newOrder.orderNumber && newOrder.client && newOrder.startDate && newOrder.endDate) {
      setOrders([...orders, { ...newOrder, id: Date.now() }]);
      setNewOrder({
        orderNumber: '',
        client: '',
        garmentType: '',
        quantity: '',
        lineAssigned: productionLines[0]?.name || 'Line 1',
        startDate: '',
        endDate: '',
        status: 'Pending',
        color: colors[Math.floor(Math.random() * colors.length)]
      });
      setShowOrderForm(false);
    }
  };

  const handleUpdateOrder = () => {
    setOrders(orders.map(order => 
      order.id === editingOrder.id ? editingOrder : order
    ));
    setEditingOrder(null);
  };

  const handleDeleteOrder = (id) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  const handleAddLine = () => {
    if (newLineName.trim()) {
      const newLine = {
        id: Date.now(),
        name: newLineName.trim(),
        dailyTarget: parseInt(newLineTarget) || 800
      };
      setProductionLines([...productionLines, newLine]);
      setNewLineName('');
      setNewLineTarget(800);
    }
  };

  const handleDeleteLine = (lineId) => {
    const line = productionLines.find(l => l.id === lineId);
    const hasOrders = orders.some(order => order.lineAssigned === line.name);
    
    if (hasOrders) {
      alert(`Cannot delete ${line.name} because it has assigned orders. Please reassign or delete those orders first.`);
      return;
    }
    
    setProductionLines(productionLines.filter(l => l.id !== lineId));
  };

  const handleUpdateLineTarget = (lineId, newTarget) => {
    setProductionLines(productionLines.map(line =>
      line.id === lineId ? { ...line, dailyTarget: parseInt(newTarget) || 0 } : line
    ));
  };

  const getDaysBetween = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const getDateArray = (start, days) => {
    const dates = [];
    const startDate = new Date(start);
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const startDate = new Date('2025-10-07');
  const daysToShow = 21;
  const timelineDates = getDateArray(startDate.toISOString().split('T')[0], daysToShow);

  const getLineCapacity = (lineName) => {
    const lineOrders = orders.filter(order => order.lineAssigned === lineName);
    let bookedDays = 0;
    
    lineOrders.forEach(order => {
      const days = getDaysBetween(order.startDate, order.endDate);
      bookedDays += days;
    });
    
    const totalDays = daysToShow;
    return Math.round((bookedDays / totalDays) * 100);
  };

  const isDateBooked = (lineName, date) => {
    return orders.some(order => {
      if (order.lineAssigned !== lineName) return false;
      const orderStart = new Date(order.startDate);
      const orderEnd = new Date(order.endDate);
      const checkDate = new Date(date);
      return checkDate >= orderStart && checkDate <= orderEnd;
    });
  };

  const getOrderForDate = (lineName, date) => {
    return orders.find(order => {
      if (order.lineAssigned !== lineName) return false;
      const orderStart = new Date(order.startDate);
      const orderEnd = new Date(order.endDate);
      const checkDate = new Date(date);
      return checkDate >= orderStart && checkDate <= orderEnd;
    });
  };

  const checkTargetMet = (lineName, date, order) => {
    if (!order) return null;
    
    const line = productionLines.find(l => l.name === lineName);
    if (!line) return null;
    
    const days = getDaysBetween(order.startDate, order.endDate);
    const dailyRequired = Math.ceil(order.quantity / days);
    
    return {
      met: dailyRequired <= line.dailyTarget,
      dailyRequired,
      target: line.dailyTarget,
      difference: line.dailyTarget - dailyRequired
    };
  };

  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status === 'In Production').length;
  const totalQuantity = orders.reduce((sum, order) => sum + parseInt(order.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SS Mudyf Production Tracker</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time production line scheduling with target tracking</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLineManager(true)}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings size={20} />
                Manage Lines
              </button>
              <button
                onClick={() => setShowOrderForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                New Order
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Timeline Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-2">
                  <Package className="text-blue-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{activeOrders}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-2">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total Quantity</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalQuantity.toLocaleString()}</p>
                </div>
                <div className="bg-purple-100 rounded-lg p-2">
                  <Package className="text-purple-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Production Lines</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{productionLines.length}</p>
                </div>
                <div className="bg-orange-100 rounded-lg p-2">
                  <Calendar className="text-orange-600" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Production Timeline */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Production Line Schedule</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target size={16} />
                  <span>Daily targets monitored</span>
                </div>
              </div>
              
              {/* Line Capacity Overview */}
              <div className="mb-6 grid gap-3" style={{ gridTemplateColumns: `repeat(${productionLines.length}, minmax(0, 1fr))` }}>
                {productionLines.map(line => {
                  const capacity = getLineCapacity(line.name);
                  return (
                    <div key={line.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900">{line.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Target size={12} />
                          <span>{line.dailyTarget}/day</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              capacity >= 90 ? 'bg-red-500' :
                              capacity >= 70 ? 'bg-orange-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${capacity}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{capacity}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timeline Grid */}
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky left-0 bg-white border border-gray-300 px-4 py-3 text-left font-semibold text-sm z-10 min-w-[120px]">
                          Line / Target
                        </th>
                        {timelineDates.map(date => {
                          const d = new Date(date);
                          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                          const dayNum = d.getDate();
                          const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                          return (
                            <th
                              key={date}
                              className={`border border-gray-300 px-3 py-2 text-xs min-w-[70px] ${
                                isWeekend ? 'bg-gray-100' : 'bg-white'
                              }`}
                            >
                              <div className="text-center">
                                <div className="font-bold text-gray-900">{dayName}</div>
                                <div className="text-gray-600 font-semibold">{dayNum}</div>
                                <div className="text-gray-500 text-[10px]">{monthName}</div>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {productionLines.map(line => (
                        <tr key={line.id}>
                          <td className="sticky left-0 bg-white border border-gray-300 px-4 py-3 z-10">
                            <div className="font-semibold text-sm text-gray-900">{line.name}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                              <Target size={11} />
                              <span>{line.dailyTarget} pcs/day</span>
                            </div>
                          </td>
                          {timelineDates.map(date => {
                            const order = getOrderForDate(line.name, date);
                            const isBooked = isDateBooked(line.name, date);
                            const d = new Date(date);
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                            const targetStatus = order ? checkTargetMet(line.name, date, order) : null;
                            
                            return (
                              <td
                                key={date}
                                className={`border border-gray-300 p-0 h-24 relative ${
                                  isWeekend ? 'bg-gray-50' : ''
                                }`}
                              >
                                {isBooked && order ? (
                                  <div className="h-full relative">
                                    <div
                                      className="h-full flex flex-col items-center justify-center text-xs text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity p-1"
                                      style={{ backgroundColor: order.color }}
                                      title={`${order.orderNumber} - ${order.client}\n${order.garmentType} (${order.quantity} pcs)\nDaily Required: ${targetStatus?.dailyRequired} pcs\nTarget: ${targetStatus?.target} pcs`}
                                    >
                                      <span className="truncate w-full text-center text-[10px]">{order.orderNumber}</span>
                                      <span className="truncate w-full text-center text-[9px] opacity-90">{order.client}</span>
                                      {targetStatus && (
                                        <div className="mt-1 flex items-center gap-1">
                                          {targetStatus.met ? (
                                            <div className="bg-white bg-opacity-30 rounded-full px-2 py-0.5 flex items-center gap-1">
                                              <span className="text-[10px] font-bold">✓</span>
                                              <span className="text-[9px]">{targetStatus.dailyRequired}/day</span>
                                            </div>
                                          ) : (
                                            <div className="bg-red-500 bg-opacity-40 rounded-full px-2 py-0.5 flex items-center gap-1">
                                              <span className="text-[10px] font-bold">⚠</span>
                                              <span className="text-[9px]">{targetStatus.dailyRequired}/day</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {/* Target indicator badge */}
                                    {targetStatus && (
                                      <div className={`absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                                        targetStatus.met ? 'bg-green-500' : 'bg-red-500'
                                      }`}>
                                        {targetStatus.met ? '✓' : '!'}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center text-green-500 text-lg font-bold">
                                    {!isWeekend && '✓'}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 items-center text-sm">
                <span className="font-semibold text-gray-700">Legend:</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-50 border border-gray-300 rounded"></div>
                  <span className="text-gray-600">Weekend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white border border-gray-300 flex items-center justify-center text-green-500 font-bold rounded">✓</div>
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                  <span className="text-gray-600">Target Met</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">!</div>
                  <span className="text-gray-600">Over Target</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Order Summary */}
        <div className="w-96 bg-white border-l shadow-lg overflow-auto">
          <div className="sticky top-0 bg-white border-b p-4 z-10">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            <p className="text-sm text-gray-600 mt-1">{orders.length} total orders</p>
          </div>

          <div className="p-4 space-y-3">
            {orders.map(order => {
              const line = productionLines.find(l => l.name === order.lineAssigned);
              const days = getDaysBetween(order.startDate, order.endDate);
              const dailyRequired = Math.ceil(order.quantity / days);
              const targetMet = line ? dailyRequired <= line.dailyTarget : null;

              return (
                <div key={order.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors">
                  {editingOrder?.id === order.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingOrder.orderNumber}
                        onChange={(e) => setEditingOrder({...editingOrder, orderNumber: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                        placeholder="Order Number"
                      />
                      <input
                        type="text"
                        value={editingOrder.client}
                        onChange={(e) => setEditingOrder({...editingOrder, client: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                        placeholder="Client"
                      />
                      <input
                        type="text"
                        value={editingOrder.garmentType}
                        onChange={(e) => setEditingOrder({...editingOrder, garmentType: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                        placeholder="Garment Type"
                      />
                      <input
                        type="number"
                        value={editingOrder.quantity}
                        onChange={(e) => setEditingOrder({...editingOrder, quantity: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                        placeholder="Quantity"
                      />
                      <select
                        value={editingOrder.lineAssigned}
                        onChange={(e) => setEditingOrder({...editingOrder, lineAssigned: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                      >
                        {productionLines.map(line => (
                          <option key={line.id} value={line.name}>{line.name}</option>
                        ))}
                      </select>
                      <select
                        value={editingOrder.status}
                        onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Production">In Production</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <input
                        type="date"
                        value={editingOrder.startDate}
                        onChange={(e) => setEditingOrder({...editingOrder, startDate: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                      <input
                        type="date"
                        value={editingOrder.endDate}
                        onChange={(e) => setEditingOrder({...editingOrder, endDate: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateOrder}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-xs"
                        >
                          <Save size={14} />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingOrder(null)}
                          className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div 
                          className="w-1 h-12 rounded mr-3" 
                          style={{ backgroundColor: order.color }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-gray-900 text-sm">{order.orderNumber}</p>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingOrder(order)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 font-medium">{order.client}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium text-gray-900">{order.garmentType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Quantity:</span>
                          <span className="font-medium text-gray-900">{parseInt(order.quantity).toLocaleString()} pcs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Line:</span>
                          <span className="font-medium text-gray-900">{order.lineAssigned}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium text-gray-900">{days} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Daily Required:</span>
                          <span className="font-medium text-gray-900">{dailyRequired} pcs/day</span>
                        </div>
                        {line && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Target Status:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              targetMet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {targetMet ? '✓ Met' : '⚠ Over'}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Dates:</span>
                          <span className="text-gray-700 text-[10px]">{order.startDate} to {order.endDate}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-gray-500">Status:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            order.status === 'In Production' ? 'bg-green-100 text-green-700' :
                            order.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="mx-auto mb-3 text-gray-300" size={48} />
                <p className="text-sm">No orders yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "New Order" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Manager Modal */}
      {showLineManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Manage Production Lines</h2>
              <button
                onClick={() => setShowLineManager(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Existing Lines */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Existing Lines</h3>
                <div className="space-y-2">
                  {productionLines.map(line => (
                    <div key={line.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{line.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Target:</label>
                        <input
                          type="number"
                          value={line.dailyTarget}
                          onChange={(e) => handleUpdateLineTarget(line.id, e.target.value)}
                          className="w-24 px-3 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                        />
                        <span className="text-sm text-gray-600">pcs/day</span>
                      </div>
                      <button
                        onClick={() => handleDeleteLine(line.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Line */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Line</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newLineName}
                    onChange={(e) => setNewLineName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Line name (e.g., Line 6)"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 whitespace-nowrap">Target:</label>
                    <input
                      type="number"
                      value={newLineTarget}
                      onChange={(e) => setNewLineTarget(e.target.value)}
                      className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      placeholder="800"
                    />
                    <span className="text-sm text-gray-600">pcs/day</span>
                  </div>
                  <button
                    onClick={handleAddLine}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Add New Order</h2>
              <button
                onClick={() => setShowOrderForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    value={newOrder.orderNumber}
                    onChange={(e) => setNewOrder({...newOrder, orderNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., ORD-003"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={newOrder.client}
                    onChange={(e) => setNewOrder({...newOrder, client: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Fashion Retailer Inc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Garment Type
                  </label>
                  <input
                    type="text"
                    value={newOrder.garmentType}
                    onChange={(e) => setNewOrder({...newOrder, garmentType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Shirts, Pants, Jackets"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (pieces)
                  </label>
                  <input
                    type="number"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Production Line
                  </label>
                  <select
                    value={newOrder.lineAssigned}
                    onChange={(e) => setNewOrder({...newOrder, lineAssigned: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {productionLines.map(line => (
                      <option key={line.id} value={line.name}>{line.name} (Target: {line.dailyTarget}/day)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newOrder.status}
                    onChange={(e) => setNewOrder({...newOrder, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Production">In Production</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newOrder.startDate}
                    onChange={(e) => setNewOrder({...newOrder, startDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={newOrder.endDate}
                    onChange={(e) => setNewOrder({...newOrder, endDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddOrder}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Order
                </button>
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;