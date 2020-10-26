const express=require('express')
const router=express.Router();
const {body,validationResult}=require('express-validator');// untuk validasi data
const gravatar=require('gravatar');// untuk gravatar
const bcrypt=require('bcryptjs');// untuk bcrypt passsword

const User=require('../../models/User');
const config=require('config');
const jwt=require('jsonwebtoken')


// kita gunakan untuk method post untuk testing ngirim data

router.post('/',
// untuk validasi data
[
    body('name','Nama harus di isi').not().isEmpty(),
    body('email','Isi dengan valid email').isEmail(),
    body('password','Isi minimal 6 atau lebih karakter').isLength({min:6})
],async(req,res)=>{
    
    // console.log(req.body);
    // cek validasi
   const erros=validationResult(req);
    if(!erros.isEmpty()){
        return res.status(400).send({erros:erros.array()})
    }
    // deklarasikan varibel
    const{name,email,password} =req.body;
    try{

        let user= await User.findOne({email});

        if(user){
            res.status(400).json({error:[
                {message:'Email sudah terdaptar'}
            ]})
        }
        // get user avatar
        const avatar=gravatar.url(email,{
            s:'200',// size
            r:'pg',//reading
            d:'mm'// default
        });
        // instansi object
          user=new User({
            name,
            email,
            password,
            avatar
        });
        // untuk bcrypt password
        const salt= await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(password,salt);
        await user.save();

        // untuk jwt token
        const payload={
            user:{id:user.id}
        };
        
       jwt.sign(payload,config.get('jwtSecret'),{expiresIn:36000},
        
        (err,token)=>{
            if(err)throw err;

            res.json({token})

        }
        )

        // res.send('Register User berhasil dilakukan');

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')

    }


});

module.exports=router;