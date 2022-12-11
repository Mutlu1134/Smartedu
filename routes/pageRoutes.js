// CONTROLLERS
const pageController = require('../controllers/pageController');

// CUSTOM MIDDLEWARES
const redirectMiddleware = require('../middlewares/redirectMiddleware');

// EXPRESS
const express = require('express');
const router = express.Router();

//ROUTES
router.route('/').get(pageController.getIndexPage);
router.route('/index').get(pageController.getIndexPage);
router.route('/about').get(pageController.getAboutPage);
router.route('/contact').get(pageController.getContactPage);
router.route('/contact').post(pageController.sendMail);
router.route('/login').get(redirectMiddleware, pageController.getLoginPage);
router.route('/register').get(
	redirectMiddleware,
	pageController.getRegisterPage
);
// router.route('/courses').get(pageController.getCoursesPage);

// router.route('/register/submit').get(registerController.newRegister);

module.exports = router;
