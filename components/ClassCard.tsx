import React from 'react';
import { ClassDefinition } from '../types';
import { ModeIcon, getClassTypeIcon } from '../constants';
import { Trash2, Edit2 } from 'lucide-react';

interface ClassCardProps {
  classDef: ClassDefinition;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onEdit: (classDef: ClassDefinition) => void;
  onDelete: (id: string) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ classDef, onDragStart, onEdit, onDelete }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, classDef.id)}
      className={`p-3 mb-2 rounded-lg border-l-4 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md bg-white dark:bg-slate-800 dark:border-slate-700 ${classDef.color.split(' ')[1]}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-bold text-sm flex items-center gap-1 dark:text-white">
            {classDef.name}
            <ModeIcon mode={classDef.mode} />
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              {getClassTypeIcon(classDef.type)}
              {classDef.type === 'Group' ? `${classDef.capacity}人` : classDef.type}
            </span>
            <span>•</span>
            <span>¥{classDef.fee}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(classDef); }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500 dark:text-gray-400"
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(classDef.id); }}
            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 dark:text-red-400"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;