const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./Models/User");
const Message = require("./Models/Messaage");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const ws = require('ws');
const fs = require('fs');
dotenv.config();

// console.log(process.env.MONGO_URL);
// mongoose.connect(process.env.MONGO_URL , (err)=>{
//     if(err) throw err;
// });

try {
  const db =  mongoose.connect(process.env.MONGO_URL);
  console.log("db connected"); 
} catch (e) {
  console.log("db not connected");
}

// (async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log("db connected");
//   } catch (e) {
//     console.error("db not connected", e);
//   }
// })();

jwtSecret = process.env.JWT_SECRET;
const salt = bcrypt.genSaltSync(10);
 
const app = express();
app.use(express.json());
app.use('/upload',express.static(__dirname+'/upload/'))
app.use(cookieParser());
app.use(
  cors({ 
    credentials: true,
    origin: process.env.CLIENT_URL, 
  })
);
async function getUserDataFromRequst(req) {
  return new Promise((resolve,reject)=>{
    const token = req.cookies?.token;
    if(token){
      jwt.verify(token,jwtSecret,{},(err,userData)=>{
        if(err) throw err;
        resolve(userData);
      })
    } else{
      reject("no token");
    }
  })  
}

app.get("/test", (req, res) => {
  res.json("test ok"); 
});
  
app.get('/messages/:userId' ,async(req,res)=>{
  const {userId} = req.params;
  const userData = await getUserDataFromRequst(req);
  const ourUserId = userData.userId
  console.log({userId});
  console.log(ourUserId);
  console.log(req.params);
  const messages = await Message.find({
    sender:{$in:[userId ,ourUserId]},
    recipient:{$in:[userId ,ourUserId]}, 
  }).sort({CreatedAt:-1}).exec()
  res.json(messages);
})

app.get('/people' , async (req,res)=>{
  const users = await User.find({},{'_id':1 ,username:1});
  res.json(users);
})
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

});

app.post('/logout',(req,res)=>{
  res.cookie('token','').status(200).json("ok");
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

  function notifyAboutOnlinePeople(){
    [...wss.clients].forEach(client => {
      client.send(JSON.stringify({
        online: [...wss.clients].map(c => ({ username: c.username, userId: c.userId }))
      }));
    });
  }
  // console.log(connection);
  console.log("ws is connected");

  connection.isAlive = true;
 
  connection.timer = setInterval(()=>{
    connection.ping();
    connection.deathTimer = setTimeout(()=>{
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log('dead');
    },1000);
  },5000);

  connection.on('pong',()=>{
    clearTimeout(connection.deathTimer);
  });

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
  
  connection.on('message', async(message)=>{ 
    // console.log('msg');
    const messageData = JSON.parse(message.toString());
    // console.log(messageData.message.text);
    const {recipient , text,file} = messageData.message;
    let filename= null;
    if(file){
      const parts = file.name.split('.'); 
      const ext = parts[parts.length-1];
      filename = Date.now() + '.' + ext;
      const path = __dirname +'/upload/'+filename;
      const bufferData = Buffer.from(file.data.split(',')[1], 'base64');
      fs.writeFile(path,bufferData,()=>{
        console.log('file saved' + path);
      });
    }
    console.log(text);
    if(recipient && (text || file)){
      const messageDoc = await Message.create({
        sender : connection.userId,
        recipient,
        text,
        file: file? filename : null,
      }); 
      [...wss.clients]
        .filter(c => c.userId === recipient)  
        .forEach(c => c.send(JSON.stringify({
          text,
          file: file? filename :null,
          sender:connection.userId,
          recipient,
          _id:messageDoc._id,
        })));
    }

  }); 

// notify everyone about online people (when someone connects)  
notifyAboutOnlinePeople();
});


