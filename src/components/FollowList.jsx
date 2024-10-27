import PropTypes from 'prop-types';
import { useOutletContext } from 'react-router-dom';
import User from './User.jsx';

function FollowList({ openTab, user, followedIds }) {
  const [, currentUser, setCurrentUser] = useOutletContext();

  function returnUser(userToReturn) {
    return (
      <User
        key={userToReturn.id}
        user={userToReturn}
        bio={true}
        isFollowed={followedIds.includes(userToReturn.id)}
        replaceUser={(updated) =>
          setCurrentUser({ ...currentUser, following: updated.following })
        }
      />
    );
  }

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

FollowList.propTypes = {
  openTab: PropTypes.string,
  user: PropTypes.object,
  followedIds: PropTypes.arrayOf(PropTypes.number),
};

export default FollowList;
