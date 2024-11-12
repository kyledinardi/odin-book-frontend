export default function formatDate(date) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const current = new Date();
  const timestamp = new Date(date);
  const elapsed = current.getTime() - timestamp.getTime();

  if (elapsed < 1) {
    return '0s';
  }

  if (elapsed < msPerMinute) {
    return `${Math.round(elapsed / 1000)}s`;
  }

  if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)}m`;
  }

  if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)}h`;
  }

  if (timestamp.getFullYear() === current.getFullYear()) {
    return Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(timestamp);
  }

  return Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(timestamp);
}
