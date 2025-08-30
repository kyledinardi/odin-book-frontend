import { useEffect, useRef, useState } from 'react';

import { useMutation } from '@apollo/client';
import EmojiPicker from 'emoji-picker-react';
import GifPicker, { Theme } from 'gif-picker-react';
import { Link, useOutletContext } from 'react-router-dom';

import PollInputs from './PollInputs.tsx';
import {
  CREATE_POST,
  CREATE_REPLY,
  CREATE_ROOT_COMMENT,
  UPDATE_COMMENT,
  UPDATE_POST,
} from '../graphql/mutations.ts';
import styles from '../style/ContentForm.module.css';
import { TENOR_API_KEY } from '../utils/config.ts';
import logError from '../utils/logError.ts';

import type { EmojiClickData } from 'emoji-picker-react';
import type { TenorImage } from 'gif-picker-react';
import type { FormEvent } from 'react';

import type {
  AppContext,
  Comment,
  Content,
  CreateContentVariables,
  Post,
} from '../types.ts';

const ContentForm = ({
  contentType,
  setContent,
  parentId,
  contentToEdit,
}: {
  contentType: string;
  setContent: (content?: Content) => void;
  parentId?: string;
  contentToEdit?: Post | Comment;
}) => {
  const [text, setText] = useState(contentToEdit?.text || '');
  const [isModal, setIsModal] = useState(false);
  const [isModalRendered, setIsModalRendered] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isPoll, setIsPoll] = useState(false);

  const [pollChoices, setPollChoices] = useState(['', '']);
  const [gifUrl, setGifUrl] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);

  const uuid = useRef(crypto.randomUUID());
  const gifModal = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [currentUser] = useOutletContext<AppContext>();

  const [createPost] = useMutation(CREATE_POST, {
    onError: logError,
    onCompleted: (data) => setContent(data.createPost),
  });

  const [updatePost] = useMutation(UPDATE_POST, {
    onError: logError,
    onCompleted: () => setContent(),
  });

  const [createRootComment] = useMutation(CREATE_ROOT_COMMENT, {
    onError: logError,
    onCompleted: (data) => setContent(data.createRootComment),
  });

  const [updateComment] = useMutation(UPDATE_COMMENT, {
    onError: logError,
    onCompleted: () => setContent(),
  });

  const [createReply] = useMutation(CREATE_REPLY, {
    onError: logError,
    onCompleted: (data) => setContent(data.createReply),
  });

  useEffect(() => {
    if (isModal) {
      setIsModalRendered(true);

      if (isModalRendered) {
        gifModal.current?.showModal();
      }
    }
  }, [isModal, isModalRendered]);

  const cancelNewImage = () => {
    if (!fileInput.current) {
      throw new Error('No file input');
    }

    fileInput.current.value = '';
    setNewImage(null);
    setGifUrl('');
  };

  const submitContent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const variables: CreateContentVariables = {
      text,
      gifUrl,
      image: newImage,
    };

    if (isPoll) {
      variables.pollChoices = pollChoices;
    }

    if (contentToEdit) {
      if (contentType === 'post') {
        variables.postId = contentToEdit.id;
      } else {
        variables.commentId = contentToEdit.id;
      }
    }

    switch (contentType) {
      case 'post':
        if (contentToEdit) {
          await updatePost({ variables });
        } else {
          await createPost({ variables });
        }

        break;

      case 'comment':
        if (contentToEdit) {
          await updateComment({ variables });
        } else {
          variables.postId = parentId;
          await createRootComment({ variables });
        }

        break;

      case 'reply':
        variables.parentId = parentId;
        await createReply({ variables });
        break;

      default:
        throw new Error(`Invalid content type: ${contentType}`);
    }

    if (e.target instanceof HTMLFormElement && textarea.current) {
      e.target.reset();
      textarea.current.style.height = '64px';
    }

    cancelNewImage();
    setIsEmojiOpen(false);
    setIsPoll(false);
  };

  const handlePlaceholder = () => {
    if (contentType === 'post') {
      return isPoll ? 'Question' : 'New Post';
    }

    return 'New Comment';
  };

  const handleInput = () => {
    const input = textarea.current;

    if (!input) {
      throw new Error('No textarea');
    }

    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      throw new Error('No files');
    }

    const file = e.target.files[0];
    setGifUrl('');

    if (file) {
      setNewImage(file);
    }
  };

  const handleGifClick = (selected: TenorImage) => {
    setGifUrl(selected.url);
    setNewImage(null);
    gifModal.current?.close();
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (!textarea.current) {
      throw new Error('No textarea');
    }
    
    textarea.current.value = `${textarea.current.value}${emojiData.emoji}`;
  };

  const getTheme = (): Theme => {
    const theme = localStorage.getItem('theme');

    switch (theme) {
      case 'dark':
        return Theme.DARK;

      case 'light':
        return Theme.LIGHT;

      default:
        return Theme.AUTO;
    }
  };

  return (
    <div
      className={`${styles.formSection} ${
        contentToEdit ? styles.editing : styles.notEditing
      }`}
    >
      {!contentToEdit && (
        <div className={styles.currentUserPfp}>
          <Link to={`/users/${currentUser.id}`}>
            <img alt='' className='pfp' src={currentUser.pfpUrl} />
          </Link>
        </div>
      )}
      <form
        className={styles.contentForm}
        encType='multipart/form-data'
        onSubmit={(e) => {
          submitContent(e).catch(logError);
        }}
      >
        {isModal ? (
          <dialog
            ref={gifModal}
            className={styles.gifModal}
            onClose={() => {
              setIsModal(false);
              setIsModalRendered(false);
            }}
          >
            <button
              className='closeButton'
              onClick={() => gifModal.current?.close()}
              type='button'
            >
              <span className='material-symbols-outlined closeIcon'>close</span>
            </button>
            <GifPicker
              onGifClick={handleGifClick}
              tenorApiKey={TENOR_API_KEY}
              theme={getTheme()}
              width={'100%'}
            />
          </dialog>
        ) : null}
        <textarea
          ref={textarea}
          id={`text-${uuid.current}`}
          maxLength={contentType === 'post' ? 50000 : 10000}
          name='text'
          onChange={(e) => setText(e.target.value)}
          onInput={handleInput}
          placeholder={handlePlaceholder()}
          required={!newImage && !gifUrl}
          value={text}
        />
        {isPoll ? (
          <PollInputs
            pollChoices={pollChoices}
            setPollChoices={(choices) => {
              setPollChoices(choices);
            }}
          />
        ) : null}
        {newImage || gifUrl !== '' ? (
          <div className={styles.imgPreview}>
            <img
              alt=''
              src={newImage ? URL.createObjectURL(newImage) : gifUrl}
            />
            <button
              className='closeButton'
              onClick={() => cancelNewImage()}
              type='button'
            >
              <span className='material-symbols-outlined closeIcon'>close</span>
            </button>
          </div>
        ) : null}
        <div className={styles.formButtons}>
          {isPoll ? (
            <button onClick={() => setIsPoll(false)} type='button'>
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
                  <input
                    ref={fileInput}
                    hidden
                    accept='image/*'
                    id={`image-${uuid.current}`}
                    name='image'
                    onChange={(e) => handleFileInputChange(e)}
                    type='file'
                  />
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
                onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                type='button'
              >
                <span className='material-symbols-outlined'>add_reaction</span>
              </button>
            </div>
          )}
          <button className={styles.submitButton} type='submit'>
            {contentToEdit ? 'Update' : 'Post'}
          </button>
        </div>
        {isEmojiOpen ? (
          <div className={styles.emojiPicker}>
            <EmojiPicker
              skinTonesDisabled
              onEmojiClick={handleEmojiClick}
              theme={getTheme()}
              width={'100%'}
            />
          </div>
        ) : null}
      </form>
    </div>
  );
};

ContentForm.defaultProps = {
  contentToEdit: null,
  parentId: null,
};

export default ContentForm;
