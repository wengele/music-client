


window.onload = function () {
    if (sessionStorage.getItem('token')) {
        renderSecondPage();
        fetchAllSongs();
        retrieveFavorites();
    } else {
        document.getElementById("first-page").style.display = "block";
        document.getElementById('loginBtn').addEventListener('click', login);
    }
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
        renderSecondPage();
        fetchAllSongs();
    } else {
        document.getElementById('errorMsg').innerText = 'Incorrect username and password';
    }

}

let myMusicList = [];
function renderSecondPage() {
    document.getElementById("first-page").style.display = "none";
    document.getElementById("second-page").style.display = "block";
    document.getElementById('logout').addEventListener('click', logout);
    document.getElementById('searchMusic').addEventListener('keyup', (ev) => {
        console.log(myMusicList.filter((music) => music.title.startsWith(ev.target.value)));
        renderSongs(myMusicList.filter((music) => music.title.toLowerCase().startsWith(ev.target.value)));
    });
}

async function fetchAllSongs() {
    let storedMyMusicList = localStorage.getItem('myMusicList');
    if (storedMyMusicList) {
        myMusicList = JSON.parse(storedMyMusicList);
        renderSongs(myMusicList);
    } else {
        myMusicList = [];
    }
    let response = await fetch("http://localhost:3000/api/music", {
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
    })
    let songs = await response.json();
    myMusicList = songs;
    localStorage.setItem('myMusicList', JSON.stringify(myMusicList));

    renderSongs(songs);
};



function renderSongs(list) {

    let count = 1;
    let myTable = "";
    for (let musics of list) {
        myTable += `
        <tr>
        <td>${count++}</td>
        <td><a href="http://localhost:3000/${musics.urlPath}">${musics.title}</a><br></td>
        <td>${musics.releaseDate}</td>
        <td><button class="addBtn" id=${musics.id} onclick="addToFavorites('${musics.id}')">Add To Favorites</button></td>
        </tr>
        `;
    }
    document.getElementById("myTable").innerHTML = myTable;
}


let favorites = [];

let index = 0;
let countt = 1;
function addToFavorites(id) {

    for (let musics of myMusicList) {
        if (musics.id == id) {
            if (favorites.includes(musics)) {
                continue;
            } else {
                favorites.push(musics);
                fetch(`http://localhost:3000/${musics.urlPath}`, {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }).then((music) => {
                    let id = music.id;
                    let title = musics.title;
                    let url = music.url;
                    let myFavoriteTable = `
      
        <tr>
          <td>${countt++}</td>
              <td><a href="${music.url}">${musics.title}</a><br></td>
              <td><button class="addBtn" id=${musics.id} onclick="removeToFavorites('${musics.id}')">Remove From Favorites</button>
               <button class="addBtn" onclick="playMusic('${music.url}','${musics.title}','${index}')">play</button></td>
          </tr>
        `;
                    fetch(`http://localhost:3000/${musics.urlPath}`, {
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
                    localStorage.setItem('favorites', JSON.stringify(favorites))
                });
            }
        }
    }
}
function retrieveFavorites() {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
        createTable(favorites);
    }
}


async function playMusic(music, title, id) {
    document.getElementById("musicName").innerHTML = title;
    document.getElementById("play").src = music;
    currentPlayingIndex = id;

    let arr = [];
    for (let music of favorites) {
        let myPlayList = await fetch(`http://localhost:3000/${music.urlPath}`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        });
        arr.push(myPlayList.url);
    }

    let audio = document.getElementById("play");
    audio.onended = () => {
        currentPlayingIndex++;
        if (currentPlayingIndex >= arr.length) {
            currentPlayingIndex = 0;
        }
        audio.src = arr[currentPlayingIndex];
        document.getElementById("musicName").innerHTML =
            myMusicList[currentPlayingIndex].title;
    };

}
function removeToFavorites(id) {
    favorites = favorites.filter((myFav) => myFav.id != id);
    createTable(favorites);
}
let count3 = 1;
function createTable(table) {
    document.getElementById("myFavoriteTable").innerHTML = `
    <tr>
    <th>ID</th>
    <th>Order </th>
    <th>Action</th>    
    </tr>
        `;
    table.forEach((each) => {
        fetch(`http://localhost:3000/${each.urlPath}`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        })
            .then((music) => {
                let myFavoriteTable = `
                <td>${count3++}</td>
                <td><a href="${music.url}">${each.title}</a><br></td>
                <td>
                  <button class="addBtn" id=${each.id} onclick="removeToFavorites('${each.id}')">Remove From Favorites</button>
                  <button class="addBtn" onclick="playMusic('${music.url}','${each.title}','${index}')">play</button>
                </td>
              `;
                document.getElementById("myFavoriteTable").innerHTML += myFavoriteTable;
            });
    });
}

favorites = [];
let currentPlayingIndex = 0;
const nextButton = async function () {
    let nextMusic = currentPlayingIndex;
    if (favorites.length !== 0) {
        nextMusic = (nextMusic + 1) % favorites.length;
        let nextPlay = await fetch(
            `http://localhost:3000/${favorites[nextMusic].urlPath}`,
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            }
        );
        document.getElementById("musicName").innerHTML = favorites[nextMusic].title;
        document.getElementById("play").src = nextPlay.url;
        currentPlayingIndex = nextMusic;
    }
};
const prevBtn = async function () {
    let playPrev = currentPlayingIndex;
    if (favorites.length !== 0) {
        if (currentPlayingIndex === 0) {
            playPrev = favorites.length - 1;
        } else {
            playPrev--;
        }
        let prevPlay = await fetch(
            `http://localhost:3000/${favorites[playPrev].urlPath}`,
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            }
        );

        document.getElementById("musicName").innerHTML = "";
        document.getElementById("play").src = "";
        document.getElementById("musicName").innerHTML = favorites[playPrev].title;
        document.getElementById("play").src = prevPlay.url;
        currentPlayingIndex = playPrev;
    }
};

const shuffle = async function () {
    document.getElementById('shuffleBtn').style.display = "none";
    document.getElementById('repeatBtn').style.display = "block";

    let arr = [];
    for (let music of favorites) {
        let shuffleMusic = await fetch(`http://localhost:3000/${music.urlPath}`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        });
        arr.push(shuffleMusic.url);
    }

    let audio = document.getElementById("play");

    audio.onended = () => {
        currentPlayingIndex++;
        if (currentPlayingIndex >= arr.length) {
            currentPlayingIndex = 0;
        }

        let randNum = parseInt(Math.random() * favorites.length);

        if (randNum == currentPlayingIndex) {
            let newPlayer = parseInt((Math.random() + 1) * favorites.length);
            if (newPlayer > favorites.length - 1) {
                randNum = newPlayer - 1;
            }
        } else {
            currentPlayingIndex = randNum;
            audio.src = arr[currentPlayingIndex];
            document.getElementById("musicName").innerHTML =
                favorites[currentPlayingIndex].title;
        }
    };
};

const repeat = async function () {
    document.getElementById('shuffleBtn').style.display = "block";
    document.getElementById('repeatBtn').style.display = "none";

    if (currentPlayingIndex != undefined) {
        let repeatSong = await fetch(
            `http://localhost:3000/${favorites[currentPlayingIndex].urlPath}`,
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
                favorites[currentPlayingIndex].title;
        };
    }
};
const search = async function () {
    let title = document.getElementById("searchMusic").value;

    let searchResults = await fetch(
        `http://localhost:3000/search?title=${title}`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        }
    );

    let result = await searchResults.json();


    if (result && result.length > 0) {
        let searchResultList = document.getElementById("searchMusic");
        searchResultList.innerHTML = "";

        result.forEach((music) => {

            let listItem = document.createElement("li");
            listItem.innerText = music.title;
            listItem.addEventListener("click", () => {
                playMusic(music);
            });


            searchResultList.appendChild(listItem);
        });
    } else {

        console.log("No search results found.");
    }
};

function logout() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("token");
    localStorage.removeItem("favorites");
    location.reload();

}