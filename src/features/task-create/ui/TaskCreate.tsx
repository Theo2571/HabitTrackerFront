import { useState, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useCreateTaskMutation } from '../../../entities/task/model/useTaskQueries';
import styles from './TaskCreate.module.css';

const FREQUENCY_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

interface TaskCreateProps {
  selectedDate?: string;
}

export const TaskCreate = ({ selectedDate }: TaskCreateProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('');
  const [reminder, setReminder] = useState('');
  const createMutation = useCreateTaskMutation(selectedDate);

  const handleOpen = () => {
    setTitle('');
    setFrequency('');
    setReminder('');
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        date: selectedDate,
        frequency: frequency.trim() || undefined,
        reminder: reminder.trim() || undefined,
      });
      handleClose();
    } catch {
      // ошибка обрабатывается React Query
    }
  };

  return (
    <>
      <div className={styles.triggerRow}>
        <button
          type="button"
          className={styles.addButton}
          onClick={handleOpen}
          aria-label="Add task"
        >
          + Add task
        </button>
      </div>

      {modalOpen &&
        createPortal(
          <div className={styles.backdrop} onClick={handleClose} aria-hidden>
            <div
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="modal-title"
              aria-modal="true"
            >
              <div className={styles.modalHeader}>
                <h2 id="modal-title" className={styles.modalTitle}>
                  New habit
                </h2>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={handleClose}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="task-title">Title *</label>
                  <input
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Morning run"
                    className={styles.input}
                    disabled={createMutation.isPending}
                    autoFocus
                  />
                </div>

                {selectedDate && (
                  <div className={styles.formGroup}>
                    <label>Date</label>
                    <div className={styles.dateReadonly}>
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="task-frequency">Frequency</label>
                  <select
                    id="task-frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className={styles.select}
                    disabled={createMutation.isPending}
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt.value || 'none'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="task-reminder">Reminder</label>
                  <input
                    id="task-reminder"
                    type="text"
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value)}
                    placeholder="e.g. Утром в 8:00"
                    className={styles.input}
                    disabled={createMutation.isPending}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleClose}
                    disabled={createMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={createMutation.isPending || !title.trim()}
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
