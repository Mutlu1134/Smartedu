const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
	categoryName: {
		type: String,
		unique: true, // bu isimli kurs'tan yalnızca 1 tane olabilir.
		required: true,
		// trim: true, // Başta sonra bırkaılan boşlukları siliyor.
	},
	slug: {
		type: String,
		unique: true,
	},
});

CategorySchema.pre('validate', function (next) {
	this.slug = slugify(this.categoryName, {
		lower: true, //tüm slug'ı küçük harf yapar.
		strict: true, // *!'^!+ gibi ifadeleri es geçip sadece stringleri alır.
	});
	next();
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
