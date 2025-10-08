import React, { useState } from 'react';
import { Plus, Calendar, Package, TrendingUp, X, Edit2, Save, Settings, Trash2, Target, Archive, CheckCircle, Clock, Upload } from 'lucide-react';

const App = () => {
  const isElectron = window.electronStore !== undefined;

  const loadFromStorage = async (key, defaultValue) => {
    if (isElectron) {
      const value = await window.electronStore.get(key);
      return value !== undefined ? value : defaultValue;
    }
    return defaultValue;
  };

  const saveToStorage = async (key, value) => {
    if (isElectron) {
      await window.electronStore.set(key, value);
    }
  };

  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: 'ORD-001',
      client: 'Fashion Hub Ltd',
      garmentType: 'T-Shirts',
      quantity: 5000,
      dailyTarget: 650,
      unitPrice: 8.50,
      image: '',
      complexity: 'easy',
      priority: 'high',
      notes: 'Cotton blend, standard sizing',
      linesAssigned: ['Line 1'],
      startDate: '2025-10-08',
      endDate: '2025-10-15',
      status: 'In Production',
      color: '#3B82F6',
      dailyProduction: {},
      hourlyProduction: {},
      hourlyRejects: {}
    }
  ]);

  const [completedOrders, setCompletedOrders] = useState([]);

  const [productionLines, setProductionLines] = useState([
    { id: 1, name: 'Line 1', operators: 10 },
    { id: 2, name: 'Line 2', operators: 10 },
    { id: 3, name: 'Line 3', operators: 8 },
    { id: 4, name: 'Line 4', operators: 8 },
    { id: 5, name: 'Line 5', operators: 8 }
  ]);

  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [workingHours, setWorkingHours] = useState(10);
  const [workStartHour, setWorkStartHour] = useState(7); // Start at 7 AM

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showLineManager, setShowLineManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProductionInput, setShowProductionInput] = useState(false);
  const [showHourlyInput, setShowHourlyInput] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedHourlyCell, setSelectedHourlyCell] = useState(null);
  const [productionInput, setProductionInput] = useState('');
  const [hourlyInputs, setHourlyInputs] = useState({});
  const [hourlyRejects, setHourlyRejects] = useState({});
  const [editingOrder, setEditingOrder] = useState(null);
  const [newLineName, setNewLineName] = useState('');
  const [newLineOperators, setNewLineOperators] = useState(10);
  const [activeTab, setActiveTab] = useState('active');
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [showFolderSettings, setShowFolderSettings] = useState(false);
  const [customFolder, setCustomFolder] = useState('');
  const [timelineStartDate, setTimelineStartDate] = useState(() => {
    // Start from current week's Monday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, else go to Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    return monday.toISOString().split('T')[0];
  });

  const [newOrder, setNewOrder] = useState({
    orderNumber: '',
    client: '',
    garmentType: '',
    quantity: '',
    dailyTarget: '',
    unitPrice: '',
    image: '',
    complexity: 'medium',
    priority: 'medium',
    notes: '',
    linesAssigned: [],
    startDate: '',
    endDate: '',
    status: 'Pending',
    color: '#8B5CF6',
    dailyProduction: {},
    hourlyProduction: {},
    hourlyRejects: {}
  });

  React.useEffect(() => {
    const loadData = async () => {
      if (isElectron) {
        const savedOrders = await loadFromStorage('orders', null);
        const savedCompleted = await loadFromStorage('completedOrders', []);
        const savedLines = await loadFromStorage('productionLines', null);
        const savedWeekends = await loadFromStorage('excludeWeekends', true);
        const savedHolidays = await loadFromStorage('holidays', []);
        const savedWorkingHours = await loadFromStorage('workingHours', 10);
        const savedWorkStartHour = await loadFromStorage('workStartHour', 7);
        const savedCustomFolder = await loadFromStorage('customFolder', '');

        if (savedOrders) setOrders(savedOrders);
        if (savedCompleted) setCompletedOrders(savedCompleted);
        if (savedLines) setProductionLines(savedLines);
        setExcludeWeekends(savedWeekends);
        setHolidays(savedHolidays);
        setWorkingHours(savedWorkingHours);
        setWorkStartHour(savedWorkStartHour);
        setCustomFolder(savedCustomFolder);
      }
    };
    loadData();
  }, []);

  React.useEffect(() => {
    saveToStorage('orders', orders);
  }, [orders]);

  React.useEffect(() => {
    saveToStorage('completedOrders', completedOrders);
  }, [completedOrders]);

  React.useEffect(() => {
    saveToStorage('productionLines', productionLines);
  }, [productionLines]);

  React.useEffect(() => {
    saveToStorage('excludeWeekends', excludeWeekends);
  }, [excludeWeekends]);

  React.useEffect(() => {
    saveToStorage('holidays', holidays);
  }, [holidays]);

  React.useEffect(() => {
    saveToStorage('workingHours', workingHours);
  }, [workingHours]);

  React.useEffect(() => {
    saveToStorage('workStartHour', workStartHour);
  }, [workStartHour]);

  React.useEffect(() => {
    saveToStorage('customFolder', customFolder);
  }, [customFolder]);

  const handleSelectFolder = async () => {
    // Check multiple possible APIs
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.selectFolder === 'function') {
      try {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
          setCustomFolder(folder);
          alert(`✅ Data location updated!\n\nNew location: ${folder}\n\n⚠️ Please restart the app for changes to take effect.`);
        }
      } catch (error) {
        console.error('Error selecting folder:', error);
        alert('Error selecting folder. Please check console for details.');
      }
    } else if (isElectron) {
      alert('⚠️ Folder selection API not available.\n\nPlease update your electron/preload.js file with:\n\ncontextBridge.exposeInMainWorld(\'electronAPI\', {\n  selectFolder: () => ipcRenderer.invoke(\'select-folder\')\n});');
    } else {
      alert('📱 Folder selection is only available in the desktop app.\n\nPlease use the Electron desktop version to access this feature.');
    }
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  const exportDailyReport = (date) => {
    let csvContent = "SS Mudyf Production Daily Report\n";
    csvContent += `Date: ${date}\n`;
    csvContent += `Work Hours: ${getTimeLabel(1).split('-')[0]} to ${getTimeLabel(workingHours).split('-')[1]}\n\n`;
    
    productionLines.forEach(line => {
      const order = getOrderForDate(line.name, date);
      if (order) {
        csvContent += `\n${line.name} - ${order.orderNumber} (${order.client})\n`;
        csvContent += "Hour,Time,Production,Rejects,Status\n";
        
        let totalProduction = 0;
        let totalRejects = 0;
        
        for (let hour = 1; hour <= workingHours; hour++) {
          const key = `${line.name}-${date}-${hour}`;
          const production = order.hourlyProduction?.[key] || 0;
          const rejects = order.hourlyRejects?.[key] || 0;
          const hourStatus = getHourlyStatus(order, line.name, date, hour);
          
          totalProduction += production;
          totalRejects += rejects;
          
          csvContent += `${hour},${getTimeLabel(hour)},${production},${rejects},${hourStatus?.emoji || '-'}\n`;
        }
        
        csvContent += `\nTotal,${totalProduction},${totalRejects}\n`;
        csvContent += `Target: ${checkTargetMet(order)?.dailyRequiredPerLine || 'N/A'} pcs\n`;
        csvContent += `Reject Rate: ${totalProduction > 0 ? ((totalRejects / totalProduction) * 100).toFixed(2) : 0}%\n`;
      }
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Production_Report_${date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTimeLabel = (hour) => {
    const startHour = workStartHour + hour - 1;
    const endHour = workStartHour + hour;
    
    const formatHour = (h) => {
      if (h === 12) return '12pm';
      if (h === 0 || h === 24) return '12am';
      const hour12 = h > 12 ? h - 12 : h;
      const ampm = h >= 12 && h < 24 ? 'pm' : 'am';
      return `${hour12}${ampm}`;
    };
    
    return `${formatHour(startHour)}-${formatHour(endHour)}`;
  };

  const isHoliday = (date) => {
    return holidays.some(h => h.date === date);
  };

  const isWorkingDay = (date) => {
    const d = new Date(date);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    
    if (excludeWeekends && isWeekend) return false;
    if (isHoliday(date)) return false;
    return true;
  };

  const handleImageUpload = (e, isNewOrder = true) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isNewOrder) {
          setNewOrder({ ...newOrder, image: reader.result });
        } else {
          setEditingOrder({ ...editingOrder, image: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddHoliday = () => {
    if (newHoliday.date && newHoliday.name) {
      setHolidays([...holidays, { ...newHoliday, id: Date.now() }]);
      setNewHoliday({ date: '', name: '' });
    }
  };

  const handleDeleteHoliday = (id) => {
    setHolidays(holidays.filter(h => h.id !== id));
  };

  const handleAddOrder = () => {
    if (newOrder.orderNumber && newOrder.client && newOrder.startDate && newOrder.endDate && newOrder.linesAssigned.length > 0) {
      setOrders([...orders, { ...newOrder, id: Date.now(), dailyProduction: {}, hourlyProduction: {}, hourlyRejects: {} }]);
      setNewOrder({
        orderNumber: '',
        client: '',
        garmentType: '',
        quantity: '',
        dailyTarget: '',
        unitPrice: '',
        image: '',
        complexity: 'medium',
        priority: 'medium',
        notes: '',
        linesAssigned: [],
        startDate: '',
        endDate: '',
        status: 'Pending',
        color: colors[Math.floor(Math.random() * colors.length)],
        dailyProduction: {},
        hourlyProduction: {},
        hourlyRejects: {}
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

  const handleCompleteOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const completedOrder = {
        ...order,
        status: 'Completed',
        completedDate: new Date().toISOString().split('T')[0]
      };
      setCompletedOrders([...completedOrders, completedOrder]);
      setOrders(orders.filter(o => o.id !== orderId));
    }
  };

  const handleRestoreOrder = (orderId) => {
    const order = completedOrders.find(o => o.id === orderId);
    if (order) {
      const restoredOrder = { ...order, status: 'In Production' };
      delete restoredOrder.completedDate;
      setOrders([...orders, restoredOrder]);
      setCompletedOrders(completedOrders.filter(o => o.id !== orderId));
    }
  };

  const handleDeleteCompletedOrder = (id) => {
    setCompletedOrders(completedOrders.filter(order => order.id !== id));
  };

  const handleAddLine = () => {
    if (newLineName.trim()) {
      const newLine = {
        id: Date.now(),
        name: newLineName.trim(),
        operators: parseInt(newLineOperators) || 10
      };
      setProductionLines([...productionLines, newLine]);
      setNewLineName('');
      setNewLineOperators(10);
    }
  };

  const handleDeleteLine = (lineId) => {
    const line = productionLines.find(l => l.id === lineId);
    const hasOrders = orders.some(order => order.linesAssigned.includes(line.name));
    
    if (hasOrders) {
      alert(`Cannot delete ${line.name} because it has assigned orders. Please reassign or delete those orders first.`);
      return;
    }
    
    setProductionLines(productionLines.filter(l => l.id !== lineId));
  };

  const toggleLineSelection = (lineName, isNewOrder = true) => {
    if (isNewOrder) {
      setNewOrder(prev => ({
        ...prev,
        linesAssigned: prev.linesAssigned.includes(lineName)
          ? prev.linesAssigned.filter(l => l !== lineName)
          : [...prev.linesAssigned, lineName]
      }));
    } else {
      setEditingOrder(prev => ({
        ...prev,
        linesAssigned: prev.linesAssigned.includes(lineName)
          ? prev.linesAssigned.filter(l => l !== lineName)
          : [...prev.linesAssigned, lineName]
      }));
    }
  };

  const handleCellClick = (order, line, date) => {
    if (!isWorkingDay(date)) return;
    setSelectedCell({ order, line, date });
    const key = `${line}-${date}`;
    setProductionInput(order.dailyProduction[key] || '');
    setShowProductionInput(true);
  };

  const handleHourlyCellClick = (order, line, date) => {
    if (!isWorkingDay(date)) return;
    setSelectedHourlyCell({ order, line, date });
    
    // Initialize hourly inputs and rejects from existing data
    const initialInputs = {};
    const initialRejects = {};
    for (let hour = 1; hour <= workingHours; hour++) {
      const key = `${line}-${date}-${hour}`;
      initialInputs[hour] = order.hourlyProduction?.[key] || '';
      initialRejects[hour] = order.hourlyRejects?.[key] || '';
    }
    setHourlyInputs(initialInputs);
    setHourlyRejects(initialRejects);
    setShowHourlyInput(true);
  };

  const handleSaveProduction = () => {
    if (selectedCell && productionInput !== '') {
      const { order, line, date } = selectedCell;
      const key = `${line}-${date}`;
      
      setOrders(orders.map(o => {
        if (o.id === order.id) {
          return {
            ...o,
            dailyProduction: {
              ...o.dailyProduction,
              [key]: parseInt(productionInput)
            }
          };
        }
        return o;
      }));
      
      setShowProductionInput(false);
      setSelectedCell(null);
      setProductionInput('');
    }
  };

  const handleSaveHourlyProduction = () => {
    if (selectedHourlyCell) {
      const { order, line, date } = selectedHourlyCell;
      const updatedHourlyProduction = { ...order.hourlyProduction };
      const updatedHourlyRejects = { ...order.hourlyRejects };
      
      for (let hour = 1; hour <= workingHours; hour++) {
        const key = `${line}-${date}-${hour}`;
        if (hourlyInputs[hour] !== '') {
          updatedHourlyProduction[key] = parseInt(hourlyInputs[hour]);
        }
        if (hourlyRejects[hour] !== '') {
          updatedHourlyRejects[key] = parseInt(hourlyRejects[hour]);
        }
      }
      
      // Calculate daily total from hourly data
      const dailyTotal = Object.values(hourlyInputs).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      const dailyKey = `${line}-${date}`;
      
      setOrders(orders.map(o => {
        if (o.id === order.id) {
          return {
            ...o,
            hourlyProduction: updatedHourlyProduction,
            hourlyRejects: updatedHourlyRejects,
            dailyProduction: {
              ...o.dailyProduction,
              [dailyKey]: dailyTotal
            }
          };
        }
        return o;
      }));
      
      setShowHourlyInput(false);
      setSelectedHourlyCell(null);
      setHourlyInputs({});
      setHourlyRejects({});
    }
  };

  const getHourlyTarget = (order) => {
    if (!order || !order.dailyTarget) return null;
    const targetStatus = checkTargetMet(order);
    if (!targetStatus) return null;
    return Math.ceil(targetStatus.dailyRequiredPerLine / workingHours);
  };

  const getHourlyStatus = (order, line, date, hour) => {
    const key = `${line}-${date}-${hour}`;
    const actual = order.hourlyProduction?.[key];
    if (actual === undefined) return null;
    
    const hourlyTarget = getHourlyTarget(order);
    if (!hourlyTarget) return { actual, emoji: '📊' };
    
    const percentage = (actual / hourlyTarget) * 100;
    
    if (percentage >= 100) return { actual, emoji: '🎉', status: 'excellent' };
    if (percentage >= 90) return { actual, emoji: '😊', status: 'good' };
    if (percentage >= 80) return { actual, emoji: '😐', status: 'ok' };
    if (percentage >= 70) return { actual, emoji: '😟', status: 'concern' };
    return { actual, emoji: '😰', status: 'poor' };
  };

  const getDaysBetween = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const getWorkingDays = (start, end) => {
    const dates = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (isWorkingDay(dateStr)) {
        dates.push(dateStr);
      }
    }
    return dates.length;
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

  const daysToShow = 21;
  const timelineDates = getDateArray(timelineStartDate, daysToShow);

  const navigateTimeline = (direction) => {
    const currentStart = new Date(timelineStartDate);
    if (direction === 'prev') {
      currentStart.setDate(currentStart.getDate() - 7); // Go back 1 week
    } else if (direction === 'next') {
      currentStart.setDate(currentStart.getDate() + 7); // Go forward 1 week
    } else if (direction === 'today') {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diff);
      setTimelineStartDate(monday.toISOString().split('T')[0]);
      return;
    }
    setTimelineStartDate(currentStart.toISOString().split('T')[0]);
  };

  const jumpToDate = (date) => {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(targetDate);
    monday.setDate(targetDate.getDate() + diff);
    setTimelineStartDate(monday.toISOString().split('T')[0]);
  };

  const getLineCapacity = (lineName) => {
    const lineOrders = orders.filter(order => order.linesAssigned.includes(lineName));
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
      if (!order.linesAssigned.includes(lineName)) return false;
      const orderStart = new Date(order.startDate);
      const orderEnd = new Date(order.endDate);
      const checkDate = new Date(date);
      return checkDate >= orderStart && checkDate <= orderEnd;
    });
  };

  const getOrderForDate = (lineName, date) => {
    return orders.find(order => {
      if (!order.linesAssigned.includes(lineName)) return false;
      const orderStart = new Date(order.startDate);
      const orderEnd = new Date(order.endDate);
      const checkDate = new Date(date);
      return checkDate >= orderStart && checkDate <= orderEnd;
    });
  };

  const checkTargetMet = (order) => {
    if (!order || !order.dailyTarget) return null;
    
    const workingDays = getWorkingDays(order.startDate, order.endDate);
    const numLines = order.linesAssigned.length;
    const dailyRequired = Math.ceil(order.quantity / workingDays);
    const dailyRequiredPerLine = Math.ceil(dailyRequired / numLines);
    
    return {
      met: dailyRequiredPerLine <= order.dailyTarget,
      dailyRequired,
      dailyRequiredPerLine,
      target: order.dailyTarget,
      numLines,
      workingDays,
      difference: order.dailyTarget - dailyRequiredPerLine
    };
  };

  const getProductionStatus = (order, line, date) => {
    const key = `${line}-${date}`;
    const actual = order.dailyProduction[key];
    
    if (actual === undefined) return null;
    
    const targetStatus = checkTargetMet(order);
    if (!targetStatus) return { actual, status: 'recorded' };
    
    const target = targetStatus.dailyRequiredPerLine;
    
    if (actual >= target) return { actual, status: 'met', target };
    if (actual >= target * 0.8) return { actual, status: 'close', target };
    return { actual, status: 'below', target };
  };

  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status === 'In Production').length;
  const totalQuantity = orders.reduce((sum, order) => sum + parseInt(order.quantity || 0), 0);
  const totalValue = orders.reduce((sum, order) => {
    const qty = parseInt(order.quantity || 0);
    const price = parseFloat(order.unitPrice || 0);
    return sum + (qty * price);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SS Mudyf Production Tracker</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time production line scheduling with time-based hourly tracking</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDailyReport(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Package size={20} />
                Daily Report
              </button>
              <button
                onClick={() => setShowScoreboard(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <TrendingUp size={20} />
                Scoreboard
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Settings size={20} />
                Settings
              </button>
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
        <div className="flex-1 overflow-auto p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'active' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              <Package size={18} />
              Active Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'completed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              <Archive size={18} />
              Completed Orders ({completedOrders.length})
            </button>
          </div>

          {activeTab === 'active' ? (
            <>
              <div className="grid grid-cols-5 gap-4 mb-6">
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
                      <p className="text-xs text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">E{totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                    <div className="bg-emerald-100 rounded-lg p-2">
                      <TrendingUp className="text-emerald-600" size={20} />
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

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Production Line Schedule</h2>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} />
                        <span>Click cells for time-based tracking</span>
                      </div>
                      {excludeWeekends && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Weekends Excluded</span>
                      )}
                    </div>
                  </div>

                  {/* Timeline Navigation */}
                  <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateTimeline('prev')}
                        className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        ← Previous Week
                      </button>
                      <button
                        onClick={() => navigateTimeline('today')}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Calendar size={16} />
                        Today
                      </button>
                      <button
                        onClick={() => navigateTimeline('next')}
                        className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Next Week →
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Viewing:</span> {' '}
                        {new Date(timelineDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {' '}
                        {new Date(timelineDates[timelineDates.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Jump to:</label>
                        <input
                          type="date"
                          onChange={(e) => jumpToDate(e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6 grid gap-3" style={{ gridTemplateColumns: `repeat(${productionLines.length}, minmax(0, 1fr))` }}>
                    {productionLines.map(line => {
                      const capacity = getLineCapacity(line.name);
                      const lineOrders = orders.filter(o => o.linesAssigned.includes(line.name) && o.status === 'In Production');
                      
                      return (
                        <div key={line.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{line.name}</p>
                              <p className="text-xs text-gray-500">👥 {line.operators || 0} operators</p>
                            </div>
                            <span className="text-xs text-gray-600">{lineOrders.length} orders</span>
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

                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="sticky left-0 bg-white border border-gray-300 px-4 py-3 text-left font-semibold text-sm z-10 min-w-[100px]">
                              Line
                            </th>
                            {timelineDates.map(date => {
                              const d = new Date(date);
                              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                              const dayNum = d.getDate();
                              const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                              const isNonWorking = !isWorkingDay(date);
                              const holiday = holidays.find(h => h.date === date);
                              const isToday = date === new Date().toISOString().split('T')[0];
                              
                              return (
                                <th
                                  key={date}
                                  className={`border border-gray-300 px-3 py-2 text-xs min-w-[70px] ${
                                    isNonWorking ? 'bg-red-50' : 
                                    isToday ? 'bg-blue-100' : 'bg-white'
                                  }`}
                                  title={holiday ? holiday.name : isToday ? 'Today' : ''}
                                >
                                  <div className="text-center">
                                    <div className={`font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                                      {dayName}
                                      {isToday && ' 📍'}
                                    </div>
                                    <div className={`font-semibold ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{dayNum}</div>
                                    <div className="text-gray-500 text-[10px]">{monthName}</div>
                                    {holiday && <div className="text-red-600 text-[8px] font-bold">HOLIDAY</div>}
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
                              </td>
                              {timelineDates.map(date => {
                                const order = getOrderForDate(line.name, date);
                                const isBooked = isDateBooked(line.name, date);
                                const isNonWorking = !isWorkingDay(date);
                                const targetStatus = order ? checkTargetMet(order) : null;
                                const productionStatus = order ? getProductionStatus(order, line.name, date) : null;
                                const hourlyTarget = order ? getHourlyTarget(order) : null;
                                
                                // Get hourly emojis for the day
                                const hourlyEmojis = [];
                                if (order && isWorkingDay(date)) {
                                  for (let hour = 1; hour <= workingHours; hour++) {
                                    const hourStatus = getHourlyStatus(order, line.name, date, hour);
                                    if (hourStatus) {
                                      hourlyEmojis.push(hourStatus.emoji);
                                    }
                                  }
                                }
                                
                                return (
                                  <td
                                    key={date}
                                    className={`border border-gray-300 p-0 h-24 relative ${
                                      isNonWorking ? 'bg-red-50' : ''
                                    }`}
                                    onClick={() => isBooked && order && isWorkingDay(date) && handleHourlyCellClick(order, line.name, date)}
                                  >
                                    {isBooked && order ? (
                                      <div className="h-full relative">
                                        <div
                                          className="h-full flex flex-col items-center justify-center text-xs text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity p-1"
                                          style={{ backgroundColor: order.color }}
                                          title={`${order.orderNumber} - Click for time-based tracking\nHourly Target: ${hourlyTarget || 'N/A'} pcs/hour\nWork Hours: ${getTimeLabel(1)} to ${getTimeLabel(workingHours).split('-')[1]}`}
                                        >
                                          <span className="truncate w-full text-center text-[10px]">{order.orderNumber}</span>
                                          {productionStatus ? (
                                            <div className={`mt-1 px-2 py-1 rounded text-[9px] font-bold ${
                                              productionStatus.status === 'met' ? 'bg-green-500' :
                                              productionStatus.status === 'close' ? 'bg-yellow-500' :
                                              'bg-red-500'
                                            }`}>
                                              {productionStatus.actual} pcs
                                            </div>
                                          ) : (
                                            isWorkingDay(date) && (
                                              <div className="mt-1 text-[9px] opacity-75">Click to track</div>
                                            )
                                          )}
                                          {hourlyEmojis.length > 0 && (
                                            <div className="mt-1 flex gap-0.5 flex-wrap justify-center">
                                              {hourlyEmojis.map((emoji, idx) => (
                                                <span key={idx} className="text-[10px]">{emoji}</span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="h-full flex items-center justify-center text-green-500 text-lg font-bold">
                                        {!isNonWorking && '✓'}
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

                  <div className="mt-6 flex flex-wrap gap-4 items-center text-sm">
                    <span className="font-semibold text-gray-700">Legend:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-red-50 border border-gray-300 rounded"></div>
                      <span className="text-gray-600">Non-Working Day</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-white border border-gray-300 flex items-center justify-center text-green-500 font-bold rounded">✓</div>
                      <span className="text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎉</span>
                      <span className="text-gray-600">100%+ hourly target</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">😊</span>
                      <span className="text-gray-600">90%+ target</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">😟</span>
                      <span className="text-gray-600">70-80% target</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">😰</span>
                      <span className="text-gray-600">&lt;70% target</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Completed Orders Archive</h2>
              <div className="space-y-3">
                {completedOrders.map(order => {
                  const orderValue = (parseInt(order.quantity || 0) * parseFloat(order.unitPrice || 0));
                  return (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 flex gap-3">
                          <div className="w-1 h-20 rounded" style={{ backgroundColor: order.color }}></div>
                          
                          {order.image && (
                            <img 
                              src={order.image} 
                              alt={order.garmentType}
                              className="w-16 h-16 object-cover rounded border border-gray-200"
                            />
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div>
                                <p className="font-bold text-gray-900">{order.orderNumber}</p>
                                <p className="text-sm text-gray-600">{order.client}</p>
                                <p className="text-xs text-gray-500">{order.garmentType}</p>
                              </div>
                              <div className="flex gap-2">
                                {order.priority && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                    order.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    order.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {order.priority.toUpperCase()}
                                  </span>
                                )}
                                {order.complexity && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                    order.complexity === 'hard' ? 'bg-purple-100 text-purple-700' :
                                    order.complexity === 'medium' ? 'bg-blue-100 text-blue-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {order.complexity.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm ml-0">
                              <div>
                                <span className="text-gray-500">Quantity:</span>
                                <span className="ml-2 font-medium">{parseInt(order.quantity).toLocaleString()} pcs</span>
                              </div>
                              {order.unitPrice && (
                                <div>
                                  <span className="text-gray-500">Value:</span>
                                  <span className="ml-2 font-semibold text-emerald-600">E{orderValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-500">Lines:</span>
                                <span className="ml-2 font-medium">{order.linesAssigned.join(', ')}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Completed:</span>
                                <span className="ml-2 font-medium">{order.completedDate}</span>
                              </div>
                            </div>
                            {order.notes && (
                              <p className="text-xs text-gray-600 italic mt-2">{order.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleRestoreOrder(order.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Restore to Active"
                          >
                            <TrendingUp size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCompletedOrder(order.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Permanently"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {completedOrders.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Archive className="mx-auto mb-3 text-gray-300" size={48} />
                    <p className="text-sm">No completed orders yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-96 bg-white border-l shadow-lg overflow-auto">
          <div className="sticky top-0 bg-white border-b p-4 z-10">
            <h2 className="text-lg font-semibold text-gray-900">Active Orders</h2>
            <p className="text-sm text-gray-600 mt-1">{orders.length} orders in production</p>
          </div>

          <div className="p-4 space-y-3">
            {orders.map(order => {
              const targetStatus = checkTargetMet(order);
              const orderValue = (parseInt(order.quantity || 0) * parseFloat(order.unitPrice || 0));

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
                      <input
                        type="number"
                        step="0.01"
                        value={editingOrder.unitPrice}
                        onChange={(e) => setEditingOrder({...editingOrder, unitPrice: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                        placeholder="Unit Price"
                      />
                      
                      <div className="border rounded p-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Upload Image:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false)}
                          className="w-full text-xs"
                        />
                        {editingOrder.image && (
                          <img src={editingOrder.image} alt="Preview" className="w-16 h-16 object-cover rounded mt-2" />
                        )}
                      </div>

                      <select
                        value={editingOrder.complexity}
                        onChange={(e) => setEditingOrder({...editingOrder, complexity: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                      <select
                        value={editingOrder.priority}
                        onChange={(e) => setEditingOrder({...editingOrder, priority: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                      <input
                        type="number"
                        value={editingOrder.dailyTarget}
                        onChange={(e) => setEditingOrder({...editingOrder, dailyTarget: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                        placeholder="Daily Target (pcs/line/day)"
                      />
                      <textarea
                        value={editingOrder.notes}
                        onChange={(e) => setEditingOrder({...editingOrder, notes: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                        placeholder="Notes"
                        rows="2"
                      />
                      <div className="border rounded p-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Production Lines:</label>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {productionLines.map(line => (
                            <label key={line.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-100 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={editingOrder.linesAssigned.includes(line.name)}
                                onChange={() => toggleLineSelection(line.name, false)}
                                className="rounded"
                              />
                              <span>{line.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <select
                        value={editingOrder.status}
                        onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-xs"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Production">In Production</option>
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
                      <div className="flex items-start gap-3 mb-2">
                        <div 
                          className="w-1 h-20 rounded flex-shrink-0" 
                          style={{ backgroundColor: order.color }}
                        ></div>
                        
                        {order.image && (
                          <img 
                            src={order.image} 
                            alt={order.garmentType}
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                          />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-gray-900 text-sm truncate">{order.orderNumber}</p>
                            <div className="flex gap-1 flex-shrink-0 ml-2">
                              <button
                                onClick={() => handleCompleteOrder(order.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Mark as Completed"
                              >
                                <CheckCircle size={14} />
                              </button>
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
                          <p className="text-xs text-gray-600 font-medium truncate">{order.client}</p>
                          <div className="flex gap-2 mt-1">
                            {order.priority && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                order.priority === 'high' ? 'bg-red-100 text-red-700' :
                                order.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {order.priority.toUpperCase()}
                              </span>
                            )}
                            {order.complexity && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                order.complexity === 'hard' ? 'bg-purple-100 text-purple-700' :
                                order.complexity === 'medium' ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {order.complexity.toUpperCase()}
                              </span>
                            )}
                          </div>
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
                        {order.unitPrice && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Unit Price:</span>
                              <span className="font-medium text-gray-900">E{parseFloat(order.unitPrice).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Order Value:</span>
                              <span className="font-semibold text-emerald-600">E{orderValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Lines:</span>
                          <span className="font-medium text-gray-900">{order.linesAssigned.join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Working Days:</span>
                          <span className="font-medium text-gray-900">{targetStatus?.workingDays} days</span>
                        </div>
                        {targetStatus && targetStatus.numLines > 1 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Per Line Required:</span>
                            <span className="font-medium text-gray-900">{targetStatus.dailyRequiredPerLine} pcs/day</span>
                          </div>
                        )}
                        {order.dailyTarget && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Target Per Line:</span>
                              <span className="font-medium text-gray-900">{order.dailyTarget} pcs/day</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Hourly Target:</span>
                              <span className="font-medium text-gray-900">{getHourlyTarget(order) || 'N/A'} pcs/hr</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Target Status:</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                                targetStatus?.met ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {targetStatus?.met ? '✓ Met' : '⚠ Over'}
                              </span>
                            </div>
                          </>
                        )}
                        {order.notes && (
                          <div className="pt-1 border-t border-gray-200">
                            <span className="text-gray-500">Notes:</span>
                            <p className="text-gray-700 mt-0.5 text-[11px] italic">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="mx-auto mb-3 text-gray-300" size={48} />
                <p className="text-sm">No active orders</p>
                <p className="text-xs text-gray-400 mt-1">Click "New Order" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scoreboard View */}
      {showScoreboard && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 z-50 flex flex-col">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Production Scoreboard</h1>
              <p className="text-blue-200 text-sm md:text-base">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => setShowScoreboard(false)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <X size={24} />
              Close
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-[1920px] mx-auto">
              {/* Export Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    exportDailyReport(today);
                  }}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Package size={20} />
                  Export Today's Report
                </button>
              </div>

              {/* Lines Grid */}
              <div className="space-y-4 mb-6">
                {productionLines.map(line => {
                  const today = new Date().toISOString().split('T')[0];
                  const order = getOrderForDate(line.name, today);
                  
                  if (!order) {
                    return (
                      <div key={line.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl md:text-2xl font-bold text-white">{line.name}</h2>
                          <span className="text-gray-300 text-sm md:text-base">No active order</span>
                        </div>
                      </div>
                    );
                  }

                  const hourlyTarget = getHourlyTarget(order);
                  const targetStatus = checkTargetMet(order);

                  return (
                    <div key={line.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                        <div>
                          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{line.name}</h2>
                          <p className="text-blue-200 text-xs md:text-sm">
                            {order.orderNumber} - {order.client}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-blue-200">Target/hour</p>
                          <p className="text-lg md:text-xl lg:text-2xl font-bold text-white">{hourlyTarget || 'N/A'} pcs</p>
                        </div>
                      </div>

                      {/* Hourly Performance - Responsive Grid */}
                      <div 
                        className="grid gap-2 mb-3"
                        style={{ 
                          gridTemplateColumns: workingHours <= 8 
                            ? `repeat(${workingHours}, minmax(0, 1fr))` 
                            : workingHours <= 12 
                            ? 'repeat(auto-fit, minmax(80px, 1fr))'
                            : 'repeat(auto-fit, minmax(70px, 1fr))'
                        }}
                      >
                        {Array.from({ length: workingHours }, (_, i) => i + 1).map(hour => {
                          const hourStatus = getHourlyStatus(order, line.name, today, hour);
                          const timeLabel = getTimeLabel(hour);
                          const key = `${line.name}-${today}-${hour}`;
                          const rejects = order.hourlyRejects?.[key] || 0;
                          
                          return (
                            <div
                              key={hour}
                              className={`rounded-lg p-2 md:p-3 text-center transition-all ${
                                hourStatus 
                                  ? hourStatus.status === 'excellent' 
                                    ? 'bg-green-500/20 border-2 border-green-400' 
                                    : hourStatus.status === 'good'
                                    ? 'bg-green-500/10 border-2 border-green-500'
                                    : hourStatus.status === 'ok'
                                    ? 'bg-yellow-500/10 border-2 border-yellow-500'
                                    : hourStatus.status === 'concern'
                                    ? 'bg-orange-500/10 border-2 border-orange-500'
                                    : 'bg-red-500/10 border-2 border-red-500'
                                  : 'bg-white/5 border-2 border-white/10'
                              }`}
                            >
                              <div className="text-[10px] md:text-xs text-blue-200 mb-1">{timeLabel}</div>
                              {hourStatus ? (
                                <>
                                  <div className="text-xl md:text-2xl lg:text-3xl mb-1">{hourStatus.emoji}</div>
                                  <div className="text-base md:text-lg lg:text-xl font-bold text-white">{hourStatus.actual}</div>
                                  <div className="text-[10px] md:text-xs text-blue-300">pcs</div>
                                  {rejects > 0 && (
                                    <div className="text-[10px] md:text-xs text-red-400 mt-1">
                                      ❌ {rejects}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="text-lg md:text-xl lg:text-2xl mb-1">⏱️</div>
                                  <div className="text-xs text-gray-400">Wait</div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Line Summary */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex gap-4 md:gap-6">
                          <div>
                            <p className="text-[10px] md:text-xs text-blue-200">Production</p>
                            <p className="text-lg md:text-xl lg:text-2xl font-bold text-white">
                              {order.dailyProduction?.[`${line.name}-${today}`] || 0} pcs
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] md:text-xs text-red-200">Rejects</p>
                            <p className="text-lg md:text-xl lg:text-2xl font-bold text-red-400">
                              {(() => {
                                let total = 0;
                                for (let h = 1; h <= workingHours; h++) {
                                  const key = `${line.name}-${today}-${h}`;
                                  total += order.hourlyRejects?.[key] || 0;
                                }
                                return total;
                              })()} pcs
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] md:text-xs text-blue-200">Target</p>
                            <p className="text-lg md:text-xl lg:text-2xl font-bold text-white">
                              {targetStatus?.dailyRequiredPerLine || 0} pcs
                            </p>
                          </div>
                        </div>
                        <div>
                          {order.dailyProduction?.[`${line.name}-${today}`] >= (targetStatus?.dailyRequiredPerLine || 0) ? (
                            <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
                              <span className="text-xl md:text-2xl">✅</span>
                              <span className="text-green-300 font-semibold text-sm md:text-base">Target Met!</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
                              <span className="text-xl md:text-2xl">⚡</span>
                              <span className="text-orange-300 font-semibold text-sm md:text-base">In Progress</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall Statistics */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Today's Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6">
                  <div className="text-center">
                    <p className="text-blue-200 text-xs md:text-sm mb-1 md:mb-2">Total Production</p>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                      {productionLines.reduce((sum, line) => {
                        const today = new Date().toISOString().split('T')[0];
                        const order = getOrderForDate(line.name, today);
                        return sum + (order?.dailyProduction?.[`${line.name}-${today}`] || 0);
                      }, 0)} pcs
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-200 text-xs md:text-sm mb-1 md:mb-2">Total Rejects</p>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-red-400">
                      {(() => {
                        const today = new Date().toISOString().split('T')[0];
                        let totalRejects = 0;
                        productionLines.forEach(line => {
                          const order = getOrderForDate(line.name, today);
                          if (order) {
                            for (let h = 1; h <= workingHours; h++) {
                              const key = `${line.name}-${today}-${h}`;
                              totalRejects += order.hourlyRejects?.[key] || 0;
                            }
                          }
                        });
                        return totalRejects;
                      })()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-200 text-xs md:text-sm mb-1 md:mb-2">Active Lines</p>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                      {productionLines.filter(line => {
                        const today = new Date().toISOString().split('T')[0];
                        return getOrderForDate(line.name, today);
                      }).length}/{productionLines.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-200 text-xs md:text-sm mb-1 md:mb-2">Work Hours</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                      {getTimeLabel(1).split('-')[0]}-{getTimeLabel(workingHours).split('-')[1]}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-200 text-xs md:text-sm mb-1 md:mb-2">Efficiency</p>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                      {(() => {
                        const today = new Date().toISOString().split('T')[0];
                        let totalActual = 0;
                        let totalTarget = 0;
                        productionLines.forEach(line => {
                          const order = getOrderForDate(line.name, today);
                          if (order) {
                            totalActual += order.dailyProduction?.[`${line.name}-${today}`] || 0;
                            const targetStatus = checkTargetMet(order);
                            totalTarget += targetStatus?.dailyRequiredPerLine || 0;
                          }
                        });
                        const efficiency = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;
                        return `${efficiency}%`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hourly Production Input Modal */}
      {showHourlyInput && selectedHourlyCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Time-Based Hourly Production Tracking</h3>
                <button
                  onClick={() => {
                    setShowHourlyInput(false);
                    setSelectedHourlyCell(null);
                    setHourlyInputs({});
                    setHourlyRejects({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Order:</span> {selectedHourlyCell.order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Line:</span> {selectedHourlyCell.line}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Date:</span> {selectedHourlyCell.date}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Work Hours:</span> {getTimeLabel(1)} to {getTimeLabel(workingHours).split('-')[1]} ({workingHours} hours)
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Hourly Target:</span> {getHourlyTarget(selectedHourlyCell.order) || 'N/A'} pcs/hour
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: workingHours }, (_, i) => i + 1).map(hour => {
                    const currentValue = hourlyInputs[hour] || '';
                    const currentRejects = hourlyRejects[hour] || '';
                    const hourlyTarget = getHourlyTarget(selectedHourlyCell.order);
                    let emoji = '📊';
                    
                    if (currentValue && hourlyTarget) {
                      const percentage = (parseInt(currentValue) / hourlyTarget) * 100;
                      if (percentage >= 100) emoji = '🎉';
                      else if (percentage >= 90) emoji = '😊';
                      else if (percentage >= 80) emoji = '😐';
                      else if (percentage >= 70) emoji = '😟';
                      else emoji = '😰';
                    }

                    return (
                      <div key={hour} className="border rounded-lg p-3 bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {getTimeLabel(hour)} <span className="text-lg ml-1">{emoji}</span>
                        </label>
                        <input
                          type="number"
                          value={hourlyInputs[hour] || ''}
                          onChange={(e) => setHourlyInputs({...hourlyInputs, [hour]: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                          placeholder="Production"
                        />
                        <input
                          type="number"
                          value={hourlyRejects[hour] || ''}
                          onChange={(e) => setHourlyRejects({...hourlyRejects, [hour]: e.target.value})}
                          className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="Rejects"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold text-gray-700">Daily Total:</span>
                      <span className="text-xl font-bold text-blue-600 ml-2">
                        {Object.values(hourlyInputs).reduce((sum, val) => sum + (parseInt(val) || 0), 0)} pcs
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Total Rejects:</span>
                      <span className="text-xl font-bold text-red-600 ml-2">
                        {Object.values(hourlyRejects).reduce((sum, val) => sum + (parseInt(val) || 0), 0)} pcs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveHourlyProduction}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save Hourly Data
                  </button>
                  <button
                    onClick={() => {
                      setShowHourlyInput(false);
                      setSelectedHourlyCell(null);
                      setHourlyInputs({});
                      setHourlyRejects({});
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Report Modal */}
      {showDailyReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-semibold">Daily Production Report</h2>
              <button
                onClick={() => setShowDailyReport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => exportDailyReport(reportDate)}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Package size={20} />
                  Export to CSV
                </button>
              </div>

              {productionLines.map(line => {
                const order = getOrderForDate(line.name, reportDate);
                if (!order) return null;

                const targetStatus = checkTargetMet(order);
                let totalProduction = 0;
                let totalRejects = 0;

                return (
                  <div key={line.id} className="mb-6 bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{line.name}</h3>
                        <p className="text-sm text-gray-600">{order.orderNumber} - {order.client}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Hourly Target</p>
                        <p className="text-lg font-bold text-gray-900">{getHourlyTarget(order) || 'N/A'} pcs</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Production</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Rejects</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Good Pieces</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: workingHours }, (_, i) => i + 1).map(hour => {
                            const key = `${line.name}-${reportDate}-${hour}`;
                            const production = order.hourlyProduction?.[key] || 0;
                            const rejects = order.hourlyRejects?.[key] || 0;
                            const good = production - rejects;
                            const hourStatus = getHourlyStatus(order, line.name, reportDate, hour);

                            totalProduction += production;
                            totalRejects += rejects;

                            return (
                              <tr key={hour} className="hover:bg-gray-100">
                                <td className="border border-gray-300 px-4 py-2">{getTimeLabel(hour)}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center font-semibold">{production}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center text-red-600 font-semibold">{rejects}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center text-green-600 font-semibold">{good}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center text-2xl">{hourStatus?.emoji || '-'}</td>
                              </tr>
                            );
                          })}
                          <tr className="bg-blue-50 font-bold">
                            <td className="border border-gray-300 px-4 py-2">TOTAL</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{totalProduction}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-red-600">{totalRejects}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-green-600">{totalProduction - totalRejects}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {totalProduction >= (targetStatus?.dailyRequiredPerLine || 0) ? '✅' : '⚠️'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600">Daily Target</p>
                        <p className="text-lg font-bold text-gray-900">{targetStatus?.dailyRequiredPerLine || 'N/A'} pcs</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600">Reject Rate</p>
                        <p className="text-lg font-bold text-red-600">
                          {totalProduction > 0 ? ((totalRejects / totalProduction) * 100).toFixed(2) : 0}%
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600">Efficiency</p>
                        <p className="text-lg font-bold text-blue-600">
                          {targetStatus?.dailyRequiredPerLine > 0 ? ((totalProduction / targetStatus.dailyRequiredPerLine) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Settings/Holidays Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h2 className="text-xl font-semibold">Production Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto" style={{ flex: 1 }}>
              <div className="p-6 space-y-6">
                {/* Weekend Toggle */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeWeekends}
                      onChange={(e) => setExcludeWeekends(e.target.checked)}
                      className="w-5 h-5 rounded text-blue-600"
                    />
                    <div>
                      <span className="font-semibold text-gray-900">Exclude Weekends</span>
                      <p className="text-xs text-gray-600">Don't schedule production on Saturdays and Sundays</p>
                    </div>
                  </label>
                </div>

                {/* Data Storage Location */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">💾 Data Storage Location</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Set a custom folder to save production data (e.g., network drive for multi-PC access)
                  </p>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Current location:</p>
                        <p className="text-sm font-mono text-gray-900 break-all">
                          {customFolder || 'Default (User Data)'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSelectFolder}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      <Settings size={18} />
                      Select Folder
                    </button>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      <strong>💡 Network Folder Setup:</strong> To share data across multiple computers, select a folder on your network drive (e.g., \\server\production). All PCs must have access to this folder.
                    </p>
                  </div>
                </div>

                {/* Working Hours Configuration */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">⏰ Working Hours Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Start Time
                      </label>
                      <select
                        value={workStartHour}
                        onChange={(e) => setWorkStartHour(parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: 13 }, (_, i) => i + 5).map(hour => {
                          const display = hour === 12 ? '12:00 PM' : 
                                         hour > 12 ? `${hour - 12}:00 PM` : 
                                         `${hour}:00 AM`;
                          return (
                            <option key={hour} value={hour}>{display}</option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Working Hours
                      </label>
                      <select
                        value={workingHours}
                        onChange={(e) => setWorkingHours(parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: 13 }, (_, i) => i + 6).map(hours => {
                          const label = hours > 8 ? 'Overtime' : hours < 8 ? 'Undertime' : 'Standard';
                          return (
                            <option key={hours} value={hours}>
                              {hours} hours ({label})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      📅 Current Schedule: {getTimeLabel(1)} to {getTimeLabel(workingHours).split('-')[1]}
                    </p>
                    <p className="text-xs text-blue-700">
                      {workingHours} hours total ({workingHours > 8 ? 'Overtime' : workingHours < 8 ? 'Undertime' : 'Standard'})
                    </p>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-2">💡 Common Schedule Examples:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Standard: 7am-3pm (8 hours)</li>
                      <li>• Until 5pm: 7am-5pm (10 hours overtime)</li>
                      <li>• Early Shift: 6am-2pm (8 hours)</li>
                      <li>• Extended: 6am-5pm (11 hours overtime)</li>
                      <li>• Full Day: 7am-6pm (11 hours overtime)</li>
                    </ul>
                  </div>
                </div>

                {/* Holidays */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Public Holidays</h3>
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {holidays.map(holiday => (
                      <div key={holiday.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <p className="font-semibold text-gray-900">{holiday.name}</p>
                          <p className="text-xs text-gray-600">{holiday.date}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={newHoliday.date}
                        onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={newHoliday.name}
                        onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Holiday name"
                      />
                    </div>
                    <button
                      onClick={handleAddHoliday}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={20} />
                      Add Holiday
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Existing Lines</h3>
                <div className="space-y-2">
                  {productionLines.map(line => {
                    const lineOrders = orders.filter(o => o.linesAssigned.includes(line.name));
                    return (
                      <div key={line.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{line.name}</p>
                          <div className="flex gap-4 text-xs text-gray-600 mt-1">
                            <span>{lineOrders.length} assigned orders</span>
                            <span>👥 {line.operators || 0} operators</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={line.operators || 0}
                            onChange={(e) => {
                              const updatedLines = productionLines.map(l => 
                                l.id === line.id ? { ...l, operators: parseInt(e.target.value) || 0 } : l
                              );
                              setProductionLines(updatedLines);
                            }}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                            placeholder="0"
                            min="0"
                          />
                          <button
                            onClick={() => handleDeleteLine(line.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Line</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Line Name</label>
                    <input
                      type="text"
                      value={newLineName}
                      onChange={(e) => setNewLineName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Line name (e.g., Line 6)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Operators</label>
                    <input
                      type="number"
                      value={newLineOperators}
                      onChange={(e) => setNewLineOperators(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10"
                      min="0"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddLine}
                  className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Add Line
                </button>
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
                    Unit Price (E)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOrder.unitPrice}
                    onChange={(e) => setNewOrder({...newOrder, unitPrice: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 8.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Target (pcs/line/day)
                  </label>
                  <input
                    type="number"
                    value={newOrder.dailyTarget}
                    onChange={(e) => setNewOrder({...newOrder, dailyTarget: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 650"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexity
                  </label>
                  <select
                    value={newOrder.complexity}
                    onChange={(e) => setNewOrder({...newOrder, complexity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({...newOrder, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
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
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                      <Upload size={18} />
                      <span className="text-sm">Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                    {newOrder.image && (
                      <img 
                        src={newOrder.image} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                      />
                    )}
                  </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes / Specifications
                </label>
                <textarea
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about the order..."
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Production Lines * (Select one or more)
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                  <div className="space-y-2">
                    {productionLines.map(line => (
                      <label key={line.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={newOrder.linesAssigned.includes(line.name)}
                          onChange={() => toggleLineSelection(line.name, true)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{line.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {newOrder.linesAssigned.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
                    Selected: <span className="font-semibold">{newOrder.linesAssigned.join(', ')}</span>
                  </p>
                )}
              </div>

              {newOrder.quantity && newOrder.unitPrice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Estimated Order Value:</span>
                    <span className="text-xl font-bold text-blue-600">
                      E{(parseFloat(newOrder.quantity) * parseFloat(newOrder.unitPrice)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddOrder}
                  disabled={newOrder.linesAssigned.length === 0}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
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