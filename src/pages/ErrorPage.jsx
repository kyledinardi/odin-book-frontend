import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from '../style/ErrorPage.module.css';

function ErrorPage({ error }) {
  const [theme, setTheme] = useState('');
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

  return (
    <div className='themeWrapper' data-theme={theme}>
      <div className={styles.error}>
        <h1>{error ? error.message : '404: Page not found'}</h1>
        <div>
          <button onClick={() => navigate('/')}>Go Home</button>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    </div>
  );
}

ErrorPage.propTypes = { error: PropTypes.object, setError: PropTypes.func };
export default ErrorPage;
