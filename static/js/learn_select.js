$(function() {
    // create toggle buttons
    $(".btn-toggle").on("click", function() {
        this.classList.toggle("active");
        if (this.children[0].classList.contains("fa-check")) {
            this.children[0].classList.remove("fa-check");
            this.children[0].classList.add("fa-times");
        } else {
            this.children[0].classList.remove("fa-times");
            this.children[0].classList.add("fa-check");
        }
    });

    // show custom input when needed
    $("#rounds_group > .btn").on("click", function() {
        if (this.innerText == "Custom") {
            $("#custom_round").fadeIn();
        } else {
            $("#custom_round").fadeOut();
        }
    });

    $("input[type='number']").on("blur", function() {
        this.value = parseInt(this.value) > parseInt(this.max) ? this.max : this.value;
    });

    document.getElementById("start").addEventListener("click", function() {
        const entryway = $("#entryway").val();
        const year = $("#year").val();
        const adapt = document.getElementById("adapt").classList.contains("active") ? 1 : 0;
        let rounds = document.querySelector(".btn-rounds.active").innerText;
        if (rounds == "Custom") {
            rounds = document.getElementById("custom_round").value;
        }
        console.log(entryway, year, adapt, rounds);
        $("#sub_entryway").val(entryway);
        $("#sub_year").val(year);
        $("#sub_adapt").val(adapt);
        $("#sub_rounds").val(rounds);
        $("#sub_done").click();
    });
});
