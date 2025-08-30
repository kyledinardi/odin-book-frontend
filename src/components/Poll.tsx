import { Fragment } from 'react';

import { useMutation } from '@apollo/client';

import { VOTE_IN_POLL } from '../graphql/mutations.ts';
import styles from '../style/Poll.module.css';
import logError from '../utils/logError.ts';

import type { Choice, Post } from '../types.ts';

const Poll = ({ post }: { post: Post }) => {
  const [voteInPoll] = useMutation(VOTE_IN_POLL, { onError: logError });

  const totalVotes = post.pollChoices.reduce(
    (acc, choice) => acc + choice.votes.length,
    0,
  );

  const getWidth = (choice: Choice) => {
    const numberOfVotes = choice.votes.length;

    if (totalVotes === 0 || numberOfVotes / totalVotes < 0.05) {
      return '5%';
    }

    return `${(numberOfVotes / totalVotes) * 100}%`;
  };

  const handleVote = async (choiceId: string) => {
    const hasVoted = post.pollChoices.some((choice) =>
      choice.votes.some((vote) => vote.id === localStorage.getItem('userId')),
    );

    if (!hasVoted) {
      await voteInPoll({ variables: { choiceId } });
    }
  };

  return (
    <Fragment>
      <div className={styles.pollChoices}>
        {post.pollChoices.map((choice) => (
          <Fragment key={choice.id}>
            <button
              className={styles.choiceBox}
              type='button'
              onClick={() => {
                handleVote(choice.id).catch(logError);
              }}
            >
              <div className={styles.choiceLabel}>
                <span>{choice.text}</span>
                {choice.votes.some(
                  (vote) => vote.id === localStorage.getItem('userId'),
                ) && (
                  <span className={`material-symbols-outlined ${styles.voted}`}>
                    check_circle
                  </span>
                )}
              </div>
              <div
                className={styles.progressBar}
                style={{ width: getWidth(choice) }}
              />
            </button>
            <div>
              {totalVotes === 0
                ? '0% (0 votes)'
                : `${
                    Math.round((choice.votes.length / totalVotes) * 1000) / 10
                  }% (${choice.votes.length} vote${
                    choice.votes.length === 1 ? '' : 's'
                  })`}
            </div>
          </Fragment>
        ))}
      </div>
      <p>{totalVotes} votes</p>
    </Fragment>
  );
};

export default Poll;
