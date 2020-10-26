const express=require('express')
const router=express.Router();
const auth=require('../../middleware/auth');
const {body,validationResult} =require('express-validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
// get dari model
const User=require('../../models/User');

const config=require('config');




// get data
router.get('/',auth,async(req,res)=>{
    try{
       const user= await User.findById(req.user.id).select('-password');
       return res.json(user);


    }catch(err){
        console.error(err.message);

    }

})
// login user
router.post('/',
// untuk rule dari inputan
[
    body('email','email harus valid').isEmail(),
    body('password','password harus valid').exists()
    
],async(req,res)=>{
    // cek validasi inputan
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    // deklarasikan varibael
    const {email,password}=req.body;

    try{
        const user= await User.findOne({email});
        if(!user){
            return res.status(400).json({msg:'user invalid'})
        }

        // compare password with by cript
       const isMatch= await bcrypt.compare(password,user.password);
       if(!isMatch){
           return res.status(400).json({msg:'password tidak valid'})
       }

       //return jsonwebtoken
       const payload={
           user:{
               id:user.id
           }
       }
       jwt.sign(payload,config.get('jwtSecret'),{expiresIn:3600},(err,token)=>{
           if(err)throw err;
           res.json(token);

       })


    }catch(err){
        console.error(err.message);

        res.status(500).send('Server error');

    }


})
module.exports=router;