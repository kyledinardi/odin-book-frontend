import { useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import PollInputs from './PollInputs.jsx';
import styles from '../style/NewPostForm.module.css';

function NewPostForm({
  modalRef,
  posts,
  setPosts,
  newPostImagesrc,
  gifUrl,
  setNewPostImagesrc,
  setGifUrl,
}) {
  const [isPoll, setIsPoll] = useState(false);
  const [pollChoiceCount, setPollChoiceCount] = useState(2);
  const fileInputRef = useRef(null);
  const [setError] = useOutletContext();

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
        body: formData,

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    const response = await responseStream.json();

    if (response.error) {
      setError(response.error);
      return;
    }

    cancelNewPostImage();
    e.target.reset();
    setPosts([response.post, ...posts]);
  }

  async function sumbitPoll(e) {
    e.preventDefault();
    const choiceArray = [];

    for (let i = 1; i <= pollChoiceCount; i += 1) {
      choiceArray.push(e.target[i].value);
    }

    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/polls`,

      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          question: e.target[0].value,
          choices: choiceArray,
        }),
      },
    );

    const response = await responseStream.json();

    if (response.error) {
      setError(response.error);
      return;
    }

    cancelNewPostImage();
    setIsPoll(false);
    e.target.reset();
    setPosts([response.post, ...posts]);
  }

  function handleFileInputChange(e) {
    const file = e.target.files[0];
    setGifUrl('');

    if (file) {
      setNewPostImagesrc(file);
    }
  }

  return (
    <form
      className={styles.postForm}
      encType='multipart/form-data'
      onSubmit={(e) => (isPoll ? sumbitPoll(e) : submitPost(e))}
    >
      <textarea
        className={styles.postText}
        name='postText'
        id='postText'
        maxLength={1000}
        placeholder={!isPoll ? 'New Post' : 'Question'}
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        required={!newPostImagesrc && !gifUrl}
      ></textarea>
      {isPoll && (
        <PollInputs
          pollChoiceCount={pollChoiceCount}
          setPollChoiceCount={(n) => setPollChoiceCount(n)}
        />
      )}
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
            <span className='material-symbols-outlined closeButton'>close</span>
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
        {isPoll ? (
          <button type='button' onClick={() => setIsPoll(false)}>
            Cancel Poll
          </button>
        ) : (
          <div className={styles.svgButtons}>
            <button className={styles.svgButton} type='button'>
              <label htmlFor='postImage'>
                <span className='material-symbols-outlined'>image</span>
              </label>
            </button>
            <button
              className={styles.svgButton}
              type='button'
              onClick={() => modalRef.current.showModal()}
            >
              <span className='material-symbols-outlined'>gif_box</span>
            </button>
            <button
              className={styles.svgButton}
              type='button'
              onClick={() => {
                setIsPoll(true);
                cancelNewPostImage();
              }}
            >
              <span className='material-symbols-outlined'>ballot</span>
            </button>
          </div>
        )}
        <button className={styles.submitButton}>Post</button>
      </div>
    </form>
  );
}

NewPostForm.propTypes = {
  modalRef: PropTypes.object,
  posts: PropTypes.array,
  setPosts: PropTypes.func,
  newPostImagesrc: PropTypes.string,
  gifUrl: PropTypes.string,
  setNewPostImagesrc: PropTypes.func,
  setGifUrl: PropTypes.func,
};

export default NewPostForm;
