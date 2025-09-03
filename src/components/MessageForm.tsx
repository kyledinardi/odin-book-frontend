import { useEffect, useRef, useState } from 'react';

import { useMutation } from '@apollo/client';
import EmojiPicker from 'emoji-picker-react';
import GifPicker from 'gif-picker-react';

import { CREATE_MESSAGE } from '../graphql/mutations.ts';
import styles from '../style/MessageForm.module.css';
import { TENOR_API_KEY } from '../utils/config.ts';
import getTheme from '../utils/getTheme.ts';
import logError from '../utils/logError.ts';
import socket from '../utils/socket.ts';

import type { EmojiClickData } from 'emoji-picker-react';
import type { ChangeEvent, FormEvent } from 'react';

import type { UserBase } from '../types.ts';

const MessageForm = ({
  receiver,
  roomId,
}: {
  receiver: UserBase;
  roomId: string;
}) => {
  const [text, setText] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [newImage, setNewImage] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const textInput = useRef<HTMLInputElement>(null);

  const [createMessage] = useMutation(CREATE_MESSAGE, {
    onError: logError,

    onCompleted: (data) => {
      socket.emit('submitMessage', { message: data.createMessage, roomId });
    },
  });

  useEffect(() => {
    const receiveIsTyping = (bool: boolean) => {
      setIsTyping(bool);
    };

    socket.on('receiveIsTyping', receiveIsTyping);

    return () => {
      socket.off('receiveIsTyping', receiveIsTyping);
    };
  }, []);

  useEffect(() => {
    socket.emit('sendIsTyping', { isTyping: text !== '', roomId });
  }, [text, roomId]);

  const cancelNewImage = () => {
    if (!fileInput.current) {
      throw new Error('No file input');
    }

    fileInput.current.value = '';
    setNewImage(null);
    setGifUrl('');
  };

  const submitMessage = async (e: FormEvent) => {
    e.preventDefault();

    await createMessage({
      variables: { roomId, text, gifUrl, image: newImage },
    });

    if (e.target instanceof HTMLFormElement) {
      e.target.reset();
    } else {
      throw new Error('No form');
    }

    setText('');
    setGifPickerOpen(false);
    setEmojiPickerOpen(false);
    cancelNewImage();
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      throw new Error('No files');
    }

    const file = e.target.files[0];
    setGifUrl('');

    if (file) {
      setNewImage(file);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (!textInput.current) {
      throw new Error('No textarea');
    }

    textInput.current.value = `${textInput.current.value}${emojiData.emoji}`;
  };

  return (
    <div className={styles.formContainer}>
      {isTyping ? (
        <p className={styles.isTyping}>{receiver.displayName} is typing...</p>
      ) : null}
      {newImage || gifUrl !== '' ? (
        <div className={styles.imageContainer}>
          <img
            alt=''
            className={styles.imagePreview}
            src={newImage ? URL.createObjectURL(newImage) : gifUrl}
          />
          <button
            className='closeButton'
            onClick={cancelNewImage}
            type='button'
          >
            <span className='material-symbols-outlined closeIcon'>close</span>
          </button>
        </div>
      ) : null}
      {gifPickerOpen || emojiPickerOpen ? (
        <div className={styles.popUp}>
          {gifPickerOpen ? (
            <GifPicker
              height="300px"
              tenorApiKey={TENOR_API_KEY}
              theme={getTheme()}
              width="100%"
              onGifClick={(selected) => {
                setGifUrl(selected.url);
                setGifPickerOpen(false);
              }}
            />
          ) : (
            <EmojiPicker
              skinTonesDisabled
              className={styles.emojiPicker}
              height="300px"
              onEmojiClick={handleEmojiClick}
              previewConfig={{ showPreview: false }}
              theme={getTheme()}
              width="100%"
            />
          )}
        </div>
      ) : null}
      <form
        className={styles.messageForm}
        encType='multipart/form-data'
        onSubmit={(e) => {
          submitMessage(e).catch(logError);
        }}
      >
        <div className={styles.svgButtons}>
          <button className={styles.svgButton} type='button'>
            <label htmlFor='image'>
              <span className='material-symbols-outlined'>image</span>
              <input
                ref={fileInput}
                hidden
                accept='image/*'
                id='image'
                name='image'
                onChange={handleFileInputChange}
                type='file'
              />
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
            id='text'
            maxLength={200}
            name='text'
            onChange={(e) => setText(e.target.value)}
            placeholder='New Message'
            required={!newImage && !gifUrl}
            type='text'
            value={text}
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
        <button
          className={styles.sendButton}
          disabled={!newImage && gifUrl === '' && text === ''}
          type='submit'
        >
          <span className='material-symbols-outlined'>send</span>
        </button>
      </form>
    </div>
  );
};

export default MessageForm;
