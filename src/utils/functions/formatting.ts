import moment from 'moment';

export const getTimeStringShort = (timestamp: number | Date): string => {
  return moment(timestamp).format('MMM DD HH:mm');
};

export const getTimeStringLong = (timestamp: number | Date): string => {
  return moment(timestamp).format('MMM DD YYYY HH:mm');
};

export const getUTCTimeString = (timestamp: number | Date): string => {
  return moment.utc(timestamp).format('MMM DD YYYY HH:mm:ss (+UTC)');
};
