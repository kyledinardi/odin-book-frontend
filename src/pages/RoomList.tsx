import { useState } from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useOutletContext } from 'react-router-dom';

import { GET_ALL_ROOMS } from '../graphql/queries.ts';
import styles from '../style/RoomList.module.css';
import formatDate from '../utils/formatDate.ts';

import type { AppContext } from '../types.ts';

const RoomList = () => {
  const [hasMoreRooms, setHasMoreRooms] = useState(true);
  const [currentUser] = useOutletContext<AppContext>();
  const roomsResult = useQuery(GET_ALL_ROOMS);

  const rooms = roomsResult.data?.getAllRooms.map((room) => ({
    ...room,
    receiver: room.users.find((user) => user.id !== currentUser.id),
  }));

  const fetchMoreRooms = async () => {
    if (!rooms) {
      throw new Error('No rooms result');
    }

    await roomsResult.fetchMore({
      variables: { cursor: rooms[rooms.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newRooms = fetchMoreResult.getAllRooms;
        setHasMoreRooms(newRooms.length % 20 === 0 && newRooms.length > 0);

        return {
          ...previousData,
          getAllRooms: [...previousData.getAllRooms, ...newRooms],
        };
      },
    });
  };

  return !currentUser || !rooms ? (
    <div className='loaderContainer'>
      <div className='loader' />
    </div>
  ) : (
    <main className={styles.roomList}>
      <h2>Messages</h2>
      {rooms.length === 0 ? (
        <div>
          <br />
          <h2>You have no chatrooms</h2>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={rooms.length}
          endMessage={<div />}
          hasMore={hasMoreRooms}
          next={fetchMoreRooms}
          loader={
            <div className='loaderContainer'>
              <div className='loader' />
            </div>
          }
        >
          {rooms.map((room) => (
            <div key={room.id}>
              <Link className={styles.room} to={`/messages/${room.id}`}>
                <img alt='' className='pfp' src={room.receiver?.pfpUrl} />
                <div>
                  <div className={styles.namesAndDate}>
                    <strong>{room.receiver?.displayName}</strong>
                    <span className='gray'>@{room.receiver?.username}</span>
                    <span className='gray'>
                      {formatDate.short(room.lastUpdated)}
                    </span>
                  </div>
                  <span className='gray'>
                    {room.messages[0] ? room.messages[0].text : '(New Chat)'}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </InfiniteScroll>
      )}
    </main>
  );
};

export default RoomList;
