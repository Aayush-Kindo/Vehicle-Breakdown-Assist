const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');


const bookingSchema = new mongoose.Schema({

        //mechanic info 
        mechanic_id:String,
        mechanic_name: String,
        ref_id: String, //for updating status
        latitude: String,
        longitude: String,
        
        //user info
        user_id: String,
        user_name: String,

        //common
        location: String,
        bookedOn:{
                type: Date,
                default: Date.now
        },
        status: String
})


bookingSchema.plugin(passportLocalMongoose);
const Booking = new mongoose.model('Booking',bookingSchema);

module.exports = Booking;