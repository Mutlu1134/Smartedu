# Password Hashing
1. `npm install md5` ile md5 modülü indir.
2. `var md5 = require('md5');` ile import et.
3. Register sayfasında aldığımız password'ü hash'leyelim md5 ile.
4. Girilen şifreyi md5 ile database'e atmak için
```
exports.newRegister = async (req, res) => {
    req.body.userPass = md5(req.body.userPass)
    await Users.create(req.body)
    res.redirect("/");
}
```
# CSS Hatası Çözümü
1. _navbar _header _footer _loader vs tüm partialslardaki linklerin başına / eklemek laazım yoksa css,unhaldedpromise vs. hataları veriyor.!!! 

# NAVBAR Açık olan sayfalı Active yapma
1. Controller'dan ilgili sayfaya render ederken page_name veya harhangibir isimde değişken gönderiyoruz Ör.:
```
exports.getCoursesPage = async (req, res) => {
	res.render('./courses.ejs', {
		page_name: 'courses',
	});
};
```

2. Daha sonra tüm ejs'lerde ortak kullanılan _navbar.ejs'yi açıp aşağıdaki gibi bir ejs kodu ekliyoruz. Eğer page_name courses ise class'a active yaz gibi.
```
<li class="nav-item <%= page_name == 'index' && 'active' %> "><a class="nav-link" href="/index">Home</a></li>
						<li class="nav-item <% if (page_name=='about') { %> <%= 'active' %> <% } %>" ><a class="nav-link" href="/about">About Us</a></li>
						<li class="nav-item <%= page_name == 'courses' && 'active' %> "><a class="nav-link" href="/courses">Courses</a></li>
						<li class="nav-item <%= page_name == 'dashboard' && 'active' %> "><a class="nav-link" href="/dashboard">Dashboard</a></li>
						<li class="nav-item <%= page_name == 'contact' && 'active' %> 	"><a class="nav-link" href="/contact">Contact</a></li>
```
# ROUTERS Klasörü kullanma MVC+Routers
1. app.js ççok karışacağı için routes diye bir klasör daha oluşturmak gerekiyor. Tıpkı controller gibi.
routes->pageRouters.js dosyasını oluşturduk. app.js'te tüm gelen istekleri buraya gönderdik. Şu komutla ; `app.use('/', pageRoute);`
2. pageRouters.js dosyasında gerekli get post yönlendirmelerini route ettik. aşağıdaki gibi.
```
// CONTROLLERS
const pageController = require('../controllers/pageController');
const registerController = require('../controllers/registerController');

// EXPRESS
const express = require('express');
const router = express.Router();

//ROUTES
router.route('/').get(pageController.getIndexPage);
router.route('/index').get(pageController.getIndexPage);
router.route('/about').get(pageController.getAboutPage);
router.route('/contact').get(pageController.getContactPage);
router.route('/dashboard').get(pageController.getDashboardPage);
router.route('/login').get(pageController.getLoginPage);
router.route('/register').get(pageController.getRegisterPage);
router.route('/register/submit').get(registerController.newRegister);

module.exports = router;

```
# MONGOOSE NEDİR?
1. Object Document Mapper'dir. Schema'lar ve Modeller(Collection) oluşturuyoruz.
2. Mongoose schema tnaımlarken işe yarayacak özellikler
```
const CoursesShema = new mongoose.Schema({
	courseName: {
		type: String,
		uniqe: true, // bu isimli kurs'tan yalnızca 1 tane olabilir.
		required: true,
		trim: true, // Başta sonra bırkaılan boşlukları siliyor.
	}
});
```

# BACKEND SIMULASYON
1. Kurs oluşturma ve sergileme front-end sayfalarımızın hazır olmadığını düşünelin. 
2. Bu durumda post methodu ve alınan bilgileri DB'ye kaydedip, ilgili ekrana render etme metodları simülasyon şeklinde yapılacak, POST MAN kullanılacak. courseController sayfası şu şekilde simülayonda çalıştırılır: 
```
const Course = require('../models/Course');

exports.create = async (req, res) => {
	// Kurs oluşturma sayfası hazır olmadığı için req.body'den alamıyoruz.
	// Bunun yerine simülasyonunu yapacağız.
	const course = Course.create(req.body);
	// Normalde aşağıdaki gibi olması lazım ama simülasyon olduğu için bir alttaki şeklinde json dosyası yapacağız.
	// res.status(200).sender("./xxxx.ejs", {
	//     course : course
	// })
	// Aşağıdaki gibi yalnızca bir json dosyası olarak yazdıracağız.

	// Burdaki hatayı yakalayabilmek için try-catch bloğu
	try {
		res.status(200).json({
			status: 'success',
			course,
		});
	} catch (error) {
		res.status(400).json({
			//400 Bad Request
			status: 'fail',
			error,
		});
	}
};

```
# SLUGIFY
1. Tekil sayfaları çağırırken URL'de `http://localhost:8000/courses/638dc25b6d9e807d33acbeae` gibi id yazıyor. Bu id yerine daha anlamlı ifadeler olan slug'lar kullanılması daha uygun olur. Bunun için slugify modülünü şu şekilde indirmeliyiz.
`npm i slugify`
2. DB'ye kayıt etmeden önce `slug` değişkeni de kayıt etmeliyiz. Yani işlemlerimiz ilgili Model dosyasında yapacağız. Bunun için Course.js modül dosyasında slugify'ı import/require ediyoruz.
Schema'ya slug'ı ekliyoruz aşağıdaki gibi.
```
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
});
```
3. Bu slug ifadesini formdan almamız uygun olmaz. İlgili isimden kendisi otomatik üretmeli, bunun için DB'ye kayıt etmeden önce slug ifadesini courseName'den türetmesini sağlayacağız. Buna model middleware'i deniyor.
```
CourseSchema.pre('validate', function (next) {
	this.slug = slugify(this.courseName, {
		lower: true, //tüm slug'ı küçük harf yapar.
		strict: true, // *!'^!+ gibi ifadeleri es geçip sadece stringleri alır.
	});
	next();
});
```
4. slug'ı oluşturduk şimdi courses.ejs sayfasında /courses/id'yerine courses/slug göndereceğiz.
Linki şu şekilde düzeltiyoruz. `<a href="./courses/<%= course[index].slug %> "`
5. Şimdi /course/:slug get requestine yakalayıp route etmemiz lazım. bunun için router'de şu şekilde ayarlıyoruz. : `router.route('/:slug').get(courseController.getSingleCourse);`
6. Şimdi courseControler'deki getSingleCourse'ta databaseden slug ile find edip ilgili ejs template'ine göndereceğiz. Find etmek ve göndermek için controller'da aşağıdaki gibi yapıyoruz. findbyid yerine findOne kullanılıyor ve findOne obje alıyor içine dikkat et.
```
exports.getSingleCourse = async (req, res) => {
	const course = await Course.findOne({ slug: req.params.slug });
	res.status(200).render('./coursesingle.ejs', {
		page_name: 'courses',
		course: course,
	});
};
```

# CATEGORY oluşturma.
1. İlk önce category oluşturmak için gerekli dosyaları hazırlayacağız. Tıpkı course oluşturmak gibi categoryde oluşturamk gerekli.
2. app.js dosyasında category için bir route atayacağız.
```
const courseRoute = require('./category/categoryRoutes');
app.use('/category', categoryRoute);
```
3. app.js'te bahsi geçen categoryRoute'ı oluşturmalıyız. Routes altında categoryRoutes'ı oluşturmamız lazım. İçeriği courseRoute'a benzer şekilde;
```
// CONTROLLERS
const categoryController = require('../controllers/categoryController');
// const registerController = require('../controllers/registerController');

// EXPRESS
const express = require('express');
const router = express.Router();

//ROUTES
router.route('/').post(categoryController.createCategory);

module.exports = router;
```
4. Şimdi categoryRoutes'ya basi geçen categoryController'ı oluşturmalıyız. Buda courseController'a benzeyecek şöyleki `
```
const Category = require('../models/Category');
const mongoose = require('mongoose');
const express = require('express');

const app = express();
exports.createCategory = async (req, res) => {
	// Burdaki hatayı yakalayabilmek için try-catch bloğu
	try {
		const category = await Category.create(req.body);
		res.status(200).json({
			status: 'success',
			course,
		});
	} catch (error) {
		res.status(400).json({
			//400 Bad Request
			status: 'fail',
			error,
		});
	}
};
```

5. Şimdide categoryController'da bahsi geçen model'i oluşturmalıyız. Bu da Course modeline benzeyecek;
```
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
		res.status(200).json({
			status: 'success',
			category,
		});
	} catch (error) {
		res.status(400).json({
			//400 Bad Request
			status: 'fail',
			error,
		});
	}
};

```
6. Şimdi category modeli ile course modeli arasında ilişki sağlamamız gerekli. Course modeline category diye bir alan oluşturuyoruz. ve bu alan otomatikman Category'deki object id'ye referans verilmiş oluyor şu şekilde;
```
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
});
```
7. POSTMAN'de category post etmek için `http://localhost:8000/category`'e 
```
{
    "categoryName" : "Adobe"
} 
```
8. Course oluşturmak için MongoDB'de cat_id'yi alıp category'e yazmalıyız ve POSTMAN'de `http://localhost:8000/courses `'e post etmeliyiz.
```
{
    "courseName" : "Adobe 101 ",
    "courseDescription" : "Adobe for Beginners.",
    "category" : "638f182f877ebe3a27dd93c1"
}
```
9. Oluşturduğumuz categoryleri courses.ejs dosyasına gönderelim ve sayfada ilgili yerlerde sergileyelim. Bunun için courseController'a category modelini import edelim ve getAllCourses'ı şu şekilde güncelleyelim. Böylece courses ejs'e category'ide göndermiş olduk.
```
exports.getAllCourses = async (req, res) => {
	const course = await Course.find({}).sort('-createdDate');
	const category = await Category.find({});
	res.status(200).render('./courses.ejs', {
		course: course,
		category: category,
		page_name: 'courses',
	});
};
```
10. courses.ejs'de category'i ejs kodlarıyla ekleyelim. Şu şekilde
```
<% for( let index = 0; index < category.length; index++ ) { %>
	<li><a href="#"><%= category[index].categoryName %> </a></li>							
<% } %>
```
11. Şimdi bunların href'lerini query olacak şekilde güncelleyeceğiz. 
`<li><a href="/course?category=<%=category[index].slug%> "><%= category[index].categoryName %> </a></li>`
12. Burada /course?category=programming şeklinde bir query paramatresi gidiyor. courseController'daki getAllCourses fonksiyonunda bu query'i yakalayıp ona göre filtre edip tıklanan kategori kurslarını ekrana vereceğiz. courseController'da aşağıdaki gibi olcak. Buradaki olay özetle. alınan query aslında categoryName, bu name göre category id'sini bul . bu id ile courses'tan filtre yap ve ekrana yine courses name vs bilgilerini yazdır.
```
exports.getAllCourses = async (req, res) => {
	try {
		const categorySlug = req.query.category; // Category slug'ı al
		// slug'a göre seçilen category al.
		const clickedCategory = await Category.findOne({
			slug: categorySlug,
		});
		// Eğer bir query varsa (categorySlug) filtreye bu slug'a karşılık gelen category id'sini yaz
		if (categorySlug) {
			filter = { category: clickedCategory._id };
		} else {
			// query yoksa filtre boş olsun
			filter = {};
		}
		// Filtreyi aşağıdaki find'a yazdır.
		const course = await Course.find(filter).sort('-createdDate');
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
```
# LOGIN işlemleri
1. Login'e tıklanınca bir adrese post atıyoruz onu yakalayıp controller'ında girilen maili ve girilen şireyi (md5'ledikten sonra) database'dekiyle karşılaştırıp, böyle bir email varsa ve şifresi aynıysa login yapmış oluyoruz.
```
exports.loginUser = async (req, res) => {
	try {
		req.body.password = md5(req.body.password);
		const { email, password } = req.body;
		console.log(email + '       ' + password);
		const receivedUser = await Users.findOne({ userMail: email });

		if (receivedUser) {
			if (receivedUser.userPass == password) {
				console.log('Succesfuly');
				res.status(200).send('Succesfuly');
			}
		}
	} catch (error) {
		error;
	}
```

# SESSION İşlemi
1. Session işlemi giriş yaptıktan sonra kullanıcının sessionu başlamış olur. Çıkış yapana kadar devam eder.
Session modülü indirmek için ` npm install express-session`
2. app.js'te modül require edilir ve middleware'i çalıştırılır.
```
const session = require('express-session');
app.use(
	session({
		secret: 'my_keyboard_cat', // bunu my_keyboard_cat şeklinde güncelledik.
		resave: false,
		saveUninitialized: true,
		
	})
);

```

3. Oturuma giriş yapıldığını/ session başlatıldığını ve id sini tüm sayfalarda kullanabilmek için global bir değişken oluşturup bu değişkene girilen kullanıcı id'sini atıyoruz. 
```
// GLOBAL VARIABLES
global.userIN = null; // null if koşulunda false döndürür. giriş yapılmadığı anlamına gelir.

//ROUTING
app.use('*', (req, res, next) => {
	userIN = req.session.userID;
	next();
});
```
4. Artık tüm sayfalarda userIN'i kullanabiliriz. 
5. Giriş yapıldıktan sonra register ve login kutucuklarının görülmemesini istiyoruz. Dasboard sayfasınında yalnızca giriş yapıldıktan sonra görülmesini istiyoruz. Bunun için navbar.ejs'te değişiklikler yapmamız lazım.
6. Yalnızca giriş yapıldığında dashboard'ı gösterir.
```
<% if (userIN) { %>
<li class="nav-item <%= page_name == 'dashboard' && 'active' %> "><a class="nav-link" href="/dashboard">Dashboard</a></li>						 
<% } %>
```
7. Giriş yapıldıktan sonra login ve register butonlarını göstermez. Sign out butonunu gösterir.
```
<ul class="nav navbar-nav navbar-right">
	<% if (!userIN) { %>
		<li><a class="hover-btn-new log   mr-2 <%= page_name == 'login' && 'orange' %>" href="/login"><span><i class="fa fa-sign-in" aria-hidden="true"></i></span></a></li>
		<li><a class="hover-btn-new log <%= page_name == 'register' && 'orange' %>" href="/register"><span><i class="fa fa-user-plus" aria-hidden="true"></i></span></a></li> 
	<% } else { %>
		<li><a class="hover-btn-new log   mr-2 <%= page_name == 'login' && 'orange' %>" href="/login"><span><i class="fa fa-sign-out" aria-hidden="true"></i></span></a></li>
	<% } %> 
</ul>
```
8. Çıkış işlemi için authController'a aşağıdaki fonksiyonu ekliyoruz ve gerekli yönlendirmeleri ekliyoruz. 
```
// Çıkış işlemi için
exports.logoutUser = async (req, res) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
};
```
9. Server'daki kodlarda ufak bir değişiklik yapıp kaydetttiğimizde server kapanıyor ve açılıyor bu yüzden giriş yapılmış hesap'tanda çıkılmış oluyor. her seferinde yeniden giriş yapmak zorunda kalınabilir. Bunu önleme için connect-mongo modülünü kullanacağız. 
Şu kodla indirelim `npm install connect-mongo`
10. Require ediyoruz `const MongoStore = require('connect-mongo');`
11. Middleware'i kullanıyoruz. Bunun için sesssion middleware'in içine ekleme yapıyoruz.
```
app.use(
	session({
		secret: 'my_keyboard_cat', // bunu my_keyboard_cat şeklinde güncelledik.
		resave: false,
		saveUninitialized: true,
		// connect-mongo middleware'i aşağıdaki gibi.
		store: MongoStore.create({
			mongoUrl: 'mongodb://localhost/SmartEdu',
		}),
	})
);
```
# CUSTOM MIDDLEWAREs
1. Dashboard sayfasını yalnızca giriş yapan kullanıcılar görsün demiştik. Ancak `http://localhost:8000/user/dashboard` linkini copy paste ile giren kişi hata alsa bile bu sayfayı hatalarıyla görüyor. Bunu engellemek için bir kontrol middleware'i yazmamız gereklir. Giriş yapmayıp bu sayfaya erişmeye çalışanları login sayfasına redirect edeceğiz.
2. Önce middlewares diye bir klasör oluşturuyoruz. ve `authMiddleware.js` dosyasını oluşturuk içine;
```
const Users = require('../models/Users');

module.exports = async (req, res, next) => {
	try {
		await Users.findOne(
			{ _id: req.session.userID },
			(err, user) => {
				if (err || !user) {
					return res.redirect('/login');
				}
				next();
			}
		);
	} catch (error) {
		error;
	}

	// aşağıdaki kodda çalışıyor ama yukarıdaki daha iyi olabilir diye onuda yazıyorum.
	// if (!req.session.userID) {
	// 	res.redirect('/login');
	// }
	// next();
};

```
3. Daha sonra bu middle ware'i dashboard sayfasına route ettiğimiz ilgili router'da (userRoutes) require ediyoruz/çağırıyoruz. Dashboard'a göndermeden önce bu middleware'in kontrol etmesini aşağıdaki şekilde sağlıyoruz.
```
//CUSTOM MIDDLEWARE
const authMiddleware = require('../middlewares/authMiddleware');

router.route('/dashboard').get(authMiddleware, authController.getDashboardPage);
```

4. Aynı şekilde giriş yaptıktan sonra  `http://localhost:8000/regiser` ve `http://localhost:8000/login` sayfalarını copy paste ile yazdığımızda erişememiz gerekir. Bunun içinde middleware yazmamız gerekiyor. middleware->redirectMiddleware.js oluşturuyoruz. içine;
```
module.exports = async (req, res, next) => {
	try {
		if (req.session.userID) {
			return res.redirect('/');
		}
	} catch (error) {
		error;
	}
	next();
};


```

5. Daha sonra redirectMiddleware'i login ve register get metodlatlarını yakaladığımız yerde kullanıyoruz.
```
router.route('/login').get(redirectMiddleware, pageController.getLoginPage);
router.route('/register').get(
	redirectMiddleware,
	pageController.getRegisterPage
);
```

6. Şimdi Role Middleware'ni yazağıcağız, mantık şu Teacher ve Admin -> kurs oluşturabilir. Student olarak kaydolmuşsa kurs oluşturamaz.

7. Bunun için Users modelinde yeni bir alan oluşturmalıyız. Şu şekilde
```	role: {
		type: String,
		enum: ['student', 'teacher', 'admin'],
		default: 'student',
	},
```
8. Register sayfasında kayıt olurken bu role'ide seçtirmeliyiz. Registerda gerekli düzenlemeyi yapalım. Email ve password arasına aşağıdaki select-option'ı ekliyoruz.

```
  <div class="offset-1 col-lg-10 col-md-10 col-sm-10 ">
	<select name="role" class="form-control">
		<option value="">Student</option>
		<option value="">Teacher</option>
	</select>
</div>
```

9. Şimdi roleMiddleware.js 'yi oluşturup yazabiliriz.
```
module.exports = (roles) => {
	// roles route sayfasında gönderilen izin verilen rollerdir
	return (req, res, next) => {
		// burda req.body.role ile register sayfasında girilen student/teacher name'i yakalanıyor
		console.log(
			'user in : ' +
				userIN +
				'  req.sesssion.userID  ' +
				req.session.userID +
				'   req.body.role  : ' +
				req.body.role
		);
		const userRole = req.body.role; // burda req.body.role yerine veritabanından rolü çekip okusak?
		if (roles.includes(userRole)) {
			next();
		} else {
			return res.status(401).send('YOU CANT DO IT');
		}
	};
};

```
10. Şimdi courseCreate aşamasında bu middleware'i çalıştırmalıyız.
``` 
router.route('/').post(
	roleMiddleware(['teacher', 'admin']),
	courseController.createCourse
);
```

# Database Create için farklı bir yöntem
1. Şu şekilde de yapılabilir;
```
// const course = await Course.create(req.body); // Bunun yerine aşağıdaki şekildede yapılabilir.

const course = await Course.create({
			courseName: req.body.courseName, // courseName'i formdan gelen courseName'den al
			courseDescription: req.body.courseDescription,
			category: req.body.category,
			user: req.session.userID,  // user'ı sessionDan gelen userID'den al
		});
```

# POPULATE 
1. Biz Course.js modelimize user şeklinde bir userID eklemiştik ve bu userID'yi Users.js Modelimizdeki id ile ilişkilendirmiştik. Bkz.
```
const CourseSchema = new mongoose.Schema({
	.
	.
	.
	.

	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Users', // Referans/İlişkilendirme vermek istediğin modelin ismi!
	},
});

```
2. Bu ilişkilendirme sayesinde biz Course.js modelimizi gönderdiğimiz herhangi bir sayfada user değişkeni üzerinden populate edip User.js modelindeki değişkenleride çağırabiliriz. Populate şu şekilde;
```
exports.getSingleCourse = async (req, res) => {
	const course = await Course.findOne({ slug: req.params.slug }).populate('user');
	res.status(200).render('./coursesingle.ejs', {
		page_name: 'courses',
		course: course,
	});
};
```
3. /coursesingle.ejs sayfasına course'ı ve course.populate üzerinden users'ı göndermiş olduk. users tablosundan userName değişkenini yazdırmak için coursegingle.ejs sayfasında aşağıdakini kullanmamız yeterli.
```
<%= course.user.userName %>
```

# REQ.BODY VS REQ.QUERY
1. Remember this: query for GET, body for POST and PUT. 
2. req.params for DELETE -- Eğer route'da ("/course/:slug") veya ("/course/:id") şeklinde yazarrsak slug veya id'yi req.params.slug veya req.params.id şeklinde yakalıyoruz.  

# MAIL GONDERME 
1. Contact sayfasından girilen mesajı mail modülü üzerinden kendi mailimize göndereceğiz. 
2. Kullanmamız gereken modül nodemailer bunu indirmek için ;
`npm i nodemailer`
3. Hangi sayfada kullancaksak o sayfade require etmemiz gerekli.
`const nodemailer = require("nodemailer");`
4. Aşağıdaki gibi örnek template'i doldurarak mail servisini aktif edebilirz.
```
exports.sendMail = async (req, res) => {
	const messageHTML = `
	<h1>Message Detail</h1>
	<li>Name : ${req.body.name}</li>
	<li>Mail : ${req.body.email}</li>
	<h1>Message</h1>
	<p>${req.body.message}</p>
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
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

	res.status(200).redirect('/contact');
};

```
# Bildirim Mesajı FLASH MESSAGES
1. Örneğin maili gönderdin veya try içerisindeki herhangi bir fonk tamamlandı bundna sonra bildirim flash message oluşturabilirsin. Bunun için gerekli modül `npm i connect-flash` 
2. Kullanmak için require etmek ve middleware'ide kullanmak gerekiyor, `const flash = require('connect-flash');`, `app.use(flash());`
3. flash messages session üzerinden çalışmaktadır. ama bir değişkene de atılabilir. şu şekilde ;
```
app.use((req, res, next) => {
	res.locals.flashMessages = req.flash();
	next();
});
```		
4. Artık ilgili template'de flash mesajını flashMessages 'üzerinden kullanabilirim. FLash message'ı göndermek istediğim yerden şu şekilde gönderiyorum. TRY içine ; `req.flash('success', 'We received your message succesfuly');`, CATCH içine `req.flash('fail', 'We didnt received your message succesfuly');`  ve proje gereği daha sonra contact'a redirect ettik
5. Şimdi contact ejs'de bu flashı mesajı şu şekilde sergileyebiliriz;
```
 <% if (flashMessages) { %>
	<% if (flashMessages.success) { %>
	<div class="alert alert-success">
		<%= flashMessages.success %> 
	</div>
	<% } %>
	<% if (flashMessages.fail) { %>
	<div class="alert alert-danger">
		<%= flashMessages.fail %> 
	</div>
	<% } %>

<% } %>

```

6. Örneğin kurs oluşturma başarılı olursa da flash message'ı gönderebiliriz. Bunun için kayıt aşamasında createCourse fonksiyonunda flash message oluşturmalıyız. 
```
req.flash(
	'success',
	`${course.courseName} has been created succesfully.`
);
```
7. Aynı şekilde istediğimiz yerde bu mesajları sergiliyoruz.
```
 <% if (flashMessages) { %>
	<% if (flashMessages.success) { %>
	<div class="alert alert-success">
		<%= flashMessages.success %> 
	</div>
	<% } %>
	<% if (flashMessages.fail) { %>
	<div class="alert alert-danger">
		<%= flashMessages.fail %> 
	</div>
	<% } %>

<% } %>
```

# VALIDATION SIFRE VE EMAIL DOGRULAMA
1. Register ve login sayfasında girilen email - şifre - isim vb. bilgilerin doğruluğunu kontrol etmek için kullancağımız modül express-validator. İndirmek için 
`npm install express-validator`
2. Modülü kullanmak için ilgili sayfalarda require etmemiz gereken (minimum) fonksiyonlar 
`const { body, validationResult } = require('express-validator');`
3. Önce kayıt sayfasındaki doğrulamaları yapalım. Öncelikle html inputlarda `required` yaparakta ufak bir doğrulama yapabiliriz. Bence required yapmalıyız. Şifrede büyük/küçük harf özel noktalama işareti vs. olsun diye mesaj gönderirken express-validator'u kullanmamız daha sağlıklı. Yoksa formu bomboş gönderdiğimizde de boş kullanıcı açıyor.
4. Kayıt sayfasında `Name` , `Email`ve `Password` inputları boş bırakıldığında flash mesaj ile ekrana hatayı yazdıracağız.
5. Boş bırakıldığında hata mesajı üretmek kayıt fonksiyonuna route ettiğimiz satırı şu şekilde güncelliyoruz.
```
const { body, validationResult } = require('express-validator');

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
```
6. Gönderilen flash messajını ve withmessage ile gönderilen hatayı controller'da yakalayıp ejs template'ine gönderiyoruz.
```
const { body, validationResult } = require('express-validator');

exports.newRegister = async (req, res) => {
	try {
		req.body.userPass = md5(req.body.userPass);
		await Users.create(req.body);
		res.redirect('/login');
	} catch (error) {
		const errors = validationResult(req); // gönderilen validationresult'u yakalayıp errors'a atıyoruz
		// console.log(errors); // errors içinde nesneler bulunan bir dizi.
		// console.log('error length : ' + errors.array().length); // bu dizinin uzunluğunu öğrenebiliriz. array() constructor'ını kullanmamız gerekiyor.!
		for (let index = 0; index < errors.array().length; index++) {
			console.log(errors.array()[index].msg); // ilgili dizideki mesajı alıp önce konsole sonrada aşağıda flash mesajla template engine'e gönderiyoruz.
			req.flash('fail', `${errors.array()[index].msg}`);
		}
		res.status(400).redirect('/register');
	}
};
```

# COURSE DELETE 
1. Delete ve update methodları için method-override'ı indirmeliyiz. Çünkü URL üzerinden get ve posttan başka http metodu gitmiyor.
2. Method-override modülünü indirmek için `npm install method-override`
3. app.js'te require etmek ve middleware'ini yazmak lazım bunlar;
```
const methodOverride = require('method-override');

app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));
```
4. Şimdi istediğimiz href üzerinden post üzerine ya da get üzerine bindirilmiş şekilde put ve delete gönderebiliriz. Örn.
`href="/courses/<%=course[index].slug%>?_method=DELETE"`
5. Şimdi router'da deleteyi yakalayıp ilgili fonksiyona route ettirmeliyiz.
`router.route('/:slug').delete(courseController.deleteCourse);`
6. Şimdi deleteCouse fonksiyonunda slug'ı yakalayıp istediğimiz gibi delete ettirebiliriz. Flash message'ıda yazdırdık. Course sayfasında istediğimiz yerde flas mesajını yazdırabiliriz. 
```
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
```
7. Flash mesajını course template'inde sergileyebiliriz.
```
<% if (flashMessages) { %>
	<% if (flashMessages.success) { %>
		<div class="alert alert-success">
			<%= flashMessages.success %> 
		</div>
	
	<% } else if (flashMessages.fail) { %>
		<div class="alert alert-danger">
			<%= flashMessages.fail %> 
		</div>
	<% } %>

<% } %>
```

# COURSE UPDATE
1. Update için Modal'ı tekrar çıkartabiliriz. Modal oluşturup çıkartmak için buton şu şekilde olmalı;
data-toggle ve date-target modal oluşturmak için gerekli.
`<a data-toggle="modal" data-target="#updateModal<%=course[index].slug%>" class="btn btn-primary rounded-0"><span>UPDATE</span></a>`

2.  updatemodalcourse[index].slug id'sine sahip bir modalımız olması lazım bunun için;
```
<!-- UPDATE Modal -->
							<div class="modal fade" id="updateModal<%=course[index].slug%>" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
							<div class="modal-dialog modal-dialog-centered modal-lg" role="document">
							<div class="modal-content">
							<div class="modal-body customer-box">
								<!-- Tab panes -->
								<div class="tab-content">
									<div class="tab-pane active" id="Login">
										<form method="POST" action="/courses/<%=course[index].slug%>?_method=PUT" class="form-horizontal">
											<div class="form-group">
												<div class="col-sm-12">
													<input type="text" name="courseName" class="form-control" value="<%=course[index].courseName%>" placeholder="Course Name">
												</div>
											</div>
											<div class="form-group">
												<div class="col-sm-12">
													<input type="hidden" name="role" class="form-control"  value="<%= user.role %>">
												</div>
											</div>
											<div class="form-group">
												<div class="col-sm-12">
													<input type="hidden" name="user" class="form-control"  value="<%= user._id %>">
												</div>
											</div>
											<div class="form-group">
												<div class="col-sm-12">
													<textarea rows="8" name="courseDescription" class="form-control" 
													placeholder="Course Description" required><%=course[index].courseName%></textarea>
												</div>
											</div>

											<div class="form-group">
												<div class="col-sm-12">
													<select class="form-control" name="category" value="<%=course[index].category%>">
														<% for (let i=0; i< categories.length; i++) { %>
														<!-- Burada kategory hangisiyse onu seçili olarak getirt. -->
														<option selected="<%=// categories[i]._id == course[index].category && 'selected' %>" value="<%= categories[i]._id %>"><%= categories[i].categoryName %></option>
														<% //console.log(categories[i]._id + "    " + course[index].category) %> 
														<% } %>	
													</select>
												</div>
											</div>
											<div class="row">
												<div class="col-sm-10">
													<button type="submit" class="btn btn-light btn-radius btn-brd grd1">
														Submit
													</button>
													<button type="submit" class="btn btn-light btn-radius btn-brd grd1"
														data-dismiss="modal" aria-hidden="true">
														Cancel
													</button>
												</div>
											</div>
										</form>
									</div>
								</div>
							</div>
							</div>
							</div>
							</div>
```
3. Modal daki form action ve methodumuzu şu şekidle yazmıştık
`<form method="POST" action="/courses/<%=course[index].slug%>?_method=PUT" `

4. Şimdi routerda yakalamamız gerekiyor.
`router.route('/:slug').put(courseController.updateCourse);`
5. Son olarak updateCourse fonksiyonunda güncellemeyi yapıyoruz.
```
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
```

# HOSTING VE UZAK DATABASE İLE SİTEYİ CANLIYA ALMA.
1. Uzak database için mongodb atlas uygulaması üzerinden new cluster açıp connect via vscode seçip linki kopyalıyoruz. ve mongoose.connect'e yapıştırıyoruz. mongoose.connect bize promise dönüyor bunları .then ve .catch ile yakalıyoruz bağlandıysa Db connected yazdırıyoruz. 
```
//DATABASE
mongoose.connect(
	'mongodb+srv://smarteduproject:XASbd7xlfzR8l155@cluster0.w0hn9qx.mongodb.net/Cluster0'
)
	.then(() => console.log('DB Connected !'))
	.catch((err) => console.log(err));
``` 
2. Hosting hizmeti için heroku ücretli olduğundan render.com üzerinden uygulama açtık ve new static site'ı seçtik ve github'ı bağladık. Uygulamamızı github'a yükleyeceğiz.
3. Hosting açmadan önce port numaramızı şu şekilde ayarlalamız gerekiyor. Böylece hosting sağlayıcı müsait olan port numarasını verebilecek veya 8000 'i verecek
`const port = process.env.PORT || 8000;`
4. package.json dosyasındaki aşağıdaki test script'ini siliyoruz.
`    "test": "echo \"Error: no test specified\" && exit 1",`
bi altındaki start'ı daaşağıdaki şekilde güncelliyooruz. nodemon yerine node oluyor.
`"start": "node app.js"`
5. render.com'a deploy'da `npm install`, `npm start` yazdım. başarılı.

