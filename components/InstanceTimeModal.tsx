
import React, { useState, useEffect } from 'react';
import { ScheduledClass } from '../types';
import { X, Clock } from 'lucide-react';

interface InstanceTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: ScheduledClass | null;
  onSave: (instanceId: string, startTime: string, endTime: string) => void;
}

const InstanceTimeModal: React.FC<InstanceTimeModalProps> = ({ isOpen, onClose, instance, onSave }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (instance) {
      setStartTime(instance.startTime);
      setEndTime(instance.endTime);
    }
  }, [instance, isOpen]);

  if (!isOpen || !instance) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(instance.instanceId, startTime, endTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <h3 className="font-bold text-gray-800 dark:text-white">修改单日课程时间</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            课程: <span className="text-gray-900 dark:text-white font-bold">{instance.name}</span>
            <br />
            日期: <span className="text-gray-900 dark:text-white">{instance.date}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">开始时间</label>
              <input
                type="time"
                required
                className="w-full border border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">结束时间</label>
              <input
                type="time"
                required
                className="w-full border border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none font-bold text-sm"
            >
              更新时间
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstanceTimeModal;
