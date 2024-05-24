// git add .
// git commit -m "message"
// git push
// git status
// clear

function get_tracks(){
    const urls = [
        "./transcriptions/books/B001/B001_C001_C004.json",
    ]
    let tracks = []
    for (const url of urls) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send();
        tracks = tracks.concat(JSON.parse(xhr.responseText));
    }
    return tracks
}

const FactoryAudio = function () {
    const tracks = get_tracks()
    let itracks = 0
    let audio = document.createElement('audio'); 
    let timeoutId_play;
    let timeoutId_pause;
    let promisePlay;
    let status = "PAUSED";

    update_title(itracks)

    function getStatus () {
        return status
    }

    function update_title(itracks) {
        const book_chapter = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0]
        const text = tracks[itracks]["tran"]
        document.querySelector("#title").innerHTML = `${book_chapter}`
        document.querySelector("#text").innerHTML = `${text}`
    }
    
    function play() {
        const playbackRate = 0.8
        // const additionalTimeintheloop = 500
        const audioFileFullPath = tracks[itracks]["audioFileFullPath"];
        // clearTimeout(timeoutId_pause);
        // clearTimeout(timeoutId_play);
        update_title(itracks);
        // WTF: 
        // If audio.scr is set after audio.currentTime, 
        // then audio.currentTime will be set to zero.
        audio.src = audioFileFullPath;
        audio.playbackRate = playbackRate;
        audio.pause();
        audio.loop = true;
        promisePlay = audio.play();
        status = "PLAYING";
        // timeoutId_pause = setTimeout(_ => {
        //     promisePlay.then(_ => {
        //         audio.pause();
        //     });
        // }, duration * 1000 * (1 / playbackRate))
        // timeoutId_play = setTimeout(_ => {
        //     play();
        // }, duration * 1000 * (1 / playbackRate) + additionalTimeintheloop);
        audio.onended = function() {
            // Code to be executed after the audio has finished playing
            console.log('Audio has finished playing');
            // Call another function here
            // anotherFunction();
        };
    }

    function pause_play() {
        console.log("PAUSE_PLAY")
        clearTimeout(timeoutId_pause);
        clearTimeout(timeoutId_play);
        if (status === "PLAYING") {
            promisePlay.then(_ => {
                audio.pause();
                status = "PAUSED";
            });
        } else {
            play();
        }
    }

    function playNext() {
        console.log("NEXT")
        itracks += 1;
        if (itracks === tracks.length) {
            itracks = 0
        };   
        play();
    }
    
    function nextTrack() {
        itracks += 1;
        if (itracks === tracks.length) {
            itracks = 0
        };
        play();
    }

    function previousTrack() {
        itracks -= 1;
        if (itracks < 0) {
            itracks = 0
        };
        play();
    }

    document.querySelector("#text").addEventListener("click", playNext)
    document.querySelector("#pause").addEventListener("click", pause_play)    
    document.querySelector("#book_up").addEventListener("click", nextTrack)
    document.querySelector("#book_down").addEventListener("click", previousTrack)
    document.querySelector("#chapter_up").addEventListener("click", nextTrack)
    document.querySelector("#chapter_down").addEventListener("click", previousTrack)
    document.querySelector("#sentence_up").addEventListener("click", nextTrack)
    document.querySelector("#sentence_down").addEventListener("click", previousTrack)

    document.onkeydown = function (event) {
        const callback = {
            "ArrowLeft"  : playPrevious,
            "ArrowRight" : playNext,
            "ArrowUp"    : previousTrack,
            "ArrowDown"  : nextTrack,
            "Enter"      : pause_play,
        }
        callback[event.key]()
    }
    
    return {audio, playPrevious, playNext, pause_play, play, getStatus, nextTrack, previousTrack, tracks, }
}

const mpa = FactoryAudio()