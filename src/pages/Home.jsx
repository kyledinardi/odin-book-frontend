import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import ContentForm from '../components/ContentForm.jsx';
import { GET_INDEX_POSTS } from '../graphql/queries';
import socket from '../../utils/socket';
import IndexFeedItem from '../components/IndexFeedItem.jsx';

function Home() {
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);
  const [, currentUser] = useOutletContext();
  const postsResult = useQuery(GET_INDEX_POSTS);
  

  useEffect(() => {
    if (postsResult.data) {
      setHasMorePosts(postsResult.data.getIndexPosts.length % 20 === 0);
    }
  }, [postsResult.data]);

  useEffect(() => {
    const incrementNewPostCount = () => setNewPostCount(newPostCount + 1);
    socket.on('receiveNewPost', incrementNewPostCount);
    return () => socket.off('receiveNewPost', incrementNewPostCount);
  }, [newPostCount]);

  async function fetchOlderPosts() {
    const { getIndexPosts } = postsResult.data;

    const lastPost = getIndexPosts.findLast(
      (post) => post.feedItemType === 'post'
    );

    const lastRepost = getIndexPosts.findLast(
      (post) => post.feedItemType === 'repost'
    );

    postsResult.fetchMore({
      variables: { postCursor: lastPost?.id, repostCursor: lastRepost?.id },

      updateQuery: (previousData, { fetchMoreResult }) => ({
        ...previousData,

        getIndexPosts: [
          ...previousData.getIndexPosts,
          ...fetchMoreResult.getIndexPosts,
        ],
      }),
    });
  }

  async function fetchNewerPosts() {
    postsResult.fetchMore({
      variables: { timestamp: postsResult.data.getIndexPosts[0].timestamp },

      updateQuery: (previousData, { fetchMoreResult }) => ({
        ...previousData,

        getIndexPosts: [
          ...fetchMoreResult.getIndexPosts,
          ...previousData.getIndexPosts,
        ],
      }),
    });

    setNewPostCount(0);
  }

  function handleCreatedPost(post) {
    postsResult.updateQuery({ GET_INDEX_POSTS }, (previousData) => ({
      getIndexPosts: [post, ...previousData.getIndexPosts],
    }));

    socket.emit('sendNewPost', { userId: post.userId });
  }

  return !currentUser || postsResult.loading ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <ContentForm
        contentType={'post'}
        setContent={(post) => handleCreatedPost(post)}
      />
      {newPostCount > 0 && (
        <button className='refreshButton' onClick={() => fetchNewerPosts()}>
          {newPostCount} new post{newPostCount === 1 ? '' : 's'}
        </button>
      )}
      <div>
        {postsResult.data.getIndexPosts.length === 0 ? (
          <h2>You and your followers have no posts</h2>
        ) : (
          <InfiniteScroll
            dataLength={postsResult.data.getIndexPosts.length}
            next={() => fetchOlderPosts()}
            hasMore={hasMorePosts}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {postsResult.data.getIndexPosts.map((post) => (
              <IndexFeedItem
                key={post.id}
                post={post}
                postsResult={postsResult}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </main>
  );
}

export default Home;
