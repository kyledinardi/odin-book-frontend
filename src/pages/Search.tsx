import { useEffect, useState } from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext, useSearchParams } from 'react-router-dom';

import PostCard from '../components/PostCard.tsx';
import UserCard from '../components/UserCard.tsx';
import { SEARCH_POSTS, SEARCH_USERS } from '../graphql/queries.ts';
import styles from '../style/Search.module.css';
import { searchChache } from '../utils/apolloCache.ts';
import logError from '../utils/logError.ts';

import type { AppContext } from '../types.ts';

const Search = () => {
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [openTab, setOpenTab] = useState('posts');

  const [currentUser, setCurrentUser] = useOutletContext<AppContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('query') || '');

  const postsResult = useQuery(SEARCH_POSTS, {
    variables: { query: searchParams.get('query') },
    skip: !searchParams.get('query'),
  });

  const usersResult = useQuery(SEARCH_USERS, {
    variables: { query: searchParams.get('query') },
    skip: !searchParams.get('query'),
  });

  const posts = postsResult.data?.searchPosts;
  const users = usersResult.data?.searchUsers;

  useEffect(() => {
    if (currentUser) {
      setFollowedIds(currentUser.following.map((user) => user.id));
    }
  }, [currentUser]);

  const fetchMorePosts = async () => {
    if (!posts) {
      throw new Error('No posts');
    }

    await postsResult.fetchMore({
      variables: { cursor: posts[posts.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newPosts = fetchMoreResult.searchPosts;
        setHasMorePosts(newPosts.length % 20 === 0 && newPosts.length > 0);

        return {
          ...previousData,
          searchPosts: [...previousData.searchPosts, ...newPosts],
        };
      },
    });
  };

  const fetchMoreUsers = async () => {
    if (!users) {
      throw new Error('No users');
    }

    await usersResult.fetchMore({
      variables: { cursor: users[users.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newUsers = fetchMoreResult.searchUsers;
        setHasMoreUsers(newUsers.length % 20 === 0 && newUsers.length > 0);

        return {
          ...previousData,
          searchUsers: [...previousData.searchUsers, ...newUsers],
        };
      },
    });
  };

  return (
    <main>
      <form
        className={styles.searchForm}
        onSubmit={(e) => {
          e.preventDefault();
          setSearchParams({ query: inputValue });
        }}
      >
        <span className='material-symbols-outlined'>search</span>
        <input
          id='search'
          name='search'
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='Search'
          type='search'
          value={inputValue}
        />
      </form>
      <div>
        <button
          onClick={() => setOpenTab('posts')}
          type='button'
          className={`${styles.categoryButton} ${
            openTab === 'posts' ? styles.openTab : null
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setOpenTab('users')}
          type='button'
          className={`${styles.categoryButton} ${
            openTab === 'users' ? styles.openTab : null
          }`}
        >
          Users
        </button>
      </div>
      {!!(posts && users) &&
        (openTab === 'posts' ? (
          <div>
            {posts.length === 0 ? (
              <h2>No post results for {`"${searchParams.get('query')}"`}</h2>
            ) : (
              <InfiniteScroll
                dataLength={posts.length}
                endMessage={<div />}
                hasMore={hasMorePosts}
                loader={
                  <div className='loaderContainer'>
                    <div className='loader' />
                  </div>
                }
                next={() => {
                  fetchMorePosts().catch(logError);
                }}
              >
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    displayType='feed'
                    post={post}
                    removePost={(postId) =>
                      searchChache.deletePost(postsResult, postId)
                    }
                    replacePost={(updatedPost) =>
                      searchChache.updatePost(postsResult, updatedPost)
                    }
                  />
                ))}
              </InfiniteScroll>
            )}
          </div>
        ) : (
          <div>
            {users.length > 0 ? (
              <h2>No user results for {`"${searchParams.get('query')}"`}</h2>
            ) : (
              <InfiniteScroll
                dataLength={users.length}
                endMessage={<div />}
                hasMore={hasMoreUsers}
                next={fetchMoreUsers}
                loader={
                  <div className='loaderContainer'>
                    <div className='loader' />
                  </div>
                }
              >
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    bio
                    isFollowed={followedIds.includes(user.id)}
                    replaceUser={setCurrentUser}
                    user={user}
                  />
                ))}
              </InfiniteScroll>
            )}
          </div>
        ))}
    </main>
  );
};

export default Search;
