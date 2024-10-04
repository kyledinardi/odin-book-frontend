/* eslint-disable no-underscore-dangle */
import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Post from './Post.jsx';

function Home() {
  const [posts, setPosts] = useState(null);
  const [newPostImagesrc, setNewPostImagesrc] = useState('');
  const fileInputRef = useRef(null);
  const [currentUser] = useOutletContext();

  useEffect(() => {
    fetch('http://localhost:3000/posts/index', {
      mode: 'cors',

      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => response.json())
      .then((response) => setPosts(response.posts));
  }, []);

  async function submitPost(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('postText', e.target[0].value);
    formData.append('postImage', e.target[1].files[0]);

    const responseStream = await fetch('http://localhost:3000/posts', {
      method: 'POST',
      mode: 'cors',

      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },

      body: formData,
    });

    const response = await responseStream.json();
    e.target.reset();
    setPosts([response.post, ...posts]);
  }

  function handleFileInputChange(e) {
    const file = e.target.files[0];

    if (file) {
      setNewPostImagesrc(file);
    }
  }

  function cancelNewPostImage() {
    fileInputRef.current.value = '';
    setNewPostImagesrc('');
  }

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
      <form encType='multipart/form-data' onSubmit={(e) => submitPost(e)}>
        <img src={currentUser.pfpUrl} alt='' />
        <textarea
          name='postText'
          id='postText'
          cols='30'
          rows='10'
          placeholder='New Post'
          required
        ></textarea>{' '}
        {newPostImagesrc !== '' && (
          <div>
            <img src={URL.createObjectURL(newPostImagesrc)} alt='' />
            <button
              type='button'
              className='svgButton'
              onClick={() => cancelNewPostImage()}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='24px'
                viewBox='0 -960 960 960'
                width='24px'
                fill='#000'
              >
                <path d='m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z' />
              </svg>
            </button>
          </div>
        )}
        <label htmlFor='postImage'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            height='24px'
            viewBox='0 -960 960 960'
            width='24px'
            fill='#000'
          >
            <path d='M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z' />
          </svg>
        </label>
        <input
          type='file'
          name='postImage'
          id='postImage'
          accept='image/*'
          hidden
          ref={fileInputRef}
          onChange={(e) => handleFileInputChange(e)}
        />
        <button>Post</button>
      </form>
      <div>
        {posts.length === 0 ? (
          <h2>You and your followers have no posts.</h2>
        ) : (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              replacePost={(updatedPost) => replacePost(updatedPost)}
            />
          ))
        )}
      </div>
    </main>
  );
}

export default Home;
