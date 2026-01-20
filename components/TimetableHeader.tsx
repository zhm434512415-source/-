
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
  Smartphone,
  Cloud,
  RefreshCw
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
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  onSyncClick: () => void;
  onManualSync: () => void;
  isSyncActive: boolean;
}

const TimetableHeader: React.FC<TimetableHeaderProps> = ({ 
  currentDate, onDateChange, onExport, onCreateClass, theme, onThemeToggle, onToggleFullscreen,
  onUndo, onRedo, canUndo, canRedo, onIncreaseScale, onDecreaseScale, isConfidential, onToggleConfidential,
  isMobileMode, onToggleMobileMode, syncStatus, onSyncClick, onManualSync, isSyncActive
}) => {
  const monthStr = format(currentDate, 'yyyy年 MMMM');

  return (
    <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between shadow-sm relative z-50 gap-3">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-blue-600 flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shrink-0">
            <CalendarIcon size={18} className="text-white" />
          </div>
          <span className="hidden md:inline">
            小萌英语排课系统 
            <span className="text-[10px] opacity-40 font-mono ml-1.5 font-normal tracking-tighter">v2.1.2</span>
          </span>
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
        {/* 云同步指示器 */}
        <div className={`flex items-center gap-1 p-1 rounded-lg transition-colors ${
          syncStatus === 'error' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-100 dark:bg-slate-800'
        }`}>
          {/* 手动刷新按钮 - 放在云端按钮左边，始终可见 */}
          <button 
            onClick={onManualSync}
            disabled={!isSyncActive || syncStatus === 'syncing'}
            className={`p-1.5 rounded-md transition-all ${
              !isSyncActive ? 'opacity-20 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-700'
            } ${syncStatus === 'syncing' ? 'animate-spin text-blue-500' : ''}`}
            title={isSyncActive ? "立即同步云端" : "请先开启云同步"}
          >
            <RefreshCw size={16} />
          </button>

          <button 
            onClick={onSyncClick} 
            className={`p-1.5 rounded-md transition-all relative ${
              syncStatus === 'error' ? 'text-red-600' : 
              syncStatus !== 'idle' ? 'text-blue-600 dark:text-blue-400' : 
              'text-gray-400 dark:text-gray-500'
            } hover:bg-white dark:hover:bg-slate-700`}
            title={syncStatus === 'error' ? '同步连接异常' : '云同步设置'}
          >
            <Cloud size={18} className={syncStatus === 'syncing' ? 'animate-pulse' : ''} />
            {isSyncActive && (
              <span className={`absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white dark:border-slate-800 ${
                syncStatus === 'error' ? 'bg-red-500' : 
                syncStatus === 'syncing' ? 'bg-amber-400' : 'bg-green-500'
              }`} />
            )}
          </button>
        </div>

        <button 
          onClick={onToggleMobileMode} 
          className={`p-2 rounded-lg transition-all ${isMobileMode ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'} hover:scale-105 active:scale-95`}
          title="切换移动/桌面布局"
        >
          <Smartphone size={18} />
        </button>

        <button 
          onClick={onToggleConfidential} 
          className={`p-2 rounded-lg transition-all ${isConfidential ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'} hover:scale-105 active:scale-95`}
          title="隐私保护模式"
        >
          {isConfidential ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <div className="hidden lg:flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={onUndo} disabled={!canUndo} className={`p-1.5 rounded-md transition-all ${canUndo ? 'hover:bg-white text-gray-600 dark:text-gray-400' : 'text-gray-300 opacity-50 cursor-not-allowed'}`} title="撤销">
            <Undo2 size={18} />
          </button>
          <button onClick={onRedo} disabled={!canRedo} className={`p-1.5 rounded-md transition-all ${canRedo ? 'hover:bg-white text-gray-600 dark:text-gray-400' : 'text-gray-300 opacity-50 cursor-not-allowed'}`} title="重做">
            <Redo2 size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={onDecreaseScale} className="p-1.5 hover:bg-white rounded-md text-gray-600 dark:text-gray-400" title="缩小字体">
            <Type size={14} className="opacity-70" />
            <span className="text-xs font-bold">-</span>
          </button>
          <button onClick={onIncreaseScale} className="p-1.5 hover:bg-white rounded-md text-gray-600 dark:text-gray-400" title="放大字体">
            <Type size={14} className="opacity-70" />
            <span className="text-xs font-bold">+</span>
          </button>
        </div>

        <button onClick={onThemeToggle} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white transition-all" title="深色/浅色模式">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button onClick={onExport} className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 transition-all" title="导出为图片">
          <Download size={18} />
        </button>

        <button onClick={onCreateClass} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md font-bold text-sm" title="创建新班级项目">
          <Plus size={18} />
          <span className="hidden sm:inline">新建班级</span>
        </button>
      </div>
    </div>
  );
};

export default TimetableHeader;
