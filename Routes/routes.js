const routes = require('express').Router()
const userController = require ('../controller/userController')
const passport = require('passport')
const { requireAccessToken } = require('../controller/authenticationController')
const {User} = require('../model/userSchema')
const bycrpt = require('bcrypt');
const jwt = require('jsonwebtoken');

// routes.post("/logout", (req, res) => {
//   res.clearCookie('userToken');
//   res.redirect('/');
// });

routes.get("/login", (req, res) => {

  if(req.user){
    const { user } = req;
    const token = jwt.sign({ id: user.id }, process.env.API_SECRET, { expiresIn: 9999 });
    // console.log(token)
    res.status(200).json({
      success : true,
      message : "Signin successful",
      user  : req.user,
      token:token,
      cookies : req.cookies
    })
  }
  else{
    res.status(400).json({
      success: false,
      message: "failure",
    })
  }
});

routes.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

routes.get('/auth/google/callback',
  passport.authenticate('google', { 
    successRedirect: "http://localhost:3000/redirect",
    failureRedirect: '/login' }),
  
  );

routes.post('/sign_up', userController.signUp )
routes.post('/sign_in',userController.signin)
routes.get('/sign_out',userController.signOut)
routes.post('/register',userController.registration)

routes.use('/cs_patientList',requireAccessToken)
routes.post('/cs_patientList',userController.csMap)
routes.post('/add_patient',userController.patientAdd)
routes.post('/select_doc',userController.selectDoc)
routes.post('/search',userController.search)

routes.use('/doc_patientList',requireAccessToken)
routes.post('/doc_patientList',userController.docMap)
routes.post('/view_patient',userController.viewPatient)
routes.post('/patient_med',userController.addMedication)

routes.post('/patient_dis',userController.discharge)




  module.exports = routes;
  