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
  const modalRef = useRef(null);
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
    <h1>Loading...</h1>
  ) : (
    <main>
      <dialog ref={modalRef}>
        <button
          className={styles.closeModalButton}
          onClick={() => modalRef.current.close()}
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
              modalRef.current.close();
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
          modalRef={modalRef}
          posts={posts}
          setPosts={(p) => setPosts(p)}
          newPostImagesrc={newPostImagesrc}
          gifUrl={gifUrl}
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
