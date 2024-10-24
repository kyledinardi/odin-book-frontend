import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../style/Sidebar.module.css';

function Sidebar({ currentUser }) {
  const navigate = useNavigate();

  return !currentUser ? (
    <h2>Loading...</h2>
  ) : (
    <aside className={styles.sidebarContainer}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarButtons}>
          <Link className={styles.sidebarButton} to='/'>
            <span className={`material-symbols-outlined ${styles.menuSvg}`}>
              home
            </span>
            <span>Home</span>
          </Link>
          <Link className={styles.sidebarButton} to={'/search'}>
            <span className={`material-symbols-outlined ${styles.menuSvg}`}>
              search
            </span>
            <span>Search</span>
          </Link>
          <Link
            className={styles.sidebarButton}
            to={`users/${currentUser.id}/follows`}
          >
            <span className={`material-symbols-outlined ${styles.menuSvg}`}>
              group
            </span>
            <span>Follows</span>
          </Link>
          <Link
            className={styles.sidebarButton}
            to={`/users/${currentUser.id}`}
          >
            <span className={`material-symbols-outlined ${styles.menuSvg}`}>
              person
            </span>
            <span>Profile</span>
          </Link>
        </div>
        <div className={styles.user}>
          <div className={styles.userInfo}>
            <img className='pfp' src={currentUser.pfpUrl} alt='' />
            <div className={styles.names}>
              <span>{currentUser.displayName}</span>
              <span
                className={styles.username}
              >{`@${currentUser.username}`}</span>
            </div>
          </div>
          <button
            className={styles.sidebarButton}
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
          >
            <span className={`material-symbols-outlined ${styles.menuSvg}`}>
              logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  currentUser: PropTypes.object,
};

export default Sidebar;
