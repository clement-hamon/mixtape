class Song {
    constructor(position, length, dataset) {
        this.position = parseInt(position);
        this.length = parseInt(length);
        this.dataset = dataset;
    }

    inElementSpan(posY) {
        return (this.position < posY && posY < this.position + this.length);
    }
}

class Reader {
    constructor(options = {}) {
        // @todo refactor with spread operator ? {...default, ...options}
        this.color = options.color ? options.color : "black";
        this.height = options.height ? options.height :20;
        this.position = options.position ? options.position :2;
        this.dir = 'down';

        this.$el = document.createElement("div");
        this.$el.style.width = 0;
        this.$el.style.height = 0;
        this.$el.style.position = "absolute";
        this.$el.style.borderTop = `${this.height / 2}px solid transparent`;
        this.$el.style.borderRight = `${this.height}px solid ${this.color}`;
        this.$el.style.borderBottom = `${this.height / 2}px solid transparent`;
    }

    setPosition(x, y) {
        this.$el.style.left = x;
        this.$el.style.top = y;
    }

    move(position) {
        this.dir = position > this.position ? 'down' : 'up';
        this.position = position;
        this.$el.style.top = `${this.position}px`;

    }
}


class MixTape {
    constructor({ tape, songs, nextCallBack, playCallBack, options = {} }) {
        this.tape = tape;
        this.songs = songs;
        this.nextCallBack = nextCallBack;
        this.playCallBack = playCallBack;
        this.options = options;

        // generate the reader object
        this.reader = new Reader(options.reader);
        // append reader to parent element
        this.tape.appendChild(this.reader.$el);
        // set reader position inside the parent 
        // @todo not working
        this.reader.setPosition(this.tape.offsetWidth, 0);
        this.playlist = [];
        this.currentElement = null;

        this.calculateSongsPosition();
        this.defineCurrentElement();
        this.addEventListeners();
    }

    calculateSongsPosition() {
        //reinitialize the list of element
        this.playlist = [];
        // for each elements
        for (let i = 0; i < this.songs.length; i++) {
            // generate object with the position inside the parent
            const el = this.songs[i];
            const song = new Song(el.offsetTop, el.offsetHeight, el.dataset);
            // push object into a list
            this.playlist.push(song);
        }
    };

    /**
     * search into the list which element is current
     * if current element not the same 
     * change it and emit event/callback
     */
    defineCurrentElement() {
        let readerPos = this.tape.scrollTop + this.reader.position;
        for (let i = 0; i < this.playlist.length; i++) {
            let song = this.playlist[i];
            if (song.inElementSpan(readerPos) && this.currentSong !== song) {
                this.currentSong = song;
                if (typeof this.nextCallBack === 'function' && song.dataset) {
                    this.nextCallBack(song.dataset, this.reader.dir);
                }
            }
        }
    }

    addEventListeners() {
        // scroll action
        this.tape.addEventListener("scroll", () => {
            var a = this.tape.scrollTop;
            var b = this.tape.scrollHeight - this.tape.clientHeight;
            // move reader according to parent scroll position
            this.reader.move(a / b * this.tape.getBoundingClientRect().height);
            this.defineCurrentElement();

            // get reader tape percentage
            const totalPercent = this.reader.position / this.tape.offsetHeight;
            // get reader song percentage
            const songPercent = (this.tape.scrollTop + this.reader.position - this.currentSong.position) / this.currentSong.length;
            this.playCallBack(totalPercent, songPercent);
        });
        // window resize
        window.addEventListener("resize", () => {
            this.calculateSongsPosition();
            this.defineCurrentElement();
            //@todo move reader 
        });
    }
}

