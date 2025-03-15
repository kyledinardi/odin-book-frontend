import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import backendFetch from '../../helpers/backendFetch';
import formatDate from '../../helpers/formatDate';
import styles from '../style/RoomList.module.css';

function RoomList() {
  const [rooms, setRooms] = useState(null);
  const [hasMoreRooms, setHasMoreRooms] = useState(false);
  const [setError, currentUser] = useOutletContext();

  useEffect(() => {
    if (currentUser) {
      backendFetch(setError, `/rooms`).then((response) => {
        const newRooms = response.rooms.map((room) => ({
          ...room,
          receiver: room.users.find((u) => u.id !== currentUser.id),
        }));

        setRooms(newRooms);
        setHasMoreRooms(response.rooms.length === 20);
      });
    }
  }, [setError, currentUser, setHasMoreRooms]);

  async function addMoreRooms() {
    const response = await backendFetch(
      setError,
      `/rooms?roomId=${rooms[rooms.length - 1].id}`,
    );

    const newRooms = response.rooms.map((room) => ({
      ...room,
      receiver: room.users.find((u) => u.id !== currentUser.id),
    }));

    setRooms([...rooms, ...newRooms]);
    setHasMoreRooms(response.rooms.length === 20);
  }

  return !currentUser || !rooms ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main className={styles.roomList}>
      <h2 className={styles.heading}>Messages</h2>
      <InfiniteScroll
        dataLength={rooms.length}
        next={() => addMoreRooms()}
        hasMore={hasMoreRooms}
        loader={
          <div className='loaderContainer'>
            <div className='loader'></div>
          </div>
        }
        endMessage={<div></div>}
      >
        {rooms.map((room) => (
          <div key={room.id}>
            <Link className={styles.room} to={`/messages/${room.id}`}>
              <img className='pfp' src={room.receiver.pfpUrl} alt='' />
              <div>
                <div className={styles.namesAndDate}>
                  <strong>{room.receiver.displayName}</strong>
                  <span className='gray'>@{room.receiver.username}</span>
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
    </main>
  );
}

export default RoomList;
