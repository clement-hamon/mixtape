const target = document.getElementById('target');
const counter = document.createElement('h2');
counter.className = 'counter';
counter.innerHTML = '0%';
target.appendChild(counter);

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
            counter.innerHTML = Math.floor(songPercent * 100) + '%';
        },
        options: {
            reader: {
                color: 'red'
            }
        }
    });