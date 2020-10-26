const express=require('express')
const app=express();
const connectDB=require('./config/db')

// buatkan route
app.get('/',(req,res)=>{
    res.send('Api is works')
})
// connect DB
connectDB();

// tambahka untuk middleware
app.use(express.json({extended:false}));

// define sendiri untuk route
app.use('/api/users',require('./route/api/users'));
app.use('/api/profile',require('./route/api/profile'));
app.use('/api/posts',require('./route/api/posts'));
app.use('/api/auth',require('./route/api/auth'));

// nyalakan server
const PORT=process.env.PORT || 5000;
app.listen(5000,()=>{
    console.log(`Server running pada port ${PORT}`);
})