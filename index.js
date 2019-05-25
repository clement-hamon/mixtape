const target = document.getElementById("target");

let mixTape = new MixTape(
    {
        tape: document.getElementById("tape"),
        songs: document.getElementsByClassName("songs"),
        nextCallBack: (dataset, dir) => {
            console.log(dataset, dir);
            target.style.backgroundImage = `url(${dataset.img})`;
        },
        playCallBack: (totalPercent, songPercent) => {
            console.log(totalPercent, songPercent);
        },
        options: {
            reader: {
                color: 'red'
            }
        }
    });