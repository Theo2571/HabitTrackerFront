import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../../../entities/task/api/taskApi';
import { useToggleTaskMutation } from '../../../entities/task/model/useTaskQueries';
import { statsApi } from '../../../features/stats';
import { HabitCard } from '../../../widgets/habit-card';
import { WeeklyChart, MonthlyChart } from '../../../widgets/stats-charts';
import styles from './DashboardPage.module.css';

function getTodayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Даты за последние 7 дней (для недельного графика) */
function getLast7Days(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 6);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

/** Fallback стрик по id задачи, если бэкенд не отдал */
function getMockStreak(taskId: number): number {
  return (taskId % 5) + 1;
}

export const DashboardPage = () => {
  const today = getTodayISO();
  const { from: weekFrom, to: weekTo } = getLast7Days();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'by-date', today],
    queryFn: () => taskApi.getByDate(today),
    staleTime: 30 * 1000,
  });

  const { data: streaksMap = {} } = useQuery({
    queryKey: ['tasks', 'streaks', today],
    queryFn: () => taskApi.getStreaksForDate(today),
    staleTime: 60 * 1000,
    retry: false, // если бэкенд ещё не реализовал — не спамить, используем mock
  });

  const { data: weeklyStats } = useQuery({
    queryKey: ['stats', 'weekly', weekFrom, weekTo],
    queryFn: () => statsApi.getWeekly(weekFrom, weekTo),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: monthlyStats } = useQuery({
    queryKey: ['stats', 'monthly', year, month],
    queryFn: () => statsApi.getMonthly(year, month),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const toggleMutation = useToggleTaskMutation(today);

  return (
    <>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p className={styles.pageSubtitle}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Today&apos;s habits</h2>
        {isLoading ? (
          <div className={styles.empty}>Loading habits…</div>
        ) : tasks.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>No habits for today</div>
            Add tasks on the Tasks page to see them here as daily habits.
          </div>
        ) : (
          <div className={styles.habitsList}>
            {tasks.map((task) => (
              <HabitCard
                key={task.id}
                task={task}
                streak={task.streak ?? streaksMap[task.id] ?? getMockStreak(task.id)}
                frequency={task.frequency ?? 'Daily'}
                reminder={task.reminder}
                onToggle={toggleMutation.mutate}
                isUpdating={toggleMutation.isPending}
              />
            ))}
          </div>
        )}
      </section>

      <div className={styles.statsGrid}>
        <section className={styles.statsSection}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Weekly consistency</h3>
            <div className={styles.chartWrap}>
              <WeeklyChart data={weeklyStats?.data} />
            </div>
          </div>
        </section>
        <section className={styles.statsSection}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Monthly completion</h3>
            <div className={styles.chartWrap}>
              <MonthlyChart data={monthlyStats?.data} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
