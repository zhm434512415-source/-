
import { format, startOfWeek, addDays, getDay, getDate, differenceInDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth } from 'date-fns';
import { ScheduledClass, RecurringConfig, ClassDefinition } from './types';

export const generateMonthDays = (baseDate: Date) => {
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(monthStart);
  const start = startOfWeek(monthStart, { weekStartsOn: 1 });
  const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days: Date[] = [];
  let current = start;
  while (current <= end) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
};

// 将时间字符串转换为分钟数
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 获取课表范围内的分钟区间（默认 8:00 - 22:00，或根据课程动态调整）
export const getTimelineRange = (classes: ScheduledClass[]) => {
  let min = 8 * 60; // 08:00
  let max = 21 * 60; // 21:00

  classes.forEach(c => {
    const start = timeToMinutes(c.startTime);
    const end = timeToMinutes(c.endTime);
    if (start < min) min = Math.floor(start / 60) * 60;
    if (end > max) max = Math.ceil(end / 60) * 60;
  });

  return { min, max };
};

export const applyRecurrence = (
  classDef: ClassDefinition,
  config: any,
  today: Date
): ScheduledClass[] => {
  const instances: ScheduledClass[] = [];
  let current = new Date(config.startDate);
  const end = new Date(config.endDate);

  while (current <= end) {
    let shouldAdd = false;
    const dayOfWeek = getDay(current);

    switch (config.frequency) {
      case 'daily': shouldAdd = true; break;
      case 'weekly':
        if (config.daysOfWeek?.includes(dayOfWeek)) shouldAdd = true;
        break;
      case 'every_other':
        const diff = differenceInDays(current, config.startDate);
        if (diff % 2 === 0) shouldAdd = true;
        break;
    }

    if (shouldAdd) {
      instances.push({
        ...classDef,
        instanceId: crypto.randomUUID(),
        date: format(current, 'yyyy-MM-dd'),
        startTime: config.startTime,
        endTime: config.endTime,
      });
    }
    current = addDays(current, 1);
  }
  return instances;
};
