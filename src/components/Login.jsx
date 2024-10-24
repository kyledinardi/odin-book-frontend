import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from '../style/Login.module.css';
import githubLogo from '../assets/github-mark.svg';

function Login() {
  const [errorMessage, setErrorMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/local`,

      {
        method: 'Post',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({
          username: e.target[0].value,
          password: e.target[1].value,
        }),
      },
    );

    const response = await responseStream.json();

    if (!response.user) {
      e.target.reset();
      setErrorMessage(response.message);
    } else {
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id);
      navigate('/');
    }
  }

  return (
    <div className={styles.flexWrapper}>
      <h1>Log in to FakeSocial</h1>
      <div className={styles.loginForms}>
        {errorMessage !== '' && (
          <div className={styles.error}>{errorMessage}</div>
        )}
        <form className={styles.flexForm} onSubmit={(e) => submitLogin(e)}>
          <div>
            <label htmlFor='username'>Username</label>
            <input type='text' name='username' id='username' required />
          </div>
          <div>
            <label htmlFor='password'>Password</label>
            <input type='password' name='password' id='password' required />
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
          href='http://localhost:3000/auth/github'
        >
          <span>Log in with GitHub</span>
          <img className={styles.logo} src={githubLogo} alt='' />
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
  );
}

export default Login;
