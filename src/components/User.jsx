import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from '../style/User.module.css';

function User({ user, isFollowed, replaceUser }) {
  async function follow() {
    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/${
        isFollowed ? 'unfollow' : 'follow'
      }`,

      {
        method: 'Put',
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({ userId: user.id }),
      },
    );

    const response = await responseStream.json();
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
      <button className={styles.followButton} onClick={() => follow()}>
        {isFollowed ? 'Unfollow' : 'Follow'}
      </button>
      <p className={styles.bio}>{user.bio}</p>
    </div>
  );
}

User.propTypes = {
  user: PropTypes.object,
  isFollowed: PropTypes.bool,
  replaceUser: PropTypes.func,
};

export default User;
