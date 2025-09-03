import { useEffect, useState } from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext } from 'react-router-dom';

import ErrorPage from './ErrorPage.tsx';
import ContentForm from '../components/ContentForm.tsx';
import IndexFeedItem from '../components/IndexFeedItem.tsx';
import { GET_INDEX_POSTS } from '../graphql/queries.ts';
import { indexFeedCache } from '../utils/apolloCache.ts';
import logError from '../utils/logError.ts';
import socket from '../utils/socket.ts';

import type { AppContext, Content } from '../types.ts';

const Home = () => {
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [newPostCount, setNewPostCount] = useState(0);
  const [currentUser] = useOutletContext<AppContext>();
  const postsResult = useQuery(GET_INDEX_POSTS);
  const posts = postsResult.data?.getIndexPosts;

  useEffect(() => {
    const incrementNewPostCount = () => setNewPostCount(newPostCount + 1);
    socket.on('receiveNewPost', incrementNewPostCount);

    return () => {
      socket.off('receiveNewPost', incrementNewPostCount);
    };
  }, [newPostCount]);

  const fetchOlderPosts = async () => {
    if (!posts) {
      throw new Error('No posts');
    }

    const lastPost = [...posts]
      .reverse()
      .find((post) => post.feedItemType === 'post');

    const lastRepost = [...posts]
      .reverse()
      .find((post) => post.feedItemType === 'repost');

    await postsResult.fetchMore({
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
  };

  const fetchNewerPosts = async () => {
    if (!posts) {
      throw new Error('No posts');
    }

    await postsResult.fetchMore({
      variables: { timestamp: posts[0].timestamp },

      updateQuery: (previousData, { fetchMoreResult }) => ({
        ...previousData,

        getIndexPosts: [
          ...fetchMoreResult.getIndexPosts,
          ...previousData.getIndexPosts,
        ],
      }),
    });

    setNewPostCount(0);
  };

  if (postsResult.error) {
    logError(postsResult.error);
    return <ErrorPage error={postsResult.error} />;
  }

  return !currentUser || !posts ? (
    <div className='loaderContainer'>
      <div className='loader' />
    </div>
  ) : (
    <main>
      <ContentForm
        contentType="post"
        setContent={(post: Content) => {
          if (post?.feedItemType === 'post') {
            indexFeedCache.create(postsResult, post);
            socket.emit('sendNewPost', { userId: post?.userId });
          }
        }}
      />
      {newPostCount > 0 && (
        <button
          className='refreshButton'
          type='button'
          onClick={() => {
            fetchNewerPosts().catch(logError);
          }}
        >
          {newPostCount} new post{newPostCount === 1 ? '' : 's'}
        </button>
      )}
      <div>
        {posts?.length === 0 ? (
          <h2>You and your followers have no posts</h2>
        ) : (
          <InfiniteScroll
            dataLength={posts.length}
            endMessage={<div />}
            hasMore={hasMorePosts}
            next={fetchOlderPosts}
            loader={
              <div className='loaderContainer'>
                <div className='loader' />
              </div>
            }
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
};

export default Home;
