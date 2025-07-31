import { InMemoryCache } from '@apollo/client';
import editFeed from './feedEdit';

export default new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getIndexPosts: { merge: (_, incoming) => incoming },
        searchPosts: { merge: (_, incoming) => incoming },
      },
    },

    Post: {
      fields: {
        likes: { merge: (_, incoming) => incoming },
        comments: { merge: (_, incoming) => incoming },
        reposts: { merge: (_, incoming) => incoming },
      },
    },

    Comment: {
      fields: {
        likes: { merge: (_, incoming) => incoming },
        replies: { merge: (_, incoming) => incoming },
        reposts: { merge: (_, incoming) => incoming },
      },
    },
  },
});

export const indexFeedCache = {
  create: (result, created) =>
    result.updateQuery(({ getIndexPosts }) => ({
      getIndexPosts: [created, ...getIndexPosts],
    })),

  update: (result, updated) =>
    result.updateQuery(({ getIndexPosts }) => ({
      getIndexPosts: editFeed.replace(updated, getIndexPosts),
    })),

  delete: (result, deletedId, deletedFeedItemType) =>
    result.updateQuery(({ getIndexPosts }) => ({
      getIndexPosts: editFeed.remove(
        deletedId,
        deletedFeedItemType,
        getIndexPosts
      ),
    })),
};

export const searchChache = {
  updatePost: (result, updatedPost) =>
    result.updateQuery(({ searchPosts }) => ({
      searchPosts: searchPosts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      ),
    })),

  deletePost: (result, deletedPostId) =>
    result.updateQuery(({ searchPosts }) => ({
      searchPosts: searchPosts.filter((post) => post.id !== deletedPostId),
    })),
};

export const postPageCache = {
  updatePost: (result, updatedPost) =>
    result.updateQuery(() => ({ getPost: updatedPost })),

  createComment: (result, createdComment) =>
    result.updateQuery(({ getPost }) => ({
      getPost: { ...getPost, comments: [createdComment, ...getPost.comments] },
    })),

  updateComment: (result, updatedComment) =>
    result.updateQuery(({ getPost }) => {
      const newComments = getPost.comments.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment
      );

      return { getPost: { ...getPost, comments: newComments } };
    }),

  deleteComment: (result, deletedCommentId) =>
    result.updateQuery(({ getPost }) => {
      const newComments = getPost.comments.filter(
        (comment) => comment.id !== deletedCommentId
      );

      return { getPost: { ...getPost, comments: newComments } };
    }),
};

export const commentPageCache = {
  updatePost: (result, updatedPost) =>
    result.updateQuery(({ getComment }) => ({
      getComment: { ...getComment, post: updatedPost },
    })),

  updateComment: (result, updatedComment) => {
    result.updateQuery(() => ({
      getComment: updatedComment,
    }));
  },

  updateAncestor: (result, updatedAncestor) =>
    result.updateQuery(({ getComment }) => {
      const newCommentChain = getComment.commentChain.map((comment) =>
        comment.id === updatedAncestor.id ? updatedAncestor : comment
      );

      return { getComment: { ...getComment, commentChain: newCommentChain } };
    }),

  createReply: (result, createdComment) =>
    result.updateQuery(({ getComment }) => ({
      getComment: {
        ...getComment,
        replies: [createdComment, ...getComment.replies],
      },
    })),

  updateReply: (result, updatedReply) =>
    result.updateQuery(({ getComment }) => {
      const newReplies = getComment.replies.map((reply) =>
        reply.id === updatedReply.id ? updatedReply : reply
      );

      return { getComment: { ...getComment, replies: newReplies } };
    }),

  deleteReply: (result, deletedReplyId) => {
    result.updateQuery(({ getComment }) => {
      const newReplies = getComment.replies.filter(
        (reply) => reply.id !== deletedReplyId
      );

      return { getComment: { ...getComment, replies: newReplies } };
    });
  },
};
