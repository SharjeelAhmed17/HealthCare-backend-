const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var userSchema = new Schema({
    fullName : {
        type : String,
        unique : [true, 'User name exsist'],
        required: [true, 'User name is not provided']
    },

    googleId : {
        type : String,
    },

    email:{
        type : String,
        unique : [true, 'User name exsist'],
        trim : true,
        lowecase : true,
        // required: [true, 'User email is not provided'],
        validate: {
            validator: function (value) {
                return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(value);
            },
            message: 'is not a valid email address'
        }
    },
    role:{
        type : String,
        enum: ['costumerService', 'Doctor'],
        // required: [true, 'User role is not provided']
    },
    password: {
        type: String,
        // required:[true,'Please provide a password']
    },
    patient : [{type:Schema.Types.ObjectId, ref: 'Patient'}],

    created: {
        type: Date,
        default: Date.now
    }    
})


var patientSchema = new Schema({
    fullName : {
        type : String,
        unique : [true, 'User name exsist'],
        required: [true, 'User name is not provided']
    },

    gender : {
        type : String,
    },

    age : {
        type : Number,
    },

    status : {
        type : String,
        enum: ['OPD', 'ICU', 'discharged'],
    },

    symptoms : {
        type : String,
    },

    diagnosis : {
        type : String,
    },

    medication : {
        type : String
    },

    discharge_Date: {
        type: Date,
    },

    costumerService : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },

    Doctor : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },

    created: {
        type: Date,
        default: Date.now
    }
})



var User = mongoose.model('User', userSchema);
var Patient = mongoose.model('Patient', patientSchema);

module.exports = { User, Patient } 