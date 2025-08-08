import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import PropTypes from 'prop-types';
import { UPDATE_PASSWORD } from '../graphql/mutations';
import logError from '../utils/logError';
import styles from '../style/UpdatePasswordForm.module.css';

function UpdatePasswordForm({ userModal }) {
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentUser] = useOutletContext();

  const [updatePassword] = useMutation(UPDATE_PASSWORD, {
    onError: (err) => {
      if (err.graphQLErrors[0].extensions.code === 'BAD_USER_INPUT') {
        setErrorMessage(err.graphQLErrors[0].message);
      } else {
        logError(err);
      }
    },

    onCompleted: () => userModal.current.close(),
  });

  function submitPasswordChange(e) {
    e.preventDefault();

    updatePassword({
      variables: {
        currentPassword: e.target[0].value,
        newPassword: e.target[1].value,
        newPasswordConfirmation: e.target[2].value,
      },
    });

    e.target.reset();
  }

  return (
    <form
      className={styles.passwordForm}
      onSubmit={(e) => submitPasswordChange(e)}
    >
      {errorMessage && (
        <p className={styles.error}>{errorMessage}</p>
      )}
      <div className={styles.passwordFields}>
        <label htmlFor='currentPassword'>Current Password</label>
        <input
          type='password'
          name='currentPassword'
          id='currentPassword'
          maxLength={50}
          required
        />
        <label htmlFor='newPassword'>New Password</label>
        <input
          type='password'
          name='newPassword'
          id='newPassword'
          maxLength={50}
          required
        />
        <label htmlFor='newPasswordConfirmation'>Confirm New Password</label>
        <input
          type='password'
          name='newPasswordConfirmation'
          id='newPasswordConfirmation'
          maxLength={50}
          required
        />
      </div>
      {currentUser.username === 'Guest' ? (
        <button className={styles.submitPassword} disabled>
          Cannot change guest password
        </button>
      ) : (
        <button className={styles.submitPassword}>Save Profile</button>
      )}
    </form>
  );
}

UpdatePasswordForm.propTypes = {
  userModal: PropTypes.object,
};

export default UpdatePasswordForm;
