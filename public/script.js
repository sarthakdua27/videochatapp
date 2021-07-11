//const { text } = require("express");
let username=prompt("Please enter your Username");
document.querySelector(".user-name").textContent = username + "  (ME)";
const socket=io('/');
const VideoPanel=document.getElementById('video-panel');
const MyVideo= document.createElement('video');
let recordbtn = document.querySelector(".record-video");
let mediaRecorder; 
let RecordedMedia; // final media
let RecordingState=false;
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
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.onstop = function (e) { // overrides MediaRecorder ka object
        downloadVideo();
    }
    mediaRecorder.ondataavailable = function (e) {
        RecordedMedia = e.data;
    }
    recordbtn.addEventListener("click", function (e) {
        if (!RecordingState) {
            mediaRecorder.start();
            document.querySelector(".record-video-control").classList.add("record-animation");
        } else {
            mediaRecorder.stop();
            document.querySelector(".record-video-control").classList.remove("record-animation");
        }
        RecordingState = !RecordingState;
    })
    peer.on('call',call =>{
        //when user calls us we answer it and add it to the video stream
        call.answer(stream) //enter his(user) call
        const video=document.createElement('video')
        call.on('stream',userVideo =>{
            addVideo(video,userVideo) // add a video stream from him
        })
    })
    socket.emit("onuserconnected", username);
    socket.on("joinedthechat", function (obj) {
        //<div class="chat joined">Joined the chat</div>
        // let div = document.createElement("div");
        // div.classList.add("chat");
        // div.classList.add("joined");
        // div.textContent = `${obj.username} joined the chat`
        // chatwin.append(div);
        // chatwin.scrollTop=chatwin.scrollHeight;
        AddmetoOthers(obj); // as it is broadcasted
    })

    socket.on("leftthechat", function (obj) {
        // let div = document.createElement("div");
        // div.classList.add("chat");
        // div.classList.add("left-chat");
        // div.textContent = `${obj.username} left the chat`
        // chatwin.append(div);
        // chatwin.scrollTop=chatwin.scrollHeight;
        Deletemefromonlinelist(obj.id);
    })

    // socket.on("uploadleftmsg", function (obj) {
    //     // <div class="chat left-msg">Ji</div>
    //     let div = document.createElement("div");
    //     div.classList.add("chat");
    //     div.classList.add("left-msg");
    //     div.setAttribute("id",`${obj.id}`);
    //     div.textContent = `${obj.username}: ${obj.chat}`;
    //     chatwin.append(div);
    // })
    let ol = document.querySelector(".online-list");
    socket.on("updatemylist", function (list) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id != socket.id) {
                let div = document.createElement("div");
                div.classList.add("user");
                div.classList.add("flex");
                div.setAttribute("id", `${list[i].id}`);
                div.innerHTML =  `<div class="user-img flex"> 
                <img src="https://cdn4.iconfinder.com/data/icons/office-people-male-avatar/128/male-27-512.png" alt="">
             </div>
                <div class="user-name flex">${list[i].username}</div>
                `;
                ol.append(div);
            }
        }
    })

    function AddmetoOthers(obj) {
        let div = document.createElement("div");
        div.classList.add("user");
        div.classList.add("flex");
        div.setAttribute("id", obj.id);
        div.innerHTML = `<div class="user-img flex">
        <img src="https://cdn4.iconfinder.com/data/icons/office-people-male-avatar/128/male-27-512.png" alt="">
        </div>
        <div class="user-name flex">${obj.username}</div>
    `;
            
        ol.append(div);
    }
    function Deletemefromonlinelist(id) {
        document.querySelector(`#${id}`).remove();
    }

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
function downloadVideo() {
    let vidurl=URL.createObjectURL(RecordedMedia); //converts blob object to URL
    console.log("downloading");
    console.log(vidurl);
    let a=document.createElement("a");      // can only download on a tags therefore create an a tag
    a.href=vidurl;          // add url to its href
    a.download="video.mp4"; // set name of file

    a.click(); 
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
// function shareScreen() {
//     navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(stream => {
//         const screenTrack = stream.getTracks()[0];
//         senders.current.find(sender => sender.track.kind === 'video').replaceTrack(screenTrack);
//         screenTrack.onended = function() {
//             senders.current.find(sender => sender.track.kind === "video").replaceTrack(userStream.current.getTracks()[1]);
//         }
//     })
// }
let on=true;
let partc=document.querySelector(".part");
let list=document.querySelector(".left-side")
 
partc.addEventListener("click",(e)=>{
    if(on){
        list.classList.add("hide");
        on=false;
    }
    else{
        on=true;
        console.log(list.classList);
        list.classList.remove("hide");
    }
})
// document.querySelector(".roomlink").value=window.location.href;
// function copy() {
//     var copyText = document.querySelector("#input");
//     copyText.select();
//     document.execCommand("copy");
// }
// document.querySelector("#copy").addEventListener("click", copy);
function copy() {
    document.querySelector(".roomlink").value = window.location.href;
    var copyText = document.querySelector("#input");
    copyText.select();
    document.execCommand("copy");
}
document.querySelector("#copy").addEventListener("click", copy);



