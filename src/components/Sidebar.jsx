import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../style/Sidebar.module.css';

function Sidebar({ currentUser }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.clear();
    navigate('/login');
  }

  return !currentUser ? (
    <h2>Loading...</h2>
  ) : (
    <aside className={styles.sidebarContainer}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarButtons}>
          <Link className={styles.sidebarButton} to='/'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='30px'
              viewBox='0 -960 960 960'
              width='30px'
              fill='#fff'
            >
              <path d='M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z' />
            </svg>
            <span>Home</span>
          </Link>
          <Link className={styles.sidebarButton} to={'/search'}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='30px'
              viewBox='0 -960 960 960'
              width='30px'
              fill='#fff'
            >
              <path d='M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z' />
            </svg>
            <span>Search</span>
          </Link>
          <Link
            className={styles.sidebarButton}
            to={`users/${currentUser.id}/follows`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='30px'
              viewBox='0 -960 960 960'
              width='30px'
              fill='#fff'
            >
              <path d='M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z' />
            </svg>
            <span>Follows</span>
          </Link>
          <Link
            className={styles.sidebarButton}
            to={`/users/${currentUser.id}`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='30px'
              viewBox='0 -960 960 960'
              width='30px'
              fill='#fff'
            >
              <path d='M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z' />
            </svg>
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
          <button className={styles.sidebarButton} onClick={() => logout()}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='30px'
              viewBox='0 -960 960 960'
              width='30px'
              fill='#fff'
            >
              <path d='M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z' />
            </svg>
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
