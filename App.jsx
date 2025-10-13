import React, { useState } from 'react';
import { Plus, Calendar, Package, TrendingUp, X, Edit2, Save, Settings, Trash2, Target, Archive, CheckCircle, Clock, Upload, ClipboardList, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

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
      lineSchedules: {
        'Line 1': { startDate: '2025-10-08', endDate: '2025-10-15' }
      },
      startDate: '2025-10-08',
      endDate: '2025-10-15',
      status: 'In Production',
      color: '#3B82F6',
      dailyProduction: {},
      hourlyProduction: {},
      hourlyRejects: {},
      trims: []
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
  const [workStartHour, setWorkStartHour] = useState(7);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showLineManager, setShowLineManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProductionInput, setShowProductionInput] = useState(false);
  const [showHourlyInput, setShowHourlyInput] = useState(false);
  const [showTrimsManager, setShowTrimsManager] = useState(false);
  const [showLineSchedule, setShowLineSchedule] = useState(false);
  const [selectedOrderForTrims, setSelectedOrderForTrims] = useState(null);
  const [selectedOrderForSchedule, setSelectedOrderForSchedule] = useState(null);
  const [showStatsCards, setShowStatsCards] = useState(false);
  const [showLineCapacity, setShowLineCapacity] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
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
  const [showSyncNotification, setShowSyncNotification] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [customFolder, setCustomFolder] = useState('');
  const [timelineStartDate, setTimelineStartDate] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    return monday.toISOString().split('T')[0];
  });

  const [newTrimItem, setNewTrimItem] = useState({
    name: '',
    quantityRequired: '',
    quantityReceived: '',
    unit: 'pcs',
    supplier: '',
    notes: ''
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
    lineSchedules: {},
    startDate: '',
    endDate: '',
    status: 'Pending',
    color: '#8B5CF6',
    dailyProduction: {},
    hourlyProduction: {},
    hourlyRejects: {},
    trims: []
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
    if (!isElectron) return;
    const handleDataFileChanged = async () => {
      setIsSyncing(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 200));
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

        setShowSyncNotification(true);
        setTimeout(() => setShowSyncNotification(false), 3000);
      } catch (error) {
        console.error('Error reloading data:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    if (window.electronAPI && window.electronAPI.onDataFileChanged) {
      window.electronAPI.onDataFileChanged(handleDataFileChanged);
    }

    return () => {
      if (window.electronAPI && window.electronAPI.removeDataFileChangedListener) {
        window.electronAPI.removeDataFileChangedListener(handleDataFileChanged);
      }
    };
  }, [isElectron]);

  React.useEffect(() => { saveToStorage('orders', orders); }, [orders]);
  React.useEffect(() => { saveToStorage('completedOrders', completedOrders); }, [completedOrders]);
  React.useEffect(() => { saveToStorage('productionLines', productionLines); }, [productionLines]);
  React.useEffect(() => { saveToStorage('excludeWeekends', excludeWeekends); }, [excludeWeekends]);
  React.useEffect(() => { saveToStorage('holidays', holidays); }, [holidays]);
  React.useEffect(() => { saveToStorage('workingHours', workingHours); }, [workingHours]);
  React.useEffect(() => { saveToStorage('workStartHour', workStartHour); }, [workStartHour]);
  React.useEffect(() => { saveToStorage('customFolder', customFolder); }, [customFolder]);

  const handleSelectFolder = async () => {
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
      alert('⚠️ Folder selection API not available.');
    } else {
      alert('📱 Folder selection is only available in the desktop app.');
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
        csvContent += `Target: ${order.dailyTarget || 'N/A'} pcs\n`;
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

  const isHoliday = (date) => holidays.some(h => h.date === date);
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

  // Trims Management Functions
  const handleAddTrim = () => {
    if (!selectedOrderForTrims || !newTrimItem.name || !newTrimItem.quantityRequired) return;
    
    const required = parseFloat(newTrimItem.quantityRequired);
    const received = parseFloat(newTrimItem.quantityReceived) || 0;
    
    // Calculate initial status
    let initialStatus = 'pending';
    if (received === 0) {
      initialStatus = 'pending';
    } else if (received >= required) {
      initialStatus = 'complete';
    } else {
      initialStatus = 'partial';
    }
    
    const trim = {
      id: Date.now(),
      name: newTrimItem.name,
      supplier: newTrimItem.supplier,
      unit: newTrimItem.unit,
      notes: newTrimItem.notes,
      quantityRequired: required,
      quantityReceived: received,
      status: initialStatus
    };

    setOrders(orders.map(order => {
      if (order.id === selectedOrderForTrims.id) {
        return { ...order, trims: [...(order.trims || []), trim] };
      }
      return order;
    }));

    setNewTrimItem({
      name: '',
      quantityRequired: '',
      quantityReceived: '',
      unit: 'pcs',
      supplier: '',
      notes: ''
    });
  };

  const handleUpdateTrim = (trimId, field, value) => {
    setOrders(orders.map(order => {
      if (order.id === selectedOrderForTrims.id) {
        return {
          ...order,
          trims: order.trims.map(trim => {
            if (trim.id === trimId) {
              // Parse value as number for quantity fields
              const numValue = (field === 'quantityReceived' || field === 'quantityRequired') 
                ? parseFloat(value) || 0 
                : value;
              
              const updated = { ...trim, [field]: numValue };
              
              // Auto-update status when quantities change
              if (field === 'quantityReceived' || field === 'quantityRequired') {
                const received = field === 'quantityReceived' ? numValue : trim.quantityReceived;
                const required = field === 'quantityRequired' ? numValue : trim.quantityRequired;
                
                if (received === 0) {
                  updated.status = 'pending';
                } else if (received >= required) {
                  updated.status = 'complete';
                } else {
                  updated.status = 'partial';
                }
              }
              return updated;
            }
            return trim;
          })
        };
      }
      return order;
    }));
  };

  const handleDeleteTrim = (trimId) => {
    setOrders(orders.map(order => {
      if (order.id === selectedOrderForTrims.id) {
        return {
          ...order,
          trims: order.trims.filter(trim => trim.id !== trimId)
        };
      }
      return order;
    }));
  };

  const getTrimsStatus = (order) => {
    if (!order.trims || order.trims.length === 0) return { status: 'none', message: 'No trims' };
    
    const total = order.trims.length;
    const complete = order.trims.filter(t => t.status === 'complete').length;
    const pending = order.trims.filter(t => t.status === 'pending').length;
    const partial = order.trims.filter(t => t.status === 'partial').length;
    const shortage = order.trims.filter(t => {
      const received = t.quantityReceived || 0;
      return received < t.quantityRequired;
    });

    if (complete === total) return { status: 'complete', message: `✓ All ${total} trims received`, shortage: [] };
    if (pending === total) return { status: 'pending', message: `⚠ ${total} trims pending`, shortage };
    return { status: 'partial', message: `${complete}/${total} complete`, shortage };
  };

  const handleAddOrder = () => {
    if (newOrder.orderNumber && newOrder.client && newOrder.startDate && newOrder.endDate && newOrder.linesAssigned.length > 0) {
      // Initialize line schedules if not already set
      const lineSchedules = newOrder.lineSchedules || {};
      newOrder.linesAssigned.forEach(lineName => {
        if (!lineSchedules[lineName]) {
          lineSchedules[lineName] = {
            startDate: newOrder.startDate,
            endDate: newOrder.endDate
          };
        }
      });
      
      setOrders([...orders, { 
        ...newOrder, 
        id: Date.now(), 
        dailyProduction: {}, 
        hourlyProduction: {}, 
        hourlyRejects: {},
        trims: [],
        lineSchedules
      }]);
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
        lineSchedules: {},
        startDate: '',
        endDate: '',
        status: 'Pending',
        color: colors[Math.floor(Math.random() * colors.length)],
        dailyProduction: {},
        hourlyProduction: {},
        hourlyRejects: {},
        trims: []
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
      setNewOrder(prev => {
        const isCurrentlySelected = prev.linesAssigned.includes(lineName);
        const newLinesAssigned = isCurrentlySelected
          ? prev.linesAssigned.filter(l => l !== lineName)
          : [...prev.linesAssigned, lineName];
        
        // Initialize line schedules when toggling
        const newLineSchedules = { ...prev.lineSchedules };
        if (!isCurrentlySelected) {
          // Adding line - set to order dates
          newLineSchedules[lineName] = {
            startDate: prev.startDate || '',
            endDate: prev.endDate || ''
          };
        } else {
          // Removing line - delete schedule
          delete newLineSchedules[lineName];
        }
        
        return {
          ...prev,
          linesAssigned: newLinesAssigned,
          lineSchedules: newLineSchedules
        };
      });
    } else {
      setEditingOrder(prev => {
        const isCurrentlySelected = prev.linesAssigned.includes(lineName);
        const newLinesAssigned = isCurrentlySelected
          ? prev.linesAssigned.filter(l => l !== lineName)
          : [...prev.linesAssigned, lineName];
        
        // Initialize line schedules when toggling
        const newLineSchedules = { ...prev.lineSchedules } || {};
        if (!isCurrentlySelected) {
          // Adding line - set to order dates
          newLineSchedules[lineName] = {
            startDate: prev.startDate || '',
            endDate: prev.endDate || ''
          };
        } else {
          // Removing line - delete schedule
          delete newLineSchedules[lineName];
        }
        
        return {
          ...prev,
          linesAssigned: newLinesAssigned,
          lineSchedules: newLineSchedules
        };
      });
    }
  };

  const handleUpdateLineSchedule = (lineName, field, value) => {
    setOrders(orders.map(order => {
      if (order.id === selectedOrderForSchedule.id) {
        const updatedSchedules = { ...order.lineSchedules };
        if (!updatedSchedules[lineName]) {
          updatedSchedules[lineName] = { startDate: order.startDate, endDate: order.endDate };
        }
        updatedSchedules[lineName][field] = value;
        
        return { ...order, lineSchedules: updatedSchedules };
      }
      return order;
    }));
  };

  const handleRemoveLineFromOrder = (orderId, lineName) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const newLinesAssigned = order.linesAssigned.filter(l => l !== lineName);
        const newLineSchedules = { ...order.lineSchedules };
        delete newLineSchedules[lineName];
        
        return {
          ...order,
          linesAssigned: newLinesAssigned,
          lineSchedules: newLineSchedules
        };
      }
      return order;
    }));
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
    return Math.ceil(order.dailyTarget / workingHours);
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
      currentStart.setDate(currentStart.getDate() - 7);
    } else if (direction === 'next') {
      currentStart.setDate(currentStart.getDate() + 7);
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
      
      // Check line-specific schedule if available
      if (order.lineSchedules && order.lineSchedules[lineName]) {
        const schedule = order.lineSchedules[lineName];
        const scheduleStart = new Date(schedule.startDate);
        const scheduleEnd = new Date(schedule.endDate);
        const checkDate = new Date(date);
        return checkDate >= scheduleStart && checkDate <= scheduleEnd;
      }
      
      // Fallback to order-level dates
      const orderStart = new Date(order.startDate);
      const orderEnd = new Date(order.endDate);
      const checkDate = new Date(date);
      return checkDate >= orderStart && checkDate <= orderEnd;
    });
  };

  const getOrderForDate = (lineName, date) => {
    return orders.find(order => {
      if (!order.linesAssigned.includes(lineName)) return false;
      
      // Check line-specific schedule if available
      if (order.lineSchedules && order.lineSchedules[lineName]) {
        const schedule = order.lineSchedules[lineName];
        const scheduleStart = new Date(schedule.startDate);
        const scheduleEnd = new Date(schedule.endDate);
        const checkDate = new Date(date);
        return checkDate >= scheduleStart && checkDate <= scheduleEnd;
      }
      
      // Fallback to order-level dates
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
    
    // Use user-set daily target (same as scoreboard)
    const target = order.dailyTarget;
    if (!target) return { actual, status: 'recorded' };
    
    if (actual >= target) return { actual, status: 'met', target };
    if (actual >= target * 0.8) return { actual, status: 'close', target };
    return { actual, status: 'below', target };
  };

  const getTotalProducedForOrder = (order) => {
    let total = 0;
    Object.keys(order.dailyProduction || {}).forEach(key => {
      total += order.dailyProduction[key] || 0;
    });
    return total;
  };

  const getProductionProgress = (order) => {
    const totalProduced = getTotalProducedForOrder(order);
    const targetQuantity = parseInt(order.quantity) || 0;
    if (targetQuantity === 0) return 0;
    return Math.min(100, Math.round((totalProduced / targetQuantity) * 100));
  };

  const getRemainingQuantity = (order) => {
    const totalProduced = getTotalProducedForOrder(order);
    const targetQuantity = parseInt(order.quantity) || 0;
    return Math.max(0, targetQuantity - totalProduced);
  };

  const getDaysRemaining = (order) => {
    const today = new Date();
    const endDate = new Date(order.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showSyncNotification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <p className="font-semibold">Data Updated</p>
              <p className="text-sm">Changes from another PC loaded</p>
            </div>
          </div>
        </div>
      )}

      {isSyncing && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Syncing data...</span>
          </div>
        </div>
      )}

      {isElectron && customFolder && (
        <div className="fixed bottom-4 left-4 z-40">
          <div className="bg-gray-800 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Multi-PC sync active</span>
          </div>
        </div>
      )}

      {/* Header - Fixed */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SS Mudyf Production Tracker</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time production tracking with trims management</p>
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
                onClick={() => setShowOrdersPanel(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <ClipboardList size={20} />
                Orders ({orders.length})
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

      {/* Main Content Area - Flex Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Timeline/Calendar View */}
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
              {/* Collapsible Stats Cards */}
              <div className="mb-4">
                {showStatsCards ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">Overview Statistics</h3>
                      <button
                        onClick={() => setShowStatsCards(false)}
                        className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span>Hide Stats</span>
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
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
                  </div>
                ) : (
                  <button
                    onClick={() => setShowStatsCards(true)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="text-blue-600" size={18} />
                          <span className="font-semibold text-gray-900">{totalOrders}</span>
                          <span className="text-gray-600">orders</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="text-green-600" size={18} />
                          <span className="font-semibold text-gray-900">{activeOrders}</span>
                          <span className="text-gray-600">active</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="text-purple-600" size={18} />
                          <span className="font-semibold text-gray-900">{totalQuantity.toLocaleString()}</span>
                          <span className="text-gray-600">pcs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="text-emerald-600" size={18} />
                          <span className="font-semibold text-emerald-600">E{totalValue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="text-orange-600" size={18} />
                          <span className="font-semibold text-gray-900">{productionLines.length}</span>
                          <span className="text-gray-600">lines</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">Click to expand stats</span>
                    </div>
                  </button>
                )}
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
                  
                  {/* Collapsible Line Capacity */}
                  <div className="mb-6">
                    {showLineCapacity ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-700">Line Capacity Overview</h3>
                          <button
                            onClick={() => setShowLineCapacity(false)}
                            className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <span>Hide Capacity</span>
                            <X size={14} />
                          </button>
                        </div>
                        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${productionLines.length}, minmax(0, 1fr))` }}>
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
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowLineCapacity(true)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            {productionLines.map(line => {
                              const capacity = getLineCapacity(line.name);
                              return (
                                <div key={line.id} className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">{line.name}:</span>
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      capacity >= 90 ? 'bg-red-500' :
                                      capacity >= 70 ? 'bg-orange-500' :
                                      'bg-green-500'
                                    }`}></div>
                                    <span className="font-bold text-gray-700">{capacity}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-xs text-gray-500">Click to expand capacity</span>
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                      <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-20 bg-white shadow-sm">
                          <tr>
                            <th className="sticky left-0 bg-white border border-gray-300 px-4 py-3 text-left font-semibold text-sm z-30 min-w-[100px]">
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
                              <td className="sticky left-0 bg-white border border-gray-300 px-4 py-3 z-10 shadow-sm">
                                <div className="font-semibold text-sm text-gray-900">{line.name}</div>
                              </td>
                              {timelineDates.map(date => {
                                const order = getOrderForDate(line.name, date);
                                const isBooked = isDateBooked(line.name, date);
                                const isNonWorking = !isWorkingDay(date);
                                const targetStatus = order ? checkTargetMet(order) : null;
                                const productionStatus = order ? getProductionStatus(order, line.name, date) : null;
                                const hourlyTarget = order ? getHourlyTarget(order) : null;
                                
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
                                          title={`${order.orderNumber} - Click for time-based tracking\n${
                                            order.lineSchedules?.[line.name] 
                                              ? `${line.name}: ${order.lineSchedules[line.name].startDate} to ${order.lineSchedules[line.name].endDate}`
                                              : `All lines: ${order.startDate} to ${order.endDate}`
                                          }\nDaily Target: ${order.dailyTarget || 'N/A'} pcs/day\nHourly Target: ${hourlyTarget || 'N/A'} pcs/hour${targetStatus && targetStatus.dailyRequiredPerLine !== order.dailyTarget ? `\nCalculated Required: ${targetStatus.dailyRequiredPerLine} pcs/day` : ''}`}
                                        >
                                          {/* Custom schedule indicator */}
                                          {order.lineSchedules?.[line.name] && order.linesAssigned.length > 1 && (
                                            <div className="absolute top-1 right-1">
                                              <Calendar size={10} className="text-white opacity-70" />
                                            </div>
                                          )}
                                          
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
                                          {/* Target indicator - same logic as scoreboard */}
                                          {targetStatus && order.dailyTarget && (
                                            <div className="mt-0.5 text-[8px] opacity-90">
                                              Target: {order.dailyTarget}
                                              {targetStatus.dailyRequiredPerLine !== order.dailyTarget && (
                                                <span className="text-yellow-200"> (Need: {targetStatus.dailyRequiredPerLine})</span>
                                              )}
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
                      <Calendar size={16} className="text-indigo-600" />
                      <span className="text-gray-600">Custom line schedule</span>
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
                  const trimsStatus = getTrimsStatus(order);
                  
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
                                {trimsStatus.status !== 'none' && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                    trimsStatus.status === 'complete' ? 'bg-green-100 text-green-700' :
                                    trimsStatus.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-orange-100 text-orange-700'
                                  }`}>
                                    {trimsStatus.message}
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
                                <span className="text-gray-500">Completed:</span>
                                <span className="ml-2 font-medium">{order.completedDate}</span>
                              </div>
                            </div>
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

        {/* Right Side - Active Orders Panel (FIXED LAYOUT) */}
        <div className="w-96 bg-white border-l shadow-lg flex flex-col">
          {/* Header - Fixed at top */}
          <div className="flex-shrink-0 bg-white border-b p-4 z-10">
            <h2 className="text-lg font-semibold text-gray-900">Active Orders</h2>
            <p className="text-sm text-gray-600 mt-1">{orders.length} orders in production</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {orders.map(order => {
              const targetStatus = checkTargetMet(order);
              const orderValue = (parseInt(order.quantity || 0) * parseFloat(order.unitPrice || 0));
              const trimsStatus = getTrimsStatus(order);
              const progress = getProductionProgress(order);
              const totalProduced = getTotalProducedForOrder(order);
              const remaining = getRemainingQuantity(order);
              const daysLeft = getDaysRemaining(order);

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
                      <div className="flex items-start gap-3 mb-3">
                        <div 
                          className="w-1 h-24 rounded flex-shrink-0" 
                          style={{ backgroundColor: order.color }}
                        ></div>
                        
                        {order.image && (
                          <img 
                            src={order.image} 
                            alt={order.garmentType}
                            className="w-20 h-20 object-cover rounded border border-gray-200"
                          />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-gray-900 text-sm truncate">{order.orderNumber}</p>
                            <div className="flex gap-1 flex-shrink-0 ml-2">
                              {order.linesAssigned.length > 1 && (
                                <button
                                  onClick={() => {
                                    setSelectedOrderForSchedule(order);
                                    setShowLineSchedule(true);
                                  }}
                                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                  title="Manage Line Schedules"
                                >
                                  <Calendar size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedOrderForTrims(order);
                                  setShowTrimsManager(true);
                                }}
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                title="Manage Trims"
                              >
                                <ClipboardList size={14} />
                              </button>
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
                          <div className="flex gap-2 mt-1 flex-wrap">
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
                            {trimsStatus.status !== 'none' && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                trimsStatus.status === 'complete' ? 'bg-green-100 text-green-700' :
                                trimsStatus.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                📋 {trimsStatus.message}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Production Progress Bar */}
                      <div className="mb-3 p-2 bg-white rounded border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700">Production Progress</span>
                          <span className={`text-xs font-bold ${
                            progress >= 100 ? 'text-green-600' :
                            progress >= 75 ? 'text-blue-600' :
                            progress >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              progress >= 100 ? 'bg-green-500' :
                              progress >= 75 ? 'bg-blue-500' :
                              progress >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-600">
                          <span>{totalProduced.toLocaleString()} / {parseInt(order.quantity).toLocaleString()} pcs</span>
                          <span>{remaining.toLocaleString()} remaining</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium text-gray-900">{order.garmentType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Target:</span>
                          <span className="font-medium text-gray-900">{parseInt(order.quantity).toLocaleString()} pcs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Produced:</span>
                          <span className={`font-bold ${
                            progress >= 100 ? 'text-green-600' :
                            progress >= 75 ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                            {totalProduced.toLocaleString()} pcs
                          </span>
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
                            <div className="flex justify-between">
                              <span className="text-gray-500">Value Produced:</span>
                              <span className="font-semibold text-emerald-600">
                                E{(totalProduced * parseFloat(order.unitPrice)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Lines:</span>
                          <div className="text-right">
                            <span className="font-medium text-gray-900">{order.linesAssigned.join(', ')}</span>
                            {order.linesAssigned.length > 1 && order.lineSchedules && (
                              <div className="text-[10px] text-indigo-600 mt-0.5">
                                <Calendar size={10} className="inline mr-1" />
                                Individual schedules
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium text-gray-900">{new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Days Left:</span>
                          <span className={`font-bold ${
                            daysLeft === 0 ? 'text-red-600' :
                            daysLeft <= 3 ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {daysLeft} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Working Days:</span>
                          <span className="font-medium text-gray-900">{targetStatus?.workingDays} days</span>
                        </div>
                        {targetStatus && targetStatus.numLines > 1 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Calculated Required:</span>
                            <span className="font-medium text-gray-900">{targetStatus.dailyRequiredPerLine} pcs/day</span>
                          </div>
                        )}
                        {order.dailyTarget && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Your Target:</span>
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
                        {trimsStatus.shortage && trimsStatus.shortage.length > 0 && (
                          <div className="pt-1 border-t border-gray-200">
                            <span className="text-red-600 font-medium">⚠ Shortages:</span>
                            {trimsStatus.shortage.slice(0, 2).map(trim => (
                              <p key={trim.id} className="text-red-600 mt-0.5 text-[11px]">
                                • {trim.name}: {trim.quantityReceived}/{trim.quantityRequired} {trim.unit}
                              </p>
                            ))}
                            {trimsStatus.shortage.length > 2 && (
                              <p className="text-red-600 mt-0.5 text-[11px]">
                                +{trimsStatus.shortage.length - 2} more
                              </p>
                            )}
                          </div>
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

      {/* Trims Manager Modal */}
      {showTrimsManager && selectedOrderForTrims && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              // Get fresh order data from orders array in real-time
              const currentOrder = orders.find(o => o.id === selectedOrderForTrims.id);
              if (!currentOrder) return null;
              
              return (
                <>
                  <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <div>
                      <h2 className="text-xl font-semibold">Trims & Materials Checklist</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {currentOrder.orderNumber} - {currentOrder.client}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowTrimsManager(false);
                        setSelectedOrderForTrims(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="p-6">
                    {/* Existing Trims List */}
                    {currentOrder.trims && currentOrder.trims.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Trims & Materials</h3>
                        <div className="space-y-2">
                          {currentOrder.trims.map(trim => {
                            const received = trim.quantityReceived || 0;
                            const required = trim.quantityRequired;
                            const shortage = required - received;
                            const percentage = (received / required) * 100;
                            
                            return (
                              <div key={trim.id} className={`p-4 rounded-lg border-2 ${
                                trim.status === 'complete' ? 'bg-green-50 border-green-200' :
                                trim.status === 'partial' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-orange-50 border-orange-200'
                              }`}>
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-semibold text-gray-900">{trim.name}</h4>
                                      {trim.status === 'complete' ? (
                                        <CheckCircle2 className="text-green-600" size={20} />
                                      ) : trim.status === 'partial' ? (
                                        <AlertCircle className="text-yellow-600" size={20} />
                                      ) : (
                                        <XCircle className="text-orange-600" size={20} />
                                      )}
                                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                        trim.status === 'complete' ? 'bg-green-100 text-green-700' :
                                        trim.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-orange-100 text-orange-700'
                                      }`}>
                                        {trim.status.toUpperCase()}
                                      </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Required Quantity</label>
                                        <div className="text-sm font-semibold text-gray-900">
                                          {required.toLocaleString()} {trim.unit}
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Received Quantity</label>
                                        <input
                                          type="number"
                                          value={trim.quantityReceived}
                                          onChange={(e) => handleUpdateTrim(trim.id, 'quantityReceived', e.target.value)}
                                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold"
                                          placeholder="0"
                                        />
                                      </div>
                                    </div>

                                    {shortage > 0 && (
                                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                                        <p className="text-sm font-semibold text-red-700">
                                          ⚠ Shortage: {shortage.toLocaleString()} {trim.unit} ({percentage.toFixed(1)}% received)
                                        </p>
                                      </div>
                                    )}

                                    {received > required && (
                                      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                                        <p className="text-sm font-semibold text-blue-700">
                                          ✓ Surplus: {(received - required).toLocaleString()} {trim.unit} extra ({percentage.toFixed(1)}% received)
                                        </p>
                                      </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                                      {trim.supplier && (
                                        <div>
                                          <span className="font-medium">Supplier:</span> {trim.supplier}
                                        </div>
                                      )}
                                      {trim.notes && (
                                        <div className="col-span-2">
                                          <span className="font-medium">Notes:</span> {trim.notes}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={() => handleDeleteTrim(trim.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                                    title="Delete Trim"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Add New Trim */}
                    <div className="border-t pt-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Trim/Material</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Trim Name *</label>
                          <input
                            type="text"
                            value={newTrimItem.name}
                            onChange={(e) => setNewTrimItem({...newTrimItem, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Buttons, Zippers, Thread"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
                          <input
                            type="text"
                            value={newTrimItem.supplier}
                            onChange={(e) => setNewTrimItem({...newTrimItem, supplier: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Supplier name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Required Quantity *</label>
                          <input
                            type="number"
                            value={newTrimItem.quantityRequired}
                            onChange={(e) => setNewTrimItem({...newTrimItem, quantityRequired: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 5000"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Received Quantity</label>
                          <input
                            type="number"
                            value={newTrimItem.quantityReceived}
                            onChange={(e) => setNewTrimItem({...newTrimItem, quantityReceived: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                          <select
                            value={newTrimItem.unit}
                            onChange={(e) => setNewTrimItem({...newTrimItem, unit: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pcs">Pieces (pcs)</option>
                            <option value="meters">Meters (m)</option>
                            <option value="yards">Yards (yd)</option>
                            <option value="kg">Kilograms (kg)</option>
                            <option value="rolls">Rolls</option>
                            <option value="boxes">Boxes</option>
                            <option value="sets">Sets</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                          <input
                            type="text"
                            value={newTrimItem.notes}
                            onChange={(e) => setNewTrimItem({...newTrimItem, notes: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Additional notes"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleAddTrim}
                        className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Plus size={20} />
                        Add Trim/Material
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Line Schedule Manager Modal */}
      {showLineSchedule && selectedOrderForSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const currentOrder = orders.find(o => o.id === selectedOrderForSchedule.id);
              if (!currentOrder) return null;
              
              return (
                <>
                  <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <div>
                      <h2 className="text-xl font-semibold">Manage Line Schedules</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {currentOrder.orderNumber} - {currentOrder.client}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Set independent start/end dates for each production line
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowLineSchedule(false);
                        setSelectedOrderForSchedule(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>💡 Tip:</strong> Adjust individual line dates to remove lines early when finishing up production. 
                        This allows you to reassign lines to new orders while others complete the current order.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {currentOrder.linesAssigned.map(lineName => {
                        const schedule = currentOrder.lineSchedules?.[lineName] || {
                          startDate: currentOrder.startDate,
                          endDate: currentOrder.endDate
                        };
                        
                        return (
                          <div key={lineName} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-12 rounded" style={{ backgroundColor: currentOrder.color }}></div>
                                <h3 className="font-semibold text-gray-900">{lineName}</h3>
                              </div>
                              {currentOrder.linesAssigned.length > 1 && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Remove ${lineName} from this order? Production data for this line will be preserved.`)) {
                                      handleRemoveLineFromOrder(currentOrder.id, lineName);
                                      if (currentOrder.linesAssigned.length === 2) {
                                        setShowLineSchedule(false);
                                        setSelectedOrderForSchedule(null);
                                      }
                                    }
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Remove Line from Order"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={schedule.startDate}
                                  onChange={(e) => handleUpdateLineSchedule(lineName, 'startDate', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  End Date
                                </label>
                                <input
                                  type="date"
                                  value={schedule.endDate}
                                  onChange={(e) => handleUpdateLineSchedule(lineName, 'endDate', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            
                            <div className="mt-2 text-xs text-gray-600">
                              {(() => {
                                const start = new Date(schedule.startDate);
                                const end = new Date(schedule.endDate);
                                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                                const workingDays = getWorkingDays(schedule.startDate, schedule.endDate);
                                return (
                                  <span>
                                    Duration: {days} days ({workingDays} working days)
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          setShowLineSchedule(false);
                          setSelectedOrderForSchedule(null);
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

{/* Scoreboard - Keep existing scoreboard code but ensure it uses order.dailyTarget consistently */}
{showScoreboard && (
  <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col h-screen overflow-hidden">
    <div className="flex-shrink-0 px-6 py-3 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Production Scoreboard</h1>
        <p className="text-slate-400 text-xs">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' • '}Click hourly cells to input data
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            exportDailyReport(today);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          <Package size={16} />
          Export
        </button>
        <button
          onClick={() => setShowScoreboard(false)}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <X size={18} />
          Close
        </button>
      </div>
    </div>

    <div className="flex-1 p-4 min-h-0 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700">
            <div className="flex items-stretch">
              <div className="w-64 border-r border-slate-700 p-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Production Line</h3>
              </div>
              
              <div className="flex-1 flex">
                {Array.from({ length: workingHours }, (_, i) => i + 1).map(hour => (
                  <div 
                    key={hour} 
                    className="flex-1 border-r border-slate-700 last:border-r-0 p-2 text-center"
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      {getTimeLabel(hour)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-80 border-l border-slate-700 flex">
                <div className="flex-1 p-2 text-center border-r border-slate-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Target</div>
                </div>
                <div className="flex-1 p-2 text-center border-r border-slate-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Production</div>
                </div>
                <div className="flex-1 p-2 text-center border-r border-slate-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Rejects</div>
                </div>
                <div className="flex-1 p-2 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <div 
              className="grid h-full"
              style={{ 
                gridTemplateRows: `repeat(${productionLines.length}, minmax(0, 1fr))`
              }}
            >
              {productionLines.map((line) => {
                const today = new Date().toISOString().split('T')[0];
                const order = getOrderForDate(line.name, today);
                
                if (!order) {
                  return (
                    <div key={line.id} className="flex items-center border-b border-slate-800 last:border-b-0">
                      <div className="w-64 border-r border-slate-700 p-3">
                        <h4 className="text-lg font-bold text-white">{line.name}</h4>
                        <p className="text-xs text-slate-400">No active order</p>
                      </div>
                      <div className="flex-1 flex items-center justify-center text-slate-600">
                        <span className="text-sm">— No Production —</span>
                      </div>
                    </div>
                  );
                }

                const hourlyTarget = getHourlyTarget(order);
                const targetStatus = checkTargetMet(order);
                const dailyProduction = order.dailyProduction?.[`${line.name}-${today}`] || 0;
                const dailyTarget = order.dailyTarget;
                const calculatedTarget = targetStatus?.dailyRequiredPerLine || 0;

                let totalRejects = 0;
                for (let h = 1; h <= workingHours; h++) {
                  const key = `${line.name}-${today}-${h}`;
                  totalRejects += order.hourlyRejects?.[key] || 0;
                }

                return (
                  <div key={line.id} className="flex items-stretch border-b border-slate-800 last:border-b-0 hover:bg-slate-800/30 transition-colors">
                    <div className="w-64 border-r border-slate-700 p-3 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-xl font-bold text-white">{line.name}</h4>
                        <span className="px-2 py-0.5 bg-blue-600/20 border border-blue-500/50 rounded text-blue-300 text-xs font-bold">
                          {order.orderNumber}
                        </span>
                      </div>
                      <p className="text-xs text-cyan-400 font-bold">
                        Target: {hourlyTarget || '-'}/hr
                      </p>
                      {calculatedTarget && calculatedTarget !== dailyTarget && (
                        <p className="text-xs text-amber-400 mt-0.5">
                          Guide: {calculatedTarget} pcs/day
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-1 flex items-stretch">
                      {Array.from({ length: workingHours }, (_, i) => i + 1).map(hour => {
                        const hourStatus = getHourlyStatus(order, line.name, today, hour);
                        const key = `${line.name}-${today}-${hour}`;
                        const production = order.hourlyProduction?.[key] || 0;
                        const rejects = order.hourlyRejects?.[key] || 0;
                        const isWorkingDayToday = isWorkingDay(today);
                        
                        return (
                          <div 
                            key={hour}
                            onClick={() => isWorkingDayToday && handleHourlyCellClick(order, line.name, today)}
                            className={`flex-1 border-r border-slate-700 last:border-r-0 flex flex-col items-center justify-center p-2 transition-all ${
                              isWorkingDayToday ? 'cursor-pointer hover:bg-slate-700/50' : 'cursor-not-allowed'
                            } ${
                              hourStatus 
                                ? hourStatus.status === 'excellent' 
                                  ? 'bg-green-500/10 border-y-2 border-y-green-500' 
                                  : hourStatus.status === 'good'
                                  ? 'bg-green-500/5'
                                  : hourStatus.status === 'ok'
                                  ? 'bg-yellow-500/5'
                                  : hourStatus.status === 'concern'
                                  ? 'bg-orange-500/10'
                                  : 'bg-red-500/10'
                                : 'bg-slate-900/50'
                            }`}
                          >
                            {hourStatus ? (
                              <>
                                <div className="text-2xl mb-1">{hourStatus.emoji}</div>
                                <div className="text-xl font-black text-white">{production}</div>
                                {rejects > 0 && (
                                  <div className="text-xs text-red-400 font-bold mt-0.5">
                                    -{rejects}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="text-xl opacity-30">⏱️</div>
                                <div className="text-xs text-slate-600">Click</div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-80 border-l border-slate-700 flex items-stretch">
                      <div className="flex-1 border-r border-slate-700 flex flex-col items-center justify-center p-2">
                        <div className="text-2xl font-black text-cyan-400">{dailyTarget || '-'}</div>
                        <div className="text-xs text-slate-400">target</div>
                        {calculatedTarget && calculatedTarget !== dailyTarget && (
                          <div className="text-xs text-amber-400 mt-0.5">({calculatedTarget})</div>
                        )}
                      </div>
                      <div className="flex-1 border-r border-slate-700 flex flex-col items-center justify-center p-2">
                        <div className="text-2xl font-black text-white">{dailyProduction}</div>
                        <div className="text-xs text-slate-400">pcs</div>
                      </div>
                      <div className="flex-1 border-r border-slate-700 flex flex-col items-center justify-center p-2">
                        <div className="text-2xl font-black text-red-400">{totalRejects}</div>
                        <div className="text-xs text-slate-400">pcs</div>
                      </div>
                      <div className="flex-1 flex items-center justify-center p-2">
                        {dailyTarget && dailyProduction >= dailyTarget ? (
                          <div className="text-center">
                            <div className="text-3xl mb-1">✅</div>
                            <div className="text-xs font-bold text-green-400">MET</div>
                          </div>
                        ) : dailyTarget ? (
                          <div className="text-center">
                            <div className="text-2xl font-black text-yellow-400">
                              {Math.round((dailyProduction / dailyTarget) * 100)}%
                            </div>
                            <div className="text-xs font-bold text-slate-400">Progress</div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-xl text-slate-600">-</div>
                            <div className="text-xs text-slate-500">No target</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 mt-3 bg-slate-900 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center justify-between gap-6">
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Production</p>
              <p className="text-3xl font-black text-white">
                {productionLines.reduce((sum, line) => {
                  const today = new Date().toISOString().split('T')[0];
                  const order = getOrderForDate(line.name, today);
                  return sum + (order?.dailyProduction?.[`${line.name}-${today}`] || 0);
                }, 0)} <span className="text-sm text-slate-400">pcs</span>
              </p>
            </div>

            <div className="w-px h-12 bg-slate-700"></div>

            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Rejects</p>
              <p className="text-3xl font-black text-red-400">
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

            <div className="w-px h-12 bg-slate-700"></div>

            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Active Lines</p>
              <p className="text-3xl font-black text-cyan-400">
                {productionLines.filter(line => {
                  const today = new Date().toISOString().split('T')[0];
                  return getOrderForDate(line.name, today);
                }).length}/{productionLines.length}
              </p>
            </div>

            <div className="w-px h-12 bg-slate-700"></div>

            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Work Hours</p>
              <p className="text-2xl font-black text-white">
                {getTimeLabel(1).split('-')[0]}-{getTimeLabel(workingHours).split('-')[1]}
              </p>
            </div>

            <div className="w-px h-12 bg-slate-700"></div>

            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Overall Efficiency</p>
              <p className={`text-3xl font-black ${
                (() => {
                  const today = new Date().toISOString().split('T')[0];
                  let totalActual = 0;
                  let totalTarget = 0;
                  productionLines.forEach(line => {
                    const order = getOrderForDate(line.name, today);
                    if (order && order.dailyTarget) {
                      totalActual += order.dailyProduction?.[`${line.name}-${today}`] || 0;
                      totalTarget += order.dailyTarget;
                    }
                  });
                  const efficiency = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;
                  return efficiency >= 100 ? 'text-green-400' : efficiency >= 80 ? 'text-yellow-400' : 'text-red-400';
                })()
              }`}>
                {(() => {
                  const today = new Date().toISOString().split('T')[0];
                  let totalActual = 0;
                  let totalTarget = 0;
                  productionLines.forEach(line => {
                    const order = getOrderForDate(line.name, today);
                    if (order && order.dailyTarget) {
                      totalActual += order.dailyProduction?.[`${line.name}-${today}`] || 0;
                      totalTarget += order.dailyTarget;
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
                              {totalProduction >= (order.dailyTarget || 0) ? '✅' : '⚠️'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600">Daily Target</p>
                        <p className="text-lg font-bold text-gray-900">{order.dailyTarget || 'N/A'} pcs</p>
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
                          {order.dailyTarget > 0 ? ((totalProduction / order.dailyTarget) * 100).toFixed(1) : 0}%
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

      {/* Settings Modal */}
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
                      <strong>💡 Network Folder Setup:</strong> To share data across multiple computers, select a folder on your network drive. All PCs must have access to this folder.
                    </p>
                  </div>
                </div>

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
                </div>

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
                    onChange={(e) => {
                      const newStartDate = e.target.value;
                      // Update all line schedules with new start date
                      const updatedLineSchedules = {};
                      newOrder.linesAssigned.forEach(lineName => {
                        updatedLineSchedules[lineName] = {
                          startDate: newStartDate,
                          endDate: newOrder.lineSchedules?.[lineName]?.endDate || newOrder.endDate
                        };
                      });
                      setNewOrder({
                        ...newOrder, 
                        startDate: newStartDate,
                        lineSchedules: updatedLineSchedules
                      });
                    }}
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
                    onChange={(e) => {
                      const newEndDate = e.target.value;
                      // Update all line schedules with new end date
                      const updatedLineSchedules = {};
                      newOrder.linesAssigned.forEach(lineName => {
                        updatedLineSchedules[lineName] = {
                          startDate: newOrder.lineSchedules?.[lineName]?.startDate || newOrder.startDate,
                          endDate: newEndDate
                        };
                      });
                      setNewOrder({
                        ...newOrder, 
                        endDate: newEndDate,
                        lineSchedules: updatedLineSchedules
                      });
                    }}
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