$(document).ready(function() {

    $(".nav-item").click(function() {
        $(".nav-item a").removeClass("active");
        $(".nav-item a").eq($(this).index()).addClass("active");
        for (var i = 0; i < 5; i++) {
            $(".nav-cont").eq(i).css("display", "none");
        }
        $(".nav-cont").eq($(this).index()).css("display", "block");
        return false;
    });

    $("#addNewPositionbtn").click(function() {
        $("#addNewPosition").submit();
    });

    $(".addCandidatebtn").click(function(e) {
        var oldlink = $(this).attr("href").trim();
        var newlink = oldlink + "/" + $("form .name").val();
        $(".addCandidatebtn").attr("href", newlink);
    });


    $("#selectPosition").change(function() {
        var length = $("#selectPosition option:first").val();
        $('select#selectPosition > option').each((index, obj) => {
            $("tbody#" + $(obj).val()).css("display", "none");
            console.log($(obj).val());
        })
        $("tbody#" + $("#selectPosition").val()).css("display", "");
        console.log($("#selectPosition").val());
    });

    $(".voteFinish").click(function(e) {
        e.preventDefault();
    })
});