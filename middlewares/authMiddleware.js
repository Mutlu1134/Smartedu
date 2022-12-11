const Users = require('../models/Users');

module.exports = async (req, res, next) => {
	try {
		await Users.findOne(
			{ _id: req.session.userID },
			(err, user) => {
				if (err || !user) {
					return res.redirect('/login');
				}
				next();
			}
		);
	} catch (error) {
		error;
	}

	// aşağıdaki kodda çalışıyor ama yukarıdaki daha iyi olabilir diye onuda yazıyorum.
	// if (!req.session.userID) {
	// 	res.redirect('/login');
	// }
	// next();
};
