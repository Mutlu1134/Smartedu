const express = require('express');
const ejs = require('ejs');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');

// CONTROLLERS
const pageController = require('./controllers/pageController');
const authController = require('./controllers/authController');

// MODELS
const Course = require('./models/Course');

// ROUTES

const pageRoute = require('./routes/pageRoutes');
const courseRoute = require('./routes/courseRoutes');
const categoryRoute = require('./routes/categoryRoutes');
const userRoute = require('./routes/userRoutes');

//EXPRESS SERVER SETUP
const app = express();
const port = process.env.port || 8000;
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

// VIEW TEMPLATE ENGINE
app.set('view engine', 'ejs');

// GLOBAL VARIABLES
global.userIN = null; // null if koşulunda false döndürür. giriş yapılmadığı anlamına gelir.

//MIDDLEWARES
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // url'deki datayı okumaya yarar POST için gerekli
app.use(express.json()); // url'deki datayı jsoon formatına çevirmemizi sağlar POST için gerekli
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
app.use(flash());
app.use((req, res, next) => {
	res.locals.flashMessages = req.flash();
	next();
});
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));

//DATABASE
mongoose.connect(
	'mongodb+srv://smarteduproject:XASbd7xlfzR8l155@cluster0.w0hn9qx.mongodb.net/Cluster0'
)
	.then(() => console.log('DB Connected !'))
	.catch((err) => console.log(err));

//ROUTES
// app.get('/index', pageController.getIndexPage);
// app.get('/', pageController.getIndexPage);
// app.get('/about', pageController.getAboutPage);
// app.get('/courses', pageController.getCoursesPage);
// app.get('/dashboard', pageController.getDashboardPage);
// app.get('/contact', pageController.getContactPage);
// app.get('/login', pageController.getLoginPage);
// app.get('/register', pageController.getRegisterPage);
// app.post('/register/submit', registerController.newRegister);

// Route işlemlerini yukardaki gibi yaparsak çok karışacak bunun için şu şekilde yapacağız.
app.use('*', (req, res, next) => {
	userIN = req.session.userID;
	next();
});
app.use('/', pageRoute);
app.use('/courses', courseRoute);
app.use('/category', categoryRoute);
app.use('/user', userRoute);
