import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import ContentForm from './ContentForm.jsx';
import Post from './Post.jsx';
import Comment from './Comment.jsx';
import backendFetch from '../../helpers/backendFetch';
import editFeed from '../../helpers/feedEdit';
import socket from '../../helpers/socket';

function Home() {
  const [posts, setPosts] = useState(null);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);
  const [setError, currentUser] = useOutletContext();

  useEffect(() => {
    backendFetch(setError, '/posts').then((response) => {
      setPosts(response.posts);
      setHasMorePosts(response.posts.length === 20);
    });
  }, [setError]);

  useEffect(() => {
    function incrementNewPostCount() {
      setNewPostCount(newPostCount + 1);
    }

    socket.on('receiveNewPost', incrementNewPostCount);
    return () => socket.off('receiveNewPost', incrementNewPostCount);
  }, [newPostCount]);

  async function addMorePosts() {
    const lastPost = posts.findLast((post) => post.feedItemType === 'post');
    const lastRepost = posts.findLast((post) => post.feedItemType === 'repost');

    const response = await backendFetch(
      setError,

      `/posts?${lastPost ? `postId=${lastPost.id}` : ''}&${
        lastRepost ? `repostId=${lastRepost.id}` : ''
      }`,
    );

    setPosts([...posts, ...response.posts]);
    setHasMorePosts(response.posts.length === 20);
  }

  async function refreshPosts() {
    const response = await backendFetch(
      setError,
      `/posts/refresh?timestamp=${posts[0].timestamp}`,
    );

    setPosts([...response.posts, ...posts]);
    setNewPostCount(0);
  }

  function renderPost(post) {
    if (post.postId) {
      return (
        <div key={`repost${post.id}`}>
          <p className='repostHeading'>
            <span className='material-symbols-outlined'>repeat</span>
            <span>{post.user.displayName} reposted</span>
          </p>
          <Post
            post={post.post}
            replacePost={(updatedPost) =>
              setPosts(editFeed.replace(updatedPost, posts))
            }
            removePost={(deletedPostId) =>
              setPosts(editFeed.remove(deletedPostId, 'post', posts))
            }
            displayType='repost'
          />
        </div>
      );
    }

    if (post.commentId) {
      return (
        <div key={`repost${post.id}`}>
          <p className='repostHeading'>
            <span className='material-symbols-outlined'>repeat</span>
            <span>{post.user.displayName} reposted</span>
          </p>
          <Comment
            comment={post.comment}
            replaceComment={(updatedComment) =>
              setPosts(editFeed.replace(updatedComment, posts))
            }
            removeComment={(deletedCommentId) =>
              setPosts(editFeed.remove(deletedCommentId, 'comment', posts))
            }
            displayType='repost'
            repostedBy={post.user.username}
          />
        </div>
      );
    }

    return (
      <Post
        key={post.id}
        post={post}
        replacePost={(updatedPost) =>
          setPosts(editFeed.replace(updatedPost, posts))
        }
        removePost={(deletedPostId) =>
          setPosts(editFeed.remove(deletedPostId, 'post', posts))
        }
        displayType='feed'
      />
    );
  }

  return !currentUser || !posts ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <ContentForm
        contentType={'post'}
        setContent={(post) => {
          setPosts([post, ...posts]);
          socket.emit('sendNewPost', { userId: post.userId });
        }}
      />
      {newPostCount > 0 && (
        <button className='refreshButton' onClick={() => refreshPosts()}>
          {newPostCount} new post{newPostCount === 1 ? '' : 's'}
        </button>
      )}
      <div>
        {posts.length === 0 ? (
          <h2>You and your followers have no posts</h2>
        ) : (
          <InfiniteScroll
            dataLength={posts.length}
            next={() => addMorePosts()}
            hasMore={hasMorePosts}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
            // inverse={true}
          >
            {posts.map((post) => renderPost(post))}
          </InfiniteScroll>
        )}
      </div>
    </main>
  );
}

export default Home;
