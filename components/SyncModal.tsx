
import React, { useState } from 'react';
import { X, Cloud, Copy, RefreshCw, Smartphone, LogIn, CheckCircle2, Wand2, AlertCircle } from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncId: string | null;
  onEnableSync: () => void;
  onJoinSync: (id: string) => void;
  onDisableSync: () => void;
  onManualPull: () => void;
  lastSynced: Date | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}

const SyncModal: React.FC<SyncModalProps> = ({ 
  isOpen, onClose, syncId, onEnableSync, onJoinSync, onDisableSync, onManualPull, lastSynced, syncStatus 
}) => {
  const [customId, setCustomId] = useState('');

  if (!isOpen) return null;

  const handleStartSync = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!customId.trim()) {
      alert('请输入同步码名称');
      return;
    }
    // 过滤掉非法字符，只保留字母数字
    const cleanId = customId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    onJoinSync(cleanId);
  };

  const suggestRandom = () => {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCustomId(`SYNC-${randomStr}`);
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
              <form onSubmit={handleStartSync} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">设定专属同步码</label>
                  <div className="flex gap-2">
                    <input 
                      autoFocus
                      className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-mono"
                      placeholder="例如: XIAOMENG-VIP"
                      value={customId}
                      onChange={e => setCustomId(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={suggestRandom}
                      className="p-3 bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-blue-600 rounded-xl transition-colors"
                      title="随机推荐一个"
                    >
                      <Wand2 size={20} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 px-1 leading-relaxed">
                    * 同步码决定了你的数据存在哪。在另一台设备输入相同的码，即可同步。支持字母、数字和连字符。
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={syncStatus === 'syncing'}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {syncStatus === 'syncing' ? <RefreshCw size={20} className="animate-spin" /> : <LogIn size={20} />}
                  开启并加载云端数据
                </button>
              </form>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-lg flex gap-3">
                <AlertCircle className="text-amber-600 shrink-0" size={18} />
                <p className="text-[10px] text-amber-700 dark:text-amber-400">
                  注意：如果该同步码下已有云端数据，开启后将<b>覆盖</b>当前设备的内容。
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                syncStatus === 'error' ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20' : 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20'
              }`}>
                <div className="flex items-center gap-3">
                  {syncStatus === 'error' ? (
                    <AlertCircle className="text-red-600" size={24} />
                  ) : (
                    <CheckCircle2 className="text-green-600" size={24} />
                  )}
                  <div>
                    <div className={`text-sm font-bold ${syncStatus === 'error' ? 'text-red-800' : 'text-green-800'}`}>
                      {syncStatus === 'error' ? '同步连接异常' : '云同步已就绪'}
                    </div>
                    <div className="text-[10px] opacity-70">
                      {syncStatus === 'error' ? '请检查网络或尝试手动同步' : `最近更新: ${lastSynced ? lastSynced.toLocaleTimeString() : '刚才'}`}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={onManualPull}
                  disabled={syncStatus === 'syncing'}
                  className={`p-2 rounded-full hover:bg-black/5 transition-all ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">当前我的同步码</label>
                <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-slate-800 rounded-lg border">
                  <span className="flex-1 font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {syncId}
                  </span>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(syncId!); alert('同步码已复制'); }}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors text-gray-500"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <button 
                onClick={onDisableSync}
                className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                断开并退出同步
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
