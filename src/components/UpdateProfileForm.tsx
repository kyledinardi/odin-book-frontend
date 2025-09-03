import { useRef, useState } from 'react';

import { useMutation } from '@apollo/client';
import { useOutletContext } from 'react-router-dom';

import headerPlaceholder from '../assets/header-placeholder.webp';
import { UPDATE_PROFILE } from '../graphql/mutations.ts';
import styles from '../style/UpdateProfileForm.module.css';
import logError from '../utils/logError.ts';

import type { ChangeEvent, FormEvent, RefObject } from 'react';

import type { AppContext } from '../types.ts';

const UpdateProfileForm = ({
  userModal,
}: {
  userModal: RefObject<HTMLDialogElement | null>;
}) => {
  const [newPfp, setNewPfp] = useState<File | null>(null);
  const [newHeaderImage, setNewHeaderImage] = useState<File | null>(null);

  const profileForm = useRef<HTMLFormElement>(null);
  const newPfpInput = useRef<HTMLInputElement | null>(null);
  const newHeaderImageInput = useRef<HTMLInputElement | null>(null);
  const [currentUser, setCurrentUser] = useOutletContext<AppContext>();

  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [location, setLocation] = useState(currentUser.location || '');
  const [website, setWebsite] = useState(currentUser.website || '');
  const [bio, setBio] = useState(currentUser.bio || '');

  const [updateProfile] = useMutation(UPDATE_PROFILE, {
    onError: logError,

    onCompleted: () => {
      setCurrentUser();
      userModal.current?.close();
    },
  });

  const submitProfileChange = async (e: FormEvent) => {
    e.preventDefault();

    await updateProfile({
      variables: {
        pfp: newPfp,
        headerImage: newHeaderImage,
        displayName,
        location,
        website,
        bio,
      },
    });

    if (e.target instanceof HTMLFormElement) {
      e.target.reset();
    } else {
      throw new Error('No form');
    }
  };

  const handleFileInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    imageType: string,
  ) => {
    if (!e.target.files) {
      throw new Error('No files');
    }

    const file = e.target.files[0];

    if (file) {
      if (imageType === 'pfp') {
        setNewPfp(file);
      } else {
        setNewHeaderImage(file);
      }
    }
  };

  const cancelNewPfp = () => {
    if (!newPfpInput.current) {
      throw new Error('No file input');
    }

    newPfpInput.current.value = '';
    setNewPfp(null);
  };

  const cancelNewHeaderImage = () => {
    if (!newHeaderImageInput.current) {
      throw new Error('No file input');
    }

    newHeaderImageInput.current.value = '';
    setNewHeaderImage(null);
  };

  return (
    <form
      ref={profileForm}
      className={styles.profileForm}
      onSubmit={(e) => {
        submitProfileChange(e).catch(logError);
      }}
    >
      <label className={styles.imageInput} htmlFor='pfp'>
        <div>Profile Picture</div>
        <div className={styles.newImagePreview}>
          <img
            alt=''
            className={styles.profilePagePfp}
            src={!newPfp ? currentUser.pfpUrl : URL.createObjectURL(newPfp)}
          />{' '}
          <button
            className={`closeButton ${styles.pfpResetButton}`}
            onClick={cancelNewPfp}
            type='button'
          >
            <span className='material-symbols-outlined closeIcon'>close</span>
          </button>
        </div>
        <input
          ref={newPfpInput}
          hidden
          accept='image/*'
          id='pfp'
          name='pfp'
          onChange={(e) => handleFileInputChange(e, 'pfp')}
          type='file'
        />
      </label>
      <label className={styles.imageInput} htmlFor='header'>
        <div>Header Image</div>
        <div className={styles.newImagePreview}>
          <img
            alt=''
            className={styles.headerPreview}
            src={
              newHeaderImage
                ? URL.createObjectURL(newHeaderImage)
                : currentUser.headerUrl || headerPlaceholder
            }
          />
          <button
            className='closeButton'
            onClick={cancelNewHeaderImage}
            type='button'
          >
            <span className='material-symbols-outlined closeIcon'>close</span>
          </button>
        </div>
        <input
          ref={newHeaderImageInput}
          hidden
          accept='image/*'
          id='header'
          name='header'
          onChange={(e) => handleFileInputChange(e, 'header')}
          type='file'
        />
      </label>
      <label htmlFor='displayName'>
        Display Name
        <input
          required
          id='displayName'
          maxLength={50}
          name='displayName'
          onChange={(e) => setDisplayName(e.target.value)}
          type='text'
          value={displayName}
        />
      </label>
      <label htmlFor='location'>
        Location
        <input
          id='location'
          maxLength={50}
          name='location'
          onChange={(e) => setLocation(e.target.value)}
          type='text'
          value={location}
        />
      </label>
      <label htmlFor='website'>
        Website
        <input
          id='website'
          maxLength={50}
          name='website'
          onChange={(e) => setWebsite(e.target.value)}
          type='text'
          value={website}
        />
      </label>
      <label htmlFor='bio'>
        Bio
        <textarea
          id='bio'
          maxLength={200}
          name='bio'
          onChange={(e) => setBio(e.target.value)}
          value={bio}
        />
      </label>
      {currentUser.username === 'Guest' ? (
        <button disabled type='button'>
          Cannot edit guest account
        </button>
      ) : (
        <button type='submit'>Save Profile</button>
      )}
    </form>
  );
};

export default UpdateProfileForm;
