
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
  EyeOff
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
}

const TimetableHeader: React.FC<TimetableHeaderProps> = ({ 
  currentDate, onDateChange, onExport, onSaveProject, onLoadProject, onShare, onCreateClass, theme, onThemeToggle, onToggleFullscreen,
  onUndo, onRedo, canUndo, canRedo, onIncreaseScale, onDecreaseScale, scale, isConfidential, onToggleConfidential
}) => {
  const monthStr = format(currentDate, 'yyyy年 MMMM');

  return (
    <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between shadow-sm relative z-50 gap-4">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <CalendarIcon size={20} className="text-white" />
          </div>
          <span className="hidden sm:inline">小萌英语工作室 <span className="text-xs opacity-60 font-mono ml-1">v1.3.0</span></span>
        </h1>
        
        <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
          <button onClick={() => onDateChange(subMonths(currentDate, 1))} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => onDateChange(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400">
            本月
          </button>
          <button onClick={() => onDateChange(addMonths(currentDate, 1))} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400">
            <ChevronRight size={18} />
          </button>
        </div>
        <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">{monthStr}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* 保密模式切换按钮 */}
        <button 
          onClick={onToggleConfidential}
          className={`relative p-2 rounded-lg transition-all duration-500 overflow-hidden ${
            isConfidential 
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-inner' 
              : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-700 shadow-sm'
          }`}
          title={isConfidential ? "退出保密模式" : "开启保密模式"}
        >
          <div className={`transition-all duration-500 transform ${isConfidential ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
            {isConfidential ? <EyeOff size={18} className="animate-eye-blink" /> : <Eye size={18} />}
          </div>
        </button>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={onUndo} disabled={!canUndo} className={`p-1.5 rounded-md transition-all ${canUndo ? 'hover:bg-white dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'}`}>
            <Undo2 size={18} />
          </button>
          <button onClick={onRedo} disabled={!canRedo} className={`p-1.5 rounded-md transition-all ${canRedo ? 'hover:bg-white dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'}`}>
            <Redo2 size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={onDecreaseScale} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400 flex items-center gap-0.5">
            <Type size={14} className="opacity-70" />
            <span className="text-xs font-bold">-</span>
          </button>
          <div className="w-[50px] text-center text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
            {Math.round(scale * 100)}%
          </div>
          <button onClick={onIncreaseScale} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400 flex items-center gap-0.5">
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

        <button onClick={onExport} className="flex items-center gap-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm font-medium">
          <Download size={16} />
          <span className="hidden lg:inline">导出图片</span>
        </button>

        <button onClick={onCreateClass} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all shadow-md text-sm font-medium">
          <Plus size={16} />
          <span>新建班级</span>
        </button>
      </div>
    </div>
  );
};

export default TimetableHeader;
