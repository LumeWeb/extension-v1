(async function () {
  const params = new URL(decodeURI(window.location)).searchParams;
  const targetUrl = params.get("url");
  const force = params.get("force") === "1" ?? false;
  // eslint-disable-next-line no-undef
  let response = await browser.runtime.sendMessage(undefined, {
    action: "resolve",
    url: targetUrl,
    force,
  });

  let location;

  if (response) {
    location = targetUrl.toString();
  } else {
    // eslint-disable-next-line no-undef
    location = browser.runtime.getURL("/error.html");
  }

  let el = document.getElementById("success");
  el.classList.add(["animate__animated"]);
  el.classList.add(["animate__bounceIn"]);

  setTimeout(() => {
    window.location.href = location;
  }, 1000);
})();
