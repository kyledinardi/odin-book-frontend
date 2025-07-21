import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import User from './User.jsx';
import backendFetch from '../utils/backendFetch';

function FollowList({ openTab, user, followedIds }) {
  const [following, setFollowing] = useState(null);
  const [followers, setFollowers] = useState(null);
  const [mutuals, setMutuals] = useState(null);
  const [followedFollowers, setFollowedFollowers] = useState(null);

  const [hasMoreFollowing, setHasMoreFollowing] = useState(null);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(null);
  const [hasMoreMutuals, setHasMoreMutuals] = useState(null);
  const [hasMoreFfs, setHasMoreFfs] = useState(null);
  const [setError, currentUser, setCurrentUser] = useOutletContext();

  useEffect(() => {
    Promise.all([
      backendFetch(setError, `/users/${user.id}/following`),
      backendFetch(setError, `/users/${user.id}/followers`),
      backendFetch(setError, `/users/${user.id}/mutuals`),

      user.id !== currentUser.id &&
        backendFetch(setError, `/users/${user.id}/followedFollowers`),
    ]).then((responses) => {
      setFollowing(responses[0].users);
      setFollowers(responses[1].users);
      setMutuals(responses[2].users);
      setFollowedFollowers(responses[3].users);
      setHasMoreFollowing(responses[0].users.length === 20);
      setHasMoreFollowers(responses[1].users.length === 20);
      setHasMoreMutuals(responses[2].users.length === 20);

      if (user.id !== currentUser.id) {
        setHasMoreFfs(responses[3].users.length === 20);
      }
    });
  }, [user, currentUser, setError]);

  async function addMoreFollowing() {
    const response = await backendFetch(
      setError,

      `/users/${user.id}/following?userId=${
        following[following.length - 1].id
      }`,
    );

    setFollowing([...following, ...response.users]);
    setHasMoreFollowing(response.users.length === 20);
  }

  async function addMoreFollowers() {
    const response = await backendFetch(
      setError,

      `/users/${user.id}/followers?userId=${
        followers[followers.length - 1].id
      }`,
    );

    setFollowers([...followers, ...response.users]);
    setHasMoreFollowers(response.users.length === 20);
  }

  async function addMoreMutuals() {
    const response = await backendFetch(
      setError,
      `/users/${user.id}/mutuals?userId=${mutuals[mutuals.length - 1].id}`,
    );

    setMutuals([...mutuals, ...response.users]);
    setHasMoreMutuals(response.users.length === 20);
  }

  async function addMoreFfs() {
    const response = await backendFetch(
      setError,

      `/users/${user.id}/followedFollowers?userId=${
        followedFollowers[followedFollowers.length - 1].id
      }`,
    );

    setFollowedFollowers([...followedFollowers, ...response.users]);
    setHasMoreFfs(response.users.length === 20);
  }

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

  if (following) {
    switch (openTab) {
      case 'following':
        if (following.length === 0) {
          return (
            <h2>
              {user.id === currentUser.id
                ? 'You are not following anyone'
                : `${user.displayName} is not following anyone`}
            </h2>
          );
        }

        return (
          <InfiniteScroll
            dataLength={following.length}
            next={() => addMoreFollowing()}
            hasMore={hasMoreFollowing}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {following.map((followedUser) => returnUser(followedUser))}
          </InfiniteScroll>
        );

      case 'followers':
        if (followers.length === 0) {
          return (
            <h2>
              {user.id === currentUser.id
                ? 'You have no followers'
                : `${user.displayName} has no followers`}
            </h2>
          );
        }

        return (
          <InfiniteScroll
            dataLength={followers.length}
            next={() => addMoreFollowers()}
            hasMore={hasMoreFollowers}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {followers.map((follower) => returnUser(follower))}
          </InfiniteScroll>
        );

      case 'mutuals': {
        if (mutuals.length === 0) {
          return <h2>You have no mutuals</h2>;
        }

        return (
          <InfiniteScroll
            dataLength={mutuals.length}
            next={() => addMoreMutuals()}
            hasMore={hasMoreMutuals}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {mutuals.map((mutual) => returnUser(mutual))}
          </InfiniteScroll>
        );
      }

      case 'followedFollowers': {
        if (followedFollowers.length === 0) {
          return (
            <h2>{`You aren't following any of ${user.displayName}'s followers`}</h2>
          );
        }

        return (
          <InfiniteScroll
            dataLength={followedFollowers.length}
            next={() => addMoreFfs()}
            hasMore={hasMoreFfs}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {followedFollowers.map((follower) => returnUser(follower))}
          </InfiniteScroll>
        );
      }

      default:
        return null;
    }
  }
}

FollowList.propTypes = {
  openTab: PropTypes.string,
  user: PropTypes.object,
  followedIds: PropTypes.arrayOf(PropTypes.number),
};

export default FollowList;
