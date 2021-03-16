window.onload = function(){
    videoSupportRating = 0;
    $('.icheck').iCheck({
        checkboxClass: 'icheckbox_minimal',
        radioClass: 'iradio_minimal',
    });

    $('#stars li').on('mouseover', function(){

        var onStar = parseInt($(this).data('value'), 10);

        $(this).parent().children('li.star').each(function(e){
            if (e < onStar)
                $(this).addClass('hover');
            else
                $(this).removeClass('hover');
        });

    }).on('mouseout', function(){
        $(this).parent().children('li.star').each(function(e){
            $(this).removeClass('hover');
        });
    });


    /* 2. Action to perform on click */
    $('#stars li').on('click', function(){
        var onStar = parseInt($(this).data('value'), 10);
        var stars = $(this).parent().children('li.star');

        for (i = 0; i < stars.length; i++)
            $(stars[i]).removeClass('selected');

        for (i = 0; i < onStar; i++)
            $(stars[i]).addClass('selected');
        videoSupportRating = parseInt($('#stars li.selected').last().data('value'), 10);

    });
    $("#cancelFeebback").on("click",function () {
        window.location.href="https://www.enablex.io/";
    })
    $("#submitFeedback").on("click",function () {
        $("#submitFeedback").attr("disabled","disabled");
        var key = window.location.href.split("/")[window.location.href.split("/").length - 1];
        username = localStorage.getItem("userName");
        // var name = $("#feedback_username").val().trim();
        // var email = $("#feedback_email").val().trim();
        // var text_message = $("#feedback_message").val().trim();
        audio_issues = "<ul>";
        video_issues = "<ul>";
        if(document.querySelector('#audio_not_present').checked)
        {
            audio_issues += "<li>I could not hear anyone</li>";
        }
        if(document.querySelector('#video_not_present').checked)
        {
            video_issues += "<li>I could not see anyone</li>";
        }
        if(document.querySelector('#audio_was_bad').checked)
        {
            audio_issues += "<li>Audio Quality was bad</li>";
        }
        if(document.querySelector('#video_is_bad').checked)
        {
            video_issues += "<li>Video quality was bad </li>";
        }
        if(document.querySelector('#other_participant_not_hear_me').checked)
        {
            audio_issues += "<li>Others could not hear me</li>";
        }
        if(document.querySelector('#other_participant_not_see_me').checked)
        {
            video_issues += "<li>Others could not see me</li>";
        }

        if(video_issues == "<ul>")
        {
            video_issues = "NONE"
        }
        else {
            video_issues += "</ul>"
        }
        if(audio_issues == "<ul>")
        {
            audio_issues = "NONE"
        }
        else {
            audio_issues += "</ul>"
        }
        send_feedback_mail({"name":username,"ratings":videoSupportRating,"log_id":key,"audio":audio_issues,"video":video_issues},function (res) {
            if(res){

                toastr.success("Thank you for your valuable feedback.","",{ positionClass : "toast-top-center"});
                $("#feedback-dialog").modal("hide");
                $("#submitFeedback").removeAttr("disabled");
                setTimeout(function(){
                    window.location.href="https://www.enablex.io/";
                },5000);
            }
        });
    });
}

function send_feedback_mail(details,callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    xhttp.open("POST", "/sendPostSesMail/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(details));

}