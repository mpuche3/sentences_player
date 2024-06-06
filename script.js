// git add .
// git commit -m "message"
// git push
// git status
// clear

function* enumerate(iterable) {
    let index = 0;
    for (const item of iterable) {
      yield [index, item];
      index++;
    }
}

function get_text(url){
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    text = xhr.responseText;
    return text
}

function get_tracks_from_json(url) {
    const text = get_text(url)
    const tracks = JSON.parse(text);
    return tracks
}

function get_tracks_from_text(url) {
    tracks = []
    const text = get_text(url)
    const sentences = text.replaceAll("\n\n", "\n").split("\n")
    let book = ""
    let chapter = ""
    let first_index_book = 0    
    for (const [index, sentence] of enumerate(sentences)){
        if (sentence.trim() !== ""){
            if(sentence.slice(0, 2) === "B0") {
                book = sentence.slice(0, 4)
                chapter = sentence.slice(4, 8)
                first_index_book = index              
            }
            const sentence_ = `S${Math.floor(index - first_index_book).toString().padStart(3, '0')}`
            const audioFileFullPath =  `./audio/books/${book}/${book}${chapter}${sentence_}_echo.mp3`
            const tran = sentence.slice(0, 2) === "B0"
                ? sentence.slice(10, undefined)
                : sentence
            tracks.push({
                "audioFileFullPath": audioFileFullPath,
                "tran": tran,
            })
        }
    }
    return tracks
}

function get_tracks(){
    const urls = [
        "./transcriptions/books/B001/B001_C001_C274.txt",
        "./transcriptions/books/B002/B002_C001_C130.txt",
        "./transcriptions/books/B009/B009_C001_C009.json",
        "./transcriptions/books/B009/B009_C010_C020.txt",
    ]
    let tracks = []
    for (const url of urls) {
        if (url.slice(-5, undefined) === ".json") {
            const new_tracks = get_tracks_from_json(url)
            tracks = tracks.concat(new_tracks)
        } else {
            const new_tracks = get_tracks_from_text(url)
            tracks = tracks.concat(new_tracks)
        }
    }
    return tracks
}

let wantFullScreenMode = true
document.addEventListener("click", enterFullscreenMode)
function enterFullscreenMode() {
    if (!document.fullscreenElement && wantFullScreenMode) {
        if (confirm('Do you want to enter fullscreen mode?')) {
            document.documentElement.requestFullscreen();
        } else {
            wantFullScreenMode = false
        }
    }
}

const FactoryAudio = function () {
    const playbackRate = 0.8
    const tracks = get_tracks()
    const audios = []
    let itracks = 0
    let isRepeat = false
    let audio = document.createElement('audio'); 
    update_title(itracks)

    function update_title() {
        const book_chaper = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0]
        const text = tracks[itracks]["tran"]
        document.querySelector("#title").innerHTML = `${book_chaper}`
        document.querySelector("#text").innerHTML = `${text}`
    }

    function runAfterAudioEnded() {
        setTimeout(function () {
            if (isRepeat === false){
                itracks += 1
            }
            play()
        }, 600)
    }

    function play(){
        update_title();
        const audioFileFullPath = tracks[itracks]["audioFileFullPath"];
        const audio = new Audio(audioFileFullPath);
        audio.playbackRate = playbackRate;
        audios.map(audio => {
            audio.pause();
        })
        document.querySelector("#pause").innerHTML = "‖"
        audio.play()
        audios.push(audio)
        audio.addEventListener("ended", runAfterAudioEnded)
    }

    function pause_play() {
        document.querySelector("#pause").innerHTML = "▷"
        audios.map(audio => {
            audio.pause();
        })
    }

    function getBook(itracks){
        const book = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(0, 4)
        return book
    }

    function getChapter(itracks){
        const chapter = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(4, 8)
        return chapter
    }

    function getSentence(itracks){
        const sentence = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(8, 12)
        return sentence
    }

    function book_up(){
        const current_book = getBook(itracks)
        let next_itracks = itracks
        while (next_itracks < tracks.length - 1){
            next_itracks += 1
            const next_book = getBook(next_itracks)
            const next_chaper = getChapter(next_itracks)
            const next_sentence = getSentence(next_itracks)
            if (current_book !== next_book && "S000" === next_sentence && "C000" === next_chaper){
                itracks = next_itracks
                play()
                return
            }
        }
    }

    function book_down(){
        const current_book = getBook(itracks)
        let next_itracks = itracks
        while (0 < next_itracks){
            next_itracks -= 1
            const next_book = getBook(next_itracks)
            const next_chaper = getChapter(next_itracks)
            const next_sentence = getSentence(next_itracks)
            if (current_book !== next_book && "S000" === next_sentence && "C000" === next_chaper){
                itracks = next_itracks
                play()
                return
            }
        }
    }

    function chapter_up(){
        const current_book = getBook(itracks)
        const current_chaper = getChapter(itracks)
        let next_itracks = itracks
        while (itracks < tracks.length - 1){
            next_itracks += 1
            const next_book = getBook(next_itracks)
            const next_chaper = getChapter(next_itracks)
            if (current_book !== next_book){
                return
            }
            if (current_chaper !== next_chaper){
                itracks = next_itracks
                play()
                return
            }
        }
    }

    function chapter_down(){
        const current_book = getBook(itracks)
        const current_chaper = getChapter(itracks)
        let next_itracks = itracks
        while (0 < next_itracks){
            next_itracks -= 1
            const next_book = getBook(next_itracks)
            const next_chaper = getChapter(next_itracks)
            const next_sentence = getSentence(next_itracks)
            if (current_book !== next_book){
                return
            }
            if (current_chaper !== next_chaper && "S000" === next_sentence){
                itracks = next_itracks
                play()
                return
            }
        }
    }

    function sentence_up(){
        itracks += 1;
        if (itracks === tracks.length) {
            itracks = tracks.length - 1
        } else {
           play(); 
        };
    }

    function sentence_down(){
        itracks -= 1;
        if (itracks < 0) {
            itracks = 0
        } else {
            play();
        };
    }

    function toggleButtons(event) {
        event.stopPropagation()
        var element = document.getElementById('UpDownButtons');
        if (element.style.display === 'none') {
            element.style.display = 'flex';
        } else {
            element.style.display = 'none';
        }
    }

    function togglePlayPause() {
        const element = document.getElementById("pause")
        if (element.innerHTML === "‖") {
            element.innerHTML = "▷";
            pause_play()
          } else {
            element.innerHTML = "‖";
            play()
          }
    }

    function toggleRepeat() {
        const element = document.getElementById("repeat")
        if (element.innerHTML === "↺") {
            element.innerHTML = "→";
            isRepeat = false
        } else {
            element.innerHTML = "↺";
            isRepeat = true
        }
    }

    function clickTextorEnter() {
        if (document.querySelector("#repeat").innerHTML === "↺"){
            sentence_up()
        } else {
            togglePlayPause()
        }
    }
    


    document.querySelector("#title").addEventListener("click", toggleButtons)
    document.querySelector("#text").parentElement.addEventListener("click", clickTextorEnter)
    document.getElementById("pause").addEventListener("click", togglePlayPause);
    document.getElementById("repeat").addEventListener("click", toggleRepeat);
    document.addEventListener('keydown', clickTextorEnter);

    function navegation_functionality(elementId, func){
        let startTime = 0;
        document.querySelector(`#${elementId}`).addEventListener("click", event => {
            func()
            if (startTime === 0) {
                startTime = new Date().getTime();
            } else {
                const endTime = new Date().getTime();
                const timeDiff = endTime - startTime;
                let repeat = 0
                if (timeDiff < 150) {repeat = 19}
                if (timeDiff < 250) {repeat = 9}
                const range = Array.from({ length: repeat })
                for (const _ of range) {
                    func()
                }
                startTime  = endTime
            }
        })
    }

    navegation_functionality("book_up", book_up)
    navegation_functionality("book_down", book_down)
    navegation_functionality("chapter_up", chapter_up)
    navegation_functionality("chapter_down", chapter_down)
    navegation_functionality("sentence_up", sentence_up)
    navegation_functionality("sentence_down", sentence_down)

    window.addEventListener('resize', () => {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
      if (screenWidth > screenHeight * 1.6) {
        document.querySelector('#title').style.display = 'none';
      } else {
        document.querySelector('#title').style.display = 'flex';
      }
    });

    pause_play()
    return {
        audio, 
        tracks, 
    }
}

const mpa = FactoryAudio()