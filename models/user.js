const mongoose = require('mongoose');
const booking = require('../models/booking');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    name: String ,
    usertype: String,
    phoneno: Number,

    //for mechanic
    servicetype: String,
    availability: String,
    address: String,
    bookings: String,
    status: {
        type:String,
        default:'checked'
    },

    //for booking 
    bookings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "booking"
        }
    ]
})

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User',userSchema);

module.exports = User;