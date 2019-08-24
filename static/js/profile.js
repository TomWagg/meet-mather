const q_to_statement = {
    "No Question": "No Question",
    "If you could have any superpower, what would it be?": "My ideal superpower is",
    "Describe your perfect day in three words": "My perfect day in three words is",
    "Who is your celebrity look-alike?": "My celebrity look-alike is",
    "If you were famous, what would you be famous for?": "I would be famous for",
    "I would like an unlimited supply of ...": "I need an unlimited supply of",
    "Which cartoon character would you choose to hang out with?": "I'd hang out with the cartoon character",
    "What is your motto for life?": "My life motto is",
    "What new activity do you want to try?": "I want to try this activity",
    "What song title best describes your life?": "This song title describes my life",
    "If you could live anywhere, where would you live?": "My ideal place to live is",
};
const statement_to_q = {
    "No Question": "No Question",
    "My ideal superpower is": "If you could have any superpower, what would it be?",
    "My perfect day in three words is": "Describe your perfect day in three words",
    "My celebrity look-alike is": "Who is your celebrity look-alike?",
    "I would be famous for": "If you were famous, what would you be famous for?",
    "I need an unlimited supply of": "I would like an unlimited supply of ...",
    "I'd hang out with the cartoon character": "Which cartoon character would you choose to hang out with?",
    "My life motto is": "What is your motto for life?",
    "I want to try this activity": "What new activity do you want to try?",
    "This song title describes my life": "What song title best describes your life?",
    "My ideal place to live is": "If you could live anywhere, where would you live?",
};
const answer_limit = 40;

$(function() {
    // copy and paste qa html for convenience
    const qa = document.querySelector("#qa1");
    for (let i = 2; i < 4; i++) {
        const new_qa = qa.cloneNode(true);
        new_qa.id = "qa" + i.toString();

        const select = new_qa.querySelector("select[name='q1']");
        select.setAttribute("name", "q" + i.toString());

        const label = new_qa.querySelector("label");
        label.innerText = "Question " + i.toString();
        label.setAttribute("for", select.getAttribute("name"));

        new_qa.querySelector("input[name='a1']").setAttribute("name", "a" + i.toString());
        new_qa.querySelector("input[name='q1-statement']").setAttribute("name", "q" + i.toString() + "-statement");
        qa.parentElement.appendChild(new_qa);
    }

    // initialise
    document.querySelector("select[name='year']").value = document.getElementById("prev_year").value;
    document.querySelector("select[name='concentration']").value = document.getElementById("prev_conc").value;
    for (let i = 1; i < 4; i++) {
        document.querySelector("select[name='q" + i.toString() + "']").value = statement_to_q[document.querySelector(".profile-q" + i.toString()).innerText];
        document.querySelector("input[name='a" + i.toString() + "']").value = document.querySelector(".profile-a" + i.toString()).innerText;
    }

    // make sure answers don't go over the limit
    document.querySelectorAll("input.answer").forEach(function(el) {
        if (el.value == "None") {
            el.value = "";
        }
        el.addEventListener("keyup", function() {
            if (answer_limit - el.value.length < 0) {
                el.value = el.value.substr(0, answer_limit);
            }
            el.parentElement.querySelector("label.text-right span.chars").innerText = answer_limit - el.value.length;
        });
    });

    // update hidden translations to statements
    document.querySelectorAll(".question-list").forEach(function(el) {
        el.parentElement.querySelector(".question-statement").value = q_to_statement[el.value];
        el.addEventListener("change", function() {
            el.parentElement.querySelector(".question-statement").value = q_to_statement[el.value];
        });
    });

    // keep the preview showing the latest changes
    update_preview();
    $(".preview-link").on("keyup change", function() {
        update_preview();
    });

    $("input[type='file']").change(function() {
        readURL(this);
    });
});


/**
 * Quickly update the profile image before upload
 * @param {*} input input image
 */
function readURL(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            $('.profile-img').attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * Update the preview of your profile
 */
function update_preview() {
    const card = document.querySelector(".preview .card");
    card.querySelectorAll(".profile-first-name").forEach((el) => {
        el.innerHTML = document.querySelector("input[name='name_first']").value;
    });
    card.querySelectorAll(".profile-last-name").forEach((el) => {
        el.innerHTML = document.querySelector("input[name='name_last']").value;
    });
    card.querySelectorAll(".profile-year").forEach((el) => {
        el.innerHTML = document.querySelector("select[name='year']").value;
    });
    card.querySelectorAll(".profile-concentration").forEach((el) => {
        el.innerHTML = document.querySelector("select[name='concentration']").value;
    });
    for (let i = 1; i < 4; i++) {
        const question = document.querySelector("select[name='q" + i.toString() + "']").value;
        const pq = card.querySelector(".profile-q" + i.toString());
        if (question == "No Question") {
            pq.parentElement.classList.add("hide");
        } else {
            pq.parentElement.classList.remove("hide");
        }
        pq.innerHTML = q_to_statement[question];
        card.querySelector(".profile-a" + i.toString()).innerHTML = document.querySelector("input[name='a" + i.toString() + "']").value;
    }
}
