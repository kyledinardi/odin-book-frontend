import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from './Post.jsx';
import User from './User.jsx';
import backendFetch from '../../helpers/backendFetch';
import styles from '../style/Search.module.css';

function Search() {
  const [posts, setPosts] = useState(null);
  const [users, setUsers] = useState(null);
  const [followedIds, setFollowedIds] = useState(null);

  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [openTab, setOpenTab] = useState('posts');

  const [searchParams, setSearchParams] = useSearchParams();
  const [setError, currentUser, setCurrentUser] = useOutletContext();

  useEffect(() => {
    if (currentUser) {
      setFollowedIds(currentUser.following.map((user) => user.id));
    }
  }, [currentUser]);

  useEffect(() => {
    async function search() {
      const [postsResponse, usersResponse] = await Promise.all([
        backendFetch(
          setError,
          `/posts/search?query=${searchParams.get('query')}`,
        ),

        backendFetch(
          setError,
          `/users/search?query=${searchParams.get('query')}`,
        ),
      ]);

      setPosts(postsResponse.posts);
      setUsers(usersResponse.users);
      setHasMorePosts(postsResponse.posts.length === 20);
      setHasMoreUsers(usersResponse.users.length === 20);

      if (postsResponse.posts.length > 0 && usersResponse.users.length === 0) {
        setOpenTab('posts');
      }

      if (postsResponse.posts.length === 0 && usersResponse.users.length > 0) {
        setOpenTab('users');
      }
    }

    if (searchParams.has('query')) {
      if (searchParams.get('query') !== '') {
        search();
      } else {
        setPosts(null);
        setUsers(null);
        setHasMorePosts(false);
        setHasMoreUsers(false);
      }
    }
  }, [searchParams, setError]);

  async function addMorePosts() {
    const response = await backendFetch(
      setError,

      `/posts/search?query=${searchParams.get('query')}&postId=${
        posts[posts.length - 1].id
      }`,
    );

    setPosts([...posts, ...response.posts]);
    setHasMorePosts(response.posts.length === 20);
  }

  async function addMoreUsers() {
    const response = await backendFetch(
      setError,

      `/users/search?query=${searchParams.get('query')}&userId=${
        users[users.length - 1].id
      }`,
    );

    setUsers([...users, ...response.users]);
    setHasMoreUsers(response.users.length === 20);
  }

  function replacePost(updatedPost) {
    const newPosts = posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post,
    );

    setPosts(newPosts);
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
                next={() => addMorePosts()}
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
                    replacePost={(updatedPost) => replacePost(updatedPost)}
                    removePost={(postId) =>
                      setPosts(posts.filter((p) => p.id !== postId))
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
                next={() => addMoreUsers()}
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
                    replaceUser={(u) =>
                      setCurrentUser({ ...currentUser, following: u.following })
                    }
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
