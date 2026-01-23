import { useState } from 'react';
import { DayCell } from './DayCell';
import type { Task } from '../../../shared/types';
import styles from './CalendarGrid.module.css';

interface CalendarGridProps {
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
  calendarData: Record<string, Task[]>;
  currentDateFromUrl?: string | null;
}

export const CalendarGrid = ({ onDateSelect, selectedDate, calendarData, currentDateFromUrl }: CalendarGridProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDateKey = (day: number): string => {
    // Форматируем дату в формате YYYY-MM-DD без конвертации в UTC
    // чтобы избежать смещения на день из-за часовых поясов
    const date = new Date(year, month, day);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const renderDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className={styles.emptyCell}></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(day);
      const tasks = calendarData[dateKey] || [];
      const isSelected = selectedDate === dateKey;
      const isCurrentDate = currentDateFromUrl === dateKey;

      days.push(
        <DayCell
          key={day}
          day={day}
          dateKey={dateKey}
          tasks={tasks}
          isSelected={isSelected}
          isCurrentDate={isCurrentDate}
          onSelect={onDateSelect}
        />
      );
    }

    return days;
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={goToPreviousMonth} className={styles.navButton} aria-label="Previous month">
          ‹
        </button>
        <h4 className={styles.monthYear}>
          {monthNames[month]} {year}
        </h4>
        <button onClick={goToNextMonth} className={styles.navButton} aria-label="Next month">
          ›
        </button>
      </div>
      <div className={styles.weekDays}>
        {weekDays.map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>
      <div className={styles.grid}>{renderDays()}</div>
    </div>
  );
};
