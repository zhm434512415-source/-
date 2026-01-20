
import React, { useState } from 'react';
import { X, Cloud, Copy, RefreshCw, Smartphone, LogIn, CheckCircle2 } from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncId: string | null;
  onEnableSync: () => void;
  onJoinSync: (id: string) => void;
  onDisableSync: () => void;
  lastSynced: Date | null;
}

const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose, syncId, onEnableSync, onJoinSync, onDisableSync, lastSynced }) => {
  const [inputId, setInputId] = useState('');

  if (!isOpen) return null;

  const copyId = () => {
    if (syncId) {
      navigator.clipboard.writeText(syncId);
      alert('同步码已复制！在另一台设备输入此码即可同步。');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[120] p-4 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border dark:border-slate-800">
        <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-blue-600">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Cloud size={20} />
            云端实时同步中心
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!syncId ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  开启云同步后，您在 iPhone、iPad 或电脑上的修改将实时自动同步。
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={onEnableSync}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  <RefreshCw size={18} />
                  开启并创建新同步码
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase">或者加入已有同步</span>
                  <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
                </div>

                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="输入他人的同步码..."
                    value={inputId}
                    onChange={e => setInputId(e.target.value)}
                  />
                  <button 
                    onClick={() => inputId && onJoinSync(inputId)}
                    className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-900 transition-all flex items-center gap-2"
                  >
                    <LogIn size={18} />
                    同步
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="text-green-600 dark:text-green-400 shrink-0" size={24} />
                <div>
                  <div className="text-sm font-bold text-green-800 dark:text-green-300">云同步已激活</div>
                  <div className="text-xs text-green-600 dark:text-green-400 opacity-80">
                    最后同步时间: {lastSynced ? lastSynced.toLocaleTimeString() : '刚刚'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">我的专属同步码</label>
                <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                  <span className="flex-1 font-mono text-sm font-bold text-blue-600 dark:text-blue-400 break-all select-all">
                    {syncId}
                  </span>
                  <button onClick={copyId} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors text-gray-500">
                    <Copy size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">
                  * 在新设备安装本程序，点击“云同步”输入此码，即可同步您的所有班级和课表。
                </p>
              </div>

              <button 
                onClick={onDisableSync}
                className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
              >
                退出并断开同步
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
