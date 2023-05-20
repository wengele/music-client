window.onload = function () {
    document.getElementById("loginBtn").onclick = login;
};

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
            username,
            password,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    });

    console.log(response);
    if (response.ok) {
        const result = await response.json();
        console.log(result);
        sessionStorage.setItem("token", result.accessToken);
        sessionStorage.setItem("username", result.username);

    } else {
        document.getElementById("errorMsg").innerText =
            "Incorrect username and password";
    }
}
