window.onload = function () {
    document.getElementById("logoutBtn").onclick = logout;
    fetchAllSongs();
    init();
}

function init() {
    document.getElementById("username").innerText =
        sessionStorage.getItem("username");
}

function logout() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("token");
    location.href = "index.html";
}
let musicList;
async function fetchAllSongs() {
    let result = await fetch("http://localhost:3000/api/music", {
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
    })
    let song = await result.json();
    musicList = song;
    console.log(musicList);
    printAllSongs(song);
};


//Display all songs
//=================================================================================================================//
function printAllSongs(list) {
    for (let each of list) {
        fetch(`http://localhost:3000/${each.urlPath}`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        }).then((songs) => {

            let myTable = `
          <tr>
          <td><a href="${songs.url}">${each.title}</a><br></td>
          <td><button class="addBtn" id=${each.id} onclick="addToFavorites('${each.id}')">+</button></td>
          </tr>
         `;
            document.getElementById("playlist").innerHTML += myTable;
        });
    }
}




//Add to favorite list
//=================================================================================================================//
let myFavoriteMusicList = [];

let index = 0;
function addToFavorites(id) {
    for (let each of musicList) {
        if (each.id == id) {
            if (myFavoriteMusicList.includes(each)) {
                continue;
            } else {
                myFavoriteMusicList.push(each);
                fetch(`http://localhost:3000/${each.urlPath}`, {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }).then((music) => {
                    let id = each.id;
                    let title = each.title;
                    let url = music.url;
                    let myFavoriteTable = `
            <tr id=${each.id}>
                <td><a href="${music.url}">${each.title}</a><br></td>
                <td><button class="addBtn" id=${each.id} onclick="removeToFavorites('${each.id}')">Remove</button></td>
                <td> <button class="addBtn" onclick="playMusic('${music.url}','${each.title}','${index}')">play</button></td>
            </tr>
          `;
                    //========================================================================================//
                    fetch(`http://localhost:3000/${each.urlPath}`, {
                        method: "POST",
                        body: JSON.stringify({
                            id,
                            title,
                            url,
                        }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                    // .then((response) => response.json())
                    // .then((item) => {
                    //   print.innerHTML += `
                    //         id:  ${item.id} <br> 
                    //         name: ${item.title} <br> 
                    //         price: ${item.price} <br>
                    //         description: ${item.description}<br> ==========================<br>`;
                    // })
                    //=======================================================================================//
                    index++;

                    document.getElementById("favorites").innerHTML += myFavoriteTable;
                });
            }
        }
    }
}

let playingMusicIndex = null;

async function playMusic(music, title, id) {
    document.getElementById("musicTitle").innerHTML = title;
    document.getElementById("play").src = music;
    playingMusicIndex = id;

    let arr = [];
    for (let each of myFavoriteMusicList) {
        let myPlayList = await fetch(`http://localhost:3000/${each.urlPath}`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        });
        arr.push(myPlayList.url);
    }

    let audio = document.getElementById("play");
    audio.onended = () => {
        playingMusicIndex++;
        if (playingMusicIndex >= arr.length) {
            playingMusicIndex = 0;
        }
        audio.src = arr[playingMusicIndex];
        document.getElementById("musicTitle").innerHTML =
            musicList[playingMusicIndex].title;
    };
    console.log(myFavoriteMusicList);
}

//Remove from list
//=================================================================================================================//
function removeToFavorites(id) {
    myFavoriteMusicList = myFavoriteMusicList.filter((myFav) => myFav.id != id);
    document.getElementById(id);
    document.getElementById("favorites");
    createTable(myFavoriteMusicList);
}

function createTable(property) {
    document.getElementById("favorites").innerHTML = `
          <tr>
              <th>Favorites Song</th>
              <th>remove from list</th>
              <th>play</th>
          </tr>
    `;

    for (let each of property) {
        fetch(`http://localhost:3000/${each.urlPath}`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        }).then((music) => {
            let myFavoriteTable = `
            <tr id=${each.id}>
                <td><a href="${music.url}">${each.title}</a><br></td>
                <td><button class="addBtn" id=${each.id} onclick="removeToFavorites('${each.id}')">Remove</button></td>
                <td> <button class="addBtn" onclick="playMusic('${music.url}','${each.title}')">play</button></td>
            </tr>
          `;
            document.getElementById("favorites").innerHTML += myFavoriteTable;
        });
    }
}

//Play Next
//=================================================================================================================//

let next = document.getElementById("next");

next.onclick = async function () {
    let nextMusic = playingMusicIndex;
    if (myFavoriteMusicList.length != 0) {
        if (nextMusic > myFavoriteMusicList.length - 1) {
            nextMusic = 0;
        } else {
            nextMusic++;
            if (nextMusic > myFavoriteMusicList.length - 1) {
                nextMusic = 0;
            }
        }
        let nextPlay = await fetch(
            `http://localhost:3000/${myFavoriteMusicList[nextMusic].urlPath}`,
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            }
        );
        document.getElementById("musicTitle").innerHTML = "";
        document.getElementById("play").src = "";

        document.getElementById("musicTitle").innerHTML =
            myFavoriteMusicList[nextMusic].title;
        document.getElementById("play").src = nextPlay.url;
        playingMusicIndex = nextMusic;
    }
};

//Play previous
//=================================================================================================================//
let previous = document.getElementById("priv");

previous.onclick = async function () {
    let playPriv = playingMusicIndex;

    if (myFavoriteMusicList.length != 0) {
        if (playingMusicIndex == 0) {
            playPriv = myFavoriteMusicList.length - 1;
        } else {
            playPriv--;
            if (playPriv < 0) {
                playPriv = myFavoriteMusicList.length - 1;
            }
        }
        let nextPlay = await fetch(
            `http://localhost:3000/${myFavoriteMusicList[playPriv].urlPath}`,
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            }
        );

        document.getElementById("musicTitle").innerHTML = "";
        document.getElementById("play").src = "";

        document.getElementById("musicTitle").innerHTML =
            myFavoriteMusicList[playPriv].title;
        document.getElementById("play").src = nextPlay.url;
        playingMusicIndex = playPriv;
    }
};

//shuffle
//=================================================================================================================//
let repeat = document.getElementById("repeat");
let shuffle = document.getElementById("shuffle");

shuffle.onclick = async function () {
    shuffle.style.display = "none";
    repeat.style.display = "block";

    let arr = [];
    for (let each of myFavoriteMusicList) {
        let me = await fetch(`http://localhost:3000/${each.urlPath}`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        });
        arr.push(me.url);
    }

    let audio = document.getElementById("play");

    audio.onended = () => {
        playingMusicIndex++;
        if (playingMusicIndex >= arr.length) {
            playingMusicIndex = 0;
        }

        let randNum = parseInt(Math.random() * myFavoriteMusicList.length);

        if (randNum == playingMusicIndex) {
            let newRand = parseInt((Math.random() + 1) * myFavoriteMusicList.length);
            if (newRand > myFavoriteMusicList.length - 1) {
                randNum = newRand - 1;
            }
        } else {
            playingMusicIndex = randNum;
            audio.src = arr[playingMusicIndex];
            document.getElementById("musicTitle").innerHTML =
                myFavoriteMusicList[playingMusicIndex].title;
        }
    };
};

//Repeat one song
//===================================================================================================//

repeat.onclick = async function () {
    shuffle.style.display = "block";
    repeat.style.display = "none";

    if (playingMusicIndex != undefined) {
        let repeatSong = await fetch(
            `http://localhost:3000/${myFavoriteMusicList[playingMusicIndex].urlPath}`,
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            }
        );

        let audio = document.getElementById("play");
        audio.onended = () => {
            audio.src = repeatSong.url;
            document.getElementById("musicTitle").innerHTML = "";
            document.getElementById("musicTitle").innerHTML =
                myFavoriteMusicList[playingMusicIndex].title;
        };
    }
};
