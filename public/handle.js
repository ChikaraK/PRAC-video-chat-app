const socket = io("/");
const myPeer = new Peer();
const videoWrap = document.getElementById("video-wrap");
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
/**
 * loadmetadataイベントでmetadataが読み込まれるたびにvido.play関数を実行, 親要素にvideoタグを追加する
 * @param {Object} video HTMLMediaElement
 * @param {Object} stream MediaDevices
 * @return {void}
 */
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    videoWrap.append(video);
};

/**
 * 新しいユーザーのストリーム情報を取得・HTMLへ表示
 * @param {String} userId 
 * @param {Object} stream 
 * @return {void}
 */
const connectToNewUsers = (userId, stream) => {
    //受信者の情報を相手へ送信
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
        video.remove();
    });
    peers[userId] = call;
}

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then(stream => {
        addVideoStream(myVideo, stream);

        myPeer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", userVideoStream => {
                addVideoStream(video, userVideoStream);
            });
            const userId = call.peer;
            peers[userId] = call;
        });

        socket.on("user-connected", userId => {
            connectToNewUsers(userId, stream);
        });

        socket.on("user-disconnected", (userId) => {
            if(peers[userId]){
                peers[userId].close();
            } 
        });
    });

myPeer.on("open", (userId) => {
    socket.emit("join-room", ROOM_ID, userId);
});