import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import EmojiPicker from 'emoji-picker-react';
import GifPicker from 'gif-picker-react';
import PollInputs from './PollInputs.jsx';
import styles from '../style/NewContentForm.module.css';
import backendFetch from '../../ helpers/backendFetch';

function NewContentForm({ contentType, setContent, postId }) {
  const [isModal, setIsModal] = useState(false);
  const [isModalRendered, setIsModalRendered] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isPoll, setIsPoll] = useState(false);

  const [pollChoiceCount, setPollChoiceCount] = useState(2);
  const [gifUrl, setGifUrl] = useState('');
  const [newImage, setNewImage] = useState(null);

  const gifModal = useRef(null);
  const fileInput = useRef(null);
  const textarea = useRef(null);
  const [setError] = useOutletContext();

  useEffect(() => {
    if (isModal) {
      setIsModalRendered(true);

      if (isModalRendered) {
        gifModal.current.showModal();
      }
    }
  }, [isModal, isModalRendered]);

  function cancelNewImage() {
    fileInput.current.value = '';
    setNewImage(null);
    setGifUrl('');
  }

  async function submitPostOrComment(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('text', e.target[0].value);
    formData.append('gifUrl', gifUrl);

    if (e.target[2].files) {
      formData.append('image', e.target[2].files[0]);
    }

    const response = await backendFetch(
      setError,
      contentType === 'post' ? '/posts' : `/posts/${postId}/comments`,

      {
        method: 'POST',
        body: formData,
      },
    );

    cancelNewImage();
    e.target.reset();
    e.target[0].style.height = '64px';
    setIsEmojiOpen(false);
    setContent(contentType === 'post' ? response.post : response.comment);
  }

  async function submitPoll(e) {
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

    cancelNewImage();
    e.target.reset();
    e.target[0].style.height = '64px';
    setIsEmojiOpen(false);
    setIsPoll(false);
    setPollChoiceCount(2);
    setContent(response.post);
  }

  function handlePlaceholder() {
    if (contentType === 'post') {
      if (isPoll) {
        return 'Question';
      }

      return 'New Post';
    }

    return 'New Comment';
  }

  function handleFileInputChange(e) {
    const file = e.target.files[0];
    setGifUrl('');

    if (file) {
      setNewImage(file);
    }
  }

  return (
    <form
      className={styles.contentForm}
      encType='multipart/form-data'
      onSubmit={(e) => (isPoll ? submitPoll(e) : submitPostOrComment(e))}
    >
      {isModal && (
        <dialog
          className={styles.gifModal}
          ref={gifModal}
          onClose={() => {
            setIsModal(false);
            setIsModalRendered(false);
          }}
        >
          <button
            type='button'
            className='closeButton'
            onClick={() => gifModal.current.close()}
          >
            <span className='material-symbols-outlined closeIcon'>close</span>
          </button>
          <GifPicker
            tenorApiKey={import.meta.env.VITE_TENOR_API_KEY}
            theme={localStorage.getItem('theme')}
            width={'100%'}
            onGifClick={(selected) => {
              setGifUrl(selected.url);
              setNewImage(null);
              gifModal.current.close();
            }}
          />
        </dialog>
      )}
      <textarea
        ref={textarea}
        name='text'
        id='text'
        maxLength={50000}
        placeholder={handlePlaceholder()}
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        required={!newImage && !gifUrl}
      ></textarea>
      {isPoll && (
        <PollInputs
          pollChoiceCount={pollChoiceCount}
          setPollChoiceCount={(n) => setPollChoiceCount(n)}
        />
      )}
      {(newImage || gifUrl !== '') && (
        <div className={styles.imgPreview}>
          <img src={newImage ? URL.createObjectURL(newImage) : gifUrl} alt='' />
          <button
            type='button'
            className='closeButton'
            onClick={() => cancelNewImage()}
          >
            <span className='material-symbols-outlined closeIcon'>close</span>
          </button>
        </div>
      )}
      <input
        type='file'
        name='image'
        id='image'
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
              <label htmlFor='image'>
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
            {contentType === 'post' && (
              <button
                className={styles.svgButton}
                type='button'
                onClick={() => {
                  setIsPoll(true);
                  cancelNewImage();
                }}
              >
                <span className='material-symbols-outlined'>ballot</span>
              </button>
            )}
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
              textarea.current.value = `${textarea.current.value}${emojiData.emoji}`;
            }}
          />
        </div>
      )}
    </form>
  );
}

NewContentForm.propTypes = {
  contentType: PropTypes.string,
  setContent: PropTypes.func,
  postId: PropTypes.number,
};

export default NewContentForm;
