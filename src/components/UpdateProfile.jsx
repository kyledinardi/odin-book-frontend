import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../style/UpdateProfile.module.css';

function UpdateProfile({ modalRef, user, currentUser, setCurrentUser }) {
  const [newPfpSrc, setNewPfpSrc] = useState('');
  const newPfpInput = useRef(null);

  async function submitProfile(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('pfp', e.target[0].files[0]);
    formData.append('displayName', e.target[2].value);
    formData.append('bio', e.target[3].value);

    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/profile`,

      {
        method: 'PUT',
        body: formData,

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    const response = await responseStream.json();
    e.target.reset();
    modalRef.current.close();

    const newCurrentUser = {
      ...currentUser,
      pfpUrl: response.user.pfpUrl,
      displayName: response.user.displayName,
      bio: response.user.bio,
    };

    setCurrentUser(newCurrentUser);
  }

  function handleFileInputChange(e) {
    const file = e.target.files[0];

    if (file) {
      setNewPfpSrc(file);
    }
  }

  return (
    <dialog className={styles.modal} ref={modalRef}>
      <button
        className={styles.closeModalButton}
        onClick={() => modalRef.current.close()}
      >
        <span className='material-symbols-outlined closeButton'>close</span>
      </button>
      <form onSubmit={(e) => submitProfile(e)}>
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
                newPfpSrc === '' ? user.pfpUrl : URL.createObjectURL(newPfpSrc)
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
            <span className='material-symbols-outlined closeButton'>close</span>
          </button>
        </div>
        <label htmlFor='displayName'>Display Name</label>
        <input
          type='text'
          name='displayName'
          id='displayName'
          defaultValue={currentUser.displayName}
        />
        <label htmlFor='bio'>Bio</label>
        <textarea
          name='bio'
          id='bio'
          cols='30'
          rows='10'
          defaultValue={currentUser.bio}
        ></textarea>
        <button className={styles.saveProfileButton}>Save Profile</button>
      </form>
    </dialog>
  );
}

UpdateProfile.propTypes = {
  modalRef: PropTypes.object,
  user: PropTypes.object,
  currentUser: PropTypes.object,
  setCurrentUser: PropTypes.func,
};

export default UpdateProfile;
