const Category = require('../models/Category');
const mongoose = require('mongoose');
const express = require('express');

// const app = express();
// app.use(express.urlencoded({ extended: true })); // url'deki datayı okumaya yarar POST için gerekli
// app.use(express.json()); // url'deki datayı jsoon formatına çevirmemizi sağlar POST için gerekli

exports.createCategory = async (req, res) => {
	// Burdaki hatayı yakalayabilmek için try-catch bloğu
	try {
		const category = await Category.create(req.body);
		res.redirect('/user/dashboard');
	} catch (error) {
		res.status(400).json({
			//400 Bad Request
			status: 'fail',
			error,
		});
	}
};
exports.deleteCategory = async (req, res) => {
	// Burdaki hatayı yakalayabilmek için try-catch bloğu
	try {
		await Category.findByIdAndDelete(req.params.id);
		res.status(200).redirect('/user/dashboard');
	} catch (error) {
		res.status(400).json({
			//400 Bad Request
			status: 'fail',
			error,
		});
	}
};
