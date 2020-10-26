const jwt= require('jsonwebtoken');
const config=require('config');
module.exports=function(req,res,next){
    // get token dari header
    const token=req.header('x-auth-token');
    if(!token){
        return res.status(404).json({msg:'Anda tidak memiliki token'})
    }
    try{
        // proses verifikasi token
        const decoded=jwt.verify(token,config.get('jwtSecret'));
        req.user=decoded.user;
        next();

    }catch(err){
        res.status(401).json({msg:'Token anda tidak valid'})
    }
}