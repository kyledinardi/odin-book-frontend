import { gql } from '@apollo/client';
import { COMMENT_FRAGMENT, POST_FRAGMENT, REPOST_FRAGMENT } from './fragments';

export const LOCAL_LOGIN = gql`
  mutation localLogin($email: String!, $password: String!) {
    localLogin(email: $email, password: $password) {
      token
    }
  }
`;

export const CREATE_USER = gql`
  mutation createUser(
    $displayName: String
    $username: String!
    $password: String!
    $passwordConfirmation: String!
  ) {
    createUser(
      displayName: $displayName
      username: $username
      password: $password
      passwordConfirmation: $passwordConfirmation
    ) {
      token
      user {
        id
      }
    }
  }
`;

export const FOLLOW = gql`
  mutation follow($userId: ID!) {
    follow(userId: $userId) {
      id
    }
  }
`;

export const CREATE_POST = gql`
  mutation createPost(
    $text: String
    $gifUrl: String
    $pollChoices: [String!]
    $image: Upload
  ) {
    createPost(
      text: $text
      gifUrl: $gifUrl
      pollChoices: $pollChoices
      image: $image
    ) {
      ...PostFragment
    }
  }

  ${POST_FRAGMENT}
`;

export const DELETE_POST = gql`
  mutation deletePost($postId: ID!) {
    deletePost(postId: $postId) {
      id
    }
  }
`;

export const UPDATE_POST = gql`
  mutation updatePost(
    $postId: ID!
    $text: String
    $gifUrl: String
    $image: Upload
  ) {
    updatePost(postId: $postId, text: $text, gifUrl: $gifUrl, image: $image) {
      ...PostFragment
    }
  }

  ${POST_FRAGMENT}
`;

export const LIKE_POST = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      ...PostFragment
    }
  }

  ${POST_FRAGMENT}
`;

export const VOTE_IN_POLL = gql`
  mutation voteInPoll($choiceId: ID!) {
    voteInPoll(choiceId: $choiceId) {
      id
      postId
      text
      votes {
        id
      }
    }
  }
`;

export const REPOST = gql`
  mutation repost($id: ID!, $contentType: String!) {
    repost(id: $id, contentType: $contentType) {
      ...RepostFragment
    }
  }

  ${REPOST_FRAGMENT}
`;

export const CREATE_ROOT_COMMENT = gql`
  mutation createRootComment(
    $postId: ID!
    $text: String
    $gifUrl: String
    $image: Upload
  ) {
    createRootComment(
      postId: $postId
      text: $text
      gifUrl: $gifUrl
      image: $image
    ) {
      ...CommentFragment
    }
  }

  ${COMMENT_FRAGMENT}
`;

export const CREATE_REPLY = gql`
  mutation createReply(
    $parentId: ID!
    $text: String
    $gifUrl: String
    $image: Upload
  ) {
    createReply(
      parentId: $parentId
      text: $text
      gifUrl: $gifUrl
      image: $image
    ) {
      ...CommentFragment
    }
  }

  ${COMMENT_FRAGMENT}
`;

export const UPDATE_COMMENT = gql`
  mutation updateComment(
    $commentId: ID!
    $text: String
    $gifUrl: String
    $image: Upload
  ) {
    updateComment(
      commentId: $commentId
      text: $text
      gifUrl: $gifUrl
      image: $image
    ) {
      ...CommentFragment
    }
  }

  ${COMMENT_FRAGMENT}
`;

export const LIKE_COMMENT = gql`
  mutation likeComment($commentId: ID!) {
    likeComment(commentId: $commentId) {
      ...CommentFragment
    }
  }

  ${COMMENT_FRAGMENT}
`;

export const DELETE_COMMENT = gql`
  mutation deleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      id
    }
  }
`;
