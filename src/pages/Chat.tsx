import { Fragment, useEffect, useRef, useState } from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useOutletContext, useParams } from 'react-router-dom';

import ErrorPage from './ErrorPage.tsx';
import MessageCard from '../components/MessageCard.tsx';
import MessageForm from '../components/MessageForm.tsx';
import { GET_ROOM } from '../graphql/queries.ts';
import styles from '../style/Chat.module.css';
import { chatCache } from '../utils/apolloCache.ts';
import logError from '../utils/logError.ts';
import socket from '../utils/socket.ts';

import type { AppContext, Message, UserBase } from '../types.ts';

const Chat = () => {
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [receiver, setReceiver] = useState<UserBase | null>(null);
  const [currentUser] = useOutletContext<AppContext>();
  const { roomId } = useParams();

  const roomResult = useQuery(GET_ROOM, { variables: { roomId } });
  const messages = roomResult.data?.getRoom.messages;
  const roomResultRef = useRef(roomResult);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const room = roomResult.data?.getRoom;

    if (room) {
      const newReceiver = room.users.find((user) => user.id !== currentUser.id);
      setReceiver(newReceiver || null);
      socket.emit('joinChatRoom', room.id);
    }
  }, [roomResult.data, currentUser]);

  useEffect(() => {
    const addNewMessage = (newMessage: Message) =>
      chatCache.createMessage(roomResultRef.current, newMessage);

    const replaceMessage = (updatedMessage: Message) =>
      chatCache.updateMessage(roomResultRef.current, updatedMessage);

    const removeMessage = (deletedMessageId: string) =>
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
    if (!messages) {
      throw new Error('No messages result');
    }

    if (!messagesEnd.current) {
      throw new Error('No messages end ref');
    }

    if (hasNewMessage) {
      if (messages[messages.length - 1].userId !== currentUser.id) {
        messagesEnd.current.scrollIntoView({ behavior: 'smooth' });
      }

      setHasNewMessage(false);
    }
  }, [hasNewMessage, messages, currentUser.id]);

  const fetchMoreMessages = async () => {
    if (!messages) {
      throw new Error('No messages result');
    }

    await roomResult.fetchMore({
      variables: { cursor: messages[messages.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newMessages = fetchMoreResult.getRoom.messages;

        setHasMoreMessages(
          newMessages.length % 20 === 0 && newMessages.length > 0,
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
  };

  const renderDate = (i: number) => {
    if (!messages) {
      throw new Error('No messages result');
    }

    const current = new Date(messages[i].timestamp);
    const next = new Date(messages[i + 1].timestamp);

    if (current.toDateString() !== next.toDateString()) {
      return (
        <Fragment>
          <hr />
          <div className={styles.date}>
            {Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
              current,
            )}
          </div>
        </Fragment>
      );
    }

    return null;
  };

  if (roomResult.error) {
    logError(roomResult.error);
    return <ErrorPage error={roomResult.error} />;
  }

  return !receiver || !messages || !roomId ? (
    <div className='loaderContainer'>
      <div className='loader' />
    </div>
  ) : (
    <main className={styles.chat}>
      <Link className={styles.heading} to={`/users/${receiver.id}`}>
        <img alt='' className='pfp' src={receiver.pfpUrl} />
        <div className={styles.names}>
          <strong>{receiver.displayName}</strong>
          <span className='gray'>@{receiver.username}</span>
        </div>
      </Link>
      {
        <div className={styles.scrollContainer} id='scrollContainer'>
          <div ref={messagesEnd} />
          {messages.length === 0 ? (
            <h2>No messages yet</h2>
          ) : (
            <InfiniteScroll
              inverse
              className={styles.infiniteScroll}
              dataLength={messages.length}
              endMessage={<div />}
              hasMore={hasMoreMessages}
              next={fetchMoreMessages}
              scrollableTarget='scrollContainer'
              loader={
                <div className='loaderContainer'>
                  <div className='loader' />
                </div>
              }
            >
              {messages.map((message, i) => (
                <div key={message.id} className={styles.messageContainer}>
                  {messages[i + 1] ? renderDate(i) : null}
                  <MessageCard message={message} roomId={roomId} />
                </div>
              ))}
            </InfiniteScroll>
          )}
        </div>
      }
      <MessageForm receiver={receiver} roomId={roomId} />
    </main>
  );
};

export default Chat;
