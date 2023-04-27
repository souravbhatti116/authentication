//jshint esversion:6

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000
const app = express();

const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
})



const User = mongoose.model('User', userSchema)




app.get('/', (req, res) => {
    res.render('home')
})
app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username})
    .then((foundUser) => {
        if (foundUser) {
            bcrypt.compare(password, foundUser.password)
            .then((result) => {
                if (result === true) {
                    res.render('secrets')
                } else {
                    res.send('</h1> Wrong Password. </h1>')
                }
            })
            // if (foundUser.password == password) {
            //     res.render('secrets');
            // } else {
            //     res.send("Wrong email/password combination."); 
            // }
        } else {  
            res.redirect('/register');
        }
    })

})


app.get('/register', (req, res) => {
    res.render('register')
})


app.post('/register', (req, res) => {
    let username = req.body.username;
    let password = (req.body.password);

    
    User.findOne({ email: username})
    .then((foundUser) => {
        if (foundUser) {
            res.redirect("/login")
        } else {  
            bcrypt.hash(password, saltRounds)
            .then((hash)=>{
                let newUser = User({
                    email: username,
                    password: hash
                })
                newUser.save().then((response) => res.redirect("/register"))
                // console.log("user Does not exist.")
            })
        }
    })

})

app.listen(port, () => console.log('Server Started.'))