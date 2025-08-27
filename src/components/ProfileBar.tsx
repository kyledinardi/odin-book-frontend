import { Link } from 'react-router-dom';

import ThemeSwitch from './ThemeSwitch.tsx';
import styles from '../style/ProfileBar.module.css';

import type { User } from '../types.ts';

const ProfileBar = ({
  currentUser,
  logoutModal,
  theme,
  setTheme,
}: {
  currentUser: User;
  logoutModal?: React.RefObject<HTMLDialogElement | null>;
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
}) =>
  !currentUser ? (
    <div className='loaderContainer'>
      <div className='loader' />
    </div>
  ) : (
    <div className={styles.profileBar}>
      <div className={styles.user}>
        <Link to={`/users/${currentUser.id}`}>
          <img alt='' className='pfp' src={currentUser.pfpUrl} />
        </Link>
        <Link className={styles.names} to={`/users/${currentUser.id}`}>
          <span>{currentUser.displayName}</span>
          <span className='gray'>@{currentUser.username}</span>
        </Link>
      </div>
      <label className={styles.themeSwitch} htmlFor='theme'>
        <span className={styles.themeLabel}>Dark Mode</span>
        <ThemeSwitch setTheme={setTheme} theme={theme} />
      </label>
      <button
        className={`${styles.sidebarButton} ${styles.logOut}`}
        onClick={() => logoutModal?.current?.showModal()}
        type='button'
      >
        <span className={`material-symbols-outlined ${styles.menuSvg}`}>
          logout
        </span>
      </button>
    </div>
  );

ProfileBar.defaultProps = {
  logoutModal: null,
};

export default ProfileBar;
