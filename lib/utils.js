import _ from 'lodash';
import logger from './logger';


function getRetries (name, value, defaultValue) {
  let retries = defaultValue;
  if (value) {
    retries = Math.round(value / 1000);
    if (_.isNaN(retries)) {
      logger.warn(`${name} timeout of ${value}ms specified, but unable to parse interval. Using default.`);
      retries = defaultValue;
    }
  }
  return retries;
}

export { getRetries };
