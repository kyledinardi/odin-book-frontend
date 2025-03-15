import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ContentForm from '../components/ContentForm.jsx';
import Post from '../components/Post.jsx';
import Comment from '../components/Comment.jsx';
import backendFetch from '../../helpers/backendFetch';
import socket from '../../helpers/socket';

function PostPage() {
  const [post, setPost] = useState(null);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [setError, currentUser] = useOutletContext();
  const navigate = useNavigate();
  const postId = parseInt(useParams().postId, 10);

  useEffect(() => {
    if (!postId) {
      setError({ status: 404, message: 'Post not found' });
    } else {
      backendFetch(setError, `/posts/${postId}`).then((response) => {
        setPost(response.post);
        setHasMoreComments(response.post.comments.length === 20);
      });
    }
  }, [postId, setError]);

  async function addMoreComments() {
    const response = await backendFetch(
      setError,

      `/posts/${postId}/comments?commentId=${
        post.comments[post.comments.length - 1].id
      }`,
    );

    setPost({ ...post, comments: [...post.comments, ...response.comments] });
    setHasMoreComments(response.comments.length === 20);
  }

  function replaceComment(updatedComment) {
    const newComments = post.comments.map((comment) =>
      comment.id === updatedComment.id ? updatedComment : comment,
    );

    setPost({ ...post, comments: newComments });
  }

  function removeComment(commentId) {
    const newComments = post.comments.filter(
      (comment) => comment.id !== commentId,
    );

    setPost({ ...post, comments: newComments });
  }

  return !post || !currentUser ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <Post
        post={post}
        replacePost={(updatedPost) => setPost(updatedPost)}
        removePost={() => navigate('/')}
        displayType='focused'
      />
      <ContentForm
        contentType='comment'
        setContent={(comment) => {
          setPost({ ...post, comments: [comment, ...post.comments] });
          socket.emit('sendNotification', { userId: post.userId });
        }}
        parentId={postId}
      />
      <div>
        <InfiniteScroll
          dataLength={post.comments.length}
          next={() => addMoreComments()}
          hasMore={hasMoreComments}
          loader={
            <div className='loaderContainer'>
              <div className='loader'></div>
            </div>
          }
          endMessage={<div></div>}
        >
          {post.comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              replaceComment={(updatedComment) =>
                replaceComment(updatedComment)
              }
              removeComment={(commentId) => removeComment(commentId)}
              displayType='reply'
            />
          ))}
        </InfiniteScroll>
      </div>
    </main>
  );
}

export default PostPage;
