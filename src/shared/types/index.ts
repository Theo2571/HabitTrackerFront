export interface Task {
  id: number;
  title: string;
  completed: boolean;
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

