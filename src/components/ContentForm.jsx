import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import PropTypes from 'prop-types';
import GifPicker from 'gif-picker-react';
import EmojiPicker from 'emoji-picker-react';
import PollInputs from './PollInputs.jsx';
import { CREATE_POST } from '../graphql/mutations';
import logError from '../utils/logError';
import styles from '../style/ContentForm.module.css';

function ContentForm({
  contentType,
  setContent,
  /* parentId, */ contentToEdit,
}) {
  const [isModal, setIsModal] = useState(false);
  const [isModalRendered, setIsModalRendered] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isPoll, setIsPoll] = useState(false);

  const [pollChoiceCount, setPollChoiceCount] = useState(2);
  const [gifUrl, setGifUrl] = useState('');
  const [newImage, setNewImage] = useState(null);

  const uuid = useRef(crypto.randomUUID());
  const gifModal = useRef(null);
  const fileInput = useRef(null);
  const textarea = useRef(null);
  const [currentUser] = useOutletContext();

  const [createPost] = useMutation(CREATE_POST, {
    onError: logError,
    onCompleted: (data) => setContent(data.createPost),
  });

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

  async function submitContent(e) {
    e.preventDefault();

    const variables = {
      text: e.target[0].value,
      gifUrl,
      image: newImage,
    };

    if (isPoll) {
      variables.pollChoices = [];

      for (let i = 1; i <= pollChoiceCount; i += 1) {
        variables.pollChoices.push(e.target[i].value);
      }
    }

    switch (contentType) {
      case 'post':
        if (contentToEdit) {
          // updatePost();
        } else {
          createPost({ variables });
        }
        break;
      case 'comment':
        if (contentToEdit) {
          // updateComment()
        } else {
          // createRootComment()
        }
        break;
      case 'reply':
        // createReply()
        break;
      default:
    }

    e.target.reset();
    e.target[0].style.height = '64px';
    cancelNewImage();
    setIsEmojiOpen(false);
    setIsPoll(false);
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
    <div
      className={`${styles.formSection} ${
        contentToEdit ? styles.editing : styles.notEditing
      }`}
    >
      {!contentToEdit && (
        <div className={styles.currentUserPfp}>
          <Link to={`/users/${currentUser.id}`}>
            <img className='pfp' src={currentUser.pfpUrl} alt='' />
          </Link>
        </div>
      )}
      <form
        className={styles.contentForm}
        encType='multipart/form-data'
        onSubmit={(e) => submitContent(e)}
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
          id={`text-${uuid.current}`}
          maxLength={contentType === 'post' ? 50000 : 10000}
          placeholder={handlePlaceholder()}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          defaultValue={contentToEdit ? contentToEdit.text : null}
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
            <img
              src={newImage ? URL.createObjectURL(newImage) : gifUrl}
              alt=''
            />
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
          ref={fileInput}
          type='file'
          name='image'
          id={`image-${uuid.current}`}
          accept='image/*'
          hidden
          onChange={(e) => handleFileInputChange(e)}
        />
        <div className={styles.formButtons}>
          {isPoll ? (
            <button type='button' onClick={() => setIsPoll(false)}>
              Cancel Poll
            </button>
          ) : (
            <div className={styles.svgButtons}>
              {contentType === 'post' && !contentToEdit && (
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
              <button className={styles.svgButton} type='button'>
                <label htmlFor={`image-${uuid.current}`}>
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
                onClick={() => setIsEmojiOpen(!isEmojiOpen)}
              >
                <span className='material-symbols-outlined'>add_reaction</span>
              </button>
            </div>
          )}
          <button className={styles.submitButton}>
            {contentToEdit ? 'Update' : 'Post'}
          </button>
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
    </div>
  );
}

ContentForm.propTypes = {
  contentType: PropTypes.string,
  setContent: PropTypes.func,
  parentId: PropTypes.number,
  contentToEdit: PropTypes.object,
};

export default ContentForm;
