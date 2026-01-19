import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import type { Task } from '../../../shared/types';
import './KanbanColumn.css';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onDelete: (id: number) => void;
  onToggle?: (id: number) => void;
  color: 'pending' | 'completed';
}

export const KanbanColumn = ({ id, title, tasks, onDelete, onToggle, color }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const taskIds = tasks.map((task) => task.id.toString());

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column kanban-column-${color} ${isOver ? 'kanban-column-over' : ''}`}
    >
      <div className="kanban-column-header">
        <h2 className="kanban-column-title">{title}</h2>
        <span className="kanban-column-count">{tasks.length}</span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="kanban-column-content">
          {tasks.length === 0 ? (
            <div className="kanban-column-empty">
              {color === 'pending' ? '✨ Drop tasks here' : '🎉 All done!'}
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onDelete={onDelete} onToggle={onToggle} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

