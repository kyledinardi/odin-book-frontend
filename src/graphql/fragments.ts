import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    username
    displayName
    pfpUrl
    joinDate
    headerUrl
    bio
    location
    website
    following {
      id
    }
    _count {
      posts
      followers
      following
      receivedNotifications
    }
  }
`;

export const POST_FRAGMENT = gql`
  fragment PostFragment on Post {
    id
    timestamp
    text
    feedItemType
    imageUrl
    userId
    user {
      username
      displayName
      pfpUrl
    }
    pollChoices {
      id
      text
      votes {
        id
      }
    }
    reposts {
      id
      userId
    }
    likes {
      id
    }
    _count {
      comments
    }
  }
`;

export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    timestamp
    text
    feedItemType
    imageUrl
    userId
    postId
    parentId
    user {
      username
      displayName
      pfpUrl
    }
    likes {
      id
    }
    reposts {
      id
      userId
    }
    _count {
      replies
    }
  }
`;

export const REPOST_FRAGMENT = gql`
  fragment RepostFragment on Repost {
    id
    timestamp
    feedItemType
    userId
    postId
    commentId
    user {
      displayName
    }
    post {
      ...PostFragment
    }
    comment {
      ...CommentFragment
      post {
        userId
        user {
          username
        }
      }
      parent {
        userId
        user {
          username
        }
      }
    }
  }

  ${POST_FRAGMENT}
  ${COMMENT_FRAGMENT}
`;
