import { Link } from 'react-router-dom';

import ProfileBar from './ProfileBar.tsx';
import styles from '../style/Sidebar.module.css';

import type { User } from '../types.ts';

const Sidebar = ({
  currentUser,
  logoutModal,
  notifCount,
  theme,
  setTheme,
}: {
  currentUser: User;
  logoutModal: React.RefObject<HTMLDialogElement | null>;
  notifCount: number;
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
}) => {
  function getNotifCount() {
    if (notifCount === 0) {
      return null;
    }

    if (notifCount > 20) {
      return '20+';
    }

    return notifCount;
  }

  return !currentUser ? (
    <div className='loaderContainer'>
      <div className='loader' />
    </div>
  ) : (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarButtons}>
        <Link className={styles.sidebarButton} to='/'>
          <span className={`material-symbols-outlined ${styles.menuSvg}`}>
            home
          </span>
          <span className={styles.sidebarLabel}>Home</span>
        </Link>
        <Link className={styles.sidebarButton} to={'/search'}>
          <span className={`material-symbols-outlined ${styles.menuSvg}`}>
            search
          </span>
          <span className={styles.sidebarLabel}>Search</span>
        </Link>
        <Link className={styles.sidebarButton} to='/notifications'>
          <div className={styles.notificationIcon}>
            <span className={`material-symbols-outlined ${styles.menuSvg}`}>
              notifications
            </span>
            <span className={styles.notificationCount}>{getNotifCount()}</span>
          </div>
          <span className={styles.sidebarLabel}>Notifications</span>
        </Link>
        <Link className={styles.sidebarButton} to='/messages'>
          <span className={`material-symbols-outlined ${styles.menuSvg}`}>
            mail
          </span>
          <span className={styles.sidebarLabel}>Messages</span>
        </Link>
        <Link
          className={styles.sidebarButton}
          to={`/users/${currentUser.id}/follows`}
        >
          <span className={`material-symbols-outlined ${styles.menuSvg}`}>
            group
          </span>
          <span className={styles.sidebarLabel}>Follows</span>
        </Link>
        <Link
          className={`${styles.sidebarButton} ${styles.profile}`}
          to={`/users/${currentUser.id}`}
        >
          <span className={`material-symbols-outlined ${styles.menuSvg}`}>
            person
          </span>
          <span className={styles.sidebarLabel}>Profile</span>
        </Link>
        <button
          className={`${styles.sidebarButton} ${styles.logOut}`}
          onClick={() => logoutModal.current?.showModal()}
          type='button'
        >
          <span className={`material-symbols-outlined ${styles.menuSvg}`}>
            logout
          </span>
          <span className={styles.sidebarLabel}>Log Out</span>
        </button>
      </div>
      <div className={styles.profileBar}>
        <ProfileBar
          currentUser={currentUser}
          setTheme={setTheme}
          theme={theme}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
