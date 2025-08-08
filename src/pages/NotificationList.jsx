import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorPage from './ErrorPage.jsx';
import Notification from '../components/Notification.jsx';
import { GET_NOTIFICATIONS } from '../graphql/queries';
import logError from '../utils/logError';
import socket from '../utils/socket';

function NotificationList() {
  const [hasMoreNotifs, setHasMoreNotifs] = useState(true);
  const [, , notifCount, setNotifCount] = useOutletContext();
  const notificationsResult = useQuery(GET_NOTIFICATIONS);
  const notifs = notificationsResult.data?.getNotifications;

  useEffect(() => {
    if (notifCount > 0) {
      setNotifCount(0);
    }
  }, [notifCount, setNotifCount]);

  useEffect(() => {
    function refreshNotifs() {
      notificationsResult.fetchMore({
        variables: { timestamp: notifs[0].timestamp },

        updateQuery: (previousData, { fetchMoreResult }) => ({
          ...previousData,

          getNotifications: [
            ...fetchMoreResult.getNotifications,
            ...previousData.getNotifications,
          ],
        }),
      });
    }

    socket.on('receiveNotification', refreshNotifs);
    return () => socket.off('receiveNotification', refreshNotifs);
  }, [notificationsResult, notifs]);

  async function fetchMoreNotifs() {
    notificationsResult.fetchMore({
      variables: { cursor: notifs[notifs.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newNotifs = fetchMoreResult.getNotifications;
        setHasMoreNotifs(newNotifs.length % 20 === 0 && newNotifs.length > 0);

        return {
          ...previousData,
          getNotifications: [...previousData.getNotifications, ...newNotifs],
        };
      },
    });
  }

  if (notificationsResult.error) {
    logError(notificationsResult.error);
    return <ErrorPage error={notificationsResult.error} />;
  }

  return !notifs ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <h2>Notifications</h2>
      {notifs.length === 0 ? (
        <div>
          <br />
          <h2>You have no notifications</h2>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={notifs.length}
          next={() => fetchMoreNotifs()}
          hasMore={hasMoreNotifs}
          loader={
            <div className='loaderContainer'>
              <div className='loader'></div>
            </div>
          }
          endMessage={<div></div>}
        >
          {notifs.map((notif) => (
            <Notification key={notif.id} notif={notif} />
          ))}
        </InfiniteScroll>
      )}
    </main>
  );
}

export default NotificationList;
