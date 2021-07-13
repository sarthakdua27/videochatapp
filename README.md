
# n-video conferencing website 
## Link to my website : 
<https://n-videoconferencing.herokuapp.com/>

- - - -
## Built with 
* [WebRTC](https://webrtc.org/)- Capture and optionally stream audio and/or video media, 
* [Node JS](https://nodejs.org/en/) - The Backend
* [Peer JS](https://peerjs.com/) - PeerJS simplifies WebRTC peer-to-peer data, video, and audio calls.
* [SocketIo](https://socket.io/) - For realtime communication
* [NPM](https://www.npmjs.com/) - Dependency Management
* [Heroku](https://id.heroku.com/login) - Used to Deploy Node.js applications
* [Express.js](https://expressjs.com/) - Open-source web application framework for Node.js. It is used for designing and building web applications quickly and easily.

## Getting started 
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites 
You have to install [Node JS](https://nodejs.org/en/) in your machine.

### Installing 
After installing node clone the repo by using git 

`https://github.com/Nandini-4120/videochatapp.git`

or you can download the zip file
Then open cmd or git bash on the project folder to install some modules that I used to build this project

Install Once

`npm install`

Nodemon For automatically restart the server as a dev dependency (optional)

`npm i --sav-dev nodemon`

### Running the app 
`node server.js`
- - - -

## Features
* Two or more users can connect with each other through video call and can have a conversation the same room.
* The users get connected using same meeting id which is unique for every room
* Users can mute and unmute their audio whenever required.
* Users can record their remote video and audio and save the recording instantly in their local laptops/computers.
* With the help of copy link to clipboard button,user can share the meeting id with another user in order to join the same room.
* Users can switch off their camera and turn it on whenever required.
* Users can chat with each other in the chat box section provided through a chat toggle button which opens and closes the chat box on clicking.
* The user can see the list of online participants in the meeting by clicking the participants toggle button. 
* User can leave the meeting room by clicking on the leave meeting icon.
