const express = require('express');
const app = express();
const server = require('http').Server(app);
const io=require('socket.io')(server);
const { v4:uuidv4} = require('uuid');
const {ExpressPeerServer } = require('peer');
const peerServer= ExpressPeerServer(server,{
   debug:true
})

app.set('view engine','ejs');
app.use(express.static('public'));

app.use('/peerjs',peerServer);
//redirect the root url 
app.get('/',(req,res) =>{
   res.redirect( `/${uuidv4()}` )
})



app.get('/:room',(req,res)=>{
   res.render('room', { UniqueRoomId: req.params.room });

})


io.on('connection',socket =>{

   socket.on('join-room',(UniqueRoomId,userId)=>{
      socket.join(UniqueRoomId);
      socket.broadcast.to(UniqueRoomId).emit('user-connected',userId);
      socket.on('message',message=>{     //sending the message here
         io.to(UniqueRoomId).emit('MsgCreation',message)
      })
   })

})


    
   



//tells the server it is local host and port is 3030
server.listen(3030);