/* eslint-disable no-underscore-dangle */
import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import Post from './Post.jsx';
import Comment from './Comment.jsx';

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

  return !post ? (
    <h1>Loading...</h1>
  ) : (
    <main>
      <Post
        key={post.id}
        post={post}
        replacePost={(updatedPost) => setPost(updatedPost)}
      />
      <form onSubmit={(e) => submitComment(e)}>
        <img src={currentUser.pfpUrl} alt='' />
        <textarea
          name='commentText'
          id='commentText'
          cols='30'
          rows='10'
          placeholder='New Comment'
          required
        ></textarea>
        <button>Post Comment</button>
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
