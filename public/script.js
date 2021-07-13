
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
    mediaRecorder.onstop = function (e) { // overrides MediaRecorder object
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
        AddmetoOthers(obj); // as it is broadcasted
    })

    socket.on("leftthechat", function (obj) {
        Deletemefromonlinelist(obj.id);
    })

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
    let text = $('#chatting');


    $('html').keydown((e)=>{
        //13 is key for enter key , on pressing the message and name gets emitted
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


//chat toggle functionality
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

//participants toggle functionality
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


