import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import styles from '../style/ErrorPage.module.css';
import logError from '../utils/logError.ts';
import navigateTo from '../utils/navigateTo.ts';

const ErrorPage = ({ error }: { error: Error }) => {
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
        <h1>{error.message}</h1>
        <div>
          <button
            type='button'
            onClick={() => {
              navigateTo(navigate, '/').catch(logError);
            }}
          >
            Go Home
          </button>
          <button
            type='button'
            onClick={() => {
              navigateTo(navigate, -1).catch(logError);
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
