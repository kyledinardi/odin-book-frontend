import { Fragment } from 'react';

import styles from '../style/PollInputs.module.css';

const PollInputs = ({
  pollChoices,
  setPollChoices,
}: {
  pollChoices: string[];
  setPollChoices: (choices: string[]) => void;
}) => {
  const choiceCount = pollChoices.length;
  const choiceInputs = [];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    inputIndex: number,
  ) => {
    const newChoices = pollChoices.map((choice, choiceIndex) =>
      choiceIndex === inputIndex ? e.target.value : choice,
    );
    
    setPollChoices(newChoices);
  };

  for (let i = 0; i < choiceCount; i += 1) {
    const inputElement = (
      <input
        key={i}
        id={`choice${i + 1}`}
        maxLength={20}
        name={`choice${i + 1}`}
        onChange={(e) => handleInputChange(e, i)}
        placeholder={`Choice ${i + 1} (optional)`}
        required={i < 2}
        type='text'
        value={pollChoices[i]}
      />
    );

    if (i === choiceCount - 1 && choiceCount < 6) {
      choiceInputs.push(
        <Fragment key={i}>
          {inputElement}
          <button
            className={styles.svgButton}
            onClick={() => setPollChoices([...pollChoices, ''])}
            type='button'
          >
            <span className='material-symbols-outlined'>add</span>
          </button>
        </Fragment>,
      );
    } else {
      choiceInputs.push(
        <Fragment key={i}>
          {inputElement}
          <div />
        </Fragment>,
      );
    }
  }

  return <div className={styles.pollChoices}>{choiceInputs}</div>;
};

export default PollInputs;
