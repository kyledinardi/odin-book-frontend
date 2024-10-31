import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import GifPicker from 'gif-picker-react';
import Post from './Post.jsx';
import NewPostForm from './NewPostForm.jsx';
import styles from '../style/Home.module.css';

function Home() {
  const [posts, setPosts] = useState(null);
  const [newPostImagesrc, setNewPostImagesrc] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const gifModal = useRef(null);
  const [setError, currentUser] = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/index`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => response.json())

      .then((response) => {
        if (response.error) {
          setError(response.error);
          return;
        }

        setPosts(response.posts);
      });
  }, [setError, navigate]);

  function replacePost(updatedPost) {
    const newPosts = posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post,
    );

    setPosts(newPosts);
  }

  return !currentUser || !posts ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <dialog ref={gifModal}>
        <button
          className={styles.closeModalButton}
          onClick={() => gifModal.current.close()}
        >
          <span className='material-symbols-outlined closeButton'>close</span>
        </button>
        <div>
          <GifPicker
            tenorApiKey={import.meta.env.VITE_TENOR_API_KEY}
            theme='dark'
            onGifClick={(selected) => {
              setGifUrl(selected.url);
              setNewPostImagesrc('');
              gifModal.current.close();
            }}
          />
        </div>
      </dialog>
      <div className={styles.formSection}>
        <div className={styles.currentUserPfp}>
          <Link to={`/users/${currentUser.id}`}>
            <img className='pfp' src={currentUser.pfpUrl} alt='' />
          </Link>
        </div>
        <NewPostForm
          gifModal={gifModal}
          posts={posts}
          newPostImagesrc={newPostImagesrc}
          gifUrl={gifUrl}
          setPosts={(p) => setPosts(p)}
          setNewPostImagesrc={(src) => setNewPostImagesrc(src)}
          setGifUrl={(url) => setGifUrl(url)}
        />
      </div>
      <div>
        {posts.length === 0 ? (
          <h2 className='nothingHere'>You and your followers have no posts.</h2>
        ) : (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              replacePost={(updatedPost) => replacePost(updatedPost)}
              removePost={(postId) =>
                setPosts(posts.filter((p) => p.id !== postId))
              }
            />
          ))
        )}
      </div>
    </main>
  );
}

export default Home;
