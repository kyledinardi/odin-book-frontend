import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import styles from '../style/Follows.module.css';
import User from './User.jsx';

function Follows() {
  const [user, setUser] = useState(null);
  const [followedIds, setFollowedIds] = useState(null);
  const [openTab, setOpenTab] = useState('following');
  const [currentUser, setCurrentUser] = useOutletContext();
  const userId = parseInt(useParams().userId, 10);

  useEffect(() => {
    if (currentUser) {
      setFollowedIds(
        currentUser.following.map((followedUser) => followedUser.id),
      );
    }
  }, [currentUser]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`, {
      mode: 'cors',

      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => response.json())
      .then((response) => setUser(response.user));
  }, [userId]);

  function returnUser(returnedUser) {
    return (
      <User
        key={returnedUser.id}
        user={returnedUser}
        bio={true}
        isFollowed={followedIds.includes(returnedUser.id)}
        replaceUser={(updatedUser) =>
          setCurrentUser({
            ...currentUser,
            following: updatedUser.following,
          })
        }
      />
    );
  }

  function renderFollows() {
    switch (openTab) {
      case 'following':
        if (user.following.length === 0) {
          return (
            <h2>
              {user.id === currentUser.id
                ? 'You are not following anyone'
                : `${user.displayName} is not following anyone`}
            </h2>
          );
        }

        return user.following.map((followedUser) => returnUser(followedUser));

      case 'followers':
        if (user.followers.length === 0) {
          return (
            <h2>
              {user.id === currentUser.id
                ? 'You have no followers'
                : `${user.displayName} has no followers`}
            </h2>
          );
        }

        return user.followers.map((follower) => returnUser(follower));

      case 'followedFollowers': {
        const followedFollowers = user.followers.filter((follower) =>
          followedIds.includes(follower.id),
        );

        if (followedFollowers.length === 0) {
          return (
            <h2>{`You aren't following any of ${user.displayName}'s followers`}</h2>
          );
        }

        return followedFollowers.map((follower) => returnUser(follower));
      }

      default:
        return null;
    }
  }

  return !user || !currentUser || !followedIds ? (
    <h1>Loading...</h1>
  ) : (
    <main>
      <div className={styles.heading}>
        <h2>{user.displayName}</h2>
        <p>{`@${user.username}`}</p>
      </div>
      <div>
        <button
          className={`${styles.categoryButton} ${
            openTab === 'following' ? styles.openTab : null
          }`}
          onClick={() => setOpenTab('following')}
        >
          Following
        </button>
        <button
          className={`${styles.categoryButton} ${
            openTab === 'followers' ? styles.openTab : null
          }`}
          onClick={() => setOpenTab('followers')}
        >
          Followers
        </button>
        {userId !== currentUser.id && (
          <button
            className={`${styles.categoryButton} ${
              openTab === 'followedFollowers' ? styles.openTab : null
            }`}
            onClick={() => setOpenTab('followedFollowers')}
          >
            Followers you follow
          </button>
        )}
      </div>
      <div>{renderFollows()}</div>
    </main>
  );
}

export default Follows;
