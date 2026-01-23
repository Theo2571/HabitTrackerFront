import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarGrid } from './CalendarGrid';
import { TasksList } from './TasksList';
import { useCalendarData } from '../model/useCalendarData';
import { taskApi } from '../../../entities/task/api/taskApi';
import styles from './CalendarPopover.module.css';

interface CalendarPopoverProps {
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

export const CalendarPopover = ({ onClose, anchorRef }: CalendarPopoverProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем текущую дату из URL
  const currentDateFromUrl = new URLSearchParams(location.search).get('date');
  
  // Загружаем данные календаря с сервера
  const { data: calendarData = {}, isLoading: isLoadingCalendar } = useCalendarData();
  
  // Загружаем задачи для выбранной даты (если их нет в calendarData)
  const { data: selectedDateTasksFromApi = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', 'by-date', selectedDate],
    queryFn: () => selectedDate ? taskApi.getByDate(selectedDate) : Promise.resolve([]),
    enabled: !!selectedDate && !calendarData[selectedDate || ''],
    staleTime: 10 * 1000, // 10 секунд
  });

  // Используем данные из calendarData, если они есть, иначе из API
  const selectedDateTasks = selectedDate 
    ? (calendarData[selectedDate] || selectedDateTasksFromApi)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, anchorRef]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleGoToTasks = () => {
    if (selectedDate) {
      onClose();
      navigate(`/tasks?date=${selectedDate}`);
    }
  };

  return (
    <div ref={popoverRef} className={styles.popover} data-calendar-popover>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>Calendar</h3>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close calendar">
            ×
          </button>
        </div>
        <div className={styles.body}>
          {isLoadingCalendar ? (
            <div className={styles.loading}>Loading calendar...</div>
          ) : (
            <CalendarGrid 
              onDateSelect={handleDateSelect} 
              selectedDate={selectedDate}
              calendarData={calendarData}
              currentDateFromUrl={currentDateFromUrl}
            />
          )}
          {selectedDate && (
            <div className={styles.tasksSection}>
              <h4 className={styles.tasksTitle}>
                Tasks for {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h4>
              {isLoadingTasks ? (
                <div className={styles.loading}>Loading tasks...</div>
              ) : (
                <>
                  <TasksList tasks={selectedDateTasks} />
                  {selectedDate !== currentDateFromUrl && (
                    <button onClick={handleGoToTasks} className={styles.goToButton}>
                      {selectedDateTasks.length > 0 ? 'Go to Tasks →' : 'Create Tasks for This Date →'}
                    </button>
                  )}
                  {selectedDate === currentDateFromUrl && (
                    <div className={styles.currentDateMessage}>
                      You are already viewing tasks for this date
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
