import { Link } from 'react-router-dom';

import CommentCard from './CommentCard.tsx';
import PostCard from './PostCard.tsx';
import { indexFeedCache } from '../utils/apolloCache.ts';

import type { QueryResult } from '@apollo/client';

import type { Comment, Post, PostOrRepost } from '../types.ts';

const IndexFeedItem = ({
  post,
  postsResult,
}: {
  post: PostOrRepost;
  postsResult: QueryResult;
}) => {
  if (post.feedItemType === 'post') {
    return (
      <PostCard
        key={post.id}
        displayType='feed'
        post={post}
        removePost={(deletedPostId: string) =>
          indexFeedCache.delete(postsResult, deletedPostId, 'post')
        }
        replacePost={(updatedPost: Post) =>
          indexFeedCache.update(postsResult, updatedPost)
        }
      />
    );
  }

  if (post.post) {
    return (
      <div key={`repost${post.id}`}>
        <p className='repostHeading'>
          <span className='material-symbols-outlined'>repeat</span>
          <Link to={`/users/${post.userId}`}>
            {post.user.displayName} reposted
          </Link>
        </p>
        <PostCard
          displayType='repost'
          post={post.post}
          removePost={(deletedPostId: string) =>
            indexFeedCache.delete(postsResult, deletedPostId, 'post')
          }
          replacePost={(updatedPost: Post) =>
            indexFeedCache.update(postsResult, updatedPost)
          }
        />
      </div>
    );
  }

  if (post.comment) {
    return (
      <div key={`repost${post.id}`}>
        <p className='repostHeading'>
          <span className='material-symbols-outlined'>repeat</span>
          <Link to={`/users/${post.userId}`}>
            {post.user.displayName} reposted
          </Link>
        </p>
        <CommentCard
          comment={post.comment}
          displayType='repost'
          removeComment={(deletedCommentId: string) =>
            indexFeedCache.delete(postsResult, deletedCommentId, 'post')
          }
          replaceComment={(updatedComment: Comment) => {
            indexFeedCache.update(postsResult, updatedComment);
          }}
        />
      </div>
    );
  }

  throw new Error('Invalid feed item');
};

export default IndexFeedItem;
