
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
  batchConfig?: {
    startTime: string;
    endTime: string;
    frequency: 'weekly' | 'daily' | 'every_other';
    daysOfWeek?: number[];
    startDate?: string;
    endDate?: string;
  };
}

export interface ScheduledClass extends ClassDefinition {
  instanceId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface RecurringConfig {
  classId: string;
  startTime: string;
  endTime: string;
  frequency: 'weekly' | 'odd' | 'even' | 'daily' | 'every_other';
  daysOfWeek?: number[];
  month?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  status?: 'processing' | 'success' | 'error';
}
