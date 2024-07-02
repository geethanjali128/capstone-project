import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { deleteFun, insertPost, insertUser, likeFun, readPosts, readUser, shareFun } from './operations.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()


app.set('view engine', 'hbs')

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
dotenv.config()

app.use(cookieParser())


app.use(express.static(path.join(__dirname,"public")))




// mongoDb for booking application app,
mongoose.connect(process.env.MONGODB_URL,{useNewUrlParser:true,useUnifiedTopology:true})

// schemas
const screen1Model1=mongoose.model('screen1',{
     seatno:{type:Number},
    status:{type:String}
})

const screen2Model2=mongoose.model('screen2',{
    seatno:{type:Number},
    status:{type:String}
})

const screen3Model3=mongoose.model('screen3',{
   seatno:{type:Number},
    status:{type:String}
})

const moviesModel=mongoose.model('movies',{
     name:{type:String},                    
    rate:{type:Number},
    screenno:{type:Number}
})


var  screen1Res
screen1Model1.find()
.then(function (output){
    screen1Res=output
})
.catch(function (error){
    console.log(error)
})

var screen2Res
screen2Model2.find()
.then(function (output){
    screen2Res=output
})
.catch(function (error){
    console.log(error)
})

var screen3Res
screen3Model3.find()
.then(function (output){
    screen3Res=output
})
.catch(function (error){
    console.log(error)
})

let moviesRes
moviesModel.find()
.then(function (output){
    moviesRes=output
})
.catch(function (error){
    console.log(error)
})

app.get('/cinema',(req,res)=>{
    res.render("cinema",{
        movies:moviesRes,
        screen1:screen1Res,
        screen2:screen2Res,
        screen3:screen3Res
    })
})


// sql for social media app


// same user signup and login routes for movie booking
app.post('/login', async (req, res) => {
    const output = await readUser(req.body.profile)

    const password = output[0].password

    if (password == req.body.password) {
        const payload={"name":output[0].name,"profile":output[0].profile,"headline":output[0].headline}
      
        const secret=process.env.SECRET_KEY
        const token=jwt.sign(payload,secret)
       
        if(!token){
            res.send("token is not generated")
        }
        res.cookie("token",token)
        res.redirect("/posts")
    }
    else{
        res.send("invalid password")
    }
    

})

// middleware
function verifyLogin(req,res,next){
    const secret=process.env.SECRET_KEY
    const token=req.cookies.token
    jwt.verify(token,secret,(err,payload)=>{
        if(err) return res.sendStatus(403)
        req.payload=payload
    })
    next()

}



// checking user already existed or not with middleWare verifyLogin 
// before displaying posts
app.get('/posts',verifyLogin,async(req, res) => {
    const output= await readPosts()
    res.render("posts",{
        data:output,
        userInfo:req.payload
        
    })
   
})

// adding user into database
app.post('/addUser',async(req,res)=>{
    if(req.passowrd===req.cnfpassowrd){
        await insertUser(req.body.name,req.body.profile,req.body.passowrd,req.body.headline)
         res.redirect("/login")
       
    }
   else{
    res.send("passowrd and confirm password did not match")
   }
})






app.post('/like',async(req,res)=>{
    
    try{
    await likeFun(req.body.content)
    res.redirect('/posts')
    }
    catch(error){
       
        res.send("like error")
    }
  
})

app.post('/share',async(req,res)=>{
    try{
        await shareFun(req.body.content)
    res.redirect('/posts')
    }
    catch(error){
      
        res.send("share error")
    }
    
})

app.post('/delete',async(req,res)=>{
    console.log(req.body)
    try{
         await deleteFun(req.body.content)
    res.redirect('/posts')
    }
    catch(error){
        res.send("delete error")
    }
   
})


app.post('/addposts',async(req,res)=>{
    await insertPost(req.body.profile,req.body.content)
    res.redirect('/posts')
})

app.get('/',(req,res)=>{
    res.render("register")
})

app.get('/login', (req, res) => {
    res.render("login")
})


app.listen(process.env.PORT, () => {
    console.log("server is running......")
})