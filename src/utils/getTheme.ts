import { Theme } from 'gif-picker-react';

const getTheme = (): Theme => {
  const theme = localStorage.getItem('theme');

  switch (theme) {
    case 'dark':
      return Theme.DARK;

    case 'light':
      return Theme.LIGHT;

    default:
      return Theme.AUTO;
  }
};

export default getTheme;
