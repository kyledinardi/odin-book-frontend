import { useEffect, useState } from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext } from 'react-router-dom';

import ErrorPage from './ErrorPage.tsx';
import NotificationCard from '../components/NotificationCard.tsx';
import { GET_NOTIFICATIONS } from '../graphql/queries.ts';
import logError from '../utils/logError.ts';
import socket from '../utils/socket.ts';

import type { AppContext } from '../types.ts';

const NotificationList = () => {
  const [hasMoreNotifs, setHasMoreNotifs] = useState(true);
  const [, , notifCount, setNotifCount] = useOutletContext<AppContext>();
  const notificationsResult = useQuery(GET_NOTIFICATIONS);
  const notifs = notificationsResult.data?.getNotifications;

  useEffect(() => {
    if (notifCount > 0) {
      setNotifCount(0);
    }
  }, [notifCount, setNotifCount]);

  useEffect(() => {
    const refreshNotifs = async () => {
      if (!notifs) {
        throw new Error('No notifications');
      }

      await notificationsResult.fetchMore({
        variables: { timestamp: notifs[0].timestamp },

        updateQuery: (previousData, { fetchMoreResult }) => ({
          ...previousData,

          getNotifications: [
            ...fetchMoreResult.getNotifications,
            ...previousData.getNotifications,
          ],
        }),
      });
    };

    socket.on('receiveNotification', refreshNotifs);

    return () => {
      socket.off('receiveNotification', refreshNotifs);
    };
  }, [notificationsResult, notifs]);

  const fetchMoreNotifs = async () => {
    if (!notifs) {
      throw new Error('No notifications');
    }

    await notificationsResult.fetchMore({
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
  };

  if (notificationsResult.error) {
    logError(notificationsResult.error);
    return <ErrorPage error={notificationsResult.error} />;
  }

  return !notifs ? (
    <div className='loaderContainer'>
      <div className='loader' />
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
          endMessage={<div />}
          hasMore={hasMoreNotifs}
          next={fetchMoreNotifs}
          loader={
            <div className='loaderContainer'>
              <div className='loader' />
            </div>
          }
        >
          {notifs.map((notif) => (
            <NotificationCard key={notif.id} notif={notif} />
          ))}
        </InfiniteScroll>
      )}
    </main>
  );
};

export default NotificationList;
