const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bookingInfo = require('../models/booking');
const passport = require('passport');



//get register form
router.get('/user/register', (req,res)=>{
    res.render('auth/user_register');
})

//register user
router.post('/user/register', async(req,res)=>{
    try{
        let user = new User(
            { 
                username: req.body.username,
                email:    req.body.email,
                usertype: req.body.usertype,
                phoneno:  req.body.phoneno
            });
        await User.register(user, req.body.password);
        req.flash('success',`Registered Successfully`);
        res.redirect('/user/login');
    }
    catch(e){
        console.log(e.message);
        req.flash('error',`Failed to Register`);
        res.redirect('/user/register');
    }
})

// //get user login form
// router.get('/user/login', (req,res)=>{
//     res.render('auth/userLogin');
// })

//get user login form
router.get('/user/login', async(req,res)=>{
    if(!req.user){
        res.render('auth/userLogin');    }
    else{
        // req.flash('error','already loggedIn');
        const user = await req.user.usertype;
        if(user === 'User'){
            console.log(`USER - loggedIN as ${req.user.usertype}`);
            req.flash('error','already loggedIn');
            res.redirect('/user/dashboard');
        }else{
            console.log(`MECHANIC - loggedIN as ${req.user.usertype}`);
            req.flash('error','already loggedIn');
            res.redirect('/mechanic/dashboard');
        }
    }
})


//login user
router.post('/user/login', 
    passport.authenticate('local', 
                    {                        
                        failureRedirect: '/user/login',
                        failureFlash: true 
                    }
                    ),async(req,res)=>{
                        const user = await req.user.usertype;
                        if(user === 'user'){
                            // const book = await User.findById(req.user._id).populate({path:'bookings',model:bookingInfo});
                            console.log(`USER - loggedIN as ${req.user.usertype}`);
                            req.flash('success',`Welcome Back ${req.user.username}`);
                            // console.log(book);
                            res.redirect('/user/dashboard');
                        }else{
                            // const book = await User.findById(req.user._id).populate({path:'bookings',model:bookingInfo});
                            console.log(`MECHANIC - loggedIN as ${req.user.usertype}`);
                            req.flash('success',`Welcome Back ${req.user.username}`);
                            // console.log(book);
                            // for(let list of book.bookings){
                            //     console.log(list.location);
                            // }
                            
                            res.redirect('/mechanic/dashboard');
                        }
                        // req.flash('success',`Welcome Back ${req.user.username}`);

                    }
)


//cancel booking
router.get('/user/booking/:refid/cancel', async(req,res)=>{
    try{
        //set booking status to cancelled in user booking data
        await bookingInfo.findByIdAndUpdate(req.params.refid,{status:'cancelled'});

        //find ref_id of this mechanic book id from user book id 
        const bookId = await bookingInfo.findById(req.params.refid);
        const refId = bookId.ref_id;   
        // change mechanic booking status to cancelled in mechanic booking data
        await bookingInfo.findByIdAndUpdate(refId, {status:'cancelled'});
        req.flash('success','Booking Cancelled');
        res.redirect('/user/bookings');

    }catch(e){
        console.log(e.message);
        req.flash('error','Booking Cancellation Failed');
        res.redirect('/user/bookings');

    }
})

//remove booking 
router.get('/user/booking/:bookid/remove', async(req,res)=>{
    try{
        const currentUser = await User.findById(req.user._id);
        await currentUser.bookings.pull((`${req.params.bookid}`));
        await currentUser.save();
        //removing booking from centralized bookings collection
        await bookingInfo.findByIdAndDelete(req.params.bookid);
        req.flash('success','Booking cancelled');
        res.redirect('/user/bookings');
    }
    catch(e){
        console.log(e.message);
        req.flash('error','Unable to cancel booking');
        res.redirect('/user/bookings');
    }
})

module.exports = router;