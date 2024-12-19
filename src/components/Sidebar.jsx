import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import ProfileBar from './ProfileBar.jsx';
import styles from '../style/Sidebar.module.css';

function Sidebar({ currentUser, theme, setTheme }) {
  const logoutModal = useRef(null);
  const navigate = useNavigate();

  function getNotificationCount() {
    const n = currentUser._count.receivedNotifications;

    if (n === 0) {
      return null;
    }

    if (n > 20) {
      return '20+';
    }

    return n;
  }

  return !currentUser ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
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
            <span className={styles.notificationCount}>
              {getNotificationCount()}
            </span>
          </div>
          <span className={styles.sidebarLabel}>Notifications</span>
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
          className={styles.sidebarButton}
          onClick={() => logoutModal.current.showModal()}
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
          theme={theme}
          setTheme={setTheme}
        />
      </div>
      <dialog ref={logoutModal}>
        <h2>Are you sure you want to log out?</h2>
        <div className='modalButtons'>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('userId');
              navigate('/login');
            }}
          >
            Log Out
          </button>
          <button onClick={() => logoutModal.current.close()}>Cancel</button>
        </div>
      </dialog>
    </aside>
  );
}

Sidebar.propTypes = {
  currentUser: PropTypes.object,
  logoutModal: PropTypes.object,
  theme: PropTypes.string,
  setTheme: PropTypes.func,
};

export default Sidebar;
