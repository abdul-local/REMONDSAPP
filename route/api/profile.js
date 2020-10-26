const express=require('express')
const router=express.Router();
const User=require('../../models/User');
const Profile=require('../../models/Profile');
const auth =require('../../middleware/auth');
const {body,validationResult }=require('express-validator');
const request=require('request');
const config=require('config');



// get data profile berdasarkan user.id
router.get('/me', auth , async(req,res)=>{
    try{
        const profile= await Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({msg:'tidak ada profile untuk user ini'})
        }
        res.json(profile);

    }catch(err){
        return res.status(500).send('server error')
    }
    

})

// post data profile
router.post('/',[auth,[
    body('status','is required').not().isEmpty(),
    body('skills','is required').not().isEmpty()
]],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({msg:errors.array()})
    }
    // deklarasikan varibel
    const {
        company,
        website,
        location,
        status,
        skills,
        bio,
        githubusername,
        youtube,
        twitter,
        linkedin,
        instagram,
        facebook


    }=req.body;
    // build profile object
    const ProfileOfStudy={};
    ProfileOfStudy.user=req.user.id;

    if(company) ProfileOfStudy.company=company;
    if(website) ProfileOfStudy.website=website;
    if(location) ProfileOfStudy.location=location;
    if(bio) ProfileOfStudy.bio=bio;
    if(status) ProfileOfStudy.status=status;
    if(githubusername) ProfileOfStudy.githubusername=githubusername;
    if(skills) {ProfileOfStudy.skills=skills.split(',').map(skill=>skill.trim());

     } 
  
    // build social object
    const SocialofObject={};
    if(youtube) SocialofObject.youtube=youtube;
    if(twitter) SocialofObject.twitter=twitter;
    if(linkedin) SocialofObject.linkedin=linkedin;
    if(facebook) SocialofObject.facebook=facebook;
    if(instagram) SocialofObject.instagram=instagram;


    try{
        let profile = await Profile.findOne({user:req.user.id});
        if(profile){
            // melakukan proses update data
            profile= await Profile.findOneAndUpdate(
                { user:req.user.id},
                {$set:ProfileOfStudy},
                {new:true}
                );
            return res.json(profile);
        }
        // malkukan  create profile 
        profile=new Profile(ProfileOfStudy);
        await profile.save();
        return res.json(profile);


    }catch(err){
        console.error(err.msg);
    }


})

// get semua data profile
router.get('/',async(req,res)=>{

    try{
        const profiles=await Profile.find().populate('user',['name','avatar']);
        if(!profiles){
            return res.status(404).json({msg:'Profile data tidak ditemukan'});
        }
        return res.json(profiles);
    }catch(err){
        console.error(err.msg);
    }
})

// get Profile berdasarkan user_id nya
router.get('/user/:user_id',async(req,res)=>{

    try{

        const profile= await Profile.find({user:req.params.user_id}).populate('user',['name','avatar']);

        if(!profile){
            return res.status(404).json({msg:'data Profile tidak ditemukan'})
        }
        return res.json(profile);
    }catch(err){
      
        console.error(err.msg);

        if(err.kind =='ObjectId'){
            return res.status(400).json({msg:'Profile tidak ditemukan'})
        }
        return res.status(500).send('Server Error');
    }
    

})

// delete profile dan user
router.delete('/',auth,async(req,res)=>{
    try{
        // delete profile
        await Profile.findOneAndRemove({user:req.user.id});

        // delete user
        await Profile.findOneAndRemove({_id:req.user.id});

        return res.status(200).json({msg:'Data sudah berhasil di hapus'});

    }catch(err){
        console.error(err.msg);
        return res.status(500).send('Server Error');
    }


})
// Tambahakan data profile experience dengan method PUT
router.put('/experience',[auth,[
    body('title','title is required').not().isEmpty(),
    body('company','company is required').not().isEmpty(),
    body('from','From is required').not().isEmpty()

]],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    // destructuring assignment
    const {title,company,from,location,to,current,description}=req.body;

    //varibel yang akan di imputkan 
    const Expe={
        title,
        company,
        from,
        to,
        current,
        location,
        description
    };
    
    try{
        const profile = await Profile.findOneAndUpdate({user:req.user.id});
         profile.experience.unshift(Expe);
        await profile.save();
         res.json(profile);

    }catch(err){
        console.error(err.msg);
        return res.status(500).send('Server Error');
    }


});

// delete data Experience dengan akses private
router.delete('/experience/:exp_id',auth,async(req,res)=>{

    try{
    // get data berdasarkan id
    const profile=await Profile.findOne({user:req.user.id});
        // akses untuk experience
       const RemoveIndex= profile.experience.map(item=>item.id).indexOf(req.params.id);
        profile.experience.splice(RemoveIndex,1);
        await profile.save();
        return res.json(profile);
    }catch(err){
        console.error(err.msg);
        return res.status(500).json({msg:'Server Error'});
    }

});

// Put data education dengan akses private
router.put('/education',[auth,
// validasi data
[
    body('school','school is required').not().isEmpty(),
    body('degree','degree is required').not().isEmpty(),
    body('fieldofstudy','fieldofstudy is requires').not().isEmpty()

]],async(req,res)=>{

   const erros= validationResult(req);
   if(!erros.isEmpty()){
       return res.status(400).json({msg:erros.array()});
   }
   const {school,degree,fieldofstudy,from,current,description,to}=req.body;

   const newEdu={
       school,
       degree,
       fieldofstudy,
       from,
       current,
       description,
       to
   }
   try{
       const profile=await Profile.findOne({user:req.user.id});
        profile.education.unshift(newEdu);
        await profile.save();
        return res.json(profile);

   }catch(err){
       console.error(err.msg);
       return res.status(500).send('Server Error');
   }


})

// delete data education dengan akses private
 router.delete('/education/:edu_id',auth,async(req,res)=>{

     try{
         const profile= await Profile.findOne({user:req.user.id});

         const RemoveIndex=profile.education.map(item=>item.id).indexOf(req.params.id);
         // proses delete data dengan splice berdasarkan indexnya
          profile.education.splice(RemoveIndex,1);
         await profile.save();

         return res.status(200).json({msg:'Data education Berhasil di delte'});



     }catch(err){
         console.error(err);
         return res.status(500).send('Server Error');
     }

 })
 // get data untuk repository dengan akses private
 router.get('/github/:username',async(req,res)=>{
     try{
         const option={
             uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientID')}&client_secret=${config.get('githubSecretID')}`,
             method:'GET',
             headers:{'user-agent':'node.js'}
         }
         request(option,(error,response,body)=>{
             if(error) console.error(error);

             if(response.statusCode!==200){
                 return res.status(500).json({msg:'Tidak ada profile github'});
             }
             return res.json(JSON.parse(body));
         })

     }catch(err){
         console.error(err.msg);
         return res.status(500).json({msg:'Server Error'});
     }

 })



module.exports=router;