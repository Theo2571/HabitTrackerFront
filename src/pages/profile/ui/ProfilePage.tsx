import { ProfileCard } from '../../../widgets/profile-card';
import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Profile</h1>
      <p className={styles.subtitle}>Your account and stats</p>
      <ProfileCard />
    </div>
  );
};
