import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import User from './User.jsx';
import {
  GET_FOLLOWED_FOLLOWERS,
  GET_FOLLOWERS,
  GET_FOLLOWING,
  GET_MUTUALS,
} from '../graphql/queries';

function FollowList({ openTab, user, followedIds }) {
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  const [hasMoreMutuals, setHasMoreMutuals] = useState(true);
  const [hasMoreFf, setHasMoreFf] = useState(true);
  const [currentUser, setCurrentUser] = useOutletContext();

  const variables = { userId: user.id };
  const followingResult = useQuery(GET_FOLLOWING, { variables });
  const followersResult = useQuery(GET_FOLLOWERS, { variables });
  const mutualsResult = useQuery(GET_MUTUALS, { variables });

  const followedFollowersResult = useQuery(GET_FOLLOWED_FOLLOWERS, {
    variables,
    skip: user.id === currentUser.id,
  });

  const following = followingResult.data?.getFollowing;
  const followers = followersResult.data?.getFollowers;
  const mutuals = mutualsResult.data?.getMutuals;
  const ff = followedFollowersResult.data?.getFollowedFollowers;

  function fetchMoreFollowing() {
    followingResult.fetchMore({
      variables: { cursor: following[following.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newFollowing = fetchMoreResult.getFollowing;
        setHasMoreFollowing(newFollowing.length % 20 === 0);

        return {
          ...previousData,
          getFollowing: [...previousData.getFollowing, ...newFollowing],
        };
      },
    });
  }

  function fetchMoreFollowers() {
    followersResult.fetchMore({
      variables: { cursor: followers[followers.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newFollowers = fetchMoreResult.getFollowers;
        setHasMoreFollowers(newFollowers.length % 20 === 0);

        return {
          ...previousData,
          getFollowers: [...previousData.getFollowers, ...newFollowers],
        };
      },
    });
  }

  function fetchMoreMutuals() {
    mutualsResult.fetchMore({
      variables: { cursor: mutuals[mutuals.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newMutuals = fetchMoreResult.getMutuals;
        setHasMoreMutuals(newMutuals.length % 20 === 0);

        return {
          ...previousData,
          getMutuals: [...previousData.getMutuals, ...newMutuals],
        };
      },
    });
  }

  function fetchMoreFf() {
    followedFollowersResult.fetchMore({
      variables: { cursor: ff[ff.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newFf = fetchMoreResult.getFollowedFollowers;
        setHasMoreFf(newFf.length % 20 === 0);

        return {
          ...previousData,

          getFollowedFollowers: [
            ...previousData.getFollowedFollowers,
            ...newFf,
          ],
        };
      },
    });
  }

  const returnUser = (userToReturn) => (
    <User
      key={userToReturn.id}
      user={userToReturn}
      bio={true}
      isFollowed={followedIds.includes(Number(userToReturn.id))}
      replaceUser={() => setCurrentUser()}
    />
  );

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
            next={() => fetchMoreFollowing()}
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
            next={() => fetchMoreFollowers()}
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
          return (
            <h2>
              {user.id === currentUser.id
                ? 'You have no mutuals'
                : `${user.displayName} has no mutuals`}
            </h2>
          );
        }

        return (
          <InfiniteScroll
            dataLength={mutuals.length}
            next={() => fetchMoreMutuals()}
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
        if (ff.length === 0) {
          return (
            <h2>{`You aren't following any of ${user.displayName}'s followers`}</h2>
          );
        }

        return (
          <InfiniteScroll
            dataLength={ff.length}
            next={() => fetchMoreFf()}
            hasMore={hasMoreFf}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {ff.map((follower) => returnUser(follower))}
          </InfiniteScroll>
        );
      }

      default:
        throw new Error(`Invalid tab: ${openTab}`);
    }
  }
}

FollowList.propTypes = {
  openTab: PropTypes.string,
  user: PropTypes.object,
  followedIds: PropTypes.arrayOf(PropTypes.number),
};

export default FollowList;
