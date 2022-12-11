const Course = require('../models/Course');
const User = require('../models/Users');

const nodemailer = require('nodemailer'); // Mail işlemi için

exports.getIndexPage = async (req, res) => {
	// res.sendFile(path.resolve('./view/index.html')); // index.html dosyasını göndermek
	// console.log(userIN); // Giriş yapılan user id'sini console'a yaz
	lastTwoCourse = await Course.find().sort('-createdDate').limit(2);
	totalStudents = await User.countDocuments({ role: 'student' });
	totalTeacher = await User.countDocuments({ role: 'teacher' });
	totalCourses = await Course.countDocuments();

	res.status(200).render('./index.ejs', {
		page_name: 'index',
		lastTwoCourse: lastTwoCourse,
		totalStudents: totalStudents,
		totalTeacher,
		totalCourses,
	});
};

exports.getAboutPage = async (req, res) => {
	res.render('./about.ejs', {
		page_name: 'about',
	});
};

exports.getCoursesPage = async (req, res) => {
	res.render('./courses.ejs', {
		page_name: 'courses',
	});
};

exports.getContactPage = async (req, res) => {
	res.render('./contact.ejs', {
		page_name: 'contact',
	});
};

exports.getRegisterPage = async (req, res) => {
	res.render('./register.ejs', {
		page_name: 'register',
	});
};

exports.getLoginPage = async (req, res) => {
	res.render('./login.ejs', {
		page_name: 'login',
	});
};

exports.sendMail = async (req, res) => {
	try {
		const messageHTML = `
	<h1>Message Detail</h1>
	<li>Name : ${req.body.name}</li>
	<li>Mail : ${req.body.email}</li>
	<h1>Message</h1>
	<p>${req.body.message} </p>
	`;
		// Generate test SMTP service account from ethereal.email
		// Only needed if you don't have a real mail account for testing
		let testAccount = await nodemailer.createTestAccount();

		// create reusable transporter object using the default SMTP transport
		let transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 465,
			secure: true, // true for 465, false for other ports
			auth: {
				user: 'test@gmailcom', // generated ethereal user
				pass: 'gmailpass', // generated ethereal password
			},
		});

		// send mail with defined transport object
		let info = await transporter.sendMail({
			from: '"Fred Foo 👻" <foo@example.com>', // sender address
			to: 'bar@example.com, baz@example.com', // list of receivers
			subject: 'Hello ✔', // Subject line
			text: 'Hello world?', // plain text body
			html: '<b>Hello world?</b>', // html body
		});

		console.log('Message sent: %s', info.messageId);
		// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

		// Preview only available when sending through an Ethereal account
		console.log(
			'Preview URL: %s',
			nodemailer.getTestMessageUrl(info)
		);
		// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

		req.flash('success', 'We received your message succesfuly');
		res.status(200).redirect('/contact');
	} catch (error) {
		error;

		req.flash('fail', 'We didnt received your message succesfuly');

		res.status(200).redirect('/contact');
	}
};
