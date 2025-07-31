import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from '../components/Post.jsx';
import User from '../components/User.jsx';
import { SEARCH_POSTS, SEARCH_USERS } from '../graphql/queries';
import { searchChache } from '../utils/apolloCache';
import styles from '../style/Search.module.css';

function Search() {
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [followedIds, setFollowedIds] = useState(null);
  const [openTab, setOpenTab] = useState('posts');

  const [currentUser, setCurrentUser] = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();

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

  function fetchMorePosts() {
    postsResult.fetchMore({
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
  }

  function fetchMoreUsers() {
    usersResult.fetchMore({
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
  }

  return (
    <main>
      <form
        className={styles.searchForm}
        onSubmit={(e) => {
          e.preventDefault();
          setSearchParams({ query: e.target[0].value });
        }}
      >
        <span className='material-symbols-outlined'>search</span>
        <input
          type='search'
          name='search'
          id='search'
          placeholder='Search'
          defaultValue={searchParams.get('query')}
        />
      </form>
      <div>
        <button
          className={`${styles.categoryButton} ${
            openTab === 'posts' ? styles.openTab : null
          }`}
          onClick={() => setOpenTab('posts')}
        >
          Posts
        </button>
        <button
          className={`${styles.categoryButton} ${
            openTab === 'users' ? styles.openTab : null
          }`}
          onClick={() => setOpenTab('users')}
        >
          Users
        </button>
      </div>
      {posts &&
        users &&
        followedIds &&
        (openTab === 'posts' ? (
          <div>
            {posts.length > 0 ? (
              <InfiniteScroll
                dataLength={posts.length}
                next={() => {
                  fetchMorePosts();
                }}
                hasMore={hasMorePosts}
                loader={
                  <div className='loaderContainer'>
                    <div className='loader'></div>
                  </div>
                }
                endMessage={<div></div>}
              >
                {posts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    replacePost={(updatedPost) =>
                      searchChache.updatePost(postsResult, updatedPost)
                    }
                    removePost={(postId) =>
                      searchChache.deletePost(postsResult, postId)
                    }
                    displayType='feed'
                  />
                ))}
              </InfiniteScroll>
            ) : (
              <h2>No post results for {`"${searchParams.get('query')}"`}</h2>
            )}
          </div>
        ) : (
          <div>
            {users.length > 0 ? (
              <InfiniteScroll
                dataLength={users.length}
                next={() => fetchMoreUsers()}
                hasMore={hasMoreUsers}
                loader={
                  <div className='loaderContainer'>
                    <div className='loader'></div>
                  </div>
                }
                endMessage={<div></div>}
              >
                {users.map((user) => (
                  <User
                    key={user.id}
                    user={user}
                    bio={true}
                    isFollowed={followedIds.includes(user.id)}
                    replaceUser={() => setCurrentUser()}
                  />
                ))}
              </InfiniteScroll>
            ) : (
              <h2>No user results for {`"${searchParams.get('query')}"`}</h2>
            )}
          </div>
        ))}
    </main>
  );
}

export default Search;
