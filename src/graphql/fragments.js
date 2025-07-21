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
      id
      username
      displayName
      pfpUrl
    }
    likes {
      id
    }
    reposts {
      id
    }
    pollChoices {
      id
      text
      votes {
        id
      }
    }
    comments {
      id
      text
      imageUrl
      user {
        id
        username
        displayName
        pfpUrl
      }
      likes {
        id
      }
      replies {
        id
        text
        imageUrl
      }
      reposts {
        id
      }
    }
  }
`;

export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    timestamp
    text
    imageUrl
    userId
    postId
    parentId
    user {
      id
      username
      displayName
      pfpUrl
    }
    likes {
      id
    }
    reposts {
      id
    }
    post {
      ...PostFragment
    }
    parent {
      id
      user {
        id
        username
        displayName
        pfpUrl
      }
      likes {
        id
      }
      replies {
        id
        text
        imageUrl
      }
      reposts {
        id
      }
    }
    replies {
      id
      text
      imageUrl
      user {
        id
        username
        displayName
        pfpUrl
      }
      likes {
        id
      }
      replies {
        id
        text
        imageUrl
      }
      reposts {
        id
      }
    }
  }

  ${POST_FRAGMENT}
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
      id
      username
      displayName
      pfpUrl
    }
    post {
      ...PostFragment
    }
    comment {
      ...CommentFragment
    }
  }

  ${POST_FRAGMENT}
  ${COMMENT_FRAGMENT}
`;
