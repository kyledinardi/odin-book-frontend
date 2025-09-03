import { useState } from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext } from 'react-router-dom';

import UserCard from './UserCard.tsx';
import {
  GET_FOLLOWED_FOLLOWERS,
  GET_FOLLOWERS,
  GET_FOLLOWING,
  GET_MUTUALS,
} from '../graphql/queries.ts';

import type { AppContext, User } from '../types.ts';

const FollowList = ({
  openTab,
  user,
  followedIds,
}: {
  openTab: string;
  user: User;
  followedIds: string[];
}) => {
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  const [hasMoreMutuals, setHasMoreMutuals] = useState(true);
  const [hasMoreFf, setHasMoreFf] = useState(true);
  const [currentUser, setCurrentUser] = useOutletContext<AppContext>();

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

  const readyToRender =
    following && followers && mutuals && (user.id === currentUser.id || ff);

  const fetchMoreFollowing = async () => {
    if (!following) {
      throw new Error('No following result');
    }

    await followingResult.fetchMore({
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
  };

  const fetchMoreFollowers = async () => {
    if (!followers) {
      throw new Error('No followers result');
    }

    await followersResult.fetchMore({
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
  };

  const fetchMoreMutuals = async () => {
    if (!mutuals) {
      throw new Error('No mutuals result');
    }

    await mutualsResult.fetchMore({
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
  };

  const fetchMoreFf = async () => {
    if (!ff) {
      throw new Error('No ff result');
    }

    await followedFollowersResult.fetchMore({
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
  };

  const returnUser = (userToReturn: User) => (
    <UserCard
      key={userToReturn.id}
      bio
      isFollowed={followedIds.includes(userToReturn.id)}
      replaceUser={setCurrentUser}
      user={userToReturn}
    />
  );

  if (!readyToRender) {
    return (
      <div className='loaderContainer'>
        <div className='loader' />
      </div>
    );
  }

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
          endMessage={<div />}
          hasMore={hasMoreFollowing}
          next={fetchMoreFollowing}
          loader={
            <div className='loaderContainer'>
              <div className='loader' />
            </div>
          }
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
          endMessage={<div />}
          hasMore={hasMoreFollowers}
          next={fetchMoreFollowers}
          loader={
            <div className='loaderContainer'>
              <div className='loader' />
            </div>
          }
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
          endMessage={<div />}
          hasMore={hasMoreMutuals}
          next={fetchMoreMutuals}
          loader={
            <div className='loaderContainer'>
              <div className='loader' />
            </div>
          }
        >
          {mutuals.map((mutual) => returnUser(mutual))}
        </InfiniteScroll>
      );
    }

    case 'followedFollowers': {
      if (!ff) {
        throw new Error('No ff result');
      }

      if (ff.length === 0) {
        return (
          <h2>{`You aren't following any of ${user.displayName}'s followers`}</h2>
        );
      }

      return (
        <InfiniteScroll
          dataLength={ff.length}
          endMessage={<div />}
          hasMore={hasMoreFf}
          next={fetchMoreFf}
          loader={
            <div className='loaderContainer'>
              <div className='loader' />
            </div>
          }
        >
          {ff.map((follower) => returnUser(follower))}
        </InfiniteScroll>
      );
    }

    default:
      throw new Error(`Invalid tab: ${openTab}`);
  }
};

export default FollowList;
