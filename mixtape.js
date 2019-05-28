(function (window) {

    class DomElement {
        constructor($el, orientation){
            this.$el = $el;
            this.orientation = orientation;
        }

        setPosition(position){
            const ref = this.orientation === 'vertical' ? 'top' : 'left';
            this.$el.style[ref] = `${position}px`; 
        }

        getPosition(){
            return this.orientation === 'vertical' ? this.$el.offsetTop : this.$el.offsetLeft;
        }

        getInnerLength(){
            return this.orientation === 'vertical' ? this.$el.height : this.$el.width;
        }

        getVisibleLength(){
            return this.orientation === 'vertical' ? this.$el.offsetHeight : this.$el.offsetWidth;
        }

        getTotalLength(){
            return this.orientation === 'vertical' ? this.$el.scrollHeight : this.$el.scrollWidth;
        }

        getScroll(){
            return this.orientation === 'vertical' ? this.$el.scrollTop : this.$el.scrollLeft;
        }

    }
    
    class Song extends DomElement{
        constructor($el, orientation) {
            super($el, orientation);
        }

        inElementSpan(position) {
            return (this.getPosition() < position && position < this.getPosition() + this.getTotalLength());
        }
    }

    class Reader extends DomElement{
        constructor($el, orientation) {
            super($el, orientation);
            this.dir = 'next';
        }

        setPosition(position) {
            this.dir = position > this.getPosition() ? 'next' : 'previous';
            const ref = this.orientation === 'vertical' ? 'top' : 'left';
            this.$el.style[ref] = `${position}px`; 
        }
    }

    class Tape extends DomElement {
    }


    class MixTape {
        constructor({ $tape, $songs, $reader, nextCallBack, playCallBack, options = {} }) {
            this.options = { orientation: 'vertical', ...options };

            this.tape = new Tape($tape, this.options.orientation);
            this.reader = new Reader($reader, this.options.orientation);
            this.$songs = $songs;
            this.songs = [];

            this.nextCallBack = nextCallBack;
            this.playCallBack = playCallBack;

            // set reader position inside the parent

            this.calculateSongsPosition();
            this.currentSong = this.songs[0];
            this.defineCurrentSong();
            this.addEventListeners();
        }

        calculateSongsPosition() {
            for (let i = 0; i < this.$songs.length; i++) {
                // generate object with the position inside the parent
                const song = new Song(this.$songs[i], this.options.orientation);
                this.songs.push(song);
            }
        };

        /**
         * search into the list which element is current
         * if current element not the same 
         * change it and emit event/callback
         */
        defineCurrentSong() {
                let readerPosInsideTape = this.tape.getScroll()+ this.reader.getPosition();
                for (let i = 0; i < this.songs.length; i++) {
                    let song = this.songs[i];
                    if (song.inElementSpan(readerPosInsideTape) && this.currentSong !== song) {
                        this.currentSong = song;
                        if (typeof this.nextCallBack === 'function' && song.$el.dataset) {
                            this.nextCallBack(song.$el.dataset, this.reader.dir);
                        }
                    }
                }
        }

        addEventListeners() {
            // scroll action
            this.tape.$el.addEventListener("scroll", () => {
                // readerPos = (tape.scroll / (tape.totallength - tape.visiblelength) ) * tape.visibleLength
                var scroll = this.tape.getScroll();
                var maxScroll = this.tape.getTotalLength() - this.tape.getVisibleLength();

                const scrollPercent = scroll / maxScroll;
                const readerPosInWindow = (scrollPercent * this.tape.getVisibleLength() ) + this.tape.getPosition();

                // move reader according to parent scroll position
                this.reader.setPosition(readerPosInWindow);
                this.defineCurrentSong();

                // get reader song percentage
                const songPercent = (scroll + this.reader.getPosition() - this.currentSong.getPosition()) / this.currentSong.getVisibleLength();
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