import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import backendFetch from '../../helpers/backendFetch';
import styles from '../style/Poll.module.css';

function Poll({ post, replacePost }) {
  const [setError] = useOutletContext();
  const userId = parseInt(localStorage.getItem('userId'), 10);
  const totalVoters = post.poll.voters.length;

  async function vote(choiceNumber) {
    if (!post.poll.voters.includes(userId)) {
      const response = await backendFetch(setError, `/polls/${post.poll.id}`, {
        method: 'PUT',
        body: JSON.stringify({ choiceNumber }),
      });

      replacePost({ ...post, poll: response.poll });
    }
  }

  function getVotes(choiceNumber) {
    return post.poll[`choice${choiceNumber}Votes`].length;
  }

  return (
    <>
      <div className={styles.pollChoices}>
        {post.poll.choices.map((choice, i) => (
          <Fragment key={i}>
            <div className={styles.choiceBox} onClick={() => vote(i + 1)}>
              <div className={styles.choiceLabel}>
                <span>{choice}</span>
                {post.poll[`choice${i + 1}Votes`].includes(userId) && (
                  <span className={`material-symbols-outlined ${styles.voted}`}>
                    check_circle
                  </span>
                )}
              </div>
              <div
                className={styles.progressBar}
                style={{
                  width:
                    totalVoters === 0
                      ? '5%'
                      : `${(getVotes(i + 1) / totalVoters) * 100}%`,
                }}
              ></div>
            </div>
            <div>
              {totalVoters === 0
                ? '0% (0 votes)'
                : `${
                    Math.round((getVotes(i + 1) / totalVoters) * 1000) / 10
                  }% (${getVotes(i + 1)} vote${
                    getVotes(i + 1) === 1 ? '' : 's'
                  })`}
            </div>
          </Fragment>
        ))}
      </div>
      <p>{totalVoters} votes</p>
    </>
  );
}

Poll.propTypes = {
  post: PropTypes.object,
  replacePost: PropTypes.func,
};

export default Poll;
