import type { NavigateFunction } from 'react-router-dom';

const navigateTo = async (
  navigate: NavigateFunction,
  pathOrDelta: string | number,
) => {
  if (typeof pathOrDelta === 'number') {
    await navigate(pathOrDelta);
  } else {
    await navigate(pathOrDelta);
  }
};

export default navigateTo;
