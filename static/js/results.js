$(function() {
    $('.carousel').carousel({
        "interval": false,
        "keyboard": false,
    });
    // $(".carousel").carousel(1);
    document.getElementById("review").addEventListener("click", function() {
        $(".carousel").carousel(1);
    });
    document.querySelectorAll(".result-card").forEach(function(el) {
        console.log(el);
        el.querySelector(".correct-name").innerText = el.getAttribute("data-name");
        if (el.getAttribute("data-correct") == 1) {
            el.classList.add("border-success");
        } else {
            el.classList.add("border-primary");
            el.querySelector(".guessed-name").innerText = el.getAttribute("data-guess");
            el.querySelector(".guessed-name").classList.remove("hide");
        }
    });
    document.getElementById("points_value").innerText = 3 * parseInt(document.getElementById("correct_value").innerText) + parseInt(document.getElementById("incorrect_value").innerText);
    const bar = new ProgressBar.Circle('#container', {
        color: '#aaa',
        // This has to be the same size as the maximum width to
        // prevent clipping
        strokeWidth: 20,
        trailWidth: 5,
        easing: 'easeInOut',
        duration: 1400,
        text: {
            autoStyleContainer: false,
        },
        from: {
            color: '#d9f7d2',
            width: 10,
        },
        to: {
            color: '#22b24c',
            width: 10,
        },
        // Set default step function for all animate calls
        step: function(state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);

            const value = Math.round(circle.value() * 100);
            if (value === 0) {
                circle.setText('');
            } else {
                circle.setText(value + "%");
            }
        },
    });
    bar.text.style.fontSize = '250%';
    bar.text.style.color = 'white';
    animateCSS("#container", "bounceInDown", function() {
        bar.animate(document.getElementById("percent_val").innerText); // Number from 0.0 to 1.0
    });
    animateCSS(".result-col", "flipInX");
});

/**
 * Add a CSS animation
 * @param {*} element element to animate
 * @param {*} animationName which animation
 * @param {*} callback what to do on completion
 */
function animateCSS(element, animationName, callback) {
    const nodes = document.querySelectorAll(element);
    nodes.forEach(function(node) {
        node.classList.add('animated', animationName);
        $(node).one("animationend", function() {
            this.classList.remove('animated', animationName);
            if (typeof callback === 'function') callback();
        });
    });
}
