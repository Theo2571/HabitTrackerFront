import type { Task } from '../../../shared/types';
import styles from './HabitCard.module.css';

export interface HabitCardProps {
  task: Task;
  streak?: number;
  frequency?: string;
  reminder?: string;
  onToggle?: (id: number) => void;
  isUpdating?: boolean;
}

const defaultIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

export const HabitCard = ({
  task,
  streak = 0,
  frequency = 'Daily',
  reminder,
  onToggle,
  isUpdating = false,
}: HabitCardProps) => {
  const progress = task.completed ? 1 : 0;
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - progress * circumference;
  const streakStrong = streak >= 7;

  return (
    <div className={`${styles.card} ${task.completed ? styles.cardCompleted : ''}`}>
      <div className={styles.iconWrap}>{defaultIcon}</div>
      <div className={styles.content}>
        <div className={styles.name}>{task.title}</div>
        <div className={styles.meta}>
          <span className={styles.frequency}>{frequency}</span>
          {reminder && <span className={styles.reminder}> · {reminder}</span>}
        </div>
      </div>
      <div className={styles.streakWrap}>
        {streak > 0 && (
          <>
            <svg className={styles.streakFlame} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 23c0 0-8-4.5-8-11.5C4 7 6 3 12 3s8 4 8 8.5C20 18.5 12 23 12 23zm0-18c-2.8 0-5 2.2-5 5 0 3.3 2.5 6.2 5 8.5 2.5-2.3 5-5.2 5-8.5 0-2.8-2.2-5-5-5z" />
            </svg>
            <span className={streakStrong ? styles.streakStrong : ''}>{streak} day{streak !== 1 ? 's' : ''}</span>
          </>
        )}
      </div>
      <div className={styles.progressWrap}>
        <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden>
          <defs>
            <linearGradient id={`habitGradient-${task.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-violet)" />
              <stop offset="100%" stopColor="var(--accent-cyan)" />
            </linearGradient>
          </defs>
          <circle className={styles.progressBg} cx="22" cy="22" r="18" />
          <circle
            className={styles.progressStroke}
            cx="22"
            cy="22"
            r="18"
            transform="rotate(-90 22 22)"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke={`url(#habitGradient-${task.id})`}
          />
        </svg>
      </div>
      <button
        type="button"
        className={`${styles.checkBtn} ${task.completed ? styles.checkBtnCompleted : ''}`}
        onClick={() => onToggle?.(task.id)}
        disabled={isUpdating}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed ? (
          <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
          </svg>
        )}
      </button>
    </div>
  );
};
