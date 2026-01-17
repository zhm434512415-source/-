
import React from 'react';
import { Wifi, Users, User, UserPlus } from 'lucide-react';
import { ClassMode, ClassType } from './types';

export const COLORS = [
  { name: 'Red', value: 'bg-red-100 dark:bg-red-800 border-red-400 dark:border-red-600 text-red-900 dark:text-red-50' },
  { name: 'Blue', value: 'bg-blue-100 dark:bg-blue-800 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-50' },
  { name: 'Green', value: 'bg-green-100 dark:bg-green-800 border-green-400 dark:border-green-600 text-green-900 dark:text-green-50' },
  { name: 'Yellow', value: 'bg-yellow-100 dark:bg-yellow-700/80 border-yellow-400 dark:border-yellow-600 text-yellow-900 dark:text-yellow-50' },
  { name: 'Purple', value: 'bg-purple-100 dark:bg-purple-800 border-purple-400 dark:border-purple-600 text-purple-900 dark:text-purple-50' },
  { name: 'Indigo', value: 'bg-indigo-100 dark:bg-indigo-800 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-50' },
  { name: 'Pink', value: 'bg-pink-100 dark:bg-pink-800 border-pink-400 dark:border-pink-600 text-pink-900 dark:text-pink-50' },
  { name: 'Orange', value: 'bg-orange-100 dark:bg-orange-800 border-orange-400 dark:border-orange-600 text-orange-900 dark:text-orange-50' },
];

export const getClassTypeIcon = (type: ClassType, size: number = 14) => {
  switch (type) {
    case 'VIP': return <User size={size} />;
    case 'Group': return <Users size={size} />;
    case '1-on-2': return <UserPlus size={size} />;
  }
};

export const ModeIcon = ({ mode, size = 14 }: { mode: ClassMode, size?: number }) => {
  if (mode === 'online') {
    return <Wifi size={size} className="text-blue-500" />;
  }
  return null;
};
