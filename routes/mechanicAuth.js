const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bookingInfo = require('../models/booking');
const passport=require('passport');


//get register form for mechanic
router.get('/mechanic/register', (req,res)=>{
    res.render('auth/mechanic_register');
})

//register user for mechanic
router.post('/mechanic/register', async(req,res)=>{
    try{
        const user = new User(
            { 
                username: req.body.username,
                email:          req.body.email,
                usertype:       req.body.usertype,
                phoneno:        req.body.phoneno,
                servicetype:    req.body.servicetype,
                availability:   req.body.availability,
                address:        req.body.address
            });
        await User.register(user, req.body.password);
        req.flash('success',`Registered Successfully`);
        res.redirect('/mechanic/login');
    }
    catch(e){
        console.log(e.message);
        req.flash('error',`Failed to Register`);
        res.redirect('/mechanic/mechanic_register');
    }
})

// //get mechanic login form
// router.get('/mechanic/login', (req,res)=>{
//     res.render('auth/mechanicLogin');
// })

//get mechanic login form
router.get('/mechanic/login', async(req,res)=>{
    if(!req.user){
        res.render('auth/mechanicLogin');    }
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

//login mechanic
router.post('/mechanic/login', 
    passport.authenticate('local', 
                    {                        
                        failureRedirect: '/mechanic/login',
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
                            //default availability set to on
                            // await User.findByIdAndUpdate(req.user._id, {status: 'checked'});
                            // console.log(book);
                            // for(let list of book.bookings){
                            //     console.log(list.location);
                            // }
                            
                            res.redirect('/mechanic/dashboard');
                        }
                        // req.flash('success',`Welcome Back ${req.user.username}`);

                    }
)

// //get login form for mechanic
// router.get('/mechanic/login', (req,res)=>{
//     if(!req.user){
//         res.render('auth/login');    }
//     else{
//         // req.flash('error','already loggedIn');
//         res.redirect('/mechanic/dashboard');
//     }
// })


// //login mechanic
// router.post('/mechanic/login', 
//     passport.authenticate('local', 
//                     {                        
//                         failureRedirect: '/mechanic/login',
//                         // failureFlash: true 
//                     }
//                     ),(req,res)=>{
//                         console.log(`MECHANIC - loggedIN as ${req.user.username}`);
//                         // req.flash('success',`Welcome Back ${req.user.username}`);
//                         res.redirect('/mechanic/dashboard');
//                     }
// )

// //logout user
// router.get('/mechanic/logout', (req,res)=>{
//     req.logout();
//     console.log('logged out successfully');
//     res.redirect('/mechanic/login');
// })

//accept user booking
router.get('/mechanic/booking/:refid/accept', async(req,res)=>{
    try{
        //change user booking status to accepted in user booking data
        await bookingInfo.findByIdAndUpdate(req.params.refid,{status:'accepted'});

        //find ref_id of this mechanic book id from user book id 
        const bookId = await bookingInfo.findById(req.params.refid);
        const refId = bookId.ref_id;   
        // change mechanic booking status to accepted in mechanic booking data
        await bookingInfo.findByIdAndUpdate(refId, {status:'accepted'});
        req.flash('success','Booking accepted');
        res.redirect('/mechanic/dashboard')
    }catch(e){
        console.log(e.message);
        req.flash('success','Cannot Accept Booking');
        res.redirect('/mechanic/dashboard')
    }
})

//cancel booking
router.get('/mechanic/booking/:refid/cancel', async(req,res)=>{
    try{
        //set booking status to cancelled in user booking data
        await bookingInfo.findByIdAndUpdate(req.params.refid,{status:'cancelled'});

        //find ref_id of this mechanic book id from user book id 
        const bookId = await bookingInfo.findById(req.params.refid);
        const refId = bookId.ref_id;   
        // change mechanic booking status to cancelled in mechanic booking data
        await bookingInfo.findByIdAndUpdate(refId, {status:'cancelled'});
        req.flash('success','Booking Cancelled');
        res.redirect('/mechanic/dashboard')

    }catch(e){
        console.log(e.message);
        req.flash('error','Booking Cancellation Failed');
        res.redirect('/mechanic/dashboard')

    }
})

//remove booking 
router.get('/mechanic/booking/:bookid/remove', async(req,res)=>{
    try{
        const currentUser = await User.findById(req.user._id);
        await currentUser.bookings.pull((`${req.params.bookid}`));
        await currentUser.save();
        //removing booking from centralized bookings collection
        await bookingInfo.findByIdAndDelete(req.params.bookid);
        req.flash('success','Deleted');
        res.redirect('/mechanic/dashboard')
    }
    catch(e){
        console.log(e.message);
        req.flash('error','Cannot Delete');
        res.redirect('/mechanic/dashboard')
    }
})

//get availability
router.post('/status', async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    // let check = req.body.status;
    const s1 = 'checked';
    const s2 = 'unchecked';

    if(currentUser.status !== s1){
        await User.findByIdAndUpdate(req.user._id, {status: s1});
    }else{
        await User.findByIdAndUpdate(req.user._id, {status: s2});
    }

    console.log(currentUser.status);
    res.redirect('/mechanic/dashboard')

    // const currentUser = await User.findById(req.user._id);
    // if(!usr.status){
    //     usr.insertOne({status:'on'})
    // }
    
    // const currentUser = await User.findByIdAndUpdate(req.user._id, {status: check});

    
})

module.exports = router;