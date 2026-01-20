
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
  Share2,
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
  onShare: () => void;
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
  currentDate, onDateChange, onExport, onSaveProject, onLoadProject, onShare, onCreateClass, theme, onThemeToggle, onToggleFullscreen,
  onUndo, onRedo, canUndo, canRedo, onIncreaseScale, onDecreaseScale, scale, isConfidential, onToggleConfidential,
  isMobileMode, onToggleMobileMode
}) => {
  const monthStr = format(currentDate, 'yyyy年 MMMM');

  return (
    <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between shadow-sm relative z-50 gap-3">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-blue-600 flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shrink-0">
            <CalendarIcon size={18} className="text-white" />
          </div>
          <span className="hidden md:inline">小萌英语 <span className="text-xs opacity-60 font-mono ml-1">v1.4.0</span></span>
        </h1>
        
        <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-0.5 sm:p-1">
          <button onClick={() => onDateChange(subMonths(currentDate, 1))} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => onDateChange(new Date())} className="px-2 py-1 text-xs sm:text-sm font-medium hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400">
            本月
          </button>
          <button onClick={() => onDateChange(addMonths(currentDate, 1))} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400">
            <ChevronRight size={16} />
          </button>
        </div>
        <span className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{monthStr}</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* 移动模式切换 */}
        <button 
          onClick={onToggleMobileMode} 
          className={`p-2 rounded-lg transition-all duration-300 ${isMobileMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'} hover:scale-105 active:scale-95`}
          title={isMobileMode ? "退出移动优化" : "开启移动优化"}
        >
          <Smartphone size={18} />
        </button>

        <button 
          onClick={onToggleConfidential} 
          className={`p-2 rounded-lg transition-all duration-300 ${isConfidential ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'} hover:scale-105 active:scale-95`}
          title={isConfidential ? "退出保密模式" : "保密模式"}
        >
          {isConfidential ? <EyeOff size={18} className="animate-blink" /> : <Eye size={18} />}
        </button>

        <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={onUndo} disabled={!canUndo} className={`p-1.5 rounded-md transition-all ${canUndo ? 'hover:bg-white dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'}`} title="撤销">
            <Undo2 size={18} />
          </button>
          <button onClick={onRedo} disabled={!canRedo} className={`p-1.5 rounded-md transition-all ${canRedo ? 'hover:bg-white dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'}`} title="重做">
            <Redo2 size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={onDecreaseScale} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400 flex items-center gap-0.5" title="减小字体">
            <Type size={14} className="opacity-70" />
            <span className="text-xs font-bold">-</span>
          </button>
          <button onClick={onIncreaseScale} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400 flex items-center gap-0.5" title="增大字体">
            <Type size={14} className="opacity-70" />
            <span className="text-xs font-bold">+</span>
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={onThemeToggle} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={onToggleFullscreen} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400">
            <Maximize size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={onSaveProject} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400" title="导出存档">
            <Save size={18} />
          </button>
          <button onClick={onShare} className="p-1.5 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 rounded-md transition-all text-blue-600 dark:text-blue-400" title="分享">
            <Share2 size={18} />
          </button>
        </div>

        <button onClick={onCreateClass} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md text-xs font-bold uppercase tracking-wide">
          <Plus size={16} />
          <span className="hidden sm:inline">新建班级</span>
        </button>
      </div>
    </div>
  );
};

export default TimetableHeader;
