import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ThemeSwitch from './ThemeSwitch.jsx';
import styles from '../style/ProfileBar.module.css';

function ProfileBar({ currentUser, logoutModal, theme, setTheme }) {
  return !currentUser ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <div className={styles.profileBar}>
      <div className={styles.user}>
        <Link to={`/users/${currentUser.id}`}>
          <img className='pfp' src={currentUser.pfpUrl} alt='' />
        </Link>
        <Link className={styles.names} to={`/users/${currentUser.id}`}>
          <span>{currentUser.displayName}</span>
          <span className='gray'>@{currentUser.username}</span>
        </Link>
      </div>
      <label className={styles.themeSwitch} htmlFor='theme'>
        <span className={styles.themeLabel}>Dark Mode</span>
        <ThemeSwitch theme={theme} setTheme={setTheme} />
      </label>
      <button
        className={`${styles.sidebarButton} ${styles.logOut}`}
        onClick={() => logoutModal.current.showModal()}
      >
        <span className={`material-symbols-outlined ${styles.menuSvg}`}>
          logout
        </span>
      </button>
    </div>
  );
}

ProfileBar.propTypes = {
  currentUser: PropTypes.object,
  logoutModal: PropTypes.object,
  theme: PropTypes.string,
  setTheme: PropTypes.func,
};

export default ProfileBar;
