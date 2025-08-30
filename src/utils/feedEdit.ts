import type { Comment, FeedItem } from '../types';

const editFeed = {
  replace(updatedFeedItem: FeedItem, feed: FeedItem[]) {
    return feed.map((feedItem) => {
      switch (feedItem.feedItemType) {
        case 'post':
          if (
            feedItem.id === updatedFeedItem.id &&
            updatedFeedItem.feedItemType === 'post'
          ) {
            return updatedFeedItem;
          }

          break;
        case 'comment':
          if (
            feedItem.id === updatedFeedItem.id &&
            updatedFeedItem.feedItemType === 'comment'
          ) {
            return {
              ...feedItem,
              text: updatedFeedItem.text,
              reposts: updatedFeedItem.reposts,
              likes: updatedFeedItem.likes,
            };
          }

          if (
            feedItem.parentId === updatedFeedItem.id &&
            updatedFeedItem.feedItemType === 'comment'
          ) {
            return { ...feedItem, parent: updatedFeedItem };
          }

          if (
            feedItem.postId === updatedFeedItem.id &&
            updatedFeedItem.feedItemType === 'post'
          ) {
            return { ...feedItem, post: updatedFeedItem };
          }

          break;
        case 'repost':
          if (
            feedItem.postId === updatedFeedItem.id &&
            updatedFeedItem.feedItemType === 'post'
          ) {
            return { ...feedItem, post: updatedFeedItem };
          }

          if (
            feedItem.commentId === updatedFeedItem.id &&
            updatedFeedItem.feedItemType === 'comment'
          ) {
            return { ...feedItem, comment: updatedFeedItem };
          }

          break;
        default:
          throw new Error('Invalid feed item type');
      }

      return feedItem;
    });
  },

  remove(
    deletedFeedItemId: string,
    deletedFeedItemType: string,
    feed: FeedItem[],
  ) {
    const isRelatedToComment = (feedItem: Comment) => {
      if (deletedFeedItemType === 'comment') {
        if (
          feedItem.id === deletedFeedItemId ||
          feedItem.parentId === deletedFeedItemId
        ) {
          return true;
        }
      }

      return (
        deletedFeedItemType === 'post' && feedItem.postId === deletedFeedItemId
      );
    };

    return feed.filter((feedItem) => {
      switch (feedItem.feedItemType) {
        case 'post':
          return (
            feedItem.id !== deletedFeedItemId || deletedFeedItemType !== 'post'
          );

        case 'comment':
          return !isRelatedToComment(feedItem);

        case 'repost':
          if (feedItem.comment) {
            return !isRelatedToComment(feedItem.comment);
          }

          return (
            feedItem.postId !== deletedFeedItemId ||
            deletedFeedItemType !== 'post'
          );

        default:
          throw new Error('Invalid feed item type');
      }
    });
  },
};

export default editFeed;
