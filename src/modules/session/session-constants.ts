const oneSecond = 1000;
const oneMinute = oneSecond * 60;
const oneHour = oneMinute * 60;
const oneDay = oneHour * 24;

const COOKIE_ACCESS_TOKEN_MAX_AGE = oneHour;
const COOKIE_REFRESH_TOKEN_MAX_AGE = oneDay * 7;

const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export {
	COOKIE_ACCESS_TOKEN_MAX_AGE,
	COOKIE_REFRESH_TOKEN_MAX_AGE,
	ACCESS_TOKEN_EXPIRES_IN,
	REFRESH_TOKEN_EXPIRES_IN
};
