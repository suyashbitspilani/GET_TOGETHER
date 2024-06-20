const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const cors = require("cors");
dotenv.config();
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js")

connectDB();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 1234;

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const server= app.listen(1234, console.log(`Server is running on ${PORT}`)); 

const io= require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
        origin:"http://localhost:3000"
    }
})

io.on("connection", (socket)=>{

    socket.on("setup",(userData)=>{
        console.log(userData._id);
        socket.join(userData._id)
        socket.emit("connected")
    })

    socket.on("join chat",(room)=>{
        socket.join(room)
        console.log("user join room", room)
    })

    socket.on("typing", (room)=>socket.in(room).emit("typing"))
    socket.on("stop typing", (room)=>socket.in(room).emit("stop typing"))

    socket.on("new message",(newMessageReceived)=>{
        var chat= newMessageReceived.chat

        if(!chat.users) return console.log("chat.users not define");

        chat.users.forEach(user =>{
            if(user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived)
        })
    })

})
