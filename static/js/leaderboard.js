$(function() {
    people = document.querySelectorAll(".person");
    let count = 0;
    let prev_points = -1;

    // rank everyone by their points
    for (let i = 0; i < people.length; i++) {
        if (people[i].querySelector(".points").innerText !== prev_points) {
            count++;
        }
        prev_points = people[i].querySelector(".points").innerText;

        // highlight the user
        if (people[i].querySelector(".rank .id").innerText == people[i].querySelector(".rank .me").innerText) {
            people[i].classList.add("bg-danger");
        }
        people[i].querySelector(".rank").innerText = count;
    }

    // animate an entrance
    let i = 0;
    const loop = setInterval(function() {
        if (i < people.length) {
            people[i].classList.remove("hide");
            animateCSS(people[i], "bounceInUp");
            i++;
        } else {
            clearInterval(loop);
        }
    }, 10);
});

/**
 * Add a CSS animation
 * @param {*} element element to animate
 * @param {*} animationName which animation
 * @param {*} callback what to do on completion
 */
function animateCSS(node, animationName, callback) {
    node.classList.add('animated', animationName);
    $(node).one("animationend", function() {
        this.classList.remove('animated', animationName);
        if (typeof callback === 'function') callback();
    });
}
