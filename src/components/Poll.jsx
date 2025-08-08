import { useMutation } from '@apollo/client';
import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { VOTE_IN_POLL } from '../graphql/mutations';
import logError from '../utils/logError';
import styles from '../style/Poll.module.css';

function Poll({ post }) {
  const [voteInPoll] = useMutation(VOTE_IN_POLL, { onError: logError });

  const totalVotes = post.pollChoices.reduce(
    (acc, choice) => acc + choice.votes.length,
    0
  );

  function getWidth(choice) {
    const numberOfVotes = choice.votes.length;

    if (totalVotes === 0 || numberOfVotes / totalVotes < 0.05) {
      return '5%';
    }

    return `${(numberOfVotes / totalVotes) * 100}%`;
  }

  function handleVote(choiceId) {
    const hasVoted = post.pollChoices.some((choice) =>
      choice.votes.some((vote) => vote.id === localStorage.getItem('userId'))
    );

    if (!hasVoted) {
      voteInPoll({ variables: { choiceId } });
    }
  }

  return (
    <>
      <div className={styles.pollChoices}>
        {post.pollChoices.map((choice) => (
          <Fragment key={choice.id}>
            <div
              className={styles.choiceBox}
              onClick={() => handleVote(choice.id)}
            >
              <div className={styles.choiceLabel}>
                <span>{choice.text}</span>
                {choice.votes.includes(
                  Number(localStorage.getItem('userId'))
                ) && (
                  <span className={`material-symbols-outlined ${styles.voted}`}>
                    check_circle
                  </span>
                )}
              </div>
              <div
                className={styles.progressBar}
                style={{ width: getWidth(choice) }}
              ></div>
            </div>
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
    </>
  );
}

Poll.propTypes = { post: PropTypes.object };
export default Poll;
