import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import styles from '../style/Login.module.css';

function Login() {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  async function submitLogin(e) {
    e.preventDefault();

    const responseStream = await fetch('http://localhost:3000/auth/local', {
      method: 'Post',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({
        username: e.target[0].value,
        password: e.target[1].value,
      }),
    });

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
        <form onSubmit={(e) => submitLogin(e)}>
          <input type='hidden' name='username' value='Guest' />
          <input type='hidden' name='password' value='1' />
          <button>Log in as guest</button>
        </form>
        <form className={styles.flexForm} onSubmit={(e) => submitLogin(e)}>
          <div>
            <label htmlFor='username'>Username</label>
            <input type='text' name='username' id='username' required />
          </div>
          <div>
            <label htmlFor='password'>Password</label>
            <input type='password' name='password' id='password' required />
          </div>
          {errorMessage !== '' && (
            <div className={styles.error}>{errorMessage}</div>
          )}
          <button>Log In</button>
        </form>
        <div>
          <p>
            Don&apos;t have an account? <Link to='/sign-up'>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
