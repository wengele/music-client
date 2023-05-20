window.onload = function () {
    document.getElementById("loginBtn").onclick = login;
}

async function login() {
    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            "username": document.getElementById('username').value,
            "password": document.getElementById('Password').value
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });


    const result = await response.json();

    if (result.ok) {
        document.getElementById("errors").innerText = result.message;
        //"Incorrect username and password";
        //const result = await response.json();


    } else {
        sessionStorage.setItem("token", result.accessToken);
        sessionStorage.setItem("username", result.username);
    }


}
