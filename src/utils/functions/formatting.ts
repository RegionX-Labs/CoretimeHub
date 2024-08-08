import moment from 'moment';

export const getTimeStringShort = (timestamp: number): string => {
  return moment(timestamp).format('MMM DD HH:mm');
};

export const getTimeStringLong = (timestamp: number): string => {
  return moment(timestamp).format('MMM DD YYYY HH:mm');
};
