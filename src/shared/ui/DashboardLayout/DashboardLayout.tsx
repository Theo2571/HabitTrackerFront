import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../../features/auth/api/authApi';
import { useProfile } from '../../../entities/user/model/useProfile';
import { ProfileAvatar } from '../../../entities/user/ui/ProfileAvatar';
import styles from './DashboardLayout.module.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: DashboardIcon },
  { path: '/tasks', label: 'Tasks', icon: TasksIcon },
  { path: '/profile', label: 'Profile', icon: ProfileIcon },
];

function DashboardIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function TasksIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const MOBILE_BREAKPOINT = 768;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  // Блокировать прокрутку только на мобильной ширине; при ресайзе на десктоп — снять блок
  useEffect(() => {
    const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

    const updateBodyLock = () => {
      if (sidebarOpen && isMobile()) {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      } else {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
    };

    updateBodyLock();
    window.addEventListener('resize', updateBodyLock);

    return () => {
      window.removeEventListener('resize', updateBodyLock);
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [sidebarOpen]);

  return (
    <div className={styles.layout}>
      <header className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <span className={styles.mobileLogo}>Habit Tracker</span>
      </header>

      <div
        className={`${styles.backdrop} ${sidebarOpen ? styles.backdropVisible : ''}`}
        onClick={closeSidebar}
        onKeyDown={(e) => e.key === 'Escape' && closeSidebar()}
        role="button"
        tabIndex={-1}
        aria-hidden
      />

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>Habit Tracker</div>
          <button
            type="button"
            className={styles.closeSidebarBtn}
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <li key={path} className={styles.navItem}>
                  <Link
                    to={path}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    onClick={closeSidebar}
                  >
                    <Icon />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.userMenu}>
            <ProfileAvatar username={profile?.username ?? ''} size="small" />
            <div className={styles.userInfo}>
              <div className={styles.userName}>{profile?.username ?? 'User'}</div>
            </div>
            <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
              Log out
            </button>
          </div>
        </div>
      </aside>
      <main className={styles.main}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
    </div>
  );
};
