//jshint esversion:6

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000


const app = express();

/////Cookies and Sessions //////
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

// const bcrypt = require('bcrypt');
// const saltRounds = 10;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "qwertyuiopasdfghjklzxcvbnm",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
})

userSchema.plugin(passportLocalMongoose);


const User = mongoose.model('User', userSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get('/', (req, res) => {
    res.render('home')
})
app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/login', (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, (err)=>{
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () =>{
                res.redirect('/secrets');
            })
        }
    })
})




app.post('/register', (req, res) => {
    User.register({username: req.body.username}, req.body.password)
    .then((user) => {
        if (user) {     
            passport.authenticate('local')(req, res, ()=>{
                res.redirect('/secrets')
            })
        }
    })
    .catch((err) => {
        console.log(err);
    })
})

app.get('/secrets', (req, res) =>{
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
})
app.get('/logout', (req, res) => {

    req.logOut( (err) =>{
        if(!err){
            res.redirect('/');
        }        
    })
    
})

app.listen(port, () => console.log('Server Started.'))