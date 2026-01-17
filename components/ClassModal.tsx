
import React, { useState, useEffect } from 'react';
import { ClassDefinition, RecurringConfig, ClassType, ClassMode } from '../types';
import { COLORS } from '../constants';
import { X, Trash2 } from 'lucide-react';
import { format, addMonths } from 'date-fns';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classDef: ClassDefinition, recurring?: RecurringConfig & { startDate: Date; endDate: Date; updateMode: 'future' | 'range' }) => void;
  onClearRange?: (classId: string, startDate: string, endDate: string) => void;
  initialData?: ClassDefinition;
}

const WEEK_DAYS = [
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
  { label: '日', value: 0 },
];

const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSave, onClearRange, initialData }) => {
  const [name, setName] = useState('');
  const [fee, setFee] = useState<number | string>('');
  const [mode, setMode] = useState<ClassMode>('offline');
  const [type, setType] = useState<ClassType>('Group');
  const [capacity, setCapacity] = useState<number | string>(''); 
  const [color, setColor] = useState(COLORS[0].value);
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [freq, setFreq] = useState<RecurringConfig['frequency']>('weekly');
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [recurStartDate, setRecurStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [recurEndDate, setRecurEndDate] = useState(format(addMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [updateMode, setUpdateMode] = useState<'future' | 'range'>('future');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setFee(initialData.fee === 0 ? '' : initialData.fee);
      setMode(initialData.mode);
      setType(initialData.type);
      setCapacity(initialData.capacity ?? '');
      setColor(initialData.color);

      // 如果有记忆的配置，自动填充
      if (initialData.batchConfig) {
        setStartTime(initialData.batchConfig.startTime);
        setEndTime(initialData.batchConfig.endTime);
        setFreq(initialData.batchConfig.frequency);
        setSelectedDays(initialData.batchConfig.daysOfWeek || [1]);
        if (initialData.batchConfig.startDate) setRecurStartDate(initialData.batchConfig.startDate);
        if (initialData.batchConfig.endDate) setRecurEndDate(initialData.batchConfig.endDate);
      }
    } else {
      setName('');
      setFee('');
      setMode('offline');
      setType('Group');
      setCapacity(''); 
      setColor(COLORS[0].value);
      setStartTime('09:00');
      setEndTime('10:30');
      setFreq('weekly');
      setSelectedDays([1]);
      setRecurStartDate(format(new Date(), 'yyyy-MM-dd'));
      setRecurEndDate(format(addMonths(new Date(), 1), 'yyyy-MM-dd'));
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const classDef: ClassDefinition = {
      id: initialData?.id || crypto.randomUUID(),
      name,
      fee: Number(fee) || 0,
      mode,
      type,
      capacity: type === 'Group' ? (Number(capacity) || 0) : undefined,
      color,
    };

    let recurring: any;
    if (isRecurring) {
      recurring = {
        classId: classDef.id,
        startTime,
        endTime,
        frequency: freq,
        daysOfWeek: freq === 'weekly' ? selectedDays : undefined,
        startDate: new Date(recurStartDate),
        endDate: new Date(recurEndDate),
        updateMode: updateMode
      };
    }

    onSave(classDef, recurring);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border dark:border-slate-700">
        <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">{initialData ? '编辑班级' : '创建新班级'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-gray-900 dark:text-white">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">班级名称</label>
            <input
              required
              className="w-full border border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: 六年级数学"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">课时费 (¥)</label>
              <input
                type="number"
                placeholder="输入金额"
                className="w-full border border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">授课方式</label>
              <select
                className="w-full border border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none"
                value={mode}
                onChange={(e) => setMode(e.target.value as ClassMode)}
              >
                <option value="offline">线下课程</option>
                <option value="online">网络课程</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">班级类型</label>
            <div className="flex gap-2">
              {(['VIP', '1-on-2', 'Group'] as ClassType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-all ${
                    type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  {t === 'Group' ? '班课' : t}
                </button>
              ))}
            </div>
          </div>

          {type === 'Group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">班级容量 (人)</label>
              <input
                type="number"
                placeholder="请输入人数"
                className="w-full border border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标签颜色</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === c.value ? 'scale-110 border-gray-800 dark:border-white' : 'border-transparent'
                  } ${c.value}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              <label htmlFor="recurring" className="text-sm font-bold text-gray-800 dark:text-gray-200 cursor-pointer">开启批量排课</label>
            </div>

            {isRecurring && (
              <div className="space-y-4 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-dashed border-gray-300 dark:border-slate-600">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">开始时间</label>
                    <input type="time" className="w-full border border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-1 text-sm" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">结束时间</label>
                    <input type="time" className="w-full border border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-1 text-sm" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">起始日期</label>
                    <input type="date" className="w-full border border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-1 text-sm" value={recurStartDate} onChange={e => setRecurStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">截止日期</label>
                    <input type="date" className="w-full border border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-1 text-sm" value={recurEndDate} onChange={e => setRecurEndDate(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">重复频率</label>
                  <select className="w-full border border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded p-1 text-sm font-medium" value={freq} onChange={e => setFreq(e.target.value as RecurringConfig['frequency'])}>
                    <option value="weekly">每周</option>
                    <option value="every_other">隔天一次</option>
                    <option value="daily">每天</option>
                  </select>
                </div>

                {freq === 'weekly' && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">选择周几</label>
                    <div className="flex justify-between gap-1">
                      {WEEK_DAYS.map(day => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`flex-1 h-8 text-[10px] font-bold rounded transition-all border ${
                            selectedDays.includes(day.value) 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                              : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                   <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">更新策略</label>
                   <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="updateMode" checked={updateMode === 'future'} onChange={() => setUpdateMode('future')} />
                        <span className="text-xs text-gray-700 dark:text-gray-300">仅对未来课程生效</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="updateMode" checked={updateMode === 'range'} onChange={() => setUpdateMode('range')} />
                        <span className="text-xs text-gray-700 dark:text-gray-300">仅对选定范围内生效</span>
                      </label>
                   </div>
                </div>

                {initialData && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onClearRange?.(initialData.id, recurStartDate, recurEndDate)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <Trash2 size={14} />
                      清除选定起止日期内的已排课程
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none font-bold"
            >
              完成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassModal;
