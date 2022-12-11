// CONTROLLERS
const courseController = require('../controllers/courseController');
// const registerController = require('../controllers/registerController');

//MIDDLEWARES
const roleMiddleware = require('../middlewares/roleMiddleware');

// EXPRESS
const express = require('express');
const router = express.Router();

//ROUTES
router.route('/').post(
	roleMiddleware(['teacher', 'admin']),
	courseController.createCourse
);
router.route('/').get(courseController.getAllCourses);
router.route('/:slug').get(courseController.getSingleCourse);
router.route('/:slug').delete(courseController.deleteCourse);
router.route('/:slug').put(courseController.updateCourse);
router.route('/enroll').post(courseController.enrollCourse);
router.route('/relase').post(courseController.relaseCourse);

// router.route('/coursesingle').get(courseController.getCoursesSingle);

module.exports = router;
