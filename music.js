window.onchange = function () {

    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('logout').addEventListener('click', logout);
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            username,
            password
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const result = await response.json();
        sessionStorage.setItem('token', result.accessToken);
        sessionStorage.setItem('username', result.username);
        document.getElementById('main-div').style.display = 'none';
        document.getElementById('main-div2').style.display = 'block';
        document.getElementById('logout').style.display = 'block';
        //document.getElementById("favorites").style.display = 'block';
        //document.getElementById('play').style.display = 'block';
        document.getElementById('table-div').style.display = 'block';

        fetchAllSongs();



    } else {
        document.getElementById('errorMsg').innerText = 'Incorrect username and password';
    }

}


let musicList = null;

async function fetchAllSongs() {
    let response = await fetch("http://localhost:3000/api/music", {
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
    })
    let songs = await response.json();
    musicList = songs;
    printAllSongs(songs);
};

//Display all songs
//=================================================================================================================//
let count = 1;
function printAllSongs(list) {
    for (let each of list) {
        fetch(`http://localhost:3000/${each.urlPath}`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        }).then((songs) => {
            let myTable = `
            <tr>
            <td>${count++}</td>
            <td><a href="${songs.url}">${each.title}</a><br></td>
            <td>${each.releaseDate}</td>
            <td><button class="addBtn" id=${each.id} onclick="addToFavorites('${each.id}')">+</button></td>
            </tr>
           `;
            document.getElementById("myTable").innerHTML += myTable;
        });
    }
}

//Add to favorite list
//=================================================================================================================//
let myFavoriteMusicList = [];

let index = 0;
let countt = 1;
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
                    let id = music.id;
                    let title = each.title;
                    let url = music.url;
                    let myFavoriteTable = `
      
        <tr>
          <td>${countt++}</td>
              <td><a href="${music.url}">${each.title}</a><br></td>
              <td><button class="addBtn" id=${each.id} onclick="removeToFavorites('${each.id}')">X</button>
               <button class="addBtn" onclick="playMusic('${music.url}','${each.title}','${index}')">play</button></td>
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
                    index++;

                    document.getElementById("myFavoriteTable").innerHTML += myFavoriteTable;
                });
            }
        }
    }
}
//   <tr id=${each.id}>
async function playMusic(music, title, id) {
    document.getElementById("musicName").innerHTML = title;
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
        document.getElementById("musicName").innerHTML =
            musicList[playingMusicIndex].title;
    };
    console.log(myFavoriteMusicList);
}

//Remove from list
//=================================================================================================================//
function removeToFavorites(id) {
    myFavoriteMusicList = myFavoriteMusicList.filter((myFav) => myFav.id != id);
    document.getElementById(id);
    document.getElementById("myFavoriteTable");
    createTable(myFavoriteMusicList);
}
let count3 = 1;
function createTable(property) {
    document.getElementById("myFavoriteTable").innerHTML = `
    <tr>
    <th>ID</th>
    <th>Order </th>
    <th>Action</th>    
    </tr>
        `;

    for (let each of property) {
        fetch(`http://localhost:3000/${each.urlPath}`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        }).then((music) => {
            let myFavoriteTable = `
            <td>${count3++}</td>
            <td><a href="${music.url}">${each.title}</a><br></td>
            <td><button class="addBtn" id=${each.id} onclick="removeToFavorites('${each.id}')">X</button>
             <button class="addBtn" onclick="playMusic('${music.url}','${each.title}','${index}')">play</button></td>
          `;
            document.getElementById("myFavoriteTable").innerHTML += myFavoriteTable;
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
        document.getElementById("musicName").innerHTML = "";
        document.getElementById("play").src = "";

        document.getElementById("musicName").innerHTML =
            myFavoriteMusicList[nextMusic].title;
        document.getElementById("play").src = nextPlay.url;
        playingMusicIndex = nextMusic;
    }
};

//Play previous
//=================================================================================================================//
let previous = document.getElementById("previous");

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

        document.getElementById("musicName").innerHTML = "";
        document.getElementById("play").src = "";

        document.getElementById("musicName").innerHTML =
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
            document.getElementById("musicName").innerHTML =
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
            document.getElementById("musicName").innerHTML = "";
            document.getElementById("musicName").innerHTML =
                myFavoriteMusicList[playingMusicIndex].title;
        };
    }
};


function logout() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("token");
    document.getElementById('main-div2').innerHTML = '';
    //document.getElementById('table-div').innerHTML = '';
    document.getElementById('main-div2').style.display = 'none';
    document.getElementById('logout').style.display = 'none';
    //document.getElementById("favorites").style.display = 'none';


    // document.getElementById('play').style.display = 'none';
    // document.getElementById('priv').style.display = 'none';
    // document.getElementById('next').style.display = 'none';
    // document.getElementById('shuffle').style.display = 'none';
    // document.getElementById('repeat').style.display = 'none';

    document.getElementById('main-div').style.display = 'block';

    location.reload();



}
