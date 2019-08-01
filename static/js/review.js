$(function() {
    const Shuffle = window.Shuffle;
    const element = document.querySelector('.grid');

    const shuffleInstance = new Shuffle(element, {
        itemSelector: '.picture-item',
    });
    document.querySelectorAll(".result-card").forEach(function(el) {
        console.log(el);
        el.querySelector(".correct-name").innerHTML = "<h3>" + el.getAttribute("data-name") + "</h3>";
        if (el.getAttribute("data-correct") == 1) {
            el.classList.add("border-success");
        } else {
            el.classList.add("border-primary");
            el.querySelector(".guessed-name").innerText = el.getAttribute("data-guess");
            el.querySelector(".guessed-name").classList.remove("hide");
        }
    });
});
