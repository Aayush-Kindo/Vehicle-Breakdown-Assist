const isLoggedIn = async(req,res,next)=>{
    if(!req.isAuthenticated()){
        // req.flash('error','you need to login first.');
        return res.redirect('/user/login');
    }
    next();
}


module.exports = { isLoggedIn };
