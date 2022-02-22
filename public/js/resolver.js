(async function () {
    let targetUrl = new URL(decodeURI(window.location)).searchParams.get("url");
    let response = await browser.runtime.sendMessage(undefined, {
        action: "resolve",
        url: new URL(decodeURI(window.location)).searchParams.get("url"),
    });

    let location;

    if (response) {
        location = targetUrl.toString();
    } else {
        location = browser.runtime.getURL("/error.html");
    }

    let el = document.getElementById("success");
    el.classList.add(["animate__animated"]);
    el.classList.add(["animate__bounceIn"]);

    setTimeout(() => {
        window.location.href = location;
    }, 1000);
})();
