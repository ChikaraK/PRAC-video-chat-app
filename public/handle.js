const socket = io("/");
const myPeer = new Peer();
const videoWrap = document.getElementById("video-wrap");
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
let myVideoStream;

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
        myVideoStream = stream;
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
myPeer.on("disconnected", (userId) => {
    console.log("disconnected=", userId);
});

/**
 * ミュートの切り替え
 * @param {Object} e 
 */
const muteUnmute = (e) => {
    console.log(typeof(e));
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        e.classList.add("active");
        myVideoStream.getAudioTracks()[0].enabled = false;
    } else {
        e.classList.remove("active");
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

/**
 * ビデオの表示切り替え
 * @param {Object} e 
 */
 const playStop = (e) => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        e.classList.add("active");
        myVideoStream.getVideoTracks()[0].enabled = false;
    } else {
        e.classList.remove("active");
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

/**
 * 通話終了
 * @param {Object} e 
 */
const leaveRoom = (e) => {
    socket.disconnect();
    myPeer.disconnect();
    const videos = document.getElementsByTagName("video");
    for (let i = videos.length -1; i >= 0; --i){
        videos[i].remove();
    }
}