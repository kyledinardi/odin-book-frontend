import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import backendFetch from '../utils/backendFetch';
import socket from '../utils/socket';
import styles from '../style/Message.module.css';

function Message({ message, roomId }) {
  const [isCurrentUserMessage, setIsCurrentUserMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [optionsOpened, setOptionsOpened] = useState(false);
  const deleteModal = useRef(null);
  const editText = useRef(null);

  const [setError, currentUser] = useOutletContext();

  useEffect(() => {
    if (message.userId === currentUser.id) {
      setIsCurrentUserMessage(true);
    }
  }, [message, currentUser]);

  useEffect(() => {
    const textarea = editText.current;

    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [isEditing]);

  async function updateMessage(e) {
    e.preventDefault();
    setIsEditing(false);

    if (e.target[0].value !== message.text) {
      const response = await backendFetch(setError, `/messages/${message.id}`, {
        method: 'PUT',
        body: JSON.stringify({ text: e.target[0].value }),
      });

      socket.emit('updateMessage', { message: response.message, roomId });
    }
  }

  async function deleteMessage() {
    await backendFetch(setError, `/messages/${message.id}`, {
      method: 'Delete',
    });

    deleteModal.current.close();
    socket.emit('deleteMessage', { messageId: message.id, roomId });
  }

  return (
    <div
      className={`${styles.message} ${
        isCurrentUserMessage ? styles.sentMessage : styles.receivedMessage
      }`}
    >
      <dialog ref={deleteModal}>
        <h2>Are you sure you want to delete this post?</h2>
        <div className='modalButtons'>
          <button onClick={() => deleteModal.current.close()}>Cancel</button>
          <button onClick={() => deleteMessage()}>Delete</button>
        </div>
      </dialog>
      <div className={styles.timestamp}>
        {Intl.DateTimeFormat(undefined, {
          timeStyle: 'short',
        }).format(new Date(message.timestamp))}
      </div>
      <div className={styles.messageBox}>
        {isCurrentUserMessage && (
          <div className={styles.optionsMenu}>
            <button
              className={styles.moreOptions}
              onClick={() => setOptionsOpened(!optionsOpened)}
            >
              <span className='material-symbols-outlined'>more_vert</span>
            </button>
            {optionsOpened && (
              <div className={styles.options}>
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setOptionsOpened(false);
                  }}
                >
                  <span className='material-symbols-outlined'>edit</span>
                </button>
                <button
                  onClick={() => {
                    deleteModal.current.showModal();
                    setOptionsOpened(false);
                  }}
                >
                  <span className='material-symbols-outlined'>delete</span>
                </button>
              </div>
            )}
          </div>
        )}
        {isEditing ? (
          <form className={styles.editForm} onSubmit={(e) => updateMessage(e)}>
            <textarea
              ref={editText}
              name='editText'
              id={`editText-${message.id}`}
              maxLength={200}
              placeholder='Edit Message'
              required={!message.imageUrl}
              defaultValue={message.text}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            ></textarea>
            <div className={styles.formButtons}>
              <button type='button' onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button>Edit</button>
            </div>
          </form>
        ) : (
          message.text !== '' && <span>{message.text}</span>
        )}
        {message.imageUrl && (
          <img className={styles.image} src={message.imageUrl} alt='' />
        )}
      </div>
    </div>
  );
}

Message.propTypes = {
  message: PropTypes.object,
  roomId: PropTypes.number,
};

export default Message;
