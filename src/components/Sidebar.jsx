import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../style/Sidebar.module.css';

function Sidebar({ currentUser, logoutModal }) {
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
        <Link
          className={styles.sidebarButton}
          to={`users/${currentUser.id}/follows`}
        >
          <span className={`material-symbols-outlined ${styles.menuSvg}`}>
            group
          </span>
          <span className={styles.sidebarLabel}>Follows</span>
        </Link>
        <Link className={styles.sidebarButton} to={`/users/${currentUser.id}`}>
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
      <div className={styles.user}>
        <img className='pfp' src={currentUser.pfpUrl} alt='' />
        <div className={styles.names}>
          <span>{currentUser.displayName}</span>
          <span className={styles.username}>{`@${currentUser.username}`}</span>
        </div>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  currentUser: PropTypes.object,
  logoutModal: PropTypes.object,
};

export default Sidebar;
