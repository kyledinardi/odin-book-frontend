import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import Comment from './Comment.jsx';
import Post from './Post.jsx';
import editFeed from '../utils/feedEdit';
import backendFetch from '../utils/backendFetch';

function ProfilePostList({ user, openTab }) {
  const [posts, setPosts] = useState(null);
  const [comments, setComments] = useState(null);
  const [imagePosts, setImagePosts] = useState(null);
  const [likedPosts, setLikedPosts] = useState(null);
  
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [hasMoreImagePosts, setHasMoreImagePosts] = useState(false);
  const [hasMoreLikedPosts, setHasMoreLikedPosts] = useState(false);
  const [currentUser] = useOutletContext();

  useEffect(() => {
    Promise.all([
      backendFetch(setError, `/users/${user.id}/posts`),
      backendFetch(setError, `/users/${user.id}/comments`),
      backendFetch(setError, `/users/${user.id}/posts/images`),
      backendFetch(setError, `/users/${user.id}/posts/likes`),
    ]).then((responses) => {
      setPosts(responses[0].posts);
      setComments(responses[1].comments);
      setImagePosts(responses[2].posts);
      setLikedPosts(responses[3].posts);
      setHasMorePosts(responses[0].posts.length === 20);
      setHasMoreComments(responses[1].comments.length === 20);
      setHasMoreImagePosts(responses[2].posts.length === 20);
      setHasMoreLikedPosts(responses[3].posts.length === 20);
    });
  }, [user]);

  const noPostsMessageTemplate =
    user.id === currentUser.id ? 'You have' : `${user.displayName} has`;

  async function addMorePosts() {
    const lastPost = posts.findLast((post) => post.feedItemType === 'post');
    const lastRepost = posts.findLast((post) => post.feedItemType === 'repost');

    const response = await backendFetch(
      setError,

      `/users/${user.id}/posts?${lastPost ? `postId=${lastPost.id}` : ''}&${
        lastRepost ? `repostId=${lastRepost.id}` : ''
      }`,
    );

    setPosts([...posts, ...response.posts]);
    setHasMorePosts(response.posts.length === 20);
  }

  async function addMoreComments() {
    const response = await backendFetch(
      setError,

      `/users/${user.id}/comments?commentId=${
        comments[comments.length - 1].id
      }`,
    );

    setComments([...comments, ...response.comments]);
    setHasMoreComments(response.comments.length === 20);
  }

  async function addMoreImagePosts() {
    const response = await backendFetch(
      setError,

      `/users/${user.id}/posts/images?postId=${
        imagePosts[imagePosts.length - 1].id
      }`,
    );

    setImagePosts([...imagePosts, ...response.posts]);
    setHasMoreImagePosts(response.posts.length === 20);
  }

  async function addMoreLikedPosts() {
    const response = await backendFetch(
      setError,

      `/users/${user.id}/posts/likes?postId=${
        likedPosts[likedPosts.length - 1].id
      }`,
    );

    setLikedPosts([...likedPosts, ...response.posts]);
    setHasMoreLikedPosts(response.posts.length === 20);
  }

  function replaceFeedItem(updatedFeedItem) {
    setPosts(editFeed.replace(updatedFeedItem, posts));
    setComments(editFeed.replace(updatedFeedItem, comments));
    setImagePosts(editFeed.replace(updatedFeedItem, imagePosts));
    setLikedPosts(editFeed.replace(updatedFeedItem, likedPosts));
  }

  function removeFeedItem(deletedFeedItemId, deletedFeedItemType) {
    setPosts(editFeed.remove(deletedFeedItemId, deletedFeedItemType, posts));
    setComments(
      editFeed.remove(deletedFeedItemId, deletedFeedItemType, comments),
    );
    setImagePosts(
      editFeed.remove(deletedFeedItemId, deletedFeedItemType, imagePosts),
    );
    setLikedPosts(
      editFeed.remove(deletedFeedItemId, deletedFeedItemType, likedPosts),
    );
  }

  function returnPost(post) {
    return (
      <Post
        key={post.id}
        post={post}
        replacePost={(updatedPost) => replaceFeedItem(updatedPost)}
        removePost={(deletedPostId) => removeFeedItem(deletedPostId, 'post')}
        displayType='feed'
      />
    );
  }

  if (posts) {
    switch (openTab) {
      case 'posts':
        if (posts.length === 0) {
          return <h2>{`${noPostsMessageTemplate} no posts.`}</h2>;
        }

        return (
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
          >
            {posts.map((post) => {
              if (post.feedItemType === 'repost') {
                return (
                  <div key={`repost${post.id}`}>
                    <p className='repostHeading'>
                      <span className='material-symbols-outlined'>repeat</span>
                      <span>{post.user.displayName} reposted</span>
                    </p>
                    {post.postId ? (
                      <Post
                        post={post.post}
                        replacePost={(updatedPost) =>
                          replaceFeedItem(updatedPost)
                        }
                        removePost={(deletedPostId) =>
                          removeFeedItem(deletedPostId, 'post')
                        }
                        displayType='repost'
                      />
                    ) : (
                      <Comment
                        comment={post.comment}
                        replaceComment={(updatedComment) =>
                          replaceFeedItem(updatedComment)
                        }
                        removeComment={(deletedCommentId) =>
                          removeFeedItem(deletedCommentId, 'comment')
                        }
                        displayType='repost'
                      />
                    )}
                  </div>
                );
              }
              return returnPost(post);
            })}
          </InfiniteScroll>
        );
      case 'comments':
        if (comments.length === 0) {
          return <h2>{`${noPostsMessageTemplate} no comments.`}</h2>;
        }

        return (
          <InfiniteScroll
            dataLength={comments.length}
            next={() => addMoreComments()}
            hasMore={hasMoreComments}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {comments.map((comment) => (
              <div key={comment.id}>
                <Post
                  post={comment.post}
                  replacePost={(updatedPost) => replaceFeedItem(updatedPost)}
                  removePost={(deletedPostId) =>
                    removeFeedItem(deletedPostId, 'post')
                  }
                  displayType='ancestor'
                />
                {comment.parent && (
                  <>
                    {comment.parent.parentId && <div>...</div>}
                    <Comment
                      comment={comment.parent}
                      replaceComment={(updatedComment) =>
                        replaceFeedItem(updatedComment)
                      }
                      removeComment={(deletedCommentId) =>
                        removeFeedItem(deletedCommentId, 'comment')
                      }
                      displayType='ancestor'
                    />
                  </>
                )}
                <Comment
                  comment={comment}
                  replaceComment={(updatedComment) =>
                    replaceFeedItem(updatedComment)
                  }
                  removeComment={(deletedCommentId) =>
                    removeFeedItem(deletedCommentId, 'comment')
                  }
                  displayType='feed'
                />
              </div>
            ))}
          </InfiniteScroll>
        );
      case 'images':
        if (imagePosts.length === 0) {
          return <h2>{`${noPostsMessageTemplate} no images.`}</h2>;
        }

        return (
          <InfiniteScroll
            dataLength={imagePosts.length}
            next={() => addMoreImagePosts()}
            hasMore={hasMoreImagePosts}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {imagePosts.map((post) => returnPost(post))}
          </InfiniteScroll>
        );
      case 'likes':
        if (likedPosts.length === 0) {
          return <h2>{`${noPostsMessageTemplate} not liked any posts`}</h2>;
        }

        return (
          <InfiniteScroll
            dataLength={likedPosts.length}
            next={() => addMoreLikedPosts()}
            hasMore={hasMoreLikedPosts}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {likedPosts.map((post) => returnPost(post))}
          </InfiniteScroll>
        );
      default:
        return null;
    }
  }
}

ProfilePostList.propTypes = {
  user: PropTypes.object,
  openTab: PropTypes.string,
};

export default ProfilePostList;
