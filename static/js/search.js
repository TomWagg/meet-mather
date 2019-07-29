$(function() {
    const Shuffle = window.Shuffle;
    const element = document.querySelector('.grid');

    const shuffleInstance = new Shuffle(element, {
        itemSelector: '.picture-item',
    });

    document.querySelectorAll(".card .back").forEach((element) => {
        const options = ["bg-primary", "bg-info", "bg-danger"];
        element.classList.add(options[randint(0, options.length - 1)]);
    });

    $(".btn-radio").on("click", function() {
        this.classList.toggle("active");
        $(".toast .toast-close").click();
        update_shuffle(shuffleInstance);
    });

    $(".toast .toast-close").on("click", function() {
        this.parentElement.parentElement.classList.remove("show");
    });

    $("#search_bar").on("keyup", function() {
        $(".toast .toast-close").click();
        update_shuffle(shuffleInstance);
    });
    $("#clear").on("click", function() {
        document.querySelectorAll(".btn-radio.active").forEach((el) => {
            el.classList.remove("active");
        });
        $(".toast .toast-close").click();
        $("#search_bar").val("");
        update_shuffle(shuffleInstance);
    });
    $("#random").on("click", function() {
        $("#clear").click();
        const limit = randint(1, 2);
        const radios = document.querySelectorAll(".btn-radio");
        const choices = {
            "year": [],
            "conc": [],
            "entryway": [],
        };
        for (let i = 0; i < limit; i++) {
            const radio = radios[randint(0, radios.length - 1)];
            if (!radio.classList.contains("active")) {
                radio.classList.add("active");
                choices[radio.getAttribute("data-ftype")].push(radio.innerText);
            } else {
                i -= 1;
            }
        }
        let choice_string = "Here are Matherites who ";
        choice_string = extend_choice_string(choices, choice_string, "year", "are", "s or ");
        choice_string = extend_choice_string(choices, choice_string, "conc", "study", " or ");
        choice_string = extend_choice_string(choices, choice_string, "entryway", "live in", "'s entryway or ");
        console.log(choices, choice_string);
        document.getElementById("surprise_message").innerText = choice_string;
        document.getElementById("surprise_toast").classList.add("show");
        animateCSS("#surprise_toast", "bounce");
        update_shuffle(shuffleInstance);
    });
});

/**
 * Extend the random choice string with details
 * @param {*} choices random choices
 * @param {*} choice_string current string
 * @param {*} type what type to add
 * @param {*} prepend string to prepend
 * @param {*} join string to join array items
 * @return {*} completed choice string
 */
function extend_choice_string(choices, choice_string, type, prepend, join) {
    if (choices[type].length > 0) {
        if (choice_string.length > 24) {
            choice_string += " and ";
        }
        choice_string += prepend + " ";
        for (let i = 0; i < choices[type].length; i++) {
            choice_string += choices[type][i] + join;
        }
        if (choice_string.substr(-4) == " or ") {
            choice_string = choice_string.slice(0, -4);
        }
    }
    return choice_string;
}

/**
 * Update the shuffle page based on search and filters
 */
function update_shuffle(shuffleInstance) {
    const filters = {
        "year": [],
        "conc": [],
        "entryway": [],
    };
    const actives = document.querySelectorAll(".btn-radio.active");
    for (let i = 0; i < actives.length; i++) {
        filters[actives[i].getAttribute("data-ftype")].push(actives[i].getAttribute("data-filter"));
    }
    const search = document.getElementById("search_bar").value.toLowerCase().trim().split(" ");
    shuffleInstance.filter(function(element) {
        condition = true;
        if (filters["year"].length > 0) {
            condition = condition && filters["year"].includes(element.getAttribute("data-year"));
        }
        if (filters["conc"].length > 0) {
            condition = condition && filters["conc"].includes(element.getAttribute("data-conc"));
        }
        if (filters["entryway"].length > 0) {
            condition = condition && filters["entryway"].includes(element.getAttribute("data-entryway"));
        }
        if (search.length > 0 && search[0] != "") {
            search_condition = false;
            for (let i = 0; i < search.length; i++) {
                search_condition = search_condition || (element.getAttribute("data-name").toLowerCase().includes(search[i]) || element.getAttribute("data-year").toLowerCase().includes(search[i]) || element.getAttribute("data-entryway").toLowerCase().includes(search[i]) || element.getAttribute("data-conc").toLowerCase().includes(search[i]));
            }
            condition = condition && search_condition;
        }
        return condition;
    });
    shuffleInstance.once(Shuffle.EventType.LAYOUT, function() {
        $("html, body").animate({
            scrollTop: 0,
        }, "smooth");
    });
}

/**
 * Get random integer in range
 * @param {*} min minimum int (inclusive)
 * @param {*} max maximum int (inclusive)
 * @return {*} the integer
 */
function randint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Add a CSS animation
 * @param {*} element element selector to animate
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
