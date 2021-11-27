if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
// const seedDb = require('./seed');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local');
const flash = require('connect-flash');


//database models for user
const User = require('./models/user');

//Routes
const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/userAuth');
const mechanicRoutes = require('./routes/mechanicAuth');

// mongodb://localhost:27017/testvba
//vba - vehicle breakdown assistance
mongoose.connect(process.env.DB_URL, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify:false,
        useCreateIndex:true
    })
    .then(()=>{
        console.log('Database Connected');
    })
    .catch(err =>{
        console.log('error occured',err);
});

// seedDb();


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
app.use(express.static(path.join(__dirname,'/public')));
app.use(express.urlencoded({extended:true}));

//session parameters
const sessionConfig = {
    secret:'thereisnosecret',
    resave:false,
    saveUninitialized: true
}

// initializing session and using 
app.use(session(sessionConfig));
app.use(flash());

//initialize passport and session for storing user info
app.use(passport.initialize());
app.use(passport.session());

// configuring the passport to use local strategy for user and mechanic
passport.use(new localStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support for user & mechanic
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.list = null;
    res.locals.location = null;
    res.locals.success= req.flash('success');
    res.locals.error= req.flash('error');
    res.locals.status = null; //for storing booking status
    next();
})


// app.get('/', (req,res)=>{
//     res.render('index');
// })

// app.get('/auth/login', (req,res)=>{
//     res.render('auth/login');
// })

// app.get('/auth/register', (req,res)=>{
//     res.render('auth/register');
// })

// app.get('/common/dashboard', async(req,res)=>{
//     const data = await Mechanics.find({});
//     res.render('common/dashboard',{data});
// })

// app.get('/common/:id', async(req,res)=>{
//     const data = await Mechanics.findById(req.params.id);
//     res.render('common/show',{data});

// })


app.use(mainRoutes);
app.use(userRoutes);
app.use(mechanicRoutes);


app.listen(process.env.PORT || 3001, ()=>{
    console.log('Server running at port 3001');
})
