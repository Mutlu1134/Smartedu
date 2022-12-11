const mongoose = require('mongoose');
const slugify = require('slugify');

const CourseSchema = new mongoose.Schema({
	courseName: {
		type: String,
		unique: true, // bu isimli kurs'tan yalnızca 1 tane olabilir.
		required: true,
		// trim: true, // Başta sonra bırkaılan boşlukları siliyor.
	},
	courseDescription: {
		type: String,
		required: true,
		trim: true, // Başta sonra bırkaılan boşlukları siliyor.
	},

	createdDate: {
		type: Date,
		default: Date.now,
	},
	slug: {
		type: String,
		unique: true,
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category', // Referans/İlişkilendirme vermek istediğin modelin ismi!
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Users', // Referans/İlişkilendirme vermek istediğin modelin ismi!
	},
});

CourseSchema.pre('validate', function (next) {
	this.slug = slugify(this.courseName, {
		lower: true, //tüm slug'ı küçük harf yapar.
		strict: true, // *!'^!+ gibi ifadeleri es geçip sadece stringleri alır.
	});
	next();
});

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;
