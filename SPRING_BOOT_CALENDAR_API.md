# Spring Boot API для календаря задач

## 1. Обновите Task Entity

Добавьте поле `date` в вашу Task entity:

```java
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    private Boolean completed;
    
    @Column(name = "due_date")
    private LocalDate date; // Добавьте это поле
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    // Геттеры и сеттеры
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
}
```

## 2. Обновите TaskDTO

```java
public class TaskDTO {
    private Long id;
    private String title;
    private Boolean completed;
    private LocalDate date; // Добавьте это поле
    
    // Геттеры и сеттеры
}
```

## 3. Создайте CalendarDTO для ответа

```java
public class CalendarResponseDTO {
    private Map<String, List<TaskDTO>> tasksByDate;
    
    public CalendarResponseDTO() {
        this.tasksByDate = new HashMap<>();
    }
    
    public Map<String, List<TaskDTO>> getTasksByDate() {
        return tasksByDate;
    }
    
    public void setTasksByDate(Map<String, List<TaskDTO>> tasksByDate) {
        this.tasksByDate = tasksByDate;
    }
}
```

## 4. Добавьте методы в TaskRepository

```java
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdAndDate(Long userId, LocalDate date);
    
    List<Task> findByUserId(Long userId);
    
    // Для получения всех задач пользователя с датами
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.date IS NOT NULL")
    List<Task> findAllByUserIdWithDate(@Param("userId") Long userId);
}
```

## 5. Создайте TaskController с новыми эндпоинтами

```java
@RestController
@RequestMapping("/tasks")
@PreAuthorize("hasRole('USER')")
public class TaskController {
    
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private AuthenticationService authenticationService;
    
    // Существующие эндпоинты...
    
    /**
     * Получить задачи по конкретной дате
     * GET /tasks/by-date?date=2026-01-23
     */
    @GetMapping("/by-date")
    public ResponseEntity<List<TaskDTO>> getTasksByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        
        Long userId = authenticationService.getUserIdFromAuthentication(authentication);
        List<TaskDTO> tasks = taskService.getTasksByDate(userId, date);
        
        return ResponseEntity.ok(tasks);
    }
    
    /**
     * Получить все задачи сгруппированные по датам для календаря
     * GET /tasks/calendar
     * Возвращает: { "2026-01-20": [{id, title, completed}], "2026-01-22": [...] }
     */
    @GetMapping("/calendar")
    public ResponseEntity<Map<String, List<TaskDTO>>> getCalendarData(
            Authentication authentication) {
        
        Long userId = authenticationService.getUserIdFromAuthentication(authentication);
        Map<String, List<TaskDTO>> calendarData = taskService.getCalendarData(userId);
        
        return ResponseEntity.ok(calendarData);
    }
}
```

## 6. Добавьте методы в TaskService

```java
@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private TaskMapper taskMapper; // Если используете MapStruct
    
    /**
     * Получить задачи по дате
     */
    public List<TaskDTO> getTasksByDate(Long userId, LocalDate date) {
        List<Task> tasks = taskRepository.findByUserIdAndDate(userId, date);
        return tasks.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Получить все задачи сгруппированные по датам
     */
    public Map<String, List<TaskDTO>> getCalendarData(Long userId) {
        List<Task> tasks = taskRepository.findAllByUserIdWithDate(userId);
        
        Map<String, List<TaskDTO>> tasksByDate = tasks.stream()
                .filter(task -> task.getDate() != null)
                .collect(Collectors.groupingBy(
                    task -> task.getDate().toString(), // "YYYY-MM-DD"
                    Collectors.mapping(
                        this::toDTO,
                        Collectors.toList()
                    )
                ));
        
        return tasksByDate;
    }
    
    private TaskDTO toDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setCompleted(task.getCompleted());
        dto.setDate(task.getDate());
        return dto;
    }
}
```

## 7. Обновите метод создания задачи

При создании задачи теперь можно передавать дату:

```java
@PostMapping
public ResponseEntity<TaskDTO> createTask(
        @RequestBody CreateTaskRequest request,
        Authentication authentication) {
    
    Long userId = authenticationService.getUserIdFromAuthentication(authentication);
    
    Task task = new Task();
    task.setTitle(request.getTitle());
    task.setDate(request.getDate()); // Добавьте это
    task.setCompleted(false);
    task.setUser(userService.findById(userId));
    
    Task savedTask = taskRepository.save(task);
    return ResponseEntity.ok(toDTO(savedTask));
}
```

## 8. CreateTaskRequest DTO

```java
public class CreateTaskRequest {
    private String title;
    private LocalDate date; // Опциональное поле
    
    // Геттеры и сеттеры
}
```

## 9. Миграция базы данных (Liquibase/Flyway)

Добавьте колонку `due_date` в таблицу `tasks`:

```sql
-- Liquibase example
<changeSet id="add-due-date-to-tasks" author="your-name">
    <addColumn tableName="tasks">
        <column name="due_date" type="date">
            <constraints nullable="true"/>
        </column>
    </addColumn>
</changeSet>
```

Или для Flyway:

```sql
-- V2__add_due_date_to_tasks.sql
ALTER TABLE tasks ADD COLUMN due_date DATE;
```

## 10. Пример ответа API

### GET /tasks/calendar
```json
{
  "2026-01-20": [
    {
      "id": 1,
      "title": "Fix login bug",
      "completed": false
    },
    {
      "id": 2,
      "title": "Prepare report",
      "completed": true
    }
  ],
  "2026-01-22": [
    {
      "id": 3,
      "title": "Meeting with team",
      "completed": false
    }
  ]
}
```

### GET /tasks/by-date?date=2026-01-20
```json
[
  {
    "id": 1,
    "title": "Fix login bug",
    "completed": false
  },
  {
    "id": 2,
    "title": "Prepare report",
    "completed": true
  }
]
```

## 11. Настройка CORS (если нужно)

Убедитесь, что CORS настроен правильно в вашем `WebConfig` или `SecurityConfig`:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/tasks/**")
                .allowedOrigins("http://localhost:5173") // Ваш frontend URL
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## Важные моменты:

1. **Формат даты**: Используйте формат `YYYY-MM-DD` (ISO 8601)
2. **Аутентификация**: Все эндпоинты должны быть защищены JWT токеном
3. **Фильтрация по пользователю**: Всегда фильтруйте задачи по `userId` из токена
4. **Null safety**: Поле `date` может быть `null` для задач без даты
5. **Валидация**: Добавьте валидацию даты в DTO

## Тестирование:

```bash
# Получить календарь
curl -X GET "http://localhost:8080/tasks/calendar" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Получить задачи по дате
curl -X GET "http://localhost:8080/tasks/by-date?date=2026-01-20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
