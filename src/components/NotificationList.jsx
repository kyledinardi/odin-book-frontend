import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import Notification from './Notification.jsx';
import backendFetch from '../../ helpers/backendFetch';

function NotificationList() {
  const [notifications, setNotifications] = useState(null);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(false);
  const [setError] = useOutletContext();

  useEffect(() => {
    backendFetch(setError, '/notifications').then((response) => {
      setNotifications(response.notifications);
      setHasMoreNotifications(response.notifications.length === 20);
    });
  }, [setError]);

  async function addMoreNotifications() {
    const response = await backendFetch(
      setError,

      `/notifications?notificationId=${
        notifications[notifications.length - 1].id
      }`,
    );

    setNotifications([...notifications, ...response.notifications]);
    setHasMoreNotifications(response.notifications.length === 20);
  }

  return !notifications ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <InfiniteScroll
        dataLength={notifications.length}
        next={() => addMoreNotifications()}
        hasMore={hasMoreNotifications}
        loader={
          <div className='loaderContainer'>
            <div className='loader'></div>
          </div>
        }
        endMessage={<div></div>}
      >
        {notifications.map((notification) => (
          <Notification key={notification.id} notification={notification} />
        ))}
      </InfiniteScroll>
    </main>
  );
}

export default NotificationList;
