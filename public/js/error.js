document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("back")
        .addEventListener("click", () => window.history.go(-1));
});
