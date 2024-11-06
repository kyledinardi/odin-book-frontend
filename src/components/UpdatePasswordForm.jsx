import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../style/UpdatePasswordForm.module.css';
import backendFetch from '../../ helpers/backendFetch';

function UpdatePasswordForm({ userModal }) {
  const [errorArray, setErrorArray] = useState(null);
  const [setError, currentUser] = useOutletContext();

  async function submitPasswordChange(e) {
    e.preventDefault();

    const response = await backendFetch(setError, '/users/password', {
      method: 'PUT',

      body: JSON.stringify({
        currentPassword: e.target[0].value,
        newPassword: e.target[1].value,
        newPasswordConfirmation: e.target[2].value,
      }),
    });

    e.target.reset();

    if (response.expectedErrors) {
      setErrorArray(response.expectedErrors);
    } else {
      userModal.current.close();
    }
  }

  return (
    <form
      className={styles.passwordForm}
      onSubmit={(e) => submitPasswordChange(e)}
    >
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
      {errorArray && (
        <ul className={styles.error}>
          {errorArray.map((error) => (
            <li key={error.msg}>{error.msg}</li>
          ))}
        </ul>
      )}
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
