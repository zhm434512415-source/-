
import React from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar as CalendarIcon, 
  Plus, 
  Moon, 
  Sun, 
  Maximize, 
  Save, 
  FileUp,
  Undo2,
  Redo2,
  Type,
  Eye,
  EyeOff,
  Smartphone
} from 'lucide-react';

interface TimetableHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onExport: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  onCreateClass: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onToggleFullscreen: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onIncreaseScale: () => void;
  onDecreaseScale: () => void;
  scale: number;
  isConfidential: boolean;
  onToggleConfidential: () => void;
  isMobileMode: boolean;
  onToggleMobileMode: () => void;
}

const TimetableHeader: React.FC<TimetableHeaderProps> = ({ 
  currentDate, onDateChange, onExport, onSaveProject, onLoadProject, onCreateClass, theme, onThemeToggle, onToggleFullscreen,
  onUndo, onRedo, canUndo, canRedo, onIncreaseScale, onDecreaseScale, scale, isConfidential, onToggleConfidential,
  isMobileMode, onToggleMobileMode
}) => {
  const monthStr = format(currentDate, 'yyyy年 MMMM');

  // 统一样式类
  const btnBaseClass = "flex items-center justify-center h-9 p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm";
  const groupBgClass = "flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg h-11";

  return (
    <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between shadow-sm relative z-50 gap-3 safe-area-pt safe-area-px">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-blue-600 flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shrink-0">
            <CalendarIcon size={18} className="text-white" />
          </div>
          <span className="hidden md:inline">小萌英语 <span className="text-xs opacity-60 font-mono ml-1">v2.5.2</span></span>
        </h1>
        
        <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1 h-11">
          <button onClick={() => onDateChange(subMonths(currentDate, 1))} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => onDateChange(new Date())} className="px-3 py-1 text-xs sm:text-sm font-bold hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400">
            本月
          </button>
          <button onClick={() => onDateChange(addMonths(currentDate, 1))} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400">
            <ChevronRight size={16} />
          </button>
        </div>
        <span className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap min-w-[120px] text-center">{monthStr}</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button 
          onClick={onToggleMobileMode} 
          className={`${btnBaseClass} ${isMobileMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'}`}
          title="移动模式"
        >
          <Smartphone size={18} />
        </button>

        <button 
          onClick={onToggleConfidential} 
          className={`${btnBaseClass} ${isConfidential ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'}`}
          title="保密模式"
        >
          {isConfidential ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <div className={`hidden lg:flex ${groupBgClass}`}>
          <button onClick={onUndo} disabled={!canUndo} className={`p-1.5 rounded-md transition-all ${canUndo ? 'hover:bg-white dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'}`} title="撤销">
            <Undo2 size={18} />
          </button>
          <button onClick={onRedo} disabled={!canRedo} className={`p-1.5 rounded-md transition-all ${canRedo ? 'hover:bg-white dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'}`} title="重做">
            <Redo2 size={18} />
          </button>
        </div>

        <div className={groupBgClass}>
          <button onClick={onDecreaseScale} className="flex items-center gap-1.5 px-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400 h-9" title="减小缩放">
            <Type size={14} className="opacity-70" />
            <span className="text-sm font-black">-</span>
          </button>
          <div className="w-[1px] h-4 bg-gray-200 dark:bg-slate-700 mx-0.5"></div>
          <button onClick={onIncreaseScale} className="flex items-center gap-1.5 px-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400 h-9" title="增大缩放">
            <Type size={14} className="opacity-70" />
            <span className="text-sm font-black">+</span>
          </button>
        </div>

        <div className={groupBgClass}>
          <button onClick={onThemeToggle} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400" title="切换主题">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={onToggleFullscreen} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400" title="全屏">
            <Maximize size={18} />
          </button>
        </div>

        <div className={groupBgClass}>
          <button onClick={onLoadProject} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400" title="读取存档">
            <FileUp size={18} />
          </button>
          <button onClick={onSaveProject} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400" title="导出存档">
            <Save size={18} />
          </button>
        </div>

        <button onClick={onExport} className={`${btnBaseClass} bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700`} title="导出图片">
          <Download size={18} />
        </button>

        <button onClick={onCreateClass} className="flex items-center gap-1.5 bg-blue-600 text-white h-9 px-4 rounded-lg hover:bg-blue-700 transition-all shadow-md text-xs font-bold uppercase tracking-wide shrink-0">
          <Plus size={16} />
          <span>新建</span>
        </button>
      </div>
    </div>
  );
};

export default TimetableHeader;
