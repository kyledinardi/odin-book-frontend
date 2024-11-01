import PropTypes from 'prop-types';
import { Link, useOutletContext } from 'react-router-dom';
import styles from '../style/User.module.css';

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
    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/${
        isFollowed ? 'unfollow' : 'follow'
      }`,

      {
        method: 'Put',
        body: JSON.stringify({ userId: user.id }),

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const response = await responseStream.json();

    if (response.error) {
      setUserError(response.error);
      return;
    }

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
