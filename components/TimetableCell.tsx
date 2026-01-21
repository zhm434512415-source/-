
import React from 'react';
import { ScheduledClass } from '../types';
import { format, isSameDay } from 'date-fns';
import { getClassTypeIcon } from '../constants';
import { Trash2, Wifi } from 'lucide-react';
import { timeToMinutes } from '../utils';

interface TimetableCellProps {
  date: Date;
  isMainMonth: boolean;
  scheduledClasses: ScheduledClass[];
  timelineRange: { min: number, max: number };
  selectedInstanceId: string | null;
  onInstanceClick: (instance: ScheduledClass) => void;
  onDrop: () => void;
  onRemoveInstance: (instanceId: string) => void;
  onEditInstance: (instance: ScheduledClass) => void;
  scale: number;
  isConfidential?: boolean;
}

const TimetableCell: React.FC<TimetableCellProps> = ({ 
  date, 
  isMainMonth,
  scheduledClasses, 
  timelineRange,
  selectedInstanceId,
  onInstanceClick,
  onDrop, 
  onRemoveInstance,
  onEditInstance,
  scale,
  isConfidential = false
}) => {
  const isToday = isSameDay(new Date(), date);
  const totalMinutes = timelineRange.max - timelineRange.min;
  const pixelsPerMinute = 1;

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={(e) => {
        onDrop();
      }}
      className={`relative border-r dark:border-slate-700 last:border-r-0 transition-colors group ${
        !isMainMonth ? 'bg-gray-50/20 dark:bg-slate-900/20' : isToday ? 'bg-blue-50/20 dark:bg-blue-900/10' : 'bg-white dark:bg-slate-900'
      } ${isToday ? 'ring-2 ring-blue-500 ring-inset z-10' : ''}`}
      style={{ minHeight: `${totalMinutes * pixelsPerMinute}px` }}
    >
      <div className={`p-1 flex items-center justify-between sticky top-0 z-20 ${
        isToday ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-50/80 dark:bg-slate-800/80 group-hover:bg-gray-100 dark:group-hover:bg-slate-700'
      }`}>
        <div className="flex items-center gap-1.5">
          <span 
            className={`font-bold ${!isMainMonth && !isToday ? 'opacity-30' : 'dark:text-white'}`}
            style={{ fontSize: `${10 * scale}px` }}
          >
            {format(date, 'd')}
          </span>
          {isToday && <span style={{ fontSize: `${8 * scale}px` }} className="font-black uppercase tracking-wider bg-white/20 px-1 rounded">今日</span>}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.1]">
        {Array.from({ length: Math.ceil(totalMinutes / 60) }).map((_, i) => (
          <div key={i} className="border-b dark:border-slate-600 w-full" style={{ height: '60px' }} />
        ))}
      </div>

      <div className="relative w-full h-full">
        {scheduledClasses.map((item) => {
          const startMin = timeToMinutes(item.startTime);
          const endMin = timeToMinutes(item.endTime);
          const top = (startMin - timelineRange.min) * pixelsPerMinute;
          const height = Math.max((endMin - startMin) * pixelsPerMinute, 32);
          const isSelected = selectedInstanceId === item.instanceId;

          return (
            <div
              key={item.instanceId}
              onClick={(e) => { 
                e.stopPropagation(); 
                onInstanceClick(item); 
              }}
              className={`absolute left-1 right-1 rounded border shadow-sm transition-all p-1 flex flex-col group/item ${item.color} ${
                isSelected ? 'ring-2 ring-blue-600 ring-offset-1 z-40 scale-[1.02] shadow-xl' : 'hover:brightness-95 hover:z-30'
              }`}
              style={{ top: `${top}px`, height: `${height}px`, overflow: 'visible' }}
            >
              <div className="flex items-start justify-between relative z-10 mb-0.5">
                <span 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onEditInstance(item); 
                  }}
                  className="font-bold leading-normal bg-white/70 dark:bg-black/40 px-1 py-0 rounded text-gray-800 dark:text-gray-100 border border-black/10 dark:border-white/10 cursor-pointer hover:bg-white/90 dark:hover:bg-black/60 transition-colors inline-block whitespace-nowrap"
                  style={{ fontSize: `${8 * scale}px` }}
                  title="修改课程时间"
                >
                  {item.startTime}
                </span>

                <div className="flex gap-1 items-center">
                   {item.mode === 'online' && (
                     <Wifi 
                        size={10} 
                        style={{ transform: `scale(${scale})`, transformOrigin: 'right top' }} 
                        className="text-blue-600 dark:text-blue-300 drop-shadow-sm" 
                     />
                   )}
                   <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onRemoveInstance(item.instanceId); 
                    }}
                    className="opacity-40 lg:opacity-0 group-hover/item:opacity-100 p-0.5 hover:bg-black/10 rounded transition-all active:scale-90"
                  >
                    <Trash2 size={12} style={{ transform: `scale(${scale})`, transformOrigin: 'center' }} className="text-gray-900 dark:text-white" />
                  </button>
                </div>
              </div>
              
              <div 
                className="font-bold truncate leading-tight text-gray-900 dark:text-white drop-shadow-sm flex-1"
                style={{ fontSize: `${10 * scale}px` }}
              >
                <span className={isConfidential ? 'mosaic-blur block w-full' : 'transition-opacity duration-300'}>
                  {item.name}
                </span>
              </div>

              {height > 35 * scale && (
                <div className="flex items-center justify-between font-bold opacity-90 mt-0.5 text-gray-800 dark:text-white/90" style={{ fontSize: `${7 * scale}px` }}>
                  <span className="flex items-center gap-0.5">
                    {getClassTypeIcon(item.type, 10 * scale)}
                    <span className={isConfidential ? 'mosaic-blur' : ''}>
                      {item.type === 'Group' ? item.capacity : ''}
                    </span>
                  </span>
                  <span className={`bg-white/40 dark:bg-black/20 px-1 rounded border border-black/5 dark:border-white/5 transition-all duration-300 ${isConfidential ? 'mosaic-blur' : ''}`}>
                    ¥{item.fee}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimetableCell;
