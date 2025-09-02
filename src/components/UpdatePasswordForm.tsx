import { useState } from 'react';

import { useMutation } from '@apollo/client';
import { useOutletContext } from 'react-router-dom';

import { UPDATE_PASSWORD } from '../graphql/mutations.ts';
import styles from '../style/UpdatePasswordForm.module.css';
import logError from '../utils/logError.ts';

import type { FormEvent, RefObject } from 'react';

import type { AppContext } from '../types.ts';

const UpdatePasswordForm = ({
  userModal,
}: {
  userModal: RefObject<HTMLDialogElement | null>;
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUser] = useOutletContext<AppContext>();

  const [updatePassword] = useMutation(UPDATE_PASSWORD, {
    onError: (err) => {
      if (err.graphQLErrors[0].extensions?.code === 'BAD_USER_INPUT') {
        setErrorMessage(err.graphQLErrors[0].message);
      } else {
        logError(err);
      }
    },

    onCompleted: () => userModal.current?.close(),
  });

  const submitPasswordChange = async (e: FormEvent) => {
    e.preventDefault();

    await updatePassword({
      variables: { currentPassword, newPassword, newPasswordConfirmation },
    });

    if (e.target instanceof HTMLFormElement) {
      e.target.reset();
    } else {
      throw new Error('No form');
    }
  };

  return (
    <form
      className={styles.passwordForm}
      onSubmit={(e) => {
        submitPasswordChange(e).catch(logError);
      }}
    >
      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
      <div className={styles.passwordFields}>
        <label htmlFor='currentPassword'>
          Current Password
          <input
            required
            id='currentPassword'
            maxLength={50}
            name='currentPassword'
            onChange={(e) => setCurrentPassword(e.target.value)}
            type='password'
            value={currentPassword}
          />
        </label>
        <label htmlFor='newPassword'>
          New Password
          <input
            required
            id='newPassword'
            maxLength={50}
            name='newPassword'
            onChange={(e) => setNewPassword(e.target.value)}
            type='password'
            value={newPassword}
          />
        </label>
        <label htmlFor='newPasswordConfirmation'>
          Confirm New Password
          <input
            required
            id='newPasswordConfirmation'
            maxLength={50}
            name='newPasswordConfirmation'
            onChange={(e) => setNewPasswordConfirmation(e.target.value)}
            type='password'
            value={newPasswordConfirmation}
          />
        </label>
      </div>
      {currentUser.username === 'Guest' ? (
        <button disabled className={styles.submitPassword} type='button'>
          Cannot change guest password
        </button>
      ) : (
        <button className={styles.submitPassword} type='submit'>
          Save Profile
        </button>
      )}
    </form>
  );
};

export default UpdatePasswordForm;
