const { body, validationResult } = require('express-validator');
const Users = require('../models/Users');
const Course = require('../models/Course');

const md5 = require('md5');
const Category = require('../models/Category');
const { getAllCourses } = require('./courseController');

exports.newRegister = async (req, res) => {
	try {
		req.body.userPass = md5(req.body.userPass);
		await Users.create(req.body);
		res.redirect('/login');
	} catch (error) {
		const errors = validationResult(req); // gönderilen validationresult'u yakalayıp errors'a atıyoruz
		// console.log(errors); // errors içinde nesneler bulunan bir dizi.
		// console.log('error length : ' + errors.array().length); // bu dizinin uzunluğunu öğrenebiliriz. array() constructor'ını kullanmamız gerekiyor.!
		for (let index = 0; index < errors.array().length; index++) {
			console.log(errors.array()[index].msg); // ilgili dizideki mesajı alıp önce konsole sonrada aşağıda flash mesajla template engine'e gönderiyoruz.
			req.flash('fail', `${errors.array()[index].msg}`);
		}
		res.status(400).redirect('/register');
	}
};

exports.loginUser = async (req, res) => {
	try {
		req.body.password = md5(req.body.password);
		const { email, password } = req.body;
		const receivedUser = await Users.findOne({ userMail: email });

		if (receivedUser) {
			if (receivedUser.userPass == password) {
				req.session.userID = receivedUser._id;
				console.log(
					'Succesfuly ID' + req.session.userID
				);
				res.status(200).redirect('/user/dashboard');
			} else {
				req.flash('fail', `Password is not correct!`);
				res.status(400).redirect('/login');
			}
		} else {
			req.flash('fail', `User could not find!`);
			res.status(400).redirect('/login');
		}
	} catch (error) {
		error;
	}
};

// Çıkış işlemi için
exports.logoutUser = async (req, res) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
};

// Dashboard'ta giriş yapılan kullanıcının bilgileri course'ları vs olacağı için auth altında yazdık.
exports.getDashboardPage = async (req, res) => {
	// Dasboard sayfasına giriş yapılan kullanıcının adını yazmak.
	const user = await Users.findOne({ _id: userIN }).populate('courses'); // userIN yerine req.session.userID'de yazabilirdik
	const course = await Course.find({ user: req.session.userID });
	const users = await Users.find({}); // All users
	const categories = await Category.find({});
	res.render('./dashboard.ejs', {
		page_name: 'dashboard',
		user: user,
		categories: categories,
		course: course,
		users: users,
	});
};

// Delete user için
exports.deleteUser = async (req, res) => {
	try {
		console.log('Deleting' + req.params._id);
		await Users.findByIdAndRemove(req.params._id);
		await Course.deleteMany({ user: req.params._id });
		res.status(200).redirect('/user/dashboard');
	} catch (error) {
		error;
		res.status(400).redirect('/user/dashboard');
	}
};
