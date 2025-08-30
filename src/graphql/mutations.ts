import { gql } from '@apollo/client';

import { COMMENT_FRAGMENT, POST_FRAGMENT, REPOST_FRAGMENT } from './fragments';

import type { TypedDocumentNode } from '@apollo/client';

import type {
  ChoiceResult,
  CommentResult,
  IdResult,
  LoginResponseResult,
  MessageResult,
  PostResult,
  RepostResult,
} from '../types';

export const LOCAL_LOGIN: TypedDocumentNode<LoginResponseResult<'localLogin'>> =
  gql`
    mutation localLogin($username: String!, $password: String!) {
      localLogin(username: $username, password: $password) {
        token
        user {
          id
        }
      }
    }
  `;

export const CREATE_USER: TypedDocumentNode<LoginResponseResult<'createUser'>> =
  gql`
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

export const UPDATE_PROFILE: TypedDocumentNode<IdResult<'updateProfile'>> = gql`
  mutation updateProfile(
    $pfp: Upload
    $headerImage: Upload
    $displayName: String
    $bio: String
    $location: String
    $website: String
  ) {
    updateProfile(
      pfp: $pfp
      headerImage: $headerImage
      displayName: $displayName
      location: $location
      website: $website
      bio: $bio
    ) {
      id
    }
  }
`;

export const UPDATE_PASSWORD: TypedDocumentNode<IdResult<'updatePassword'>> =
  gql`
    mutation updatePassword(
      $currentPassword: String!
      $newPassword: String!
      $newPasswordConfirmation: String!
    ) {
      updatePassword(
        currentPassword: $currentPassword
        newPassword: $newPassword
        newPasswordConfirmation: $newPasswordConfirmation
      ) {
        id
      }
    }
  `;

export const FOLLOW: TypedDocumentNode<IdResult<'follow'>> = gql`
  mutation follow($userId: ID!) {
    follow(userId: $userId) {
      id
    }
  }
`;

export const CREATE_POST: TypedDocumentNode<PostResult<'createPost'>> = gql`
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

export const DELETE_POST: TypedDocumentNode<IdResult<'deletePost'>> = gql`
  mutation deletePost($postId: ID!) {
    deletePost(postId: $postId) {
      id
    }
  }
`;

export const UPDATE_POST: TypedDocumentNode<PostResult<'updatePost'>> = gql`
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

export const LIKE_POST: TypedDocumentNode<PostResult<'likePost'>> = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      ...PostFragment
    }
  }

  ${POST_FRAGMENT}
`;

export const VOTE_IN_POLL: TypedDocumentNode<ChoiceResult<'voteInPoll'>> = gql`
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

export const REPOST: TypedDocumentNode<RepostResult<'repost'>> = gql`
  mutation repost($id: ID!, $contentType: String!) {
    repost(id: $id, contentType: $contentType) {
      ...RepostFragment
    }
  }

  ${REPOST_FRAGMENT}
`;

export const CREATE_ROOT_COMMENT: TypedDocumentNode<
  CommentResult<'createRootComment'>
> = gql`
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

export const CREATE_REPLY: TypedDocumentNode<CommentResult<'createReply'>> =
  gql`
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

export const UPDATE_COMMENT: TypedDocumentNode<CommentResult<'updateComment'>> =
  gql`
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

export const LIKE_COMMENT: TypedDocumentNode<CommentResult<'likeComment'>> =
  gql`
    mutation likeComment($commentId: ID!) {
      likeComment(commentId: $commentId) {
        ...CommentFragment
      }
    }

    ${COMMENT_FRAGMENT}
  `;

export const DELETE_COMMENT: TypedDocumentNode<IdResult<'deleteComment'>> = gql`
  mutation deleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      id
    }
  }
`;

export const FIND_OR_CREATE_ROOM: TypedDocumentNode<
  IdResult<'findOrCreateRoom'>
> = gql`
  mutation findOrCreateRoom($userId: ID!) {
    findOrCreateRoom(userId: $userId) {
      id
    }
  }
`;

export const CREATE_MESSAGE: TypedDocumentNode<MessageResult<'createMessage'>> =
  gql`
    mutation createMessage(
      $roomId: ID!
      $text: String!
      $gifUrl: String
      $image: Upload
    ) {
      createMessage(
        roomId: $roomId
        text: $text
        gifUrl: $gifUrl
        image: $image
      ) {
        id
        timestamp
        text
        imageUrl
        userId
      }
    }
  `;

export const UPDATE_MESSAGE: TypedDocumentNode<MessageResult<'updateMessage'>> =
  gql`
    mutation updateMessage($messageId: ID!, $text: String!) {
      updateMessage(messageId: $messageId, text: $text) {
        id
        timestamp
        text
        imageUrl
        userId
      }
    }
  `;

export const DELETE_MESSAGE: TypedDocumentNode<IdResult<'deleteMessage'>> = gql`
  mutation deleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId) {
      id
    }
  }
`;
