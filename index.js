const express = require('express');
const session = require('express-session');
const cookieSession = require("cookie-session");
const cookieParser = require('cookie-parser');
const cors = require('cors')
const passportSetup = require('./passport/Google')
const mongoose = require('mongoose')
const routes = require('./Routes/routes')
const passport = require('passport');
const app = express();
const PORT = process.env.PORT || 3002


require('dotenv').config()

//Set up session middleware
// app.use(session({
//   secret: 'secret',
//   resave: false,
//   saveUninitialized: false
// }));

app.use(
    cookieSession({ name: "session1", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
  );

// Set up Passport.js middleware
app.use(passport.initialize());
app.use(passport.session());

try{
    mongoose.connect('mongodb+srv://mongotuts:lraRjHjtSPG1gbYc@cluster0.6yopsjn.mongodb.net/HealthCare_DB?retryWrites=true&w=majority',{
        useUnifiedTopology : true,
        useNewUrlParser : true
    })
    console.log('connected to DB')
}
catch(error){
    console.log('DB error', error)
}

process.on('UnhandledRejection', error => {
    console.log('DB error', error);
});
 
app.use(cors(
    {
        origin: ['http://localhost:3000', 'http://localhost:3002'],
        methods: "GET,POST,PUT,DELETE",
        credentials: true,
      }
))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', routes);


app.listen(PORT,()=>{
    console.log(`Server is live at ${PORT}`)
})
