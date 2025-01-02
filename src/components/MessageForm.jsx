import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import GifPicker from 'gif-picker-react';
import EmojiPicker from 'emoji-picker-react';
import backendFetch from '../../helpers/backendFetch';
import socket from '../../helpers/socket';
import styles from '../style/MessageForm.module.css';

function MessageForm({ receiver, roomId }) {
  const [text, setText] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [newImage, setNewImage] = useState(null);
  const fileInput = useRef(null);
  const textInput = useRef(null);
  const [setError] = useOutletContext();

  useEffect(() => {
    function receiveIsTyping(bool) {
      setIsTyping(bool);
    }

    socket.on('receiveIsTyping', receiveIsTyping);
    return () => socket.off('receiveIsTyping', receiveIsTyping);
  }, []);

  useEffect(() => {
    socket.emit('sendIsTyping', { isTyping: text !== '', roomId });
  }, [text, roomId]);

  function cancelNewImage() {
    fileInput.current.value = '';
    setNewImage(null);
    setGifUrl('');
  }

  async function submitMessage(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('text', text);
    formData.append('gifUrl', gifUrl);

    if (e.target[4].files) {
      formData.append('image', e.target[4].files[0]);
    }

    const response = await backendFetch(setError, `/rooms/${roomId}/messages`, {
      method: 'Post',
      body: formData,
    });

    setText('');
    setGifPickerOpen(false);
    setEmojiPickerOpen(false);

    cancelNewImage();
    e.target.reset();
    socket.emit('submitMessage', { message: response.message, roomId });
  }

  function handleFileInputChange(e) {
    const file = e.target.files[0];
    setGifUrl('');

    if (file) {
      setNewImage(file);
    }
  }

  return (
    <div className={styles.formContainer}>
      {isTyping && (
        <p className={styles.isTyping}>{receiver.displayName} is typing...</p>
      )}
      {(newImage || gifUrl !== '') && (
        <div className={styles.imageContainer}>
          <img
            className={styles.imagePreview}
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
      {(gifPickerOpen || emojiPickerOpen) && (
        <div className={styles.popUp}>
          {gifPickerOpen ? (
            <GifPicker
              tenorApiKey={import.meta.env.VITE_TENOR_API_KEY}
              theme={localStorage.getItem('theme')}
              width={'100%'}
              height={'300px'}
              onGifClick={(selected) => {
                setGifUrl(selected.url);
                setGifPickerOpen(false);
              }}
            />
          ) : (
            <EmojiPicker
              className={styles.emojiPicker}
              theme={localStorage.getItem('theme')}
              skinTonesDisabled={true}
              width={'100%'}
              height={'300px'}
              previewConfig={{ showPreview: false }}
              onEmojiClick={(emojiData) => {
                textInput.current.value = `${textInput.current.value}${emojiData.emoji}`;
                setText(`${text}${emojiData.emoji}`);
              }}
            />
          )}
        </div>
      )}
      <form
        className={styles.messageForm}
        encType='multipart/form-data'
        onSubmit={(e) => submitMessage(e)}
      >
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
              setGifPickerOpen(!gifPickerOpen);
              setEmojiPickerOpen(false);
            }}
          >
            <span className='material-symbols-outlined'>gif_box</span>
          </button>
        </div>
        <div className={styles.textInputContainer}>
          <input
            ref={textInput}
            type='text'
            name='text'
            id='text'
            maxLength={200}
            placeholder='New Message'
            required={!newImage && !gifUrl}
            onInput={(e) => setText(e.target.value)}
          />
        </div>
        <button
          className={`${styles.svgButton} ${styles.emojiButton}`}
          type='button'
          onClick={() => {
            setEmojiPickerOpen(!emojiPickerOpen);
            setGifPickerOpen(false);
          }}
        >
          <span className='material-symbols-outlined'>add_reaction</span>
        </button>
        <input
          ref={fileInput}
          type='file'
          name='image'
          id='image'
          accept='image/*'
          hidden
          onChange={(e) => handleFileInputChange(e)}
        />
        {
          <button
            className={styles.sendButton}
            disabled={!newImage && gifUrl === '' && text === ''}
          >
            <span className='material-symbols-outlined'>send</span>
          </button>
        }
      </form>
    </div>
  );
}

MessageForm.propTypes = {
  receiver: PropTypes.object,
  roomId: PropTypes.number,
};
export default MessageForm;
