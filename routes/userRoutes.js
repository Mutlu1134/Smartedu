const { body, validationResult } = require('express-validator');
const User = require('../models/Users');
// CONTROLLERS
const authController = require('../controllers/authController');

//CUSTOM MIDDLEWARE
const authMiddleware = require('../middlewares/authMiddleware');

// EXPRESS
const express = require('express');
const router = express.Router();

//ROUTES
router.route('/signup').post(
	[
		body('userName')
			.not()
			.isEmpty()
			.withMessage('Please enter your Name.'),
		body('userMail')
			.isEmail()
			.withMessage('Please enter valid Email.')
			// Email daha önce kayıt edilmiş mi ;
			.custom((enteredUserEmail) => {
				return User.findOne({
					userMail: enteredUserEmail,
				}).then((user) => {
					if (user) {
						return Promise.reject(
							'Email is already exists!'
						);
					}
				});
			}),
		body('userPass')
			.not()
			.isEmpty()
			.withMessage('Please enter Password.'),
	],
	authController.newRegister
);
router.route('/login').post(authController.loginUser);
router.route('/logout').get(authController.logoutUser);
router.route('/dashboard').get(authMiddleware, authController.getDashboardPage);
router.route('/:_id').delete(authController.deleteUser);

// router.route('/register/submit').get(registerController.newRegister);

module.exports = router;
