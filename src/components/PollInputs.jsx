import PropTypes from 'prop-types';
import { Fragment } from 'react';
import styles from '../style/PollInputs.module.css';

function PollInputs({ pollChoiceCount, setPollChoiceCount }) {
  const choiceInputs = [];

  for (let i = 0; i < pollChoiceCount; i += 1) {
    let inputElement;

    if (i < 2) {
      inputElement = (
        <input
          key={i}
          type='text'
          name={`choice${i + 1}`}
          id={`choice${i + 1}`}
          placeholder={`Choice ${i + 1}`}
          required
        />
      );
    } else {
      inputElement = (
        <input
          key={i}
          type='text'
          name={`choice${i + 1}`}
          id={`choice${i + 1}`}
          placeholder={`Choice ${i + 1} (optional)`}
        />
      );
    }

    if (i === pollChoiceCount - 1 && pollChoiceCount !== 6) {
      choiceInputs.push(
        <Fragment key={i}>
          {inputElement}
          <button
            className={styles.svgButton}
            type='button'
            onClick={() => setPollChoiceCount(pollChoiceCount + 1)}
          >
            <span className='material-symbols-outlined'>add</span>
          </button>
        </Fragment>,
      );
    } else {
      choiceInputs.push(
        <Fragment key={i}>
          {inputElement}
          <div></div>
        </Fragment>,
      );
    }
  }

  return <div className={styles.pollChoices}>{choiceInputs}</div>;
}

PollInputs.propTypes = {
  pollChoiceCount: PropTypes.number,
  setPollChoiceCount: PropTypes.func,
};

export default PollInputs;
