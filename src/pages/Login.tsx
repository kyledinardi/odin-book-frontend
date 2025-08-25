import { useEffect, useState } from 'react';

import { useMutation } from '@apollo/client';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import ErrorPage from './ErrorPage.tsx';
import githubLogo from '../assets/github-mark.svg';
import { LOCAL_LOGIN } from '../graphql/mutations.ts';
import styles from '../style/Login.module.css';
import { BACKEND_URL } from '../utils/config.ts';
import logError from '../utils/logError.ts';
import navigateTo from '../utils/navigateTo.ts';

import type { FormEvent } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [unexpectedError, setUnexpectedError] = useState<Error | null>(null);
  const [theme, setTheme] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [login, loginResult] = useMutation(LOCAL_LOGIN, {
    onError: (err) => {
      if (err.graphQLErrors[0].message === 'Incorrect username or password') {
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
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const error = searchParams.get('error');

    if (token && userId) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      navigateTo(navigate, '/').catch(logError);
    }

    if (error) {
      setErrorMessage(error);
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (loginResult.data) {
      const { token, user } = loginResult.data.localLogin;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      navigateTo(navigate, '/').catch(logError);
    }
  }, [loginResult, navigate]);

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    await login({ variables: { username, password } });
    setPassword('');
  };

  const submitGuest = async (e: FormEvent) => {
    e.preventDefault();
    await login({ variables: { username: 'Guest', password: '1' } });
  };

  return (
    <div className='themeWrapper' data-theme={theme}>
      {unexpectedError ? (
        <ErrorPage error={unexpectedError} />
      ) : (
        <div className={styles.flexWrapper}>
          <h1>Log in to Odin-Book</h1>
          <div className={styles.loginForms}>
            {errorMessage !== '' && (
              <div className={styles.error}>{errorMessage}</div>
            )}
            <form
              className={styles.flexForm}
              onSubmit={(e) => {
                submitLogin(e).catch(logError);
              }}
            >
              <div>
                <label htmlFor='username'>
                  Username
                  <input
                    required
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
              <button type='submit'>Log In</button>
            </form>
            <form
              onSubmit={(e) => {
                submitGuest(e).catch(logError);
              }}
            >
              <button type='submit'>Log in as guest</button>
            </form>
            <a
              className={styles.logoButton}
              href={`${BACKEND_URL}/auth/github`}
            >
              <span>Log in with GitHub</span>
              <span className={styles.logoContainer}>
                <img alt='' className={styles.logo} src={githubLogo} />
              </span>
            </a>
            <div>
              <p>
                Don&apos;t have an account?{' '}
                <Link className={styles.signUpLink} to='/sign-up'>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
