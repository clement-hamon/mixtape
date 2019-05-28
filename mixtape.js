(function (window) {
    class Song {
        constructor(position, length, dataset) {
            this.position = parseInt(position);
            this.length = parseInt(length);
            this.dataset = dataset;
        }

        inElementSpan(startPosition) {
            return (this.position < startPosition && startPosition < this.position + this.length);
        }
    }

    class Reader {
        constructor(options = {}) {
            // @todo refactor with spread operator {...default, ...options}
            this.color = options.color ? options.color : "black";
            this.height = options.height ? options.height : 20;
            this.position = options.position ? options.position : 2;
            this.dir = 'next';
            this.$el = document.createElement("div");
            this.$el.style.width = 0;
            this.$el.style.height = 0;
            this.$el.style.transformOrigin = "center";
            this.$el.style.position = "absolute";
            this.$el.style.borderTop = `${this.height / 2}px solid transparent`;
            this.$el.style.borderRight = `${this.height}px solid ${this.color}`;
            this.$el.style.borderBottom = `${this.height / 2}px solid transparent`;
        }

        setOrientation(orientation){
            const rotation = orientation === "vertical" ? 0 : 90;
            this.$el.style.transform = `rotate(${rotation}deg)`;
        }

        setPosition(x, y) {
            this.$el.style.left = x;
            this.$el.style.top = y;
        }

        move(position) {
            this.dir = position > this.position ? 'next' : 'previous';
            this.position = position;
            //this.$el.style.top = `${this.position}px`;
        }
    }

    class DistCalculator {
        constructor(orientation){
            this.orientation = orientation;
        }

        setPosition($el, position){
            const ref = this.orientation === 'vertical' ? 'top' : 'left';
            $el.style[ref] = `${position}px`; 
        }

        getPosition($el){
            return this.orientation === 'vertical' ? $el.offsetTop : $el.offsetLeft;
        }

        getInnerLength($el){
            return this.orientation === 'vertical' ? $el.height : $el.width;
        }

        getVisibleLength($el){
            return this.orientation === 'vertical' ? $el.offsetHeight : $el.offsetWidth;
        }

        getTotalLength($el){
            return this.orientation === 'vertical' ? $el.scrollHeight : $el.scrollWidth;
        }

        getScroll($el){
            return this.orientation === 'vertical' ? $el.scrollTop : $el.scrollLeft;
        }


    }


    class MixTape {
        constructor({ tape, songs, nextCallBack, playCallBack, options = {} }) {
            this.tape = tape;
            this.songs = songs;
            this.nextCallBack = nextCallBack;
            this.playCallBack = playCallBack;
            this.options = { orientation: 'vertical', ...options };
            this.distCalculator = new DistCalculator(this.options.orientation);
            // generate the reader object
            this.reader = new Reader(this.options.reader);
            this.reader.setOrientation(this.options.orientation);
            // append reader to parent element
            this.tape.appendChild(this.reader.$el);

            this.reader.setPosition(0, 0);

            // set reader position inside the parent 
            this.playlist = [];
            this.currentElement = null;

            this.calculateSongsPosition();
            this.defineCurrentSong();
            this.addEventListeners();
        }

        calculateSongsPosition() {
            //reinitialize the list of element
            this.playlist = [];
            // for each elements
            for (let i = 0; i < this.songs.length; i++) {
                // generate object with the position inside the parent
                const $el = this.songs[i];

                //POSITION ===========> Reader position inside the container
                const song = new Song(this.distCalculator.getPosition($el), 
                                        this.distCalculator.getTotalLength($el), 
                                        $el.dataset);

                // push object into a list
                this.playlist.push(song);
            }
        };

        /**
         * search into the list which element is current
         * if current element not the same 
         * change it and emit event/callback
         */
        defineCurrentSong() {
            let readerPosInsideTape = this.distCalculator.getScroll(this.tape)+ this.reader.position;

            for (let i = 0; i < this.playlist.length; i++) {
                let song = this.playlist[i];
                if (song.inElementSpan(readerPosInsideTape) && this.currentSong !== song) {
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
                // readerPos = (tape.scroll / (tape.totallength - tape.visiblelength) ) * tape.visibleLength
                var scroll = this.distCalculator.getScroll(this.tape);
                var maxScroll = this.distCalculator.getTotalLength(this.tape) - this.distCalculator.getVisibleLength(this.tape);

                const scrollPercent = scroll / maxScroll;
                const readerPosInWindow = (scrollPercent * this.distCalculator.getVisibleLength(this.tape) ) + this.distCalculator.getPosition(this.tape);

                // move reader according to parent scroll position
                this.reader.move(readerPosInWindow);
                this.distCalculator.setPosition(this.reader.$el, readerPosInWindow);
                this.defineCurrentSong();

                // get reader song percentage
                const songPercent = (scroll + this.reader.position - this.currentSong.position) / this.currentSong.length;
                this.playCallBack(scrollPercent, songPercent);
            });
            // window resize
            window.addEventListener("resize", () => {
                this.calculateSongsPosition();
                this.defineCurrentSong();
                //@todo move reader 
            });
        }
    }
    window.MixTape = MixTape;
}(('undefined' !== typeof window) ? window : {}));