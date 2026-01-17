
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ClassDefinition, ScheduledClass } from './types';
import TimetableHeader from './components/TimetableHeader';
import TimetableCell from './components/TimetableCell';
import ClassCard from './components/ClassCard';
import ClassModal from './components/ClassModal';
import InstanceTimeModal from './components/InstanceTimeModal';
import { generateMonthDays, applyRecurrence, getTimelineRange } from './utils';
import { format, startOfDay, isBefore, isAfter, isSameMonth, parseISO } from 'date-fns';
import { Search, Info, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  const timetableRef = useRef<HTMLDivElement>(null);
  const today = startOfDay(new Date());

  // 检测 URL 分享数据
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');
    if (sharedData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(atob(sharedData)));
        if (decodedData.classes && decodedData.schedule) {
          const confirmLoad = window.confirm("检测到他人分享的课表数据，是否覆盖当前本地数据进行查看？");
          if (confirmLoad) {
            setClasses(decodedData.classes);
            setSchedule(decodedData.schedule);
            // 清除 URL 参数
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch (e) {
        console.error("解析分享链接失败", e);
      }
    }
  }, []);

  const updateScheduleWithHistory = useCallback((newSchedule: ScheduledClass[]) => {
    setPast(prev => [...prev.slice(-49), schedule]);
    setFuture([]);
    setSchedule(newSchedule);
  }, [schedule]);

  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setFuture(prev => [schedule, ...prev]);
    setPast(newPast);
    setSchedule(previous);
  }, [past, schedule]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast(prev => [...prev, schedule]);
    setFuture(newFuture);
    setSchedule(next);
  }, [future, schedule]);

  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('schedule', JSON.stringify(schedule));
    localStorage.setItem('timetableScale', timetableScale.toString());
  }, [classes, schedule, timetableScale]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    alert('已清除选定日期范围内的班级课程。');
  };

  const handleUpdateInstanceTime = (instanceId: string, startTime: string, endTime: string) => {
    updateScheduleWithHistory(schedule.map(s => s.instanceId === instanceId ? { ...s, startTime, endTime } : s));
  };

  const performDrop = (date: string, classId: string) => {
    const classDef = classes.find(c => c.id === classId);
    if (!classDef) return;
    const startTime = classDef.batchConfig?.startTime || "09:00";
    const endTime = classDef.batchConfig?.endTime || "10:30";
    const newInstance: ScheduledClass = {
      ...classDef,
      instanceId: crypto.randomUUID(),
      date,
      startTime,
      endTime
    };
    updateScheduleWithHistory([...schedule, newInstance]);
    setDraggedClassId(null);
    setSelectedClassId(null);
  };

  const handleExport = async () => {
    if (!timetableRef.current) return;
    const canvas = await html2canvas(timetableRef.current, { 
      scale: 2, 
      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff' 
    });
    const link = document.createElement('a');
    link.download = `小萌英语课表-${format(currentDate, 'yyyy-MM')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const saveProject = () => {
    const data = JSON.stringify({ classes, schedule });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `小萌排课存档-${format(new Date(), 'yyyyMMdd')}.json`;
    link.click();
  };

  const handleShare = () => {
    const data = { classes, schedule };
    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    
    // 复制到剪贴板
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("分享链接已复制到剪贴板！发送给他人打开网址即可同步你的课表。");
    }).catch(err => {
      console.error('复制失败', err);
      // 后备方案
      window.prompt("分享网址已生成，请手动复制：", shareUrl);
    });
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
            alert('读取存档成功！');
          }
        } catch (err) {
          alert('无效的存档文件');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      if (window.innerHeight > window.innerWidth) {
        setIsRotated(true);
      }
    } else {
      document.exitFullscreen();
      setIsRotated(false);
    }
  };

  const handleInstanceClick = (instance: ScheduledClass) => {
    if (selectedInstanceId === instance.instanceId) {
      setEditingInstance(instance);
      setIsInstanceModalOpen(true);
    } else {
      setSelectedInstanceId(instance.instanceId);
    }
  };

  const handleIncreaseScale = () => setTimetableScale(prev => Math.min(prev + 0.5, 3.0));
  const handleDecreaseScale = () => setTimetableScale(prev => Math.max(prev - 0.5, 1.0));

  return (
    <div className={`h-screen flex flex-col bg-slate-50 dark:bg-dark-bg overflow-hidden select-none transition-all duration-500 ${isRotated ? 'force-landscape' : ''}`}>
      <TimetableHeader 
        currentDate={currentDate} 
        onDateChange={setCurrentDate} 
        onExport={handleExport} 
        onSaveProject={saveProject}
        onLoadProject={loadProject}
        onShare={handleShare}
        onCreateClass={() => setIsModalOpen(true)}
        theme={theme}
        onThemeToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        onToggleFullscreen={toggleFullscreen}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onIncreaseScale={handleIncreaseScale}
        onDecreaseScale={handleDecreaseScale}
        scale={timetableScale}
      />

      <div className="flex-1 flex overflow-hidden relative" onClick={() => setSelectedInstanceId(null)}>
        <div className="relative flex h-full z-40" onClick={(e) => e.stopPropagation()}>
          <div className={`bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col shadow-sm transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-80'}`}>
            <div className="p-4 border-b dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-700 dark:text-gray-300">
                  班级库 <span className="text-xs font-normal text-gray-400 ml-1">{classes.length}</span>
                </h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" placeholder="查找班级..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
              {classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                <div key={c.id} className={`relative transition-all ${selectedClassId === c.id ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : ''}`} onClick={() => setSelectedClassId(c.id === selectedClassId ? null : c.id)}>
                  <ClassCard classDef={c} onDragStart={(_, id) => setDraggedClassId(id)} onEdit={(def) => { setEditingClass(def); setIsModalOpen(true); }} onDelete={(id) => setClasses(prev => prev.filter(x => x.id !== id))} />
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-2 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-slate-800 border dark:border-slate-700 w-5 h-16 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all group">
            {isSidebarCollapsed ? <ChevronRight size={12} className="text-blue-600 dark:text-blue-400" /> : <ChevronLeft size={12} className="text-gray-400 dark:text-gray-500" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-100/30 dark:bg-slate-900/50 p-4 sm:p-6 custom-scrollbar">
          <div ref={timetableRef} className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 min-w-[1000px] overflow-hidden">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-gray-50 dark:bg-slate-800 border-b dark:border-slate-700">
              <div className="border-r dark:border-slate-700"></div>
              {['一', '二', '三', '四', '五', '六', '日'].map(d => (
                <div key={d} style={{ fontSize: `${12 * timetableScale}px` }} className="py-2 text-center font-bold text-gray-500 dark:text-gray-400 border-r dark:border-slate-700 last:border-r-0">周{d}</div>
              ))}
            </div>

            <div className="flex flex-col">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-cols-[60px_repeat(7,1fr)] border-b dark:border-slate-700 last:border-b-0">
                  <div className="bg-gray-50/50 dark:bg-slate-800/50 border-r dark:border-slate-700 flex flex-col relative py-2 min-h-[400px]">
                    {hours.map((h, i) => (
                      <div key={h} className="text-[10px] text-gray-400 dark:text-gray-500 h-[60px] flex items-start justify-center font-medium">
                        {h}
                      </div>
                    ))}
                  </div>
                  {week.map(day => (
                    <TimetableCell
                      key={format(day, 'yyyy-MM-dd')}
                      date={day}
                      isMainMonth={isSameMonth(day, currentDate)}
                      scheduledClasses={schedule.filter(s => s.date === format(day, 'yyyy-MM-dd'))}
                      timelineRange={timelineRange}
                      selectedInstanceId={selectedInstanceId}
                      onInstanceClick={handleInstanceClick}
                      onDrop={() => {
                        if (draggedClassId) performDrop(format(day, 'yyyy-MM-dd'), draggedClassId);
                        else if (selectedClassId) performDrop(format(day, 'yyyy-MM-dd'), selectedClassId);
                      }}
                      onRemoveInstance={(id) => updateScheduleWithHistory(schedule.filter(s => s.instanceId !== id))}
                      onEditInstance={(instance) => { setEditingInstance(instance); setIsInstanceModalOpen(true); }}
                      scale={timetableScale}
                    />
                  ))}
                  <div className="bg-gray-50/80 dark:bg-slate-800/80 border-r dark:border-slate-700 border-t dark:border-slate-700 flex items-center justify-center font-bold text-gray-400 py-1.5" style={{ fontSize: '10px' }}>
                    Income
                  </div>
                  {week.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dailyIncome = schedule.filter(s => s.date === dateKey).reduce((sum, s) => sum + s.fee, 0);
                    return (
                      <div key={`income-${dateKey}`} className="border-r border-t dark:border-slate-700 last:border-r-0 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 bg-blue-50/5 dark:bg-blue-900/5 py-1.5" style={{ fontSize: `${12 * timetableScale}px` }}>
                        {dailyIncome > 0 ? dailyIncome : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
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
