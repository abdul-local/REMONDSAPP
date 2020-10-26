const express=require('express');
const router=express.Router();
const auth=require('../../middleware/auth');
const {body,validationResult}= require('express-validator')
const Post = require('../../models/Posts');
const User=require('../../models/User');
const Profile=require('../../models/Profile')





// get all date dengan akseses private
router.get('/',auth,async(req,res)=>{
    try{
        const posts=await Post.find().sort({date:-1});
        if(!posts){

            return res.status(404).json({msg:'Post data not found'});
        }
        return res.json(posts);

    }catch(err){
        console.error(err);
        return res.status(500).send('Server Error');
    }
    

})
// post data akses prvat
router.post('/',[auth,[
    body('text','text is required').not().isEmpty()

]],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(402).json({errors:errors.array()});
    }

try{
    const user=await User.findById(req.user.id).select('-password');
    const newPost=new Post({
        text:req.body.text,
        user:req.user.id,
        name:user.name,
        avatar:user.avatar,

    });

    const posts =await newPost.save();
    return res.json(posts);


}catch(err){
    console.error(err);
    return res.status(500).send('Server Error');
}

})
// get single data berdasarkan id nya dengan akses private
router.get('/:id',auth,async(req,res)=>{

    try{
        const posts=await Post.findById(req.params.id);
        if(!posts){
            return res.status(400).json({msg:'data tidak ada'})
        }
        return res.json(posts);

    }catch(err){
        console.error(err.msg);
        if(err.kind=="ObejctId"){
            return res.status(404).json({msg:'data tidak ditemukan'})

        }
        return res.status(500).send('Server Error');
    }

})

// proses tu delet data berdasarkan id
router.delete('/:id',auth,async(req,res)=>{
    try{
        const posts=await Post.findById(req.params.id);
        if(!posts){
            return res.status(404).json({msg:'data tidak ditemukan'});
        }
        // validasi utk usernya id yang di imputkan
        // console.log(posts.user.toString());
        if(posts.user.toString()!== req.user.id){
            return res.status(404).json({msg:'tidak valid inputan'})
        }
        await posts.remove();
        return res.json({msg:'data berhasil di hapus'});

    }catch(err){
        console.error(err.msg);
        if(err.kind==="ObjectId"){
            return res.status(404).json({msg:'Data tidak ditemukan'});
        }
        return res.status(500).send('Server Error');
    }

})

module.exports=router;