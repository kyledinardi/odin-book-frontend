import PropTypes from 'prop-types';
import User from './User.jsx';

function FollowList({
  openTab,
  user,
  currentUser,
  setCurrentUser,
  followedIds,
}) {
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
  currentUser: PropTypes.object,
  setCurrentUser: PropTypes.func,
  followedIds: PropTypes.arrayOf(PropTypes.number),
};

export default FollowList;
