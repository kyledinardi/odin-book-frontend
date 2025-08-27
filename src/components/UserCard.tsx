import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';

import { FOLLOW } from '../graphql/mutations.ts';
import styles from '../style/User.module.css';
import logError from '../utils/logError.ts';
import socket from '../utils/socket.ts';

import type { User as UserType } from '../types.ts';

const UserCard = ({
  user,
  replaceUser,
  isFollowed,
  bio,
}: {
  user: UserType;
  replaceUser: () => void;
  isFollowed: boolean;
  bio: boolean;
}) => {
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
        <img alt='' className='pfp' src={user.pfpUrl} />
      </Link>
      <Link className={styles.username} to={`/users/${user.id}`}>
        <strong>{user.displayName}</strong>
        <span className='gray'>{` @${user.username}`}</span>
      </Link>
      {user.id !== localStorage.getItem('userId') && (
        <button
          className={styles.followButton}
          type='button'
          onClick={() => {
            follow({ variables: { userId: user.id } }).catch(logError);
          }}
        >
          {isFollowed ? 'Unfollow' : 'Follow'}
        </button>
      )}
      {bio ? <p className={styles.bio}>{user.bio}</p> : null}
    </div>
  );
};

export default UserCard;
