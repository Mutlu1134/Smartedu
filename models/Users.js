const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
	userName: {
		type: String,
		trim: true,
	},
	userPass: String,
	userMail: {
		type: String,
		trim: true,
		unique: true,
	},
	role: {
		type: String,
		enum: ['student', 'teacher', 'admin'],
		default: 'student',
	},
	courses: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course',
		},
	],
	dateCreated: { type: Date, default: Date.now },
});

const Users = mongoose.model('Users', UsersSchema);

module.exports = Users;
