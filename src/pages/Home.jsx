import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorPage from './ErrorPage.jsx';
import ContentForm from '../components/ContentForm.jsx';
import IndexFeedItem from '../components/IndexFeedItem.jsx';
import { GET_INDEX_POSTS } from '../graphql/queries';
import { indexFeedCache } from '../utils/apolloCache';
import logError from '../utils/logError';
import socket from '../utils/socket';

function Home() {
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);
  const [currentUser] = useOutletContext();
  const postsResult = useQuery(GET_INDEX_POSTS);
  const posts = postsResult.data?.getIndexPosts;

  useEffect(() => {
    const incrementNewPostCount = () => setNewPostCount(newPostCount + 1);
    socket.on('receiveNewPost', incrementNewPostCount);
    return () => socket.off('receiveNewPost', incrementNewPostCount);
  }, [newPostCount]);

  function fetchOlderPosts() {
    const lastPost = posts.findLast((post) => post.feedItemType === 'post');
    const lastRepost = posts.findLast((post) => post.feedItemType === 'repost');

    postsResult.fetchMore({
      variables: { postCursor: lastPost?.id, repostCursor: lastRepost?.id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newPosts = fetchMoreResult.getIndexPosts;
        setHasMorePosts(newPosts.length % 20 === 0 && newPosts.length > 0);

        return {
          ...previousData,
          getIndexPosts: [...previousData.getIndexPosts, ...newPosts],
        };
      },
    });
  }

  function fetchNewerPosts() {
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

  if (postsResult.error) {
    logError(postsResult.error);
    return <ErrorPage error={postsResult.error} />;
  }

  return !currentUser || postsResult.loading ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <ContentForm
        contentType={'post'}
        setContent={(post) => {
          indexFeedCache.createPost(postsResult, post);
          socket.emit('sendNewPost', { userId: post.userId });
        }}
      />
      {newPostCount > 0 && (
        <button className='refreshButton' onClick={() => fetchNewerPosts()}>
          {newPostCount} new post{newPostCount === 1 ? '' : 's'}
        </button>
      )}
      <div>
        {posts.length === 0 ? (
          <h2>You and your followers have no posts</h2>
        ) : (
          <InfiniteScroll
            dataLength={posts.length}
            next={() => fetchOlderPosts()}
            hasMore={hasMorePosts}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {posts.map((post) => (
              <IndexFeedItem
                key={
                  post.feedItemType === 'post' ? `p-${post.id}` : `r-${post.id}`
                }
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
