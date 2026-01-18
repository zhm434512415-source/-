
import React from 'react';
import { ClassDefinition } from '../types';
import { ModeIcon, getClassTypeIcon } from '../constants';
import { Trash2, Edit2 } from 'lucide-react';

interface ClassCardProps {
  classDef: ClassDefinition;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onEdit: (classDef: ClassDefinition) => void;
  onDelete: (id: string) => void;
  isConfidential?: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({ classDef, onDragStart, onEdit, onDelete, isConfidential = false }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, classDef.id)}
      className={`p-3 mb-2 rounded-lg border-l-4 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${classDef.color}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-bold text-sm flex items-center gap-1 dark:text-white">
            <span className={isConfidential ? 'mosaic-blur' : 'transition-all duration-300'}>
              {classDef.name}
            </span>
            <span className={isConfidential ? 'hidden' : ''}>
              <ModeIcon mode={classDef.mode} />
            </span>
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              {getClassTypeIcon(classDef.type)}
              <span className={isConfidential ? 'mosaic-blur' : 'transition-all duration-300'}>
                {classDef.type === 'Group' ? `${classDef.capacity}人` : classDef.type}
              </span>
            </span>
            <span>•</span>
            <span className={isConfidential ? 'mosaic-blur' : 'transition-all duration-300'}>
              ¥{classDef.fee}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(classDef); }}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-gray-500 dark:text-gray-300 transition-colors"
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(classDef.id); }}
            className="p-1 hover:bg-red-500/20 rounded text-red-500 dark:text-red-400 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
