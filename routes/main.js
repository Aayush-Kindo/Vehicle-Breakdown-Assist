const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bookingInfo = require('../models/booking');
const passport = require('passport');


//landing page
router.get('/', (req,res)=>{
    res.render('main/index');
})

//get user dashboard for user
router.get('/user/dashboard', async(req,res)=>{
    // const data = await User.find({});
    // console.log(data);
    res.render('main/userDashboard');
})

//get user dashboard for mechanic
router.get('/mechanic/dashboard', async(req,res)=>{
    // const user = await req.user.req.user._id;
    // const book = await User.findById(req.user._id).populate({path:'bookings',model:bookingInfo});
    const data = await User.findById(req.user._id).populate({path:'bookings',model:bookingInfo});
    console.log(data.bookings);
    res.render('main/mechanicDashboard',{data});
}) 

//get My Account for rider and mechanic
router.get('/:usertype/account', (req,res)=>{
    res.render('main/myAccount');
})

//fetch mechanic on search
router.post('/user/dashboard', async(req,res)=>{
    // const found = req.body.usertype;
    const location = req.body.location;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    const foundMechanic = await User.find({usertype:'mechanic',status:'checked',address:`${location}`});
    console.log(foundMechanic);
    console.log(latitude);
    console.log(longitude);
    res.render('main/userDashboard',{list:foundMechanic,location,latitude,longitude});
})

//book mechanic
router.post('/mechanic/:mechanicId/:userId/:loc/:latitude/:longitude/booking', async(req,res)=>{
    try{
        //find user and mechanic
    const mechanicAcc = await User.findById(req.params.mechanicId);
    const userAcc = await User.findById(req.params.userId);
    
    //create new booking for user by saving mechanic id and location
    const userBook = new bookingInfo({
        mechanic_id: req.params.mechanicId,
        mechanic_name: mechanicAcc.username,
        location: req.params.loc,
        //setting user booking status to pending
        status: 'pending',
    });
    userAcc.bookings.push(userBook);
    await userBook.save();
    await userAcc.save();
    // console.log("book id is ");
    // console.log(userBook._id);
    //sending booking information to mechanic by saving user id and its location
    const mechanicBook = new bookingInfo({
        user_id:req.params.userId,
        user_name: userAcc.username,
        ref_id: userBook._id, //ref_id of user
        location: req.params.loc,
        //latitude and longitude
        latitude: req.params.latitude,
        longitude: req.params.longitude,
        //setting mechanic booking status to pending
        status: 'pending'
    })
    mechanicAcc.bookings.push(mechanicBook);
    await mechanicBook.save();
    await mechanicAcc.save();
    
    //inserting ref_id of mechanic in user
    await bookingInfo.findByIdAndUpdate(userBook._id,{ref_id: mechanicBook._id});

    req.flash('success',`${mechanicAcc.username} booked successfully`)
    res.redirect('/user/dashboard');
    console.log('booked successfully');

    }catch(e){
        req.flash('error','Booking Failed');
        res.redirect('/user/dashboard');
    }
    
})

//get bookings information made by user
router.get('/user/bookings', async(req,res)=>{
    const data = await User.findById(req.user._id).populate({path:'bookings',model:bookingInfo});
    res.render('main/showBookings',{data});
})

// //go to mechanic search results page
// router.get('/user/dashboard/searchResults', (req,res)=>{
//     res.render('main/searchResults');
// })


//logout user
router.get('/logout', async(req,res)=>{
    try{
        const user = await req.user.usertype;
        req.logout();
        if(user=='user'){
            req.flash('success','logged Out successfully')
            res.redirect('/user/login');
            console.log('logged out successfully');
        }else{
            req.flash('success','logged Out successfully')
            res.redirect('/mechanic/login');
            console.log('logged out successfully');
        }
    }catch(e){
        req.flash('error','already logged out');
        res.redirect('/');
    }
    
})

//error Page
router.get('/error',(req,res)=>{
    res.render('error');
})

//test route
router.get('/registerU', (req,res)=>{
    res.render('changes/user_register');
})
router.get('/registerM', (req,res)=>{
    res.render('changes/mechanic_register');
})



module.exports = router;