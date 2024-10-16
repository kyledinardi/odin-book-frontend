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
  const { postId } = useParams();
  const [currentUser] = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/${postId}`, {
      mode: 'cors',

      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => response.json())
      .then((response) => setPost(response.post));
  }, [postId]);

  async function submitComment(e) {
    e.preventDefault();

    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/posts/${postId}/comments`,

      {
        method: 'POST',
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({ text: e.target[0].value }),
      },
    );

    const response = await responseStream.json();
    e.target.reset();
    const newComments = [response.comment, ...post.comments];
    setPost({ ...post, comments: newComments });
  }

  function resetTextareaHeight(e) {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
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
    <h1>Loading...</h1>
  ) : (
    <main>
      <Post
        key={post.id}
        post={post}
        replacePost={(updatedPost) => setPost(updatedPost)}
        removePost={() => navigate('/')}
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
          maxLength={1000}
          onInput={(e) => resetTextareaHeight(e)}
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
