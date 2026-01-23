import type { Task } from '../../../shared/types';

export const tasksMock: Record<string, Task[]> = {
  "2026-01-20": [
    { id: 1, title: "Fix login bug", completed: false },
    { id: 2, title: "Prepare report", completed: true }
  ],
  "2026-01-22": [
    { id: 3, title: "Meeting with team", completed: false }
  ],
  "2026-01-23": [
    { id: 4, title: "Code review", completed: false },
    { id: 5, title: "Update documentation", completed: true },
    { id: 6, title: "Team standup", completed: false }
  ],
  "2026-01-25": [
    { id: 7, title: "Deploy to production", completed: false }
  ],
  "2026-01-28": [
    { id: 8, title: "Client presentation", completed: false },
    { id: 9, title: "Prepare slides", completed: true }
  ]
};
