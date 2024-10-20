import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import GifPicker from 'gif-picker-react';
import styles from '../style/NewPostForm.module.css';

function NewPostForm({ currentUser, posts, setPosts }) {
  const [newPostImagesrc, setNewPostImagesrc] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  function cancelNewPostImage() {
    fileInputRef.current.value = '';
    setNewPostImagesrc('');
    setGifUrl('');
  }

  async function submitPost(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('postText', e.target[0].value);
    formData.append('gifUrl', gifUrl);

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
    cancelNewPostImage();
    setPosts([response.post, ...posts]);
  }

  function handleFileInputChange(e) {
    const file = e.target.files[0];
    setGifUrl('');

    if (file) {
      setNewPostImagesrc(file);
    }
  }

  function resetTextareaHeight(e) {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  return (
    <>
      <dialog ref={modalRef}>
        <button
          className={styles.closeModalButton}
          onClick={() => modalRef.current.close()}
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
        <div className={styles.GifPicker}>
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
          required={!newPostImagesrc && !gifUrl}
        ></textarea>
        {(newPostImagesrc !== '' || gifUrl !== '') && (
          <div className={styles.imgPreview}>
            <img
              src={
                newPostImagesrc ? URL.createObjectURL(newPostImagesrc) : gifUrl
              }
              alt=''
            />
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
          <div className={styles.svgButtons}>
            <button className={styles.svgButton} type='button'>
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
            </button>
            <button
              className={styles.svgButton}
              type='button'
              onClick={() => modalRef.current.showModal()}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='24px'
                viewBox='0 -960 960 960'
                width='24px'
                fill='#6161FF'
              >
                <path d='M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm240-160h60v-240h-60v240Zm-160 0h80q17 0 28.5-11.5T400-400v-80h-60v60h-40v-120h100v-20q0-17-11.5-28.5T360-600h-80q-17 0-28.5 11.5T240-560v160q0 17 11.5 28.5T280-360Zm280 0h60v-80h80v-60h-80v-40h120v-60H560v240ZM200-200v-560 560Z' />
              </svg>
            </button>
          </div>
          <button className={styles.submitButton}>Post</button>
        </div>
      </form>
    </>
  );
}

NewPostForm.propTypes = {
  currentUser: PropTypes.object,
  posts: PropTypes.array,
  setPosts: PropTypes.func,
};

export default NewPostForm;
