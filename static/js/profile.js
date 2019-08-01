$(function() {
    document.querySelector("select[name='year']").value = document.getElementById("prev_year").value;
    document.querySelector("select[name='concentration']").value = document.getElementById("prev_conc").value;
    update_preview();
    $(".preview-link").on("keyup change", function() {
        update_preview();
    });
});

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
        el.innerHTML = document.querySelector("input[name='year']").value;
    });
    card.querySelectorAll(".profile-concentration").forEach((el) => {
        el.innerHTML = document.querySelector("select[name='concentration']").value;
    });
}
