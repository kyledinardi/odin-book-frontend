import { useEffect, useRef, useState } from 'react';

import { useMutation } from '@apollo/client';
import { useOutletContext } from 'react-router-dom';

import { DELETE_MESSAGE, UPDATE_MESSAGE } from '../graphql/mutations.ts';
import styles from '../style/Message.module.css';
import logError from '../utils/logError.ts';
import socket from '../utils/socket.ts';

import type { FormEvent } from 'react';

import type { AppContext, Message } from '../types.ts';

const MessageCard = ({
  message,
  roomId,
}: {
  message: Message;
  roomId: string;
}) => {
  const [text, setText] = useState(message.text);
  const [isEditing, setIsEditing] = useState(false);
  const [optionsOpened, setOptionsOpened] = useState(false);
  const deleteModal = useRef<HTMLDialogElement>(null);
  const editText = useRef<HTMLTextAreaElement>(null);

  const [currentUser] = useOutletContext<AppContext>();
  const isCurrentUserMessage = message.userId === currentUser.id;

  const [updateMessage] = useMutation(UPDATE_MESSAGE, {
    onError: logError,

    onCompleted: (data) => {
      socket.emit('updateMessage', {
        updatedMessage: data.updateMessage,
        roomId,
      });
    },
  });

  const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    onError: logError,

    onCompleted: () => {
      if (!deleteModal.current) {
        throw new Error('No delete modal');
      }

      deleteModal.current.close();
      socket.emit('deleteMessage', { deletedMessageId: message.id, roomId });
    },
  });

  useEffect(() => {
    const textarea = editText.current;

    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [isEditing]);

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    await updateMessage({ variables: { messageId: message.id, text } });
  };

  const handleInput = () => {
    const input = editText.current;

    if (!input) {
      throw new Error('No textarea');
    }

    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  };

  return (
    <div
      className={`${styles.message} ${
        isCurrentUserMessage ? styles.sentMessage : styles.receivedMessage
      }`}
    >
      <dialog ref={deleteModal}>
        <h2>Are you sure you want to delete this post?</h2>
        <div className='modalButtons'>
          <button onClick={() => deleteModal.current?.close()} type='button'>
            Cancel
          </button>
          <button
            type='button'
            onClick={() => {
              deleteMessage({ variables: { messageId: message.id } }).catch(
                logError,
              );
            }}
          >
            Delete
          </button>
        </div>
      </dialog>
      <div className={styles.timestamp}>
        {Intl.DateTimeFormat(undefined, {
          timeStyle: 'short',
        }).format(new Date(message.timestamp))}
      </div>
      <div className={styles.messageBox}>
        {isCurrentUserMessage ? (
          <div className={styles.optionsMenu}>
            <button
              className={styles.moreOptions}
              onClick={() => setOptionsOpened(!optionsOpened)}
              type='button'
            >
              <span className='material-symbols-outlined'>more_vert</span>
            </button>
            {optionsOpened ? (
              <div className={styles.options}>
                <button
                  type='button'
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setOptionsOpened(false);
                  }}
                >
                  <span className='material-symbols-outlined'>edit</span>
                </button>
                <button
                  type='button'
                  onClick={() => {
                    deleteModal.current?.showModal();
                    setOptionsOpened(false);
                  }}
                >
                  <span className='material-symbols-outlined'>delete</span>
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        {isEditing ? (
          <form
            className={styles.editForm}
            onSubmit={(e) => {
              submitEdit(e).catch(logError);
            }}
          >
            <textarea
              ref={editText}
              id={`editText-${message.id}`}
              maxLength={200}
              name='editText'
              onChange={(e) => setText(e.target.value)}
              onInput={handleInput}
              placeholder='Edit Message'
              required={!message.imageUrl}
              value={text}
            />
            <div className={styles.formButtons}>
              <button onClick={() => setIsEditing(false)} type='button'>
                Cancel
              </button>
              <button type='submit'>Edit</button>
            </div>
          </form>
        ) : (
          message.text !== '' && <span>{message.text}</span>
        )}
        {message.imageUrl ? (
          <img alt='' className={styles.image} src={message.imageUrl} />
        ) : null}
      </div>
    </div>
  );
};

export default MessageCard;
