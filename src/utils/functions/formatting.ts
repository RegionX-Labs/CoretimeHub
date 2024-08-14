import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import moment from 'moment';

TimeAgo.addDefaultLocale(en);

export const getTimeStringShort = (timestamp: number | Date): string => {
  return moment(timestamp).format('MMM DD HH:mm');
};

export const getTimeStringLong = (timestamp: number | Date): string => {
  return moment(timestamp).format('MMM DD YYYY HH:mm');
};

export const getUTCTimeString = (timestamp: number | Date): string => {
  return moment.utc(timestamp).format('MMM DD YYYY HH:mm:ss (+UTC)');
};

export const getRelativeTimeString = (timestamp: number | Date): string => {
  const timeAgo = new TimeAgo('en-US');
  return timeAgo.format(timestamp, {
    steps: [
      { formatAs: 'second' },
      { formatAs: 'minute', minTime: 60 },
      { formatAs: 'hour', minTime: 60 * 60 },
      { formatAs: 'day', minTime: 24 * 60 * 60 },
    ],
    labels: 'long',
  });
};
