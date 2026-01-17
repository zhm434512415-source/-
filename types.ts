
export type ClassMode = 'online' | 'offline';
export type ClassType = 'VIP' | 'Group' | '1-on-2';

export interface ClassDefinition {
  id: string;
  name: string;
  fee: number;
  mode: ClassMode;
  type: ClassType;
  capacity?: number;
  color: string;
}

export interface ScheduledClass extends ClassDefinition {
  instanceId: string;
  date: string; // ISO format: YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface RecurringConfig {
  classId: string;
  startTime: string;
  endTime: string;
  // Added 'every_other' to the frequency union to resolve type errors in utils.ts
  frequency: 'weekly' | 'odd' | 'even' | 'daily' | 'every_other';
  daysOfWeek?: number[]; // 0-6
  month?: number; // 0-11
}
