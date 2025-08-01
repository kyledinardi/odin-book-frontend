import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import PropTypes from 'prop-types';
import { FOLLOW } from '../graphql/mutations';
import logError from '../utils/logError';
import socket from '../utils/socket';
import styles from '../style/User.module.css';

function User({ user, replaceUser, isFollowed, bio }) {
  const [follow] = useMutation(FOLLOW, {
    onError: logError,

    onCompleted: () => {
      replaceUser();

      if (!isFollowed && user.id !== localStorage.getItem('userId')) {
        socket.emit('sendNotification', { userId: user.id });
      }
    },
  });
  

  return (
    <div className={styles.user}>
      <Link className={styles.userPfp} to={`/users/${user.id}`}>
        <img className='pfp' src={user.pfpUrl} alt='' />
      </Link>
      <Link className={styles.username} to={`/users/${user.id}`}>
        <strong>{user.displayName}</strong>
        <span className='gray'>{` @${user.username}`}</span>
      </Link>
      {user.id !== localStorage.getItem('userId') && (
        <button
          className={styles.followButton}
          onClick={() => follow({ variables: { userId: user.id } })}
        >
          {isFollowed ? 'Unfollow' : 'Follow'}
        </button>
      )}
      {bio && <p className={styles.bio}>{user.bio}</p>}
    </div>
  );
}

User.propTypes = {
  user: PropTypes.object,
  replaceUser: PropTypes.func,
  isFollowed: PropTypes.bool,
  bio: PropTypes.bool,
};

export default User;
