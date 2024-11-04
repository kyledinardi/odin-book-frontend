import PropTypes from 'prop-types';
import { Link, useOutletContext } from 'react-router-dom';
import styles from '../style/User.module.css';
import backendFetch from '../../ helpers/backendFetch';

function User({ user, bio, isFollowed, replaceUser, setError }) {
  const outletContext = useOutletContext();

  function setUserError(err) {
    if (outletContext) {
      const [setOutletError] = outletContext;
      setOutletError(err);
    } else {
      setError(err);
    }
  }

  async function follow() {
    const response = await backendFetch(
      setUserError,
      `/users/${isFollowed ? 'unfollow' : 'follow'}`,
      { method: 'PUT', body: JSON.stringify({ userId: user.id }) },
    );

    replaceUser(response.user);
  }

  return (
    <div className={styles.user}>
      <Link className={styles.userPfp} to={`/users/${user.id}`}>
        <img className='pfp' src={user.pfpUrl} alt='' />
      </Link>
      <Link className={styles.username} to={`/users/${user.id}`}>
        <strong>{user.displayName}</strong>
        <span className='gray'>{` @${user.username}`}</span>
      </Link>
      {user.id !== parseInt(localStorage.getItem('userId'), 10) && (
        <button className={styles.followButton} onClick={() => follow()}>
          {isFollowed ? 'Unfollow' : 'Follow'}
        </button>
      )}
      {!!bio && <p className={styles.bio}>{user.bio}</p>}
    </div>
  );
}

User.propTypes = {
  user: PropTypes.object,
  bio: PropTypes.bool,
  isFollowed: PropTypes.bool,
  replaceUser: PropTypes.func,
  setError: PropTypes.func,
};

export default User;
