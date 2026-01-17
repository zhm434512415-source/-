import React from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Download, Calendar as CalendarIcon, Plus, Moon, Sun, Maximize, Save, FileUp } from 'lucide-react';

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
}

const TimetableHeader: React.FC<TimetableHeaderProps> = ({ 
  currentDate, onDateChange, onExport, onSaveProject, onLoadProject, onCreateClass, theme, onThemeToggle, onToggleFullscreen 
}) => {
  const monthStr = format(currentDate, 'yyyy年 MMMM');

  return (
    <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between shadow-sm relative z-50 gap-4">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <CalendarIcon size={20} className="text-white" />
          </div>
          <span className="hidden sm:inline">小萌英语工作室</span>
        </h1>
        
        <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
          <button 
            onClick={() => onDateChange(subMonths(currentDate, 1))}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-md transition-all text-gray-600 dark:text-gray-400"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1 text-sm font-medium hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-md transition-all text-gray-600 dark:text-gray-400"
          >
            本月
          </button>
          <button 
            onClick={() => onDateChange(addMonths(currentDate, 1))}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-md transition-all text-gray-600 dark:text-gray-400"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        
        <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">{monthStr}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={onThemeToggle}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400"
            title="切换主题"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400"
            title="全屏/旋转"
          >
            <Maximize size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={onSaveProject}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400"
            title="导出存档"
          >
            <Save size={18} />
          </button>
          <button
            onClick={onLoadProject}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-gray-600 dark:text-gray-400"
            title="读取存档"
          >
            <FileUp size={18} />
          </button>
        </div>

        <button
          onClick={onExport}
          className="flex items-center gap-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm font-medium"
        >
          <Download size={16} />
          <span className="hidden lg:inline">图片</span>
        </button>

        <button
          onClick={onCreateClass}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100 dark:shadow-none text-sm font-medium"
        >
          <Plus size={16} />
          <span>新建班级</span>
        </button>
      </div>
    </div>
  );
};

export default TimetableHeader;