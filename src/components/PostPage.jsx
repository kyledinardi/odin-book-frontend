import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import Post from './Post.jsx';
import Comment from './Comment.jsx';
import styles from '../style/PostPage.module.css';
import backendFetch from '../../ helpers/backendFetch';

function PostPage() {
  const [post, setPost] = useState(null);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const commentTextarea = useRef(null);

  const [setError, currentUser] = useOutletContext();
  const navigate = useNavigate();
  const postId = parseInt(useParams().postId, 10);

  useEffect(() => {
    if (!postId) {
      setError({ status: 404, message: 'Post not found' });
      return;
    }

    backendFetch(setError, `/posts/${postId}`).then((response) =>
      setPost(response.post),
    );
  }, [postId, setError]);

  async function submitComment(e) {
    e.preventDefault();

    const response = await backendFetch(setError, `/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text: e.target[0].value }),
    });

    e.target.reset();
    e.target[0].style.height = '64px';
    setIsEmojiOpen(false);
    setPost({ ...post, comments: [response.comment, ...post.comments] });
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
        key={post.id}
        post={post}
        replacePost={(updatedPost) => setPost(updatedPost)}
        removePost={() => navigate('/')}
        isPostPage={true}
      />
      <div className={styles.formSection}>
        <Link className={styles.currentUserPfp} to={`/users/${currentUser.id}`}>
          <img className='pfp' src={currentUser.pfpUrl} alt='' />
        </Link>
        <form onSubmit={(e) => submitComment(e)}>
          <textarea
            ref={commentTextarea}
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
          <div className={styles.formButtons}>
            <button
              className={styles.svgButton}
              type='button'
              onClick={() => setIsEmojiOpen(!isEmojiOpen)}
            >
              <span className='material-symbols-outlined'>add_reaction</span>
            </button>
            <button className={styles.submitButton}>Post Comment</button>
          </div>
          {isEmojiOpen && (
            <div className={styles.emojiPicker}>
              <EmojiPicker
                theme={localStorage.getItem('theme')}
                skinTonesDisabled={true}
                width={'100%'}
                onEmojiClick={(emojiData) => {
                  commentTextarea.current.value = `${commentTextarea.current.value}${emojiData.emoji}`;
                }}
              />
            </div>
          )}
        </form>
      </div>
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
