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

// app.use('/peerjs',peerServer);
// //redirect the root url 
// app.get('/',(req,res) =>{
//    res.redirect( `/${uuidv4()}` )
// })

app.use('/peerjs', peerServer);
app.get('/', (req, res) => {
   res.redirect('/login');
   // res.redirect( `/${uuidv4()}` )
})
app.get('/login', (req, res) => {
   res.render('login');
})
app.get('/room', (req, res) => {
   // res.render('room');
   res.redirect(`/${uuidv4()}`)
})

app.get('/:room',(req,res)=>{
   res.render('room', { UniqueRoomId: req.params.room });

})

let onlinelist=[];
io.on('connection', socket => {

   socket.on("onuserconnected", function (username) {
      let userobj = { "id": socket.id, "username": username };
      onlinelist.push(userobj);
      // console.log(onlinelist);
      // update my online list with userlist
      socket.emit("updatemylist", onlinelist);
      //broadcast it to all other devices=> emit
      socket.broadcast.emit("joinedthechat",userobj);
   });

// io.on('connection',socket =>{
//    socket.on('join-room',(UniqueRoomId,userId)=>{
//       socket.join(UniqueRoomId);
//       socket.broadcast.to(UniqueRoomId).emit('user-connected',userId);
//       socket.on('disconnect', () => {
//          socket.broadcast.to(UniqueRoomId).emit('user-disconnected', userId)
//       })
//       socket.on('message',obj=>{     //sending the message here
//          io.to(UniqueRoomId).emit('MsgCreation',obj)
//       })
//       /*socket.on('message',message=>{     //sending the message here
//          io.to(UniqueRoomId).emit('MsgCreation',message)
//       })*/
//    })
//    /*socket.on("disconnect",function(){
//       //document.querySelector(`.${socket.id}`).remove();
//       socket.emit("remove",socket.id);*/
   

// })
socket.on('join-room', (UniqueRoomId, userId) => {
   socket.join(UniqueRoomId);
   socket.broadcast.to(UniqueRoomId).emit('user-connected', userId);
   socket.on('disconnect', () => {
      let userleft;
      let remaininguser = onlinelist.filter((obj) => {
         if (obj.id == socket.id) {
            userleft = obj;
         }
         return obj.id != socket.id;
      })
      onlinelist = remaininguser;
      socket.broadcast.emit("leftthechat", userleft);
      socket.broadcast.to(UniqueRoomId).emit('user-disconnected', userId)
   })
   socket.on('message', obj => {     //sending the message here
      io.to(UniqueRoomId).emit('MsgCreation', obj)
   })
   socket.on("chat",function(obj){
      socket.broadcast.emit("uploadleftmsg",obj);
  })
   /*socket.on('message',message=>{     //sending the message here
      io.to(UniqueRoomId).emit('MsgCreation',message)
   })*/
})
/*socket.on("disconnect",function(){
   //document.querySelector(`.${socket.id}`).remove();
   socket.emit("remove",socket.id);*/


})

    
   let port=process.env.PORT || 3030;



//tells the server it is local host and port is 3030
server.listen(port,function(){
   console.log("server has started")
});