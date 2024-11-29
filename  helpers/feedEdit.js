const editFeed = {
  replace(updatedFeedItem, feed) {
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
      }

      return feedItem;
    });
  },

  remove(deletedFeedItemId, deletedFeedItemType, feed) {
    function isRelatedToComment(feedItem) {
      return (
        (feedItem.id === deletedFeedItemId &&
          deletedFeedItemType === 'comment') ||
        (feedItem.parentId === deletedFeedItemId &&
          deletedFeedItemType === 'comment') ||
        (feedItem.postId === deletedFeedItemId &&
          deletedFeedItemType === 'post')
      );
    }

    return feed.filter((feedItem) => {
      switch (feedItem.feedItemType) {
        case 'post':
          return (
            feedItem.id !== deletedFeedItemId || deletedFeedItemType !== 'post'
          );
        case 'comment':
          return !isRelatedToComment(feedItem);
        case 'repost':
          if (feedItem.commentId) {
            return !isRelatedToComment(feedItem.comment);
          }

          return (
            feedItem.postId !== deletedFeedItemId ||
            deletedFeedItemType !== 'post'
          );
        default:
          return true;
      }
    });
  },
};

export default editFeed;
