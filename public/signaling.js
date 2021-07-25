const socket = io("/");
const myPeer = new Peer();

myPeer.on("open", (userId) => {
    socket.emit("join-room", ROOM_ID, userId);
});


socket.on("user-connected", userId => {
    console.log("userId=",userId);
});