module.exports = async (req, res, next) => {
	try {
		if (req.session.userID) {
			return res.redirect('/');
		}
	} catch (error) {
		error;
	}
	next();
};
