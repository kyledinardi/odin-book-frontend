import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import { useEffect, useState } from 'react';
import Post from './Post.jsx';
import Comment from './Comment.jsx';
import styles from '../style/PostPage.module.css';

function PostPage() {
  const [post, setPost] = useState(null);
  const [setError, currentUser] = useOutletContext();
  const navigate = useNavigate();
  const postId = parseInt(useParams().postId, 10);

  useEffect(() => {
    if (!postId) {
      setError({ status: 404, message: 'Post not found' });
      return;
    }

    fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          setError(response.error);
        }

        setPost(response.post);
      });
  }, [postId, setError]);

  async function submitComment(e) {
    e.preventDefault();

    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/posts/${postId}/comments`,

      {
        method: 'POST',
        body: JSON.stringify({ text: e.target[0].value }),

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const response = await responseStream.json();

    if (response.error) {
      setError(response.error);
    }

    e.target.reset();
    const newComments = [response.comment, ...post.comments];
    setPost({ ...post, comments: newComments });
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

  return !post ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <Post
        key={post.id}
        post={post}
        replacePost={(updatedPost) => setPost(updatedPost)}
        removePost={() => navigate('/')}
        isPostPage={true}
      />
      <form
        className={styles.newCommentForm}
        onSubmit={(e) => submitComment(e)}
      >
        <Link className={styles.currentUserPfp} to={`/users/${currentUser.id}`}>
          <img className='pfp' src={currentUser.pfpUrl} alt='' />
        </Link>
        <textarea
          className={styles.commentText}
          name='commentText'
          id='commentText'
          placeholder='New Comment'
          maxLength={10000}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          required
        ></textarea>
        <button className={styles.submitButton}>Post Comment</button>
      </form>
      <div>
        {post.comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            replaceComment={(updatedComment) => replaceComment(updatedComment)}
            removeComment={(commentId) => removeComment(commentId)}
          />
        ))}
      </div>
    </main>
  );
}

export default PostPage;
