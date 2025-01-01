import { useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import backendFetch from '../../helpers/backendFetch';
import headerPlaceholder from '../assets/header-placeholder.webp';
import styles from '../style/UpdateProfileForm.module.css';

function UpdateProfileForm({ userModal }) {
  const [newPfp, setNewPfp] = useState(null);
  const [newHeaderImage, setNewHeaderImage] = useState(null);
  const [errorArray, setErrorArray] = useState(null);

  const profileForm = useRef(null);
  const newPfpInput = useRef(null);
  const newHeaderImageInput = useRef(null);
  const [setError, currentUser, setCurrentUser] = useOutletContext();

  async function submitProfileChange(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('pfp', e.target[1].files[0]);
    formData.append('headerImage', e.target[3].files[0]);
    formData.append('displayName', e.target[4].value);
    formData.append('location', e.target[5].value);
    formData.append('website', e.target[6].value);
    formData.append('bio', e.target[7].value);

    const response = await backendFetch(setError, '/users', {
      method: 'PUT',
      body: formData,
    });
    
    if (response.expectedErrors) {
      setErrorArray(response.expectedErrors);
    } else {
      setCurrentUser(response.user);
      userModal.current.close();
    }
  }

  function handleFileInputChange(e, imageType) {
    const file = e.target.files[0];

    if (file) {
      if (imageType === 'pfp') {
        setNewPfp(file);
      } else {
        setNewHeaderImage(file);
      }
    }
  }

  return (
    <form
      className={styles.profileForm}
      ref={profileForm}
      onSubmit={(e) => submitProfileChange(e)}
    >
      <label htmlFor='pfp'>Profile Picture</label>
      <div className={styles.newImagePreview}>
        <label htmlFor='pfp'>
          <img
            className={styles.profilePagePfp}
            src={!newPfp ? currentUser.pfpUrl : URL.createObjectURL(newPfp)}
            alt=''
          />
        </label>
        <button
          type='button'
          className={`closeButton ${styles.pfpResetButton}`}
          onClick={() => {
            newPfpInput.current.value = '';
            setNewPfp(null);
          }}
        >
          <span className='material-symbols-outlined closeIcon'>close</span>
        </button>
        <input
          type='file'
          name='pfp'
          id='pfp'
          accept='image/*'
          ref={newPfpInput}
          onChange={(e) => handleFileInputChange(e, 'pfp')}
          hidden
        />
      </div>
      <label htmlFor='header'>Header</label>
      <div className={styles.newImagePreview}>
        <label htmlFor='header'>
          <img
            className={styles.headerPreview}
            src={
              newHeaderImage
                ? URL.createObjectURL(newHeaderImage)
                : currentUser.headerUrl || headerPlaceholder
            }
            alt=''
          />
        </label>
        <button
          type='button'
          className='closeButton'
          onClick={() => {
            newHeaderImageInput.current.value = '';
            setNewHeaderImage(null);
          }}
        >
          <span className='material-symbols-outlined closeIcon'>close</span>
        </button>
        <input
          type='file'
          name='header'
          id='header'
          accept='image/*'
          ref={newHeaderImageInput}
          onChange={(e) => handleFileInputChange(e, 'header')}
          hidden
        />
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
      <label htmlFor='location'>Location</label>
      <input
        type='text'
        name='location'
        id='location'
        maxLength={50}
        defaultValue={currentUser.location}
      />
      <label htmlFor='website'>Website</label>
      <input
        type='text'
        name='website'
        id='website'
        maxLength={50}
        defaultValue={currentUser.website}
      />
      {errorArray && (
        <div className={styles.error}>
          {errorArray.map((error, i) => (
            <span key={i}>{error.msg}</span>
          ))}
        </div>
      )}
      <label htmlFor='bio'>Bio</label>
      <textarea
        name='bio'
        id='bio'
        maxLength={200}
        defaultValue={currentUser.bio}
      ></textarea>
      {currentUser.username === 'Guest' ? (
        <button disabled>Cannot edit guest account</button>
      ) : (
        <button>Save Profile</button>
      )}
    </form>
  );
}

UpdateProfileForm.propTypes = {
  userModal: PropTypes.object,
};

export default UpdateProfileForm;
