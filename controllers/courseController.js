// const mongoose = require('mongoose');
// const express = require('express');

const Course = require('../models/Course');
const Users = require('../models/Users');
const Category = require('../models/Category');

// const app = express();
// app.use(express.urlencoded({ extended: true })); // url'deki datayı okumaya yarar POST için gerekli
// app.use(express.json()); // url'deki datayı jsoon formatına çevirmemizi sağlar POST için gerekli

exports.createCourse = async (req, res) => {
	// Kurs oluşturma sayfası hazır olmadığı için req.body'den alamıyoruz.
	// Bunun yerine simülasyonunu yapacağız.

	// const course = req.body;
	// Normalde aşağıdaki gibi olması lazım ama simülasyon olduğu için bir alttaki şeklinde json dosyası yapacağız.
	// res.status(200).render("./xxxx.ejs", {
	//     course : course
	// })
	// Aşağıdaki gibi yalnızca bir json dosyası olarak yazdıracağız.

	// Burdaki hatayı yakalayabilmek için try-catch bloğu
	try {
		// const course = await Course.create(req.body); // bunun yerine aşağıdaki şekilde de yapılabilir.
		const course = await Course.create({
			courseName: req.body.courseName, // courseName'i formdan gelen courseName'den al
			courseDescription: req.body.courseDescription,
			category: req.body.category,
			user: req.session.userID, // user'ı sessionDan gelen userID'den al
		});
		req.flash(
			'success',
			`${course.courseName} has been created succesfully.`
		);
		res.status(200).redirect('/courses');
	} catch (error) {
		req.flash(
			'fail',
			`${course.courseName} has not been created !`
		);

		res.status(401).redirect('/courses');
	}
};

exports.getAllCourses = async (req, res) => {
	try {
		const categorySlug = req.query.category; // Category slug'ı al
		// slug'a göre seçilen category'i bul.
		const clickedCategory = await Category.findOne({
			slug: categorySlug,
		});

		//Search butonuna birşeyler yazıldıysa query üzerinden işlem yapıcaz.
		const query = req.query.search;

		// Eğer bir query varsa (categorySlug) filtreye bu slug'a karşılık gelen category id'sini yaz
		if (categorySlug) {
			filter = { category: clickedCategory._id };
		} else if (query) {
			filter = {
				courseName: {
					$regex: '.*' + query + '.*', // Yazılan değerin sağında solunda ne olduğu farketmez anlamına geliyor.
					$options: 'i', // ignore case-insensitive, büyük küçük ayrımı gözetmiyor
				},
			};
		} else {
			// query yoksa filtre boş olsun
			filter = {};
			// Aşağıdakine gerek yok ama bir yöntem olabilir.
			// filter.courseName = '';
			// filter.category = null;
		}
		// Filtreyi aşağıdaki find'a yazdır.
		const course = await Course.find(
			filter
			//aşağıdakine gerek yok ama bir yöntem olabilir.
			// 	{
			// 	// $or: [
			// 	// 	{ courseName: filter.courseName },
			// 	// 	{ category: filter.category },
			// 	// ],
			// }
		)
			.sort('-createdDate')
			.populate('user');
		const category = await Category.find({});

		res.status(200).render('./courses.ejs', {
			course: course,
			category: category,
			page_name: 'courses',
		});
	} catch (error) {
		res.status(400).json({
			error,
		});
	}
};

exports.getSingleCourse = async (req, res) => {
	const course = await Course.findOne({ slug: req.params.slug }).populate(
		'user'
	);
	const user = await Users.findById(req.session.userID);
	const category = await Category.find({});

	res.status(200).render('./coursesingle.ejs', {
		page_name: 'courses',
		course: course,
		user: user,
		category: category,
	});
};

// exports.getCoursesSingle = async (req, res) => {
// 	const course = await Course.findById(req.params.id);
// 	res.status(200).render('./coursesingle.ejs', {
// 		course: course,
// 		page_name: 'courses',
// 	});
// };

exports.enrollCourse = async (req, res) => {
	try {
		const user = await Users.findOne({ _id: req.session.userID });
		await user.courses.push({ _id: req.body.courseID });
		await user.save();
		res.status(200).redirect('/user/dashboard');
	} catch (error) {
		error;
	}
};

exports.relaseCourse = async (req, res) => {
	try {
		const user = await Users.findOne({ _id: req.session.userID });
		await user.courses.pull({ _id: req.body.courseID });
		await user.save();
		res.status(200).redirect('/user/dashboard');
	} catch (error) {
		error;
	}
};

exports.deleteCourse = async (req, res) => {
	try {
		const course = await Course.findOneAndRemove({
			slug: req.params.slug,
		});
		req.flash(
			'success',
			`${course.courseName} was deleted succesfully`
		);
		res.status(200).redirect('/courses');
	} catch (error) {
		error;
	}
};
exports.updateCourse = async (req, res) => {
	try {
		// Aşağıdaki gibi kısaca yapabilir ya da bir sonraki gibi de yapabiliriz.
		// await Course.findOneAndUpdate(
		// 	{ slug: req.params.slug },
		// 	req.body
		// );

		// Yukarıdaki gibi kısa yoldanda yapabiliriz ya da şu şekilde de yapabiliriz.
		const course = await Course.findOne({ slug: req.params.slug });
		course.courseName = req.body.courseName;
		course.courseDescription = req.body.courseDescription;
		course.category = req.body.category;
		course.save();
		res.status(200).redirect('/courses');
	} catch (error) {
		error;
	}
};
