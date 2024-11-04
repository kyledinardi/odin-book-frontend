import { useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../style/UpdateUser.module.css';
import backendFetch from '../../ helpers/backendFetch';

function UpdateUser({ userModal, modalType, user }) {
  const [newPfpSrc, setNewPfpSrc] = useState('');
  const [errorArray, setErrorArray] = useState(null);
  const profileForm = useRef(null);
  const passwordForm = useRef(null);
  const newPfpInput = useRef(null);
  const [setError, currentUser, setCurrentUser] = useOutletContext();

  async function submitProfileChange(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('pfp', e.target[0].files[0]);
    formData.append('displayName', e.target[2].value);
    formData.append('bio', e.target[3].value);

    const response = await backendFetch(setError, '/users/profile', {
      method: 'PUT',
      body: formData,
    });

    const newCurrentUser = {
      ...currentUser,
      pfpUrl: response.user.pfpUrl,
      displayName: response.user.displayName,
      bio: response.user.bio,
    };

    setCurrentUser(newCurrentUser);
    e.target.reset();
    userModal.current.close();
  }

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
      setErrorArray(null);
      userModal.current.close();
    }
  }

  function handleFileInputChange(e) {
    const file = e.target.files[0];

    if (file) {
      setNewPfpSrc(file);
    }
  }

  return (
    <dialog
      className={styles.modal}
      ref={userModal}
      onClose={() =>
        profileForm.current
          ? profileForm.current.reset()
          : passwordForm.current.reset()
      }
    >
      <button
        className={styles.closeModalButton}
        onClick={() => {
          userModal.current.close();
          setNewPfpSrc('');
          setErrorArray(null);
        }}
      >
        <span className='material-symbols-outlined closeButton'>close</span>
      </button>
      {modalType === 'profile' ? (
        <form
          className={styles.profileForm}
          ref={profileForm}
          onSubmit={(e) => submitProfileChange(e)}
        >
          <input
            type='file'
            name='pfp'
            id='pfp'
            accept='image/*'
            ref={newPfpInput}
            onChange={(e) => handleFileInputChange(e)}
            hidden
          />
          <label htmlFor='pfp'>Profile Picture</label>
          <div className={styles.newPfpPreview}>
            <label htmlFor='pfp'>
              <img
                className={styles.profilePagePfp}
                src={
                  newPfpSrc === ''
                    ? user.pfpUrl
                    : URL.createObjectURL(newPfpSrc)
                }
                alt=''
              />
            </label>
            <button
              type='button'
              className={styles.cancelNewPfp}
              onClick={() => {
                newPfpInput.current.value = '';
                setNewPfpSrc('');
              }}
            >
              <span className='material-symbols-outlined closeButton'>
                close
              </span>
            </button>
          </div>
          <label htmlFor='displayName'>Display Name</label>
          <input
            type='text'
            name='displayName'
            id='displayName'
            maxLength={50}
            defaultValue={currentUser.displayName}
            required
          />
          <label htmlFor='bio'>Bio</label>
          <textarea
            name='bio'
            id='bio'
            maxLength={200}
            defaultValue={currentUser.bio}
          ></textarea>
          {user.username === 'Guest' ? (
            <button disabled>Cannot edit guest account</button>
          ) : (
            <button>Save Profile</button>
          )}
        </form>
      ) : (
        <form
          className={styles.passwordForm}
          ref={passwordForm}
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
            <label htmlFor='newPasswordConfirmation'>
              Confirm New Password
            </label>
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
          {user.username === 'Guest' ? (
            <button className={styles.submitPassword} disabled>
              Cannot change guest password
            </button>
          ) : (
            <button className={styles.submitPassword}>Save Profile</button>
          )}
        </form>
      )}
    </dialog>
  );
}

UpdateUser.propTypes = {
  userModal: PropTypes.object,
  modalType: PropTypes.string,
  user: PropTypes.object,
};

export default UpdateUser;
