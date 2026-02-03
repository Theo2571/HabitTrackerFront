# API-запросы проекта ReactHabit

Все запросы выполняются через `apiRequest` из `src/shared/api/base.ts` (axios). Базовый URL задаётся в `API_BASE_URL` (`src/shared/config/env.ts`). К каждому запросу автоматически добавляется заголовок `Authorization: Bearer <token>` (если токен есть в `localStorage`).

---

## 1. Auth API (`src/features/auth/api/authApi.ts`)

### 1.1 Регистрация

- **Метод:** `POST`
- **URL:** `/auth/register`
- **Тело запроса:** `RegisterCredentials`
  - `username: string`
  - `password: string`
- **Ответ:** `AuthResponse` — `{ token: string }`
- **Побочные эффекты:** сохраняет токен и профиль в `storage` (localStorage).

---

### 1.2 Вход (логин)

- **Метод:** `POST`
- **URL:** `/auth/login`
- **Тело запроса:** `LoginCredentials`
  - `username: string`
  - `password: string`
- **Ответ:** `AuthResponse` — `{ token: string }`
- **Побочные эффекты:** сохраняет токен и при необходимости создаёт/обновляет профиль в `storage`.

---

### 1.3 Выход (logout)

- **Метод:** не HTTP-запрос
- **Действие:** удаление токена и профиля из `storage` (локально).

---

## 2. User API (`src/entities/user/api/userApi.ts`)

### 2.1 Получить профиль текущего пользователя

- **Метод:** `GET`
- **URL:** `/users/me`
- **Тело запроса:** нет
- **Ответ:** `ServerProfile`
  - `username: string`
  - `email?: string`
  - `bio?: string`
  - `createdAt: string`

---

### 2.2 Обновить профиль

- **Метод:** `PUT`
- **URL:** `/users/me`
- **Тело запроса:** `UpdateProfilePayload`
  - `email?: string`
  - `bio?: string`
- **Ответ:** `ServerProfile` (та же структура, что и в 2.1).

---

## 3. Task API (`src/entities/task/api/taskApi.ts`)

### 3.1 Получить все задачи

- **Метод:** `GET`
- **URL:** `/tasks`
- **Тело запроса:** нет
- **Ответ:** `Task[]`
  - каждый элемент: `{ id: number; title: string; completed: boolean }` (и при наличии с бэкенда — `date`).

---

### 3.2 Создать задачу

- **Метод:** `POST`
- **URL:** `/tasks`
- **Тело запроса:**
  - `{ title: string }` — без даты
  - или `{ title: string; date: string }` — с датой
- **Ответ:** `Task` — созданная задача.

---

### 3.3 Переключить выполнение задачи (toggle)

- **Метод:** `PUT`
- **URL:** `/tasks/:id/toggle` (например, `/tasks/1/toggle`)
- **Тело запроса:** нет
- **Ответ:** `Task` — обновлённая задача.

---

### 3.4 Удалить задачу

- **Метод:** `DELETE`
- **URL:** `/tasks/:id` (например, `/tasks/1`)
- **Тело запроса:** нет
- **Ответ:** `void`.

---

### 3.5 Получить задачи по дате

- **Метод:** `GET`
- **URL:** `/tasks/by-date?date=<date>` (например, `/tasks/by-date?date=2025-02-03`)
- **Тело запроса:** нет
- **Ответ:** массив задач. Поддерживаются форматы ответа бэкенда:
  - массив напрямую: `Task[]`;
  - объект `{ tasksByDate: { [date]: Task[] } }`;
  - объект `{ [date]: Task[] }`.

---

### 3.6 Получить данные календаря (задачи по датам)

- **Метод:** `GET`
- **URL:** `/tasks/calendar`
- **Тело запроса:** нет
- **Ответ:** объект «дата → массив задач». Поддерживаются форматы:
  - `{ tasksByDate: Record<string, Task[]> }`;
  - или прямой `Record<string, Task[]>`.

---

## Сводная таблица

| Модуль   | Метод   | Endpoint                    | Описание                    |
|----------|---------|-----------------------------|-----------------------------|
| Auth     | POST    | `/auth/register`            | Регистрация                 |
| Auth     | POST    | `/auth/login`               | Вход                        |
| User     | GET     | `/users/me`                 | Получить профиль            |
| User     | PUT     | `/users/me`                 | Обновить профиль            |
| Task     | GET     | `/tasks`                    | Все задачи                  |
| Task     | POST    | `/tasks`                    | Создать задачу              |
| Task     | PUT     | `/tasks/:id/toggle`         | Переключить выполнение      |
| Task     | DELETE  | `/tasks/:id`                | Удалить задачу              |
| Task     | GET     | `/tasks/by-date?date=...`   | Задачи по дате              |
| Task     | GET     | `/tasks/calendar`           | Задачи по датам (календарь) |

---

## Обработка ошибок

- При ответах **401** или **403** токен удаляется из хранилища и выполняется редирект на `/login` (если текущий путь не `/login` и не `/register`).
- Ошибки API оборачиваются в класс `ApiError` (`src/shared/api/base.ts`) с полями: `message`, `status`, `statusText`, `data`.
- Таймаут запросов: **10 секунд** (задаётся в `axiosInstance` в `base.ts`).
