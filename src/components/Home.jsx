import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import NewContentForm from './NewContentForm.jsx';
import Post from './Post.jsx';
import Comment from './Comment.jsx';
import backendFetch from '../../ helpers/backendFetch';
import editFeed from '../../ helpers/feedEdit';

function Home() {
  const [posts, setPosts] = useState(null);
  const [setError, currentUser] = useOutletContext();

  useEffect(() => {
    backendFetch(setError, '/posts').then((response) => {
      setPosts(response.posts);
    });
  }, [setError]);

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
      <NewContentForm
        contentType={'post'}
        setContent={(post) => setPosts([post, ...posts])}
        currentUser={currentUser}
      />
      <div>
        {posts.length === 0 ? (
          <h2>You and your followers have no posts</h2>
        ) : (
          posts.map((post) => renderPost(post))
        )}
      </div>
    </main>
  );
}

export default Home;
