import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import Post from './Post.jsx';
import User from './User.jsx';
import styles from '../style/Search.module.css';

function Search() {
  const [openTab, setOpenTab] = useState('posts');
  const [posts, setPosts] = useState(null);
  const [users, setUsers] = useState(null);
  const [followedIds, setFollowedIds] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useOutletContext();

  useEffect(() => {
    if (currentUser) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((response) => response.json())
        .then((response) => {
          setFollowedIds(currentUser.following.map((user) => user.id));
          setUsers(response.users);
        });
    }

    if (searchParams.has('query')) {
      if (searchParams.get('query') !== '') {
        fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/posts/search?query=${searchParams.get('query')}`,

          {
            mode: 'cors',

            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        )
          .then((response) => response.json())
          .then((response) => setPosts(response.posts));
        fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/users/search?query=${searchParams.get('query')}`,

          {
            mode: 'cors',

            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        )
          .then((response) => response.json())
          .then((response) => setUsers(response.users));
      } else {
        setPosts(null);
        setUsers(null);
      }
    }
  }, [currentUser, searchParams]);

  function submitSearch(e) {
    e.preventDefault();
    setSearchParams({ query: e.target[0].value });
  }

  function replacePost(updatedPost) {
    const newPosts = posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post,
    );

    setPosts(newPosts);
  }

  function removePost(postId) {
    setPosts(posts.filter((post) => post.id !== postId));
  }

  return (
    <main>
      <form className={styles.searchForm} onSubmit={(e) => submitSearch(e)}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          height='24px'
          viewBox='0 -960 960 960'
          width='24px'
          fill='#808080'
        >
          <path d='M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z' />
        </svg>
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
        (openTab === 'posts' ? (
          <div>
            {posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                replacePost={(updatedPost) => replacePost(updatedPost)}
                removePost={(postId) => removePost(postId)}
              />
            ))}
          </div>
        ) : (
          <div>
            {users.map((user) => (
              <User
                key={user.id}
                user={user}
                bio={true}
                isFollowed={followedIds.includes(user.id)}
                replaceUser={(updatedUser) =>
                  setCurrentUser({
                    ...currentUser,
                    following: updatedUser.following,
                  })
                }
              />
            ))}
          </div>
        ))}
    </main>
  );
}

export default Search;
