const mongoose=require('mongoose');
const config=require('config');
const db=config.get('mongoURI');

// connect to db
const connectDB=async()=>{
    try{
        await mongoose.connect(db,{useNewUrlParser:true,useCreateIndex:true});
        console.log('sudah berhasil terhubung ke database')
    }catch(err){
        console.log(err.message);

        process.exit(1);

    }
}
// module export
module.exports=connectDB;