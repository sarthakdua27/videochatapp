//const { text } = require("express");
let username=prompt("add name");
const socket=io('/');
const VideoPanel=document.getElementById('video-panel');
const MyVideo= document.createElement('video');
MyVideo.muted=true;

var peer = new Peer( undefined,{
    path:'/peerjs',
    host:'/',   
    port:'443'
}); 
const peers = {}
let myOwnVideo
navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true

}).then(stream =>{
    myOwnVideo=stream;//my stream coming from here i.e the promise
    addVideo(MyVideo,stream);

    peer.on('call',call =>{
        //when user calls us we answer it and add it to the video stream
        call.answer(stream) //enter his(user) call
        const video=document.createElement('video')
        call.on('stream',userVideo =>{
            addVideo(video,userVideo) // add a video stream from him
        })
    })

    socket.on('user-connected',(userId)=>{
        connectToUser(userId,stream);     //user got connected... go to connectuser function 
    })
    socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close()
      })
    /*socket.on("remove",(id)=>{
        document.querySelector(`.${id}`).remove();
    })*/
    let text = $('input')



//$('html').keydown((e)=>{
    //13 is key for enter key
    //if(e.which==13 && text.val().length!==0){
        //socket.emit('message',text.val());
        //text.val('')
    //}
    $('html').keydown((e)=>{
        //13 is key for enter key
        if(e.which==13 && text.val().length!==0){
            socket.emit('message',{"user":username, "message":text.val()});
            text.val('')
    }
});

//got the message back - receiving end
socket.on('MsgCreation',(msg)=>{
    console.log(msg)
$('.messages').append(`<li class="message"><b>${msg.user}</b><br/>${msg.message}</li>`);
BottomScroll();
})

} )

peer.on('open',id=>{
    socket.emit('join-room', TheRoom_id,id);
})


const connectToUser =(userId,stream)=>{
const call=peer.call(userId,stream) // call user , send him my stream
const video=document.createElement('video');//creating new video element for him
//video.setAttribute("id",socket.id)
call.on('stream',userVideo =>{ //sending my own stream from here
    addVideo(video,userVideo) //add that video stream
})
call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
}



const addVideo =( video,stream) =>{
    video.srcObject=stream;
    video.addEventListener('loadedmetadata',() => {
        video.play();

    })
    VideoPanel.append(video);

}

const BottomScroll= () =>{
    let d=$('.master-chat');
    d.scrollTop(d.prop("scrollHeight"));

}

//switch on and off audio
const AudioOnandOff =()=>{
    
    const enabled=myOwnVideo.getAudioTracks()[0].enabled;
    if(enabled){
        myOwnVideo.getAudioTracks()[0].enabled=false;
        setAudioOn();
    }
    else{
       
        setAudioOff();
        myOwnVideo.getAudioTracks()[0].enabled=true;
    }
}

const setAudioOff=()=>{
    const html=` 
    <i class="fas fa-microphone"></i>
    <span>MUTE</span>`
    document.querySelector('.mute').innerHTML=html;

}

const setAudioOn=()=>{
    const html=`
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `
    document.querySelector('.mute').innerHTML=html;
}

//switch video on and off
const VideoOnandOff=()=>{
   
    let enabled=myOwnVideo.getVideoTracks()[0].enabled;
    if(enabled){
        myOwnVideo.getVideoTracks()[0].enabled=false;
        setVideoOn();
    }
    else{
        
        setVideoOff();
        myOwnVideo.getVideoTracks()[0].enabled=true;
    }

}

const setVideoOff=()=>{
    const html=`
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `
    document.querySelector('.videobutton').innerHTML=html;
}
const setVideoOn=()=>{
    const html=`
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `
    document.querySelector('.videobutton').innerHTML=html;
}


 //myOwnVideo.srcObject.getTracks().forEach(track => track.stop())
/*document.querySelector(".block").addEventListener("click",()=>{
   window.close()
    //myOwnVideo.srcObject.getTracks().forEach(track => track.stop())
})*/
$('#ChatToggle').on('click',function(e){
    document.querySelector(".master-left").style.flex=1;
    e.stopPropagation();
    $('#ChatContainer').toggle('slow');
    
});

$(document).on("click",function(){
    $('#ChatContainer').hide("slow");

    document.querySelector(".master-left").style.flex=0.8;
});

$('#ChatContainer').click(function(e){e.stopPropagation()}).hide();

// function screenshare(){
// let displayMediaOptions = { video: screen, audio: false };
//         navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
//             .then(function (stream) {
//                 video_el.srcObject = stream;
//             })
//             VideoPanel.append(video);
            
// }
function shareScreen() {
    navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(stream => {
        const screenTrack = stream.getTracks()[0];
        senders.current.find(sender => sender.track.kind === 'video').replaceTrack(screenTrack);
        screenTrack.onended = function() {
            senders.current.find(sender => sender.track.kind === "video").replaceTrack(userStream.current.getTracks()[1]);
        }
    })
}



