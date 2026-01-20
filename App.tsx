
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ClassDefinition, ScheduledClass } from './types';
import TimetableHeader from './components/TimetableHeader';
import TimetableCell from './components/TimetableCell';
import ClassCard from './components/ClassCard';
import ClassModal from './components/ClassModal';
import InstanceTimeModal from './components/InstanceTimeModal';
import SyncModal from './components/SyncModal';
import { generateMonthDays, applyRecurrence, getTimelineRange } from './utils';
import { format, startOfDay, isBefore, isAfter, isSameMonth, parseISO } from 'date-fns';
import { Search, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import html2canvas from 'html2canvas';

// 使用自定义的 Bucket 命名空间，确保不与其他应用冲突
const SYNC_API_BASE = "https://kvdb.io/v1/buckets/xiaomeng_studio_v2_prod/keys";

const App: React.FC = () => {
  const [classes, setClasses] = useState<ClassDefinition[]>(() => {
    const saved = localStorage.getItem('classes');
    return saved ? JSON.parse(saved) : [];
  });
  const [schedule, setSchedule] = useState<ScheduledClass[]>(() => {
    const saved = localStorage.getItem('schedule');
    return saved ? JSON.parse(saved) : [];
  });
  const [timetableScale, setTimetableScale] = useState(() => {
    const saved = localStorage.getItem('timetableScale');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [isConfidential, setIsConfidential] = useState(() => {
    const saved = localStorage.getItem('isConfidential');
    return saved === 'true';
  });
  const [isMobileMode, setIsMobileMode] = useState(() => {
    const saved = localStorage.getItem('isMobileMode');
    return saved === 'true';
  });

  // 云同步状态
  const [syncId, setSyncId] = useState<string | null>(localStorage.getItem('syncId'));
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const skipNextPush = useRef(false);

  const [past, setPast] = useState<ScheduledClass[][]>([]);
  const [future, setFuture] = useState<ScheduledClass[][]>([]);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstanceModalOpen, setIsInstanceModalOpen] = useState(false);
  
  const [editingClass, setEditingClass] = useState<ClassDefinition | undefined>();
  const [editingInstance, setEditingInstance] = useState<ScheduledClass | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  
  const [draggedClassId, setDraggedClassId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => 
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isMobileMode);
  const [isRotated, setIsRotated] = useState(false);

  const timetableRef = useRef<HTMLDivElement>(null);
  const today = startOfDay(new Date());

  // 云端推送
  const pushToCloud = useCallback(async (dataToPush: any, forceId?: string) => {
    const targetId = forceId || syncId;
    if (!targetId || skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }

    setSyncStatus('syncing');
    try {
      const response = await fetch(`${SYNC_API_BASE}/${targetId}`, {
        method: 'PUT',
        body: JSON.stringify(dataToPush),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setSyncStatus('synced');
        setLastSynced(new Date());
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (err) {
      console.error('Push Error:', err);
      setSyncStatus('error');
    }
  }, [syncId]);

  // 云端拉取
  const pullFromCloud = useCallback(async () => {
    if (!syncId) return;
    // 如果后台不可见，除非弹窗开着，否则不更新
    if (document.visibilityState !== 'visible' && !isSyncModalOpen) return;
    
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${SYNC_API_BASE}/${syncId}`);
      if (response.ok) {
        const text = await response.text();
        if (!text) {
          // 路径存在但内容为空，初始化一次
          pushToCloud({ classes, schedule });
          return;
        }
        
        const cloudData = JSON.parse(text);
        const localDataString = JSON.stringify({ classes, schedule });
        const cloudDataString = JSON.stringify(cloudData);
        
        if (localDataString !== cloudDataString) {
          console.log("检测到云端更新...");
          skipNextPush.current = true;
          setClasses(cloudData.classes);
          setSchedule(cloudData.schedule);
        }
        setSyncStatus('synced');
        setLastSynced(new Date());
      } else if (response.status === 404) {
        // 第一次使用这个自定义码，自动创建路径
        console.log("新同步码，正在上传初始数据...");
        pushToCloud({ classes, schedule });
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (err) {
      console.error('Pull Error:', err);
      setSyncStatus('error');
    }
  }, [syncId, classes, schedule, isSyncModalOpen, pushToCloud]);

  // 数据监听与自动保存
  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('schedule', JSON.stringify(schedule));
  }, [classes, schedule]);

  // 自动推送防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      pushToCloud({ classes, schedule });
    }, 2000); 
    return () => clearTimeout(timer);
  }, [classes, schedule, pushToCloud]);

  // 定期同步逻辑
  useEffect(() => {
    if (!syncId) return;
    pullFromCloud(); 
    const interval = setInterval(pullFromCloud, 120000); // 2分钟轮询
    
    const handleFocus = () => pullFromCloud();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [syncId, pullFromCloud]);

  // 同步管理函数
  const handleEnableSync = () => {
    // 生成一个随机码
    const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    handleJoinSync(randomId);
  };

  const handleJoinSync = (id: string) => {
    const cleanId = id.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!cleanId) return;
    
    setSyncId(cleanId);
    localStorage.setItem('syncId', cleanId);
    // 强制执行一次推/拉
    pullFromCloud();
  };

  const handleDisableSync = () => {
    if (window.confirm("确定断开云同步吗？")) {
      setSyncId(null);
      localStorage.removeItem('syncId');
      setSyncStatus('idle');
    }
  };

  // 其它原有功能代码...
  useEffect(() => {
    localStorage.setItem('timetableScale', timetableScale.toString());
    localStorage.setItem('isConfidential', isConfidential.toString());
    localStorage.setItem('isMobileMode', isMobileMode.toString());
  }, [timetableScale, isConfidential, isMobileMode]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const updateScheduleWithHistory = useCallback((newSchedule: ScheduledClass[]) => {
    setPast(prev => [...prev.slice(-49), schedule]);
    setFuture([]);
    setSchedule(newSchedule);
  }, [schedule]);

  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setFuture(prev => [schedule, ...prev]);
    setPast(past.slice(0, past.length - 1));
    setSchedule(previous);
  }, [past, schedule]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setPast(prev => [...prev, schedule]);
    setFuture(future.slice(1));
    setSchedule(next);
  }, [future, schedule]);

  const monthDays = useMemo(() => generateMonthDays(currentDate), [currentDate]);
  const weeks = useMemo(() => {
    const res = [];
    for (let i = 0; i < monthDays.length; i += 7) res.push(monthDays.slice(i, i + 7));
    return res;
  }, [monthDays]);

  const timelineRange = useMemo(() => getTimelineRange(schedule), [schedule]);
  const hours = useMemo(() => {
    const h = [];
    for (let m = timelineRange.min; m <= timelineRange.max; m += 60) h.push(format(new Date().setHours(Math.floor(m/60), 0), 'HH:00'));
    return h;
  }, [timelineRange]);

  const handleSaveClass = (classDef: ClassDefinition, recurring?: any) => {
    const updatedClassDef = {
      ...classDef,
      batchConfig: recurring ? {
        startTime: recurring.startTime,
        endTime: recurring.endTime,
        frequency: recurring.frequency,
        daysOfWeek: recurring.daysOfWeek,
        startDate: format(recurring.startDate, 'yyyy-MM-dd'),
        endDate: format(recurring.endDate, 'yyyy-MM-dd')
      } : classDef.batchConfig
    };
    const isNew = !classes.find(c => c.id === classDef.id);
    if (isNew) setClasses(prev => [...prev, updatedClassDef]);
    else setClasses(prev => prev.map(c => c.id === classDef.id ? updatedClassDef : c));
    
    if (recurring) {
      const { startDate, endDate, updateMode } = recurring;
      const otherClasses = schedule.filter(s => s.id !== classDef.id);
      const pastInstances = schedule.filter(s => s.id === classDef.id && isBefore(new Date(s.date), today));
      let futureInstancesToKeep = [];
      if (updateMode === 'range') {
        futureInstancesToKeep = schedule.filter(s => 
          s.id === classDef.id && !isBefore(new Date(s.date), today) && 
          (isBefore(new Date(s.date), startDate) || isAfter(new Date(s.date), endDate))
        );
      }
      const newInstances = applyRecurrence(updatedClassDef, { ...recurring, startDate: isBefore(startDate, today) ? today : startDate }, today);
      updateScheduleWithHistory([...otherClasses, ...pastInstances, ...futureInstancesToKeep, ...newInstances]);
    } else if (!isNew) {
      updateScheduleWithHistory(schedule.map(s => (s.id === classDef.id && !isBefore(new Date(s.date), today)) ? { ...s, ...updatedClassDef } : s));
    }
    setEditingClass(undefined);
  };

  const handleClearRange = (classId: string, startDateStr: string, endDateStr: string) => {
    const start = startOfDay(parseISO(startDateStr));
    const end = startOfDay(parseISO(endDateStr));
    updateScheduleWithHistory(schedule.filter(s => {
      if (s.id !== classId) return true;
      const classDate = startOfDay(parseISO(s.date));
      return !((isAfter(classDate, start) || classDate.getTime() === start.getTime()) && (isBefore(classDate, end) || classDate.getTime() === end.getTime()));
    }));
  };

  // Fix: Added handleInstanceClick to manage selection of a scheduled class instance
  const handleInstanceClick = (instance: ScheduledClass) => {
    setSelectedInstanceId(instance.instanceId);
  };

  const handleUpdateInstanceTime = (instanceId: string, startTime: string, endTime: string) => {
    updateScheduleWithHistory(schedule.map(s => s.instanceId === instanceId ? { ...s, startTime, endTime } : s));
  };

  const performDrop = (date: string, classId: string) => {
    const classDef = classes.find(c => c.id === classId);
    if (!classDef) return;
    updateScheduleWithHistory([...schedule, {
      ...classDef,
      instanceId: crypto.randomUUID(),
      date,
      startTime: classDef.batchConfig?.startTime || "09:00",
      endTime: classDef.batchConfig?.endTime || "10:30"
    }]);
    setDraggedClassId(null);
    setSelectedClassId(null);
  };

  const handleExport = async () => {
    if (!timetableRef.current) return;
    const loadingToast = document.createElement('div');
    loadingToast.innerHTML = '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:white;padding:20px 40px;border-radius:10px;z-index:99999;">生成图片中...</div>';
    document.body.appendChild(loadingToast);
    try {
      const canvas = await html2canvas(timetableRef.current, { scale: 2, useCORS: true, backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff' });
      const link = document.createElement('a');
      link.download = `课表-${format(currentDate, 'yyyy-MM')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      document.body.removeChild(loadingToast);
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-slate-50 dark:bg-dark-bg overflow-hidden transition-all ${isRotated ? 'force-landscape' : ''} ${isMobileMode ? 'is-mobile-ui' : ''}`}>
      <TimetableHeader 
        currentDate={currentDate} onDateChange={setCurrentDate} onExport={handleExport} 
        onSaveProject={() => {}} onLoadProject={() => {}} onCreateClass={() => setIsModalOpen(true)}
        theme={theme} onThemeToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        onToggleFullscreen={() => {}} onUndo={handleUndo} onRedo={handleRedo} 
        canUndo={past.length > 0} canRedo={future.length > 0}
        onIncreaseScale={() => setTimetableScale(p => Math.min(p + 0.5, 3))}
        onDecreaseScale={() => setTimetableScale(p => Math.max(p - 0.5, 1))}
        scale={timetableScale} isConfidential={isConfidential} onToggleConfidential={() => setIsConfidential(!isConfidential)}
        isMobileMode={isMobileMode} onToggleMobileMode={() => setIsMobileMode(!isMobileMode)}
        syncStatus={syncStatus} onSyncClick={() => setIsSyncModalOpen(true)} onManualSync={pullFromCloud} isSyncActive={!!syncId}
      />

      <div className="flex-1 flex overflow-hidden relative" onClick={() => setSelectedInstanceId(null)}>
        <div className={`bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col shadow-sm transition-all ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-80'}`}>
          <div className="p-4 border-b dark:border-slate-800 space-y-4">
            <h2 className="font-bold text-sm">班级库 <span className="opacity-50 ml-1">{classes.length}</span></h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-slate-800 border rounded-lg text-xs outline-none" placeholder="查找班级..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {classes.filter(c => c.name.includes(searchTerm)).map(c => (
              <ClassCard key={c.id} classDef={c} onDragStart={(_, id) => setDraggedClassId(id)} onEdit={(d) => {setEditingClass(d); setIsModalOpen(true);}} onDelete={(id) => setClasses(p => p.filter(x => x.id !== id))} isConfidential={isConfidential} />
            ))}
          </div>
        </div>

        <div className={`flex-1 overflow-auto p-4 sm:p-6 bg-slate-100/30 dark:bg-slate-900/50 custom-scrollbar`}>
          <div ref={timetableRef} className={`timetable-container bg-white dark:bg-slate-900 rounded-xl shadow-xl border overflow-hidden ${isMobileMode ? 'min-w-[700px]' : 'min-w-[1000px]'}`}>
            <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-gray-50 dark:bg-slate-800 border-b">
              <div className="border-r"></div>
              {['一', '二', '三', '四', '五', '六', '日'].map(d => (
                <div key={d} style={{ fontSize: `${12 * timetableScale}px` }} className="py-2 text-center font-bold text-gray-500 border-r last:border-r-0">周{d}</div>
              ))}
            </div>
            <div className="flex flex-col">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-b-0">
                  <div className="bg-gray-50/50 dark:bg-slate-800/50 border-r flex flex-col py-2 min-h-[400px]">
                    {hours.map(h => <div key={h} className="text-[10px] text-gray-400 h-[60px] flex items-start justify-center font-medium">{h}</div>)}
                  </div>
                  {week.map(day => (
                    <TimetableCell key={format(day, 'yyyy-MM-dd')} date={day} isMainMonth={isSameMonth(day, currentDate)} scheduledClasses={schedule.filter(s => s.date === format(day, 'yyyy-MM-dd'))} timelineRange={timelineRange} selectedInstanceId={selectedInstanceId} onInstanceClick={handleInstanceClick} onDrop={() => performDrop(format(day, 'yyyy-MM-dd'), draggedClassId || selectedClassId || '')} onRemoveInstance={(id) => updateScheduleWithHistory(schedule.filter(s => s.instanceId !== id))} onEditInstance={(i) => {setEditingInstance(i); setIsInstanceModalOpen(true);}} scale={timetableScale} isConfidential={isConfidential} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ClassModal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false); setEditingClass(undefined);}} onSave={handleSaveClass} onClearRange={handleClearRange} initialData={editingClass} />
      <InstanceTimeModal isOpen={isInstanceModalOpen} onClose={() => {setIsInstanceModalOpen(false); setEditingInstance(null);}} instance={editingInstance} onSave={handleUpdateInstanceTime} />
      <SyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} syncId={syncId} onEnableSync={handleEnableSync} onJoinSync={handleJoinSync} onDisableSync={handleDisableSync} onManualPull={pullFromCloud} lastSynced={lastSynced} syncStatus={syncStatus} />
    </div>
  );
};

export default App;
