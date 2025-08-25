import { useEffect, useState } from 'react';

import { useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';

import ErrorPage from './ErrorPage.tsx';
import { CREATE_USER } from '../graphql/mutations.ts';
import styles from '../style/Login.module.css';
import logError from '../utils/logError.ts';
import navigateTo from '../utils/navigateTo.ts';

import type { FormEvent } from 'react';

const SignUp = () => {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [unexpectedError, setUnexpectedError] = useState<Error | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [theme, setTheme] = useState('');
  const navigate = useNavigate();

  const [createUser, createUserResult] = useMutation(CREATE_USER, {
    onError: (err) => {
      if (err.graphQLErrors[0].extensions?.code === 'BAD_USER_INPUT') {
        setErrorMessage(err.graphQLErrors[0].message);
      } else {
        setUnexpectedError(err);
      }
    },
  });

  useEffect(() => {
    let themeName = localStorage.getItem('theme');

    if (!themeName) {
      const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
      themeName = isDark ? 'dark' : 'light';
      localStorage.setItem('theme', themeName);
    }

    setTheme(themeName);
  }, []);

  useEffect(() => {
    if (createUserResult.data) {
      const { token, user } = createUserResult.data.createUser;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      navigateTo(navigate, '/').catch(logError);
    }
  }, [createUserResult.data, navigate]);

  const submitSignUp = async (e: FormEvent) => {
    e.preventDefault();

    await createUser({
      variables: { displayName, username, password, passwordConfirmation },
    });

    setPassword('');
    setPasswordConfirmation('');
  };

  return (
    <div className='themeWrapper' data-theme={theme}>
      {unexpectedError ? (
        <ErrorPage error={unexpectedError} />
      ) : (
        <div className={styles.flexWrapper}>
          <div>
            <Link to='/login'>
              <span
                className={`material-symbols-outlined ${styles.backButton}`}
              >
                arrow_back
              </span>
            </Link>
            <h1>Sign up for Odin-Book</h1>
          </div>
          <div className={styles.loginForms}>
            {errorMessage !== '' && (
              <div className={styles.error}>
                <span>{errorMessage}</span>
              </div>
            )}
            <form
              className={styles.flexForm}
              onSubmit={(e) => {
                submitSignUp(e).catch(logError);
              }}
            >
              <div>
                <label htmlFor='displayName'>
                  Display Name (optional)
                  <input
                    id='displayName'
                    maxLength={50}
                    name='displayName'
                    onChange={(e) => setDisplayName(e.target.value)}
                    type='text'
                    value={displayName}
                  />
                </label>
              </div>
              <div>
                <label htmlFor='username'>
                  Username
                  <input
                    required
                    id='username'
                    maxLength={50}
                    name='username'
                    onChange={(e) => setUsername(e.target.value)}
                    type='text'
                    value={username}
                  />
                </label>
              </div>
              <div>
                <label htmlFor='password'>
                  Password
                  <input
                    required
                    id='password'
                    maxLength={50}
                    name='password'
                    onChange={(e) => setPassword(e.target.value)}
                    type='password'
                    value={password}
                  />
                </label>
              </div>
              <div>
                <label htmlFor='passwordConfirmation'>
                  Confirm Password
                  <input
                    required
                    id='passwordConfirmation'
                    maxLength={50}
                    name='passwordConfirmation'
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    type='password'
                    value={passwordConfirmation}
                  />
                </label>
              </div>
              <button type='submit'>Sign Up</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
