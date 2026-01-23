// import { useState } from 'react';
import type { Task } from '../../../shared/types';
import styles from './DayCell.module.css';

interface DayCellProps {
  day: number;
  dateKey: string;
  tasks: Task[];
  isSelected: boolean;
  isCurrentDate?: boolean;
  onSelect: (date: string) => void;
}

export const DayCell = ({ day, dateKey, tasks, isSelected, isCurrentDate, onSelect }: DayCellProps) => {
  // const [showTooltip, setShowTooltip] = useState(false);
  const hasTasks = tasks.length > 0;

  const handleClick = () => {
    onSelect(dateKey);
  };

  // const handleMouseEnter = () => {
  //   if (hasTasks) {
  //     setShowTooltip(true);
  //   }
  // };

  // const handleMouseLeave = () => {
  //   setShowTooltip(false);
  // };

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.cell} ${hasTasks ? styles.hasTasks : ''} ${isSelected ? styles.selected : ''} ${isCurrentDate ? styles.currentDate : ''}`}
        onClick={handleClick}
        // onMouseEnter={handleMouseEnter}
        // onMouseLeave={handleMouseLeave}
        aria-label={`Day ${day}${hasTasks ? `, ${tasks.length} task${tasks.length > 1 ? 's' : ''}` : ''}${isCurrentDate ? ', current date' : ''}`}
      >
        <span className={styles.dayNumber}>{day}</span>
        {hasTasks && (
          <span className={styles.badge} title={`${tasks.length} task${tasks.length > 1 ? 's' : ''}`}>
            {tasks.length}
          </span>
        )}
      </button>
      {/* {showTooltip && hasTasks && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipDate}>
              {new Date(dateKey).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className={styles.tooltipTasks}>
              {tasks.map((task) => (
                <div key={task.id} className={styles.tooltipTask}>
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};
