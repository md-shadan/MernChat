const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./Models/User");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const ws = require('ws');
dotenv.config();

// console.log(process.env.MONGO_URL);
// mongoose.connect(process.env.MONGO_URL , (err)=>{
//     if(err) throw err;
// });

try {
  const db = mongoose.connect(process.env.MONGO_URL);
  console.log("db connected");
} catch (e) {
  console.log("db not connected");
}
jwtSecret = process.env.JWT_SECRET;
const salt = bcrypt.genSaltSync(10);
 
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({ 
    credentials: true,
    origin: process.env.CLIENT_URL, 
  })
);

app.get("/test", (req, res) => {
  res.json("test ok"); 
});

app.get("/profile", (req,res)=>{
  const token = req.cookies?.token;
  // console.log(req.cookies);
  if(token){
    jwt.verify(token , jwtSecret ,{} , (err , userData)=>{
      if(err) throw err;
      
      res.json(userData);
    });
  }
  else{
    res.status(401).json("No token")
  }
})

app.post("/login", async (req,res)=>{
  const {username , password} = req.body;
  const foundUser = await User.findOne({username});
  // console.log(foundUser);
  if(foundUser){
    const crrtPassword = await bcrypt.compareSync(password , foundUser.password);
    if(crrtPassword){
      jwt.sign({userId:foundUser._id,username},jwtSecret , {},(err,token)=>{
        if(err) throw err;
        res.cookie("token",token).status(200).json({
          id:foundUser._id,
        })
      })
    }
  }

})

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hashSync(password,salt);
    const CreatedUser = await User.create({ username, password:hashedPassword });

    // ********** Another method ***********
    //    jwt.sign({Userid : UserCreated._id}, jwtSecret).then ((err , token)=>{
    //     if(err) throw err;
    //     res.cookie('token',token).status(201).json('token is generated');
    //    })

    jwt.sign({ userId: CreatedUser._id,username }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token,).status(201).json({
        id: CreatedUser._id,
       });
    });
    
  } catch (err) {
    if (err) throw err;
    res.status(500).json('error');
  }
});

const server = app.listen(4000);


const wss = new ws.WebSocketServer({server});
wss.on('connection',(connection,req)=>{
  console.log("ws is connected");
  // console.log(req.headers.cookie);
  
  // read the username and userId from the cookie for the connections
  const cookies = req.headers.cookie;
  if(cookies){

    const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
    if(tokenCookieString){
      const token = tokenCookieString.split('=')[1];
      if(token){
        jwt.verify(token,jwtSecret ,{},(err,userData)=>{
          const {username , userId} = userData;
          connection.username = username;
          connection.userId= userId;
        })
      }
    }
  } 
  
  connection.on('message', (message)=>{
    console.log(message.toString());
    const messageData = JSON.parse(message.toString());
    console.log(messageData.text);
    const {recipient , text} = messageData;
    if(recipient && text){
      [...clients]
        .filter(c => c.userId === recipient)  
        .forEach(c => c.send(JSON.stringify({text})));
    }

  }); 

// notify everyone about online people (when someone connects)  
  [...wss.clients].forEach(client => {
    client.send(JSON.stringify({
      online: [...wss.clients].map(c => ({ username: c.username, userId: c.userId }))
    }));
  });
});


