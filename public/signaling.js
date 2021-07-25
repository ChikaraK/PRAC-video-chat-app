const socket = io("/");
const userId = 123456;

socket.emit("join-room", ROOM_ID, userId);

socket.on("user-connected", userId => {
    console.log("userId=",userId);
});