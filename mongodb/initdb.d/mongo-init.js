db = db.getSiblingDB('dev');

db.createUser({
	user: 'the_king_in_the_north',
	pwd: 'winter_is_coming',
	roles: [
		{
			role: 'readWrite',
			db: 'dev'
		}
	]
});

db.createCollection('User');
