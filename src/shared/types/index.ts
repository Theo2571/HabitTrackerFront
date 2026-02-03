export interface Task {
  id: number;
  title: string;
  completed: boolean;
  /** Дата в формате YYYY-MM-DD (если бэкенд присылает) */
  date?: string;
  /** Частота привычки: daily, weekly (опционально с бэка) */
  frequency?: string;
  /** Текст напоминания (опционально с бэка) */
  reminder?: string;
  /** Текущий стрик в днях (опционально с бэка или из /tasks/streaks) */
  streak?: number;
}

/** Точка для графика «неделя»: день + процент выполнения */
export interface WeeklyStatsPoint {
  day: string; // e.g. "Mon", "Tue"
  date?: string; // YYYY-MM-DD для сортировки
  completion: number; // 0–100
}

/** Точка для графика «месяц»: неделя + количество выполненных привычек */
export interface MonthlyStatsPoint {
  week: string; // e.g. "W1", "W2"
  count: number;
}

/** Ответ GET /stats/weekly */
export interface WeeklyStatsResponse {
  data: WeeklyStatsPoint[];
}

/** Ответ GET /stats/monthly */
export interface MonthlyStatsResponse {
  data: MonthlyStatsPoint[];
}

/** Ответ GET /tasks/streaks?date= — маппинг taskId → текущий стрик в днях */
export interface StreaksResponse {
  streaks: Record<number, number>;
}

export interface AuthResponse {
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

export interface UserProfile {
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  stats?: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  };
}

