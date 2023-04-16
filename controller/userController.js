const { User, Patient } = require('../model/userSchema');
const jwt = require('jsonwebtoken');
const bycrpt = require('bcrypt');
 

function userRegistration(req){
    const user = new User({
        fullName : req.body.fullName,
        email : req.body.email,
        role : req.body.role,
        password : bycrpt.hashSync(req.body.password,8)
    })
    return user
}

function checkErr500 (err, res){
    if (err) {
        res.status(500).json({message : 'error'})
        return true
    }
    return false
}

function isValidPassword(user, password) {
  return bycrpt.compareSync(password, user.password)
}

function checkErr500 (err, res){
  if (err) {
      res.status(500).json({message : 'error'})
      return true
  }
  return false
}

function patientAddition(req){
  const patient = new Patient({
    fullName : req.body.fullName,
      gender : req.body.gender,
      costumerService : req.body.costumerService,
      Doctor : req.body.Doctor,
      age : req.body.age,
      status : req.body.status,
  })
  return patient
}

exports.signUp = async (req, res) => {
    try {
      const user = userRegistration(req);
      await user.save();
      res.status(200).json({ message: "User added" });
    } catch (err) {
      console.log(err)
      if (checkErr500(err, res)) {
        return;
      }
    }
}

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!isValidPassword(user, req.body.password)) {
      return res.status(401).json({ accessToken: null, message: 'Invalid password' });
    }

    const token = jwt.sign({ email: user.email, id: user.id }, process.env.API_SECRET, { expiresIn: 9999 });

    res.status(200).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role : user.role,
      },
      message: 'Signin successful',
      accessToken: token
    });
  } catch (err) {
    if (checkErr500(err, res)) {
      return;
    }
  }
};

exports.patientAdd = async (req , res) =>{
  try{
    const patient = patientAddition(req)
    await patient.save()

    const { costumerService , Doctor, fullName} = req.body

    const CostumerService = await User.findById(costumerService)
    const doctor = await User.findById(Doctor)
    if (!CostumerService) {
      return res.status(400).json({ message: 'Costumer representative not found' });
    }

    // if (CostumerService) {
    //   CostumerService.patient.push(patient.id)
    // }
    
    if (!doctor) {
      return res.status(400).json({ message: 'Doctor not found' });
    }
    if (doctor && CostumerService) {
      doctor.patient.push(patient.id)
      CostumerService.patient.push(patient.id)

      await doctor.save()
      await CostumerService.save()
      return res.status(200).json({ message : `${fullName} is asign to ${doctor.fullName} created by ${CostumerService.fullName}`})
    }

  }catch(err){
    console.log(err)
    if(checkErr500(err, res)){
      return;
    }
  }
}

exports.selectDoc = async (req, res) => {
  try{
    const doctors = await User.find({ role : 'Doctor'})

    if(!doctors){
      res.status(400).json({ message : 'no doctors found'})
    }
    if(doctors){
      res.status(200).json({ 
        doctor : doctors.map((item)=>({
          id : item.id,
          fullName : item.fullName
        })),
        message : 'doctor found'})
    }
  }catch(err){
    if(checkErr500(err, res)){
      return;
    }
  }
}

exports.csMap = async (req, res) =>{
  try{
    const patients = await Patient.find()
    const OPD = []
    const ICU = []
    const discharged = []

    if (!patients) {
      res.status(400).json({ message : 'patients not found'})
    }

    for (const id of patients) {
      const patient = await Patient.findById(id).populate({
        path: 'costumerService',
        select: 'fullName'
      }).populate({
        path: 'Doctor',
        select: 'fullName'
      });

      if (patient.status === 'OPD') {
        OPD.push(patient);
      }
      if (patient.status === 'ICU') {
        ICU.push(patient);
      }
      if (patient.status === 'discharged') {
        discharged.push(patient);
      }
    }

    res.status(200).json({
      OPDcount : OPD.length,
      OPD: OPD.map((item) => ({
        id : item.id,
        fullName : item.fullName,
        gender : item.gender,
        age : item.age,
        status :  item.status,
        doctor : item.Doctor.fullName,
        costumerService: item.costumerService.fullName,
        symptoms : item.symptoms,
        diagnosis : item.diagnosis,
        medication : item.medication,
      })),
      ICUcount : ICU.length,
      ICU: ICU.map((item) => ({
        id : item.id,
        fullName : item.fullName,
        gender : item.gender,
        age : item.age,
        status :  item.status,
        doctor : item.Doctor.fullName,
        costumerService: item.costumerService.fullName,
        symptoms : item.symptoms,
        diagnosis : item.diagnosis,
        medication : item.medication,
      })),
      dischargedcount : discharged.length,
      discharged: discharged.map((item) => ({
        id : item.id,
        fullName : item.fullName,
        gender : item.gender,
        age : item.age,
        status :  item.status,
        doctor : item.Doctor.fullName,
        costumerService: item.costumerService.fullName,
        symptoms : item.symptoms,
        diagnosis : item.diagnosis,
        medication : item.medication,
      }))
    });

  }catch(err){
    console.log(err)
    if(checkErr500(err, res)){
      return;
    }
  }
}

exports.search = async (req, res) => {
  try{
    const { search } = req.body
    const userQuery = new RegExp(`${search}`, "i");
    const searchResult = await Patient.find({fullName : userQuery})

    if (searchResult.length === 0) {
      res.status(400).json({message : 'Patient not found'})     
    }

    res.status(200).json({
      search: searchResult.map((item) => ({
        fullName : item.fullName,
        gender : item.gender,
        age : item.age,
        status :  item.status,
        doctor : item.Doctor,
        costumerService: item.costumerService
      }))
    })
  }catch(err){
    if(checkErr500(err, res)){
      return;
    }
  }
}

exports.docMap = async (req, res) =>{
  try{
    const { userId } = req.body

    const doctor = await User.findById(userId)
    const patients = doctor.patient

    const OPD = []
    const ICU = []
    const discharged = []
    
    if(!doctor){
      res.status(400).json({message : 'Doctor not fond'})
    }

    for (const id of patients) {
      const patient = await Patient.findById(id).populate({
        path: 'costumerService',
        select: 'fullName'
      }).populate({
        path: 'Doctor',
        select: 'fullName'
      });

      if (patient.status === 'OPD') {
        OPD.push(patient);
      }
      if (patient.status === 'ICU') {
        ICU.push(patient);
      }
      if (patient.status === 'discharged') {
        discharged.push(patient);
      }
    }

    res.status(200).json({
      OPDcount : OPD.length,
      OPD: OPD.map((item) => ({
        id : item.id,
        fullName : item.fullName,
        gender : item.gender,
        age : item.age,
        status :  item.status,
        doctor : item.Doctor.fullName,
        costumerService: item.costumerService.fullName,
        symptoms : item.symptoms,
        diagnosis : item.diagnosis,
        medication : item.medication,
      })),
      ICUcount : ICU.length,
      ICU: ICU.map((item) => ({
        id : item.id,
        fullName : item.fullName,
        gender : item.gender,
        age : item.age,
        status :  item.status,
        doctor : item.Doctor.fullName,
        costumerService: item.costumerService.fullName,
        symptoms : item.symptoms,
        diagnosis : item.diagnosis,
        medication : item.medication,
      })),
      dischargedcount : discharged.length,
      discharged: discharged.map((item) => ({
        id : item.id,
        fullName : item.fullName,
        gender : item.gender,
        age : item.age,
        status :  item.status,
        doctor : item.Doctor.fullName,
        costumerService: item.costumerService.fullName,
        symptoms : item.symptoms,
        diagnosis : item.diagnosis,
        medication : item.medication,
      }))
    });

  }catch(err){
    console.log(err)
    if(checkErr500(err, res)){
      return;
    }
  }
}

exports.addMedication = async (req, res) =>{
  try{
    const { status, symptoms, diagnosis, medication, patientId} = req.body
    
    const patient = await Patient.findById(patientId)
    if (!patient) {
      res.status(400).json({message : 'Patient not fond'})
    }
    if (patient) {
      patient.symptoms = symptoms
      patient.status = status
      patient.diagnosis = diagnosis
      patient.medication = medication

      await patient.save();
      res.status(200).json({message : 'Patient medication is added'})
    } 
  }catch(err){
    if(checkErr500(err, res)){
      return;
    }
  }
}

exports.viewPatient = async (req, res) =>{
  try{
    const { patientId } = req.body
    
    const patient = await Patient.findById(patientId)
    if (!patient) {
      res.status(400).json({message : 'Patient not fond'})
    }
    if (patient) {
      res.status(200).json({
        patient: {
          fullName : patient.fullName,
          age : patient.age,
          gender : patient.gender,
          status : patient.status,
          symptoms : patient.symptoms,
          diagnosis : patient.diagnosis,
          medication : patient.medication
        },
        message : 'patient found'
      })
    } 
  }catch(err){
    if(checkErr500(err, res)){
      return;
    }
  }
}

exports.discharge = async (req, res) => {
  try{
    const { patientId } = req.body
    const patient = await Patient.findById(patientId)

    if(!patient){
      res.status(400).json({ message : 'pateint not found'})
    }
    if (patient) {
      patient.status = 'discharged'
      const fullName = patient.fullName
      
      await patient.save();
      res.status(200).json({message : `${fullName} is discharged`})
    } 

  }catch(err){
    if(checkErr500(err, res)){
      return;
    }
  }
}

exports.registration = async (req, res) =>{
  try{
    const { googleId , fullName, role } = req.body
    const googleUser = await User.findOne({googleId : googleId})
    if(googleUser){
       googleUser.role = role
       const savedUser = await googleUser.save()
       res.status(200).json({ 
        user:{
          id : savedUser.id,
          fullName : savedUser.fullName,
          role : savedUser.role
        },
        message : 'Signup successful'})
    }

      
  }catch(err){
    if(checkErr500(err, res)){
      return;
    }
  }
}

exports.signOut = async (req, res)=>{
  try{
    req.session = null;
    res.clearCookie('session1', { path: '/' });
    res.send('Session destroyed and cookie cleared');
  }catch(err){
    console.log(err
      )
    if(checkErr500(err, res)){
      return;
    }
  }
}