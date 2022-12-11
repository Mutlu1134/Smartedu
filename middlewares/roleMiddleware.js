module.exports = (roles) => {
	// roles route sayfasında gönderilen izin verilen rollerdir
	return (req, res, next) => {
		// burda req.body.role ile register sayfasında girilen student/teacher name'i yakalanıyor
		console.log(
			'user in : ' +
				userIN +
				'  req.sesssion.userID  ' +
				req.session.userID +
				'  req.sesssion.role  ' +
				req.session.role +
				'   req.body.role  : ' +
				req.body.role
		);
		const userRole = req.body.role; // req.body.role -> dashboard'ta create course'a post yaparken name=role olan bir değişken post ediliyor.
		if (roles.includes(userRole)) {
			next();
		} else {
			return res.status(401).send('YOU CANT DO IT');
		}
	};
};
