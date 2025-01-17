import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ErrorPage from './ErrorPage.jsx';
import backendFetch from '../../helpers/backendFetch';
import githubLogo from '../assets/github-mark.svg';
import styles from '../style/Login.module.css';

function Login() {
  const [unexpectedError, setUnexpectedError] = useState(null);
  const [theme, setTheme] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
    if (searchParams.has('token') && searchParams.has('userId')) {
      localStorage.setItem('token', searchParams.get('token'));
      localStorage.setItem('userId', searchParams.get('userId'));
      navigate('/');
    }

    if (searchParams.has('error')) {
      setErrorMessage(searchParams.get('error'));
    }
  }, [searchParams, navigate]);

  async function submitLogin(e) {
    e.preventDefault();

    const response = await backendFetch(setUnexpectedError, '/auth/local', {
      hasBearer: false,
      method: 'POST',

      body: JSON.stringify({
        username: e.target[0].value,
        password: e.target[1].value,
      }),
    });

    if (response.expectedError) {
      e.target.reset();
      setErrorMessage(response.expectedError.message);
    } else {
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id);
      navigate('/');
    }
  }

  return (
    <div className='themeWrapper' data-theme={theme}>
      {unexpectedError ? (
        <ErrorPage
          data-theme={theme}
          error={unexpectedError}
          setError={(err) => setUnexpectedError(err)}
        />
      ) : (
        <div className={styles.flexWrapper}>
          <h1>Log in to Odin-Book</h1>
          <div className={styles.loginForms}>
            {errorMessage !== '' && (
              <div className={styles.error}>{errorMessage}</div>
            )}
            <form className={styles.flexForm} onSubmit={(e) => submitLogin(e)}>
              <div>
                <label htmlFor='username'>Username</label>
                <input
                  type='text'
                  name='username'
                  id='username'
                  maxLength={50}
                  required
                />
              </div>
              <div>
                <label htmlFor='password'>Password</label>
                <input
                  type='password'
                  name='password'
                  id='password'
                  maxLength={50}
                  required
                />
              </div>
              <button>Log In</button>
            </form>
            <form onSubmit={(e) => submitLogin(e)}>
              <input type='hidden' name='username' value='Guest' />
              <input type='hidden' name='password' value='1' />
              <button>Log in as guest</button>
            </form>
            <a
              className={styles.logoButton}
              href={`${import.meta.env.VITE_BACKEND_URL}/auth/github`}
            >
              <span>Log in with GitHub</span>
              <span className={styles.logoContainer}>
                <img className={styles.logo} src={githubLogo} alt='' />
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
}

export default Login;
