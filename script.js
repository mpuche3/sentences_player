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

const FactoryAudio = function () {
    const playbackRate = 0.8
    const tracks = get_tracks()
    const audios = []
    let itracks = 0
    let isRepeat = false
    let playPromise
    let audio = document.createElement('audio'); 
    update_title(itracks)

    function update_title() {
        const book_chapter = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0]
        const text = tracks[itracks]["tran"]
        document.querySelector("#title").innerHTML = `${book_chapter}`
        document.querySelector("#text").innerHTML = `${text}`
    }

    function runAfterAudioEnded(event) {
        setTimeout(function () {
            if (isRepeat === false){
                itracks += 1
            }
            play()
        }, 500)
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

    function book_up(){
        const current_Book = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(0, 4)
        let next_itracks = itracks
        while (next_itracks < tracks.length - 1){
            next_itracks += 1
            const next_Book = tracks[next_itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(0, 4)
            const next_Chapter = tracks[next_itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(4, 8)
            const next_Sentence = tracks[next_itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(8, 12)
            if (current_Book !== next_Book && "S000" === next_Sentence && "C000" === next_Chapter){
                itracks = next_itracks
                play()
                return
            }
        }
    }

    function book_down(){
        const current_Book = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(0, 4)
        let loopCount = 0
        let next_itracks = itracks
        while (loopCount < 10000){
            loopCount += 1
            next_itracks -= 1
            if (next_itracks < 0) {return}
            const next_Book = tracks[next_itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(0, 4)
            const next_Chapter = tracks[next_itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(4, 8)
            const next_Sentence = tracks[next_itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(8, 12)
            if (current_Book !== next_Book && "S000" === next_Sentence && "C000" === next_Chapter){
                itracks = next_itracks
                play()
                return
            }
        }
    }

    function chapter_up(){
        const current_Book = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(0, 4)
        const current_Chapter = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(4, 8)
        let loopCount = 0
        let next_itracks = itracks
        while (loopCount < 1000){
            loopCount += 1
            next_itracks += 1
            const next_Book = tracks[next_itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(0, 4)
            const next_Chapter = tracks[next_itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(4, 8)
            if (current_Book !== next_Book){
                return
            }
            if (current_Chapter !== next_Chapter){
                itracks = next_itracks
                play()
                return
            }
        }
    }

    function chapter_down(){
        const current_Book = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(0, 4)
        const current_Chapter = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(4, 8)
        let loopCount = 0
        let next_itracks = itracks
        if (next_itracks < 0) {return}
        while (loopCount < 1000){
            loopCount += 1
            next_itracks -= 1
            const next_Book = tracks[next_itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(0, 4)
            const next_Chapter = tracks[next_itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(4, 8)
            const next_Sentence = tracks[next_itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0].slice(8, 12)
            if (current_Book !== next_Book){
                return
            }
            if (current_Chapter !== next_Chapter && "S000" === next_Sentence){
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
        if (this.innerHTML === "‖") {
            this.innerHTML = "▷";
            pause_play()
          } else {
            this.innerHTML = "‖";

            play()
          }
    }

    function toggleRepeat() {
        if (this.innerHTML === "↺") {
            this.innerHTML = "→";
            isRepeat = false
          } else {
            this.innerHTML = "↺";
            isRepeat = true
          }
    }

    
    document.querySelector("#title").addEventListener("click", toggleButtons)
    document.querySelector("#text").parentElement.addEventListener("click", function (){
        if (document.querySelector("#repeat").innerHTML === "↺"){
            sentence_up()
        } else {
            togglePlayPause()
        }
    })
    document.getElementById("pause").addEventListener("click", togglePlayPause);
    document.getElementById("repeat").addEventListener("click", toggleRepeat);
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') { 
            if (document.querySelector("#repeat").innerHTML === "↺"){
                sentence_up()
            } else {
                togglePlayPause()
            }
        }
    });

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
    pause_play()

    return {
        audio, 
        tracks, 
    }
}

const mpa = FactoryAudio()
