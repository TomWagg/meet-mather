$(function() {
    // set active nav-link
    document.querySelector(".nav-link[href='/learn_select']").classList.add("active");

    const rows = document.querySelectorAll(".person-row");
    for (let i = 0; i < rows.length; i++) {
        if (i % 2 == 1) {
            const pic = rows[i].querySelector(".col-pic");
            const pic_copy = pic.cloneNode(true);
            rows[i].removeChild(pic);
            rows[i].appendChild(pic_copy);
        }
    }

    const cols = document.querySelectorAll(".col-pic");
    const names = document.querySelectorAll(".name-input");
    const nexts = document.querySelectorAll(".btn-next");
    for (let i = 0; i < cols.length - 1; i++) {
        cols[i].id = "col_pic_" + String(i);
        nexts[i].addEventListener("click", function() {
            $('html').animate({
                scrollTop: $(cols[i + 1]).offset().top,
            }, 10, function() {
                console.log(names[i + 1]);
                $(names[i + 1]).select();
            });
        });
    }
    nexts[cols.length - 1].addEventListener("click", function() {
        $('html').animate({
            scrollTop: $("#finish").offset().top,
        }, 10, function() {
            $("#finish").focus();
        });
    });

    $(".panel").on("click", function() {
        this.classList.toggle("flip");
    });

    $(".name-input").on("keydown", function(e) {
        if (e.keyCode == 13) {
            console.log(this, this.parentElement);
            this.parentElement.querySelector(".btn-next").click();
        }
    });

    $("#finish").on("click", function() {
        const ids = document.querySelectorAll(".id");
        const names = document.querySelectorAll(".name-input");
        const id_array = [];
        const name_array = [];
        for (let i = 0; i < ids.length; i++) {
            id_array.push(parseInt(ids[i].innerText));
            name_array.push(names[i].value);
        }
        document.getElementById("sub_ids").value = id_array;
        document.getElementById("sub_names").value = name_array;
        document.getElementById("submit_guesses").click();
    });
});
