const formatDate = {
  short(dateString: string) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const current = new Date();
    const timestamp = new Date(Number(dateString));

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
  },

  long(dateString: string) {
    const timestamp = new Date(Number(dateString));

    const time = Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(
      timestamp,
    );

    const date = Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
      timestamp,
    );

    return `${time}, ${date}`;
  },
};

export default formatDate;
