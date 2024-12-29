import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import MessageForm from './MessageForm.jsx';
import backendFetch from '../../ helpers/backendFetch';
import styles from '../style/Chat.module.css';
import Message from './Message.jsx';

function Chat() {
  const [receiver, setReciever] = useState(null);
  const [messages, setMessages] = useState(null);
  const [hasImagePreview, setHasImagePreview] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEnd = useRef(null);

  const [setError, currentUser] = useOutletContext();
  const roomId = parseInt(useParams().roomId, 10);

  useEffect(() => {
    if (!roomId) {
      setError({ status: 404, message: 'Chat not found' });
    } else if (currentUser) {
      backendFetch(setError, `/rooms/${roomId}`).then((response) => {
        setReciever(response.room.users.find((u) => u.id !== currentUser.id));
        setMessages(response.room.messages);
        setHasMoreMessages(response.room.messages.length === 20);
      });
    }
  }, [setError, currentUser, roomId]);

  useEffect(() => {
    if (hasNewMessage) {
      messagesEnd.current.scrollIntoView({ behavior: 'smooth' });
      setHasNewMessage(false);
    }
  }, [hasNewMessage]);

  function renderDate(i) {
    const current = new Date(messages[i].timestamp);
    const next = new Date(messages[i + 1].timestamp);

    if (current.toDateString() !== next.toDateString()) {
      return (
        <>
          <hr />
          <div className={styles.date}>
            {Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
              current,
            )}
          </div>
        </>
      );
    }

    return null;
  }

  async function addMoreMessages() {
    const response = await backendFetch(
      setError,
      `/rooms/${roomId}/messages?messageId=${messages[messages.length - 1].id}`,
    );

    setMessages([...messages, ...response.messages]);
    setHasMoreMessages(response.messages.length === 20);
  }

  function replaceMessage(newMessage) {
    setMessages(
      messages.map((message) =>
        message.id === newMessage.id ? newMessage : message,
      ),
    );
  }

  function removeMessage(messageId) {
    setMessages(messages.filter((message) => message.id !== messageId));
  }

  return !receiver || !messages ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main className={styles.chat}>
      <Link className={styles.heading} to={`/users/${receiver.id}`}>
        <img className='pfp' src={receiver.pfpUrl} alt='' />
        <div className={styles.names}>
          <strong>{receiver.displayName}</strong>
          <span className='gray'>@{receiver.username}</span>
        </div>
      </Link>
      <div
        className={`${styles.scrollContainer} ${
          hasImagePreview ? styles.withPreview : ''
        }`}
        id='scrollContainer'
      >
        <div ref={messagesEnd}></div>
        <InfiniteScroll
          dataLength={messages.length}
          next={() => addMoreMessages()}
          hasMore={hasMoreMessages}
          loader={
            <div className='loaderContainer'>
              <div className='loader'></div>
            </div>
          }
          endMessage={<div></div>}
          className={styles.infiniteScroll}
          inverse={true}
          scrollableTarget='scrollContainer'
        >
          {messages.map((message, i) => (
            <div className={styles.messageContainer} key={message.id}>
              {messages[i + 1] && renderDate(i)}
              <Message
                message={message}
                replaceMessage={(newMessage) => replaceMessage(newMessage)}
                removeMessage={(messageId) => removeMessage(messageId)}
              />
            </div>
          ))}
        </InfiniteScroll>
      </div>
      <MessageForm
        addMessage={(message) => {
          setMessages([message, ...messages]);
          setHasNewMessage(true);
        }}
        roomId={roomId}
        setHasImagePreview={(bool) => setHasImagePreview(bool)}
      />
    </main>
  );
}

export default Chat;
