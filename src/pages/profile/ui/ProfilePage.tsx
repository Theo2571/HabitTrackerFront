import { ProfileCard } from '../../../widgets/profile-card';
import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <ProfileCard />
      </div>
    </div>
  );
};

