import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorPage from './ErrorPage.jsx';
import MessageForm from '../components/MessageForm.jsx';
import Message from '../components/Message.jsx';
import { GET_ROOM } from '../graphql/queries';
import { chatCache } from '../utils/apolloCache';
import logError from '../utils/logError';
import socket from '../utils/socket';
import styles from '../style/Chat.module.css';

function Chat() {
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [receiver, setReceiver] = useState(null);
  const [currentUser] = useOutletContext();
  const roomId = Number(useParams().roomId);

  const roomResult = useQuery(GET_ROOM, { variables: { roomId } });
  const messages = roomResult.data?.getRoom.messages;
  const roomResultRef = useRef(roomResult);
  const messagesEnd = useRef(null);

  useEffect(() => {
    const room = roomResult.data?.getRoom;

    if (room) {
      setReceiver(room.users.find((user) => user.id !== currentUser.id));
      socket.emit('joinChatRoom', room.id);
    }
  }, [roomResult.data, currentUser]);

  useEffect(() => {
    const addNewMessage = (newMessage) =>
      chatCache.createMessage(roomResultRef.current, newMessage);

    const replaceMessage = (updatedMessage) =>
      chatCache.updateMessage(roomResultRef.current, updatedMessage);

    const removeMessage = (deletedMessageId) =>
      chatCache.deleteMessage(roomResultRef.current, deletedMessageId);

    socket.on('addNewMessage', addNewMessage);
    socket.on('replaceMessage', replaceMessage);
    socket.on('removeMessage', removeMessage);

    return () => {
      socket.off('addNewMessage', addNewMessage);
      socket.off('replaceMessage', replaceMessage);
      socket.off('removeMessage', removeMessage);
    };
  }, []);

  useEffect(() => {
    if (hasNewMessage) {
      if (messages[messages.length - 1].userId !== Number(currentUser.id)) {
        messagesEnd.current.scrollIntoView({ behavior: 'smooth' });
      }

      setHasNewMessage(false);
    }
  }, [hasNewMessage, messages, currentUser.id]);

  async function fetchMoreMessages() {
    roomResult.fetchMore({
      variables: { cursor: messages[messages.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newMessages = fetchMoreResult.getRoom.messages;

        setHasMoreMessages(
          newMessages.length % 20 === 0 && newMessages.length > 0
        );

        return {
          ...previousData,

          getRoom: {
            ...previousData.getRoom,
            messages: [...previousData.getRoom.messages, ...newMessages],
          },
        };
      },
    });
  }

  function renderDate(i) {
    const current = new Date(messages[i].timestamp);
    const next = new Date(messages[i + 1].timestamp);

    if (current.toDateString() !== next.toDateString()) {
      return (
        <>
          <hr />
          <div className={styles.date}>
            {Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
              current
            )}
          </div>
        </>
      );
    }

    return null;
  }

  if (roomResult.error) {
    logError(roomResult.error);
    return <ErrorPage error={roomResult.error} />;
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
      {
        <div className={styles.scrollContainer} id='scrollContainer'>
          <div ref={messagesEnd}></div>
          {messages.length === 0 ? (
            <h2>No messages yet</h2>
          ) : (
            <InfiniteScroll
              dataLength={messages.length}
              next={() => fetchMoreMessages()}
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
                  <Message message={message} roomId={roomId} />
                </div>
              ))}
            </InfiniteScroll>
          )}
        </div>
      }
      <MessageForm receiver={receiver} roomId={roomId} />
    </main>
  );
}

export default Chat;
