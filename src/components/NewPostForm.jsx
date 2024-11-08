import { useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import EmojiPicker from 'emoji-picker-react';
import PollInputs from './PollInputs.jsx';
import styles from '../style/NewPostForm.module.css';
import backendFetch from '../../ helpers/backendFetch';

function NewPostForm({
  posts,
  newPostImage,
  gifUrl,
  setPosts,
  setNewPostImage,
  setIsModal,
  setGifUrl,
}) {
  const [isPoll, setIsPoll] = useState(false);
  const [pollChoiceCount, setPollChoiceCount] = useState(2);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const fileInput = useRef(null);
  const postTextarea = useRef(null);
  const [setError] = useOutletContext();

  function cancelNewPostImage() {
    fileInput.current.value = '';
    setNewPostImage(null);
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

    const response = await backendFetch(setError, '/posts', {
      method: 'POST',
      body: formData,
    });

    cancelNewPostImage();
    e.target.reset();
    e.target[0].style.height = '64px';
    setIsEmojiOpen(false);
    setPosts([response.post, ...posts]);
  }

  async function sumbitPoll(e) {
    e.preventDefault();
    const choiceArray = [];

    for (let i = 1; i <= pollChoiceCount; i += 1) {
      choiceArray.push(e.target[i].value);
    }

    const response = await backendFetch(setError, '/polls', {
      method: 'POST',

      body: JSON.stringify({
        question: e.target[0].value,
        choices: choiceArray,
      }),
    });

    cancelNewPostImage();
    setIsPoll(false);
    e.target.reset();
    e.target[0].style.height = '64px';
    setPollChoiceCount(2);
    setIsEmojiOpen(false);
    setPosts([response.post, ...posts]);
  }

  function handleFileInputChange(e) {
    const file = e.target.files[0];
    setGifUrl('');

    if (file) {
      setNewPostImage(file);
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
        ref={postTextarea}
        name='postText'
        id='postText'
        maxLength={50000}
        placeholder={!isPoll ? 'New Post' : 'Question'}
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        required={!newPostImage && !gifUrl}
      ></textarea>
      {isPoll && (
        <PollInputs
          pollChoiceCount={pollChoiceCount}
          setPollChoiceCount={(n) => setPollChoiceCount(n)}
        />
      )}
      {(newPostImage || gifUrl !== '') && (
        <div className={styles.imgPreview}>
          <img
            src={newPostImage ? URL.createObjectURL(newPostImage) : gifUrl}
            alt=''
          />
          <button
            type='button'
            className='closeButton'
            onClick={() => cancelNewPostImage()}
          >
            <span className='material-symbols-outlined closeIcon'>close</span>
          </button>
        </div>
      )}
      <input
        type='file'
        name='postImage'
        id='postImage'
        accept='image/*'
        hidden
        ref={fileInput}
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
              onClick={() => {
                setIsModal(true);
              }}
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

            <button
              className={styles.svgButton}
              type='button'
              onClick={() => setIsEmojiOpen(!isEmojiOpen)}
            >
              <span className='material-symbols-outlined'>add_reaction</span>
            </button>
          </div>
        )}
        <button className={styles.submitButton}>Post</button>
      </div>
      {isEmojiOpen && (
        <div className={styles.emojiPicker}>
          <EmojiPicker
            theme={localStorage.getItem('theme')}
            skinTonesDisabled={true}
            width={'100%'}
            onEmojiClick={(emojiData) => {
              postTextarea.current.value = `${postTextarea.current.value}${emojiData.emoji}`;
            }}
          />
        </div>
      )}
    </form>
  );
}

NewPostForm.propTypes = {
  posts: PropTypes.array,
  newPostImage: PropTypes.object,
  gifUrl: PropTypes.string,
  setPosts: PropTypes.func,
  setPickerType: PropTypes.func,
  setNewPostImage: PropTypes.func,
  setIsModal: PropTypes.func,
  setGifUrl: PropTypes.func,
};

export default NewPostForm;
