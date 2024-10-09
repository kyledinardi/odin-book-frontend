import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import Post from './Post.jsx';
import Comment from './Comment.jsx';
import styles from '../style/PostPage.module.css';

function PostPage() {
  const [post, setPost] = useState(null);
  const { postId } = useParams();
  const [currentUser] = useOutletContext();

  useEffect(() => {
    fetch(`http://localhost:3000/posts/${postId}`, {
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
      `http://localhost:3000/posts/${postId}/comments`,

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

  return !post ? (
    <h1>Loading...</h1>
  ) : (
    <main>
      <Post
        key={post.id}
        post={post}
        replacePost={(updatedPost) => setPost(updatedPost)}
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
          maxLength={1000}
          onInput={(e) => resetTextareaHeight(e)}
          required
        ></textarea>
        <button className={styles.submitButton}>Post Comment</button>
      </form>
      <div>
        {post.comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </main>
  );
}

export default PostPage;
