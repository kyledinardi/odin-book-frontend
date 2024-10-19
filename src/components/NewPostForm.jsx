import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../style/NewPostForm.module.css';

function NewPostForm({ currentUser, posts, setPosts }) {
  const [newPostImagesrc, setNewPostImagesrc] = useState('');
  const fileInputRef = useRef(null);

  async function submitPost(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('postText', e.target[0].value);

    if (e.target[2].files) {
      formData.append('postImage', e.target[2].files[0]);
    }

    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/posts`,

      {
        method: 'POST',
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },

        body: formData,
      },
    );

    const response = await responseStream.json();
    e.target.reset();
    setPosts([response.post, ...posts]);
  }

  function cancelNewPostImage() {
    fileInputRef.current.value = '';
    setNewPostImagesrc('');
  }

  function handleFileInputChange(e) {
    const file = e.target.files[0];

    if (file) {
      setNewPostImagesrc(file);
    }
  }

  function resetTextareaHeight(e) {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  return (
    <form
      className={styles.postForm}
      encType='multipart/form-data'
      onSubmit={(e) => submitPost(e)}
    >
      <Link className={styles.currentUserPfp} to={`/users/${currentUser.id}`}>
        <img className='pfp' src={currentUser.pfpUrl} alt='' />
      </Link>
      <textarea
        className={styles.postText}
        name='postText'
        id='postText'
        maxLength={1000}
        placeholder='New Post'
        onInput={(e) => resetTextareaHeight(e)}
        required
      ></textarea>
      {newPostImagesrc !== '' && (
        <div className={styles.imgPreview}>
          <img src={URL.createObjectURL(newPostImagesrc)} alt='' />
          <button
            type='button'
            className={styles.cancelPreviewButton}
            onClick={() => cancelNewPostImage()}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='24px'
              viewBox='0 -960 960 960'
              width='24px'
              fill='#fff'
            >
              <path d='m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z' />
            </svg>
          </button>
        </div>
      )}
      <input
        type='file'
        name='postImage'
        id='postImage'
        accept='image/*'
        hidden
        ref={fileInputRef}
        onChange={(e) => handleFileInputChange(e)}
      />
      <div className={styles.formButtons}>
        <label htmlFor='postImage'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            height='24px'
            viewBox='0 -960 960 960'
            width='24px'
            fill='#6161FF'
          >
            <path d='M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z' />
          </svg>
        </label>
        <button className={styles.submitButton}>Post</button>
      </div>
    </form>
  );
}

NewPostForm.propTypes = {
  currentUser: PropTypes.object,
  posts: PropTypes.array,
  setPosts: PropTypes.func,
};

export default NewPostForm;
