// CONTROLLERS
const categoryController = require('../controllers/categoryController');
// const registerController = require('../controllers/registerController');

// EXPRESS
const express = require('express');
const router = express.Router();

//ROUTES
router.route('/').post(categoryController.createCategory);
router.route('/:id').delete(categoryController.deleteCategory);

// router.route('/').get(courseController.getAllCourses);
// router.route('/:slug').get(courseController.getSingleCourse);
// // router.route('/coursesingle').get(courseController.getCoursesSingle);

module.exports = router;
