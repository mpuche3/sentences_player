// git add .
// git commit -m "message"
// git push
// git status
// clear

function get_tracks(){
    const urls = [
        "./transcriptions/books/B001/B001_C001_C004.json",
        "./transcriptions/books/B009/B009_C001_C009.json",
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

function get_maps_itracker(tracks){
    const map_book_itracker = {}
    const map_bookChapter_itracker = {}
    tracks.forEach((item, itracker) => {
        const path = item["audioFileFullPath"]
        const filename = path.split("/").slice(-1)[0].split("_")[0]
        const book = String(filename.slice(0, 4))
        const chapter = String(filename.slice(0, 8))
        const sentence = String(filename.slice(0, 12))
        map_book_itracker[book] = Math.min(
            map_book_itracker[book] ?? Number.MAX_SAFE_INTEGER,
            itracker
        )
        map_bookChapter_itracker[chapter] = Math.min(
            map_bookChapter_itracker[chapter] ?? Number.MAX_SAFE_INTEGER, 
            itracker
        )
    })
    return [
        map_book_itracker, 
        map_bookChapter_itracker, 
    ]
}

const FactoryAudio = function () {
    const tracks = get_tracks()
    const [
        map_book_itracker, 
        map_bookChapter_itracker, 
    ] = get_maps_itracker(tracks)

    let itracks = 0
    let audio = document.createElement('audio'); 
    let promisePlay;
    let status = "PAUSED";

    update_title(itracks)

    function update_title(itracks) {
        const book_chapter = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0]
        const text = tracks[itracks]["tran"]
        document.querySelector("#title").innerHTML = `${book_chapter}`
        document.querySelector("#text").innerHTML = `${text}`
    }

    function play() {
        const playbackRate = 0.8
        const audioFileFullPath = tracks[itracks]["audioFileFullPath"];
        update_title(itracks);
        audio.src = audioFileFullPath;
        audio.playbackRate = playbackRate;
        audio.pause();
        audio.loop = true;
        promisePlay = audio.play();
        status = "PLAYING";
    }

    function pause_play() {
        audio.pause();
    }

    function book_up(){
        let tmp = ""
        tmp = tracks[itracks]
        tmp = tmp["audioFileFullPath"]
        tmp = tmp.split("/")
        tmp = tmp.slice(-1)
        tmp = tmp[0]
        tmp = tmp.split("_")
        tmp = tmp[0]

        const book_chapter_sentence = tmp
        const book = book_chapter_sentence.slice(0, 4)
        const books = Object.keys(map_book_itracker)
        const iBook = books.indexOf(book)
        const new_ibook = iBook + 1  !== books.length
            ? iBook + 1
            : iBook
        const new_book = books[new_ibook]
        const new_itracks = map_book_itracker[new_book]
        itracks = new_itracks
        play()
    }

    function book_down(){
        const book_chapter_sentence = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0]
        const book = book_chapter_sentence.slice(0, 4)
        const books = Object.keys(map_book_itracker)
        const iBook = books.indexOf(book)
        const new_ibook = iBook - 1  !== -1
            ? iBook - 1
            : iBook
        const new_book = books[new_ibook]
        const new_itracks = map_book_itracker[new_book]
        itracks = new_itracks
        play()
    }

    function chapter_up(){
        const book_chapter_sentence = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0]
        const book_chapter = book_chapter_sentence.slice(0, 8)
        const bookChapters = Object.keys(map_bookChapter_itracker)
        const iBookChapter = bookChapters.indexOf(book_chapter)
        const new_iBookChapter= iBookChapter + 1  !== bookChapters.length
            ? iBookChapter + 1
            : iBookChapter
        const new_BookChapter = bookChapters[new_iBookChapter]
        const new_itracks = map_bookChapter_itracker[new_BookChapter]
        itracks = new_itracks
        play()
    }

    function chapter_down(){
        const book_chapter_sentence = tracks[itracks]["audioFileFullPath"].split("/").slice(-1)[0].split("_")[0]
        const book_chapter = book_chapter_sentence.slice(0, 8)
        const bookChapters = Object.keys(map_bookChapter_itracker)
        const iBookChapter = bookChapters.indexOf(book_chapter)
        const new_iBookChapter= iBookChapter - 1  !== -1
            ? iBookChapter - 1
            : iBookChapter
        const new_BookChapter = bookChapters[new_iBookChapter]
        const new_itracks = map_bookChapter_itracker[new_BookChapter]
        itracks = new_itracks
        play()
    }

    function play_next(){
        pause_play()
        itracks += 1;
        if (itracks === tracks.length) {
            itracks = 0
        };
        play();
    }

    function sentence_up(){
        pause_play()
        itracks += 1;
        if (itracks === tracks.length) {
            itracks = 0
        };
        play();
    }

    function sentence_down(){
        itracks -= 1;
        if (itracks < 0) {
            itracks = 0
        };
        play();
    }

    document.querySelector("#text").parentElement.addEventListener("click", sentence_up)
    document.querySelector("#pause").addEventListener("click", pause_play)    
    document.querySelector("#book_up").addEventListener("click", book_up)
    document.querySelector("#book_down").addEventListener("click", book_down)
    document.querySelector("#chapter_up").addEventListener("click", chapter_up)
    document.querySelector("#chapter_down").addEventListener("click", chapter_down)
    document.querySelector("#sentence_up").addEventListener("click", sentence_up)
    document.querySelector("#sentence_down").addEventListener("click", sentence_down)
    

    pause_play()


    return {
        audio, 
        tracks, 
        map_book_itracker, 
        map_bookChapter_itracker, 
    }
}

const mpa = FactoryAudio()