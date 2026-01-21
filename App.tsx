
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ClassDefinition, ScheduledClass } from './types';
import TimetableHeader from './components/TimetableHeader';
import TimetableCell from './components/TimetableCell';
import ClassCard from './components/ClassCard';
import ClassModal from './components/ClassModal';
import InstanceTimeModal from './components/InstanceTimeModal';
import { generateMonthDays, applyRecurrence, getTimelineRange } from './utils';
import { format, startOfDay, isBefore, isAfter, isSameMonth, parseISO } from 'date-fns';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import html2canvas from 'html2canvas';

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

  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('schedule', JSON.stringify(schedule));
    localStorage.setItem('timetableScale', timetableScale.toString());
    localStorage.setItem('isConfidential', isConfidential.toString());
    localStorage.setItem('isMobileMode', isMobileMode.toString());
  }, [classes, schedule, timetableScale, isConfidential, isMobileMode]);

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
    for (let i = 0; i < monthDays.length; i += 7) {
      res.push(monthDays.slice(i, i + 7));
    }
    return res;
  }, [monthDays]);

  const timelineRange = useMemo(() => getTimelineRange(schedule), [schedule]);
  const hours = useMemo(() => {
    const h = [];
    for (let m = timelineRange.min; m <= timelineRange.max; m += 60) {
      h.push(format(new Date().setHours(Math.floor(m/60), 0), 'HH:00'));
    }
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
      const effectiveStart = isBefore(startDate, today) ? today : startDate;
      const newInstances = applyRecurrence(updatedClassDef, { ...recurring, startDate: effectiveStart }, today);
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
      const isInRange = (isAfter(classDate, start) || classDate.getTime() === start.getTime()) && 
                        (isBefore(classDate, end) || classDate.getTime() === end.getTime());
      return !isInRange;
    }));
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
    loadingToast.innerHTML = '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:white;padding:20px 40px;border-radius:10px;z-index:99999;font-weight:bold;">图片生成中...</div>';
    document.body.appendChild(loadingToast);
    try {
      const canvas = await html2canvas(timetableRef.current, { scale: 2, useCORS: true, backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff' });
      const link = document.createElement('a');
      link.download = `课表-${format(currentDate, 'yyyy-MM')}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } finally {
      document.body.removeChild(loadingToast);
    }
  };

  const saveProject = () => {
    const data = JSON.stringify({ classes, schedule });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `排课存档-${format(new Date(), 'yyyyMMdd')}.json`;
    link.click();
  };

  const loadProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.classes && data.schedule) {
            setClasses(data.classes);
            setSchedule(data.schedule);
            setPast([]);
            setFuture([]);
          }
        } catch (err) { alert('无效文件'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      if (window.innerHeight > window.innerWidth) setIsRotated(true);
    } else {
      document.exitFullscreen();
      setIsRotated(false);
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-slate-50 dark:bg-dark-bg overflow-hidden select-none transition-all duration-500 ${isRotated ? 'force-landscape' : ''} ${isMobileMode ? 'is-mobile-ui' : ''}`}>
      <TimetableHeader 
        currentDate={currentDate} onDateChange={setCurrentDate} onExport={handleExport} 
        onSaveProject={saveProject} onLoadProject={loadProject} onCreateClass={() => setIsModalOpen(true)}
        theme={theme} onThemeToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        onToggleFullscreen={toggleFullscreen} onUndo={handleUndo} onRedo={handleRedo} 
        canUndo={past.length > 0} canRedo={future.length > 0}
        onIncreaseScale={() => setTimetableScale(p => Math.min(p + 0.5, 3))}
        onDecreaseScale={() => setTimetableScale(p => Math.max(p - 0.5, 1))}
        scale={timetableScale} isConfidential={isConfidential} onToggleConfidential={() => setIsConfidential(!isConfidential)}
        isMobileMode={isMobileMode} onToggleMobileMode={() => setIsMobileMode(!isMobileMode)}
      />

      <div className="flex-1 flex overflow-hidden relative" onClick={() => setSelectedInstanceId(null)}>
        <div className="relative flex h-full z-40" onClick={(e) => e.stopPropagation()}>
          <div className={`bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col shadow-sm transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-80'}`}>
            <div className="p-4 border-b dark:border-slate-800 space-y-4">
              <h2 className="font-bold text-gray-700 dark:text-gray-300 text-sm">班级库 <span className="text-xs font-normal text-gray-400 ml-1">{classes.length}</span></h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" placeholder="查找班级..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
              {classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                <div key={c.id} className={`relative transition-all ${selectedClassId === c.id ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : ''}`} onClick={() => setSelectedClassId(c.id === selectedClassId ? null : c.id)}>
                  <ClassCard classDef={c} onDragStart={(_, id) => setDraggedClassId(id)} onEdit={(def) => { setEditingClass(def); setIsModalOpen(true); }} onDelete={(id) => setClasses(prev => prev.filter(x => x.id !== id))} isConfidential={isConfidential} />
                </div>
              ))}
            </div>
          </div>
          {/* 优化后的宽版折叠按钮 */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className={`absolute -right-4 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-slate-800 border dark:border-slate-700 w-10 h-24 flex items-center justify-center rounded-r-2xl shadow-xl hover:w-12 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-300 group ${isSidebarCollapsed ? 'opacity-100 translate-x-4' : ''}`}
            title={isSidebarCollapsed ? "展开班级库" : "隐藏班级库"}
          >
            {isSidebarCollapsed ? 
              <ChevronRight size={24} className="text-blue-600 dark:text-blue-400 animate-pulse" /> : 
              <ChevronLeft size={24} className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600" />
            }
          </button>
        </div>

        <div className={`flex-1 overflow-auto bg-slate-100/30 dark:bg-slate-900/50 ${isMobileMode ? 'p-1' : 'p-4 sm:p-6'} custom-scrollbar`}>
          <div ref={timetableRef} className={`timetable-container bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden ${isMobileMode ? 'min-w-[800px]' : 'min-w-[1000px]'}`}>
            {/* 表头：1列时间轴(100px) + 7列日期 */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)] bg-gray-50 dark:bg-slate-800 border-b dark:border-slate-700">
              <div className="border-r dark:border-slate-700"></div>
              {['一', '二', '三', '四', '五', '六', '日'].map(d => (
                <div key={d} style={{ fontSize: `${(isMobileMode ? 10 : 12) * timetableScale}px` }} className="py-2 text-center font-bold text-gray-500 dark:text-gray-400 border-r dark:border-slate-700 last:border-r-0">周{d}</div>
              ))}
            </div>
            
            <div className="flex flex-col">
              {weeks.map((week, wIdx) => {
                const weekDates = week.map(d => format(d, 'yyyy-MM-dd'));
                const weekTotal = schedule
                  .filter(s => weekDates.includes(s.date))
                  .reduce((sum, item) => sum + item.fee, 0);

                return (
                  <div key={wIdx} className="grid grid-cols-[100px_repeat(7,1fr)] border-b dark:border-slate-700 last:border-b-0">
                    {/* 时间轴列 */}
                    <div className="bg-gray-50/50 dark:bg-slate-800/50 border-r dark:border-slate-700 flex flex-col relative py-2 min-h-[400px]">
                      {hours.map(h => <div key={h} className="text-gray-400 dark:text-gray-500 h-[60px] flex items-start justify-center font-medium" style={{ fontSize: `${(isMobileMode ? 9 : 10) * timetableScale}px` }}>{h}</div>)}
                    </div>
                    {/* 每日课程单元格 */}
                    {week.map(day => (
                      <TimetableCell key={format(day, 'yyyy-MM-dd')} date={day} isMainMonth={isSameMonth(day, currentDate)} scheduledClasses={schedule.filter(s => s.date === format(day, 'yyyy-MM-dd'))} timelineRange={timelineRange} selectedInstanceId={selectedInstanceId} onInstanceClick={s => setSelectedInstanceId(s.instanceId)} onDrop={() => performDrop(format(day, 'yyyy-MM-dd'), draggedClassId || selectedClassId || '')} onRemoveInstance={id => updateScheduleWithHistory(schedule.filter(s => s.instanceId !== id))} onEditInstance={i => { setEditingInstance(i); setIsInstanceModalOpen(true); }} scale={timetableScale} isConfidential={isConfidential} />
                    ))}

                    {/* 每周底部的日收入横向统计行 */}
                    {/* 1. 左侧汇总格 -> 显示“周收入: ¥XXX” */}
                    <div className="bg-blue-50/30 dark:bg-blue-900/10 border-t border-r dark:border-slate-700 flex flex-col items-center justify-center p-1 min-h-[48px]">
                        <span className={`font-bold text-blue-500 dark:text-blue-400 uppercase tracking-tighter ${isConfidential ? 'mosaic-blur' : ''}`} style={{ fontSize: `${8 * timetableScale}px` }}>周收入</span>
                        <span className={`font-black text-blue-700 dark:text-blue-300 ${isConfidential ? 'mosaic-blur' : ''}`} style={{ fontSize: `${11 * timetableScale}px` }}>
                            ¥{weekTotal}
                        </span>
                    </div>
                    {/* 2. 每日收入汇总单元格 (7个) */}
                    {week.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dailySum = schedule
                          .filter(s => s.date === dateStr)
                          .reduce((sum, item) => sum + item.fee, 0);
                        
                        return (
                          <div key={`footer-${dateStr}`} className="bg-slate-50 dark:bg-slate-800/40 border-t border-r dark:border-slate-700 flex flex-col items-center justify-center py-2 last:border-r-0 transition-colors hover:bg-blue-50/50 dark:hover:bg-slate-700/50">
                             <span className={`text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight ${isConfidential ? 'mosaic-blur' : ''}`} style={{ fontSize: `${7 * timetableScale}px` }}>当日</span>
                             <span className={`font-black text-green-600 dark:text-green-400 ${isConfidential ? 'mosaic-blur' : ''}`} style={{ fontSize: `${10 * timetableScale}px` }}>
                                ¥{dailySum}
                             </span>
                          </div>
                        );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <ClassModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingClass(undefined); }} onSave={handleSaveClass} onClearRange={handleClearRange} initialData={editingClass} />
      <InstanceTimeModal isOpen={isInstanceModalOpen} onClose={() => { setIsInstanceModalOpen(false); setEditingInstance(null); }} instance={editingInstance} onSave={handleUpdateInstanceTime} />
    </div>
  );
};

export default App;
