var conf_duration = 0;
function startDuration() {
    setInterval(function(){
        conf_duration++;
        var minute,second,hour;
        var min = parseInt(conf_duration/60);
        var sec = conf_duration%60;
        var hr= 0;
        if(min>59){
            min = min%60;
            hr = parseInt(conf_duration/3600)
        }
        (sec<10)?(second="0"+sec):(second=""+sec);
        (min<10)?(minute="0"+min):(minute=""+min);
        (hr<10)?(hour="0"+hr):(hour=""+hr);
        $("#duration-label").text(hour+" : "+minute+" : "+second);
    },1000)
}
function checkOnlyParMsg() {
    var players = ATUserList.length;
    if(players === 0 && shareStart)
    {
        $(".only-par-msg").hide();
        $(".watermark").hide();
    }
    if(players === 0 ){
        $(".only-par-msg").show();
        $(".watermark").show();
    }else{
        $(".only-par-msg").hide();
        $(".watermark").hide();
    }
}
// $( "#extenstion-info" ).dialog({
//     autoOpen: false,
//     modal: true,
//     width: 600,
//     show: {
//         effect: "blind",
//         duration: 1000
//     },
//     hide: {
//         effect: "explode",
//         duration: 1000
//     }
// });
// $( "#device-selection-dialog" ).dialog({
//     autoOpen: false,
//     modal: true,
//     width: 600,
//     show: {
//         effect: "blind",
//         duration: 1000
//     },
//     hide: {
//         effect: "explode",
//         duration: 1000
//     }
// });
var send_mail = function(details,callback){

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    xhttp.open("POST", "/sendMail/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(details));
};

var sendChatEmail = function(details,callback){

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    xhttp.open("POST", "/sendChatMail/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(details));
};

var inviteRoom = function(details,callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    xhttp.open("POST", "/inviteRoom/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(details));
};


$( ".par_audio_mute" ).click(function(e) {

});
function muteParAudio(elem) {
    var currId = elem.id;
    room.remoteStreams.forEach(function (value,index,arr) {
        if(value.clientId === currId){
            if(elem.src.split("/")[elem.src.split("/").length-1] === "volume_on.svg"){
                value.hardMuteAudio(function () {});
                elem.src = "../img/volume_off.svg";
                return;
            }else if(elem.src.split("/")[elem.src.split("/").length-1] === "volume_off.svg"){
                value.hardUnmuteAudio(function () {});
                elem.src = "../img/volume_on.svg";
                return;
            }

        }
    });
}
function muteParVideo(elem) {
    var currId = elem.id;
    room.remoteStreams.forEach(function (value,index,arr) {
        if(value.clientId === currId){
            if(elem.src.split("/")[elem.src.split("/").length-1] === "video_on.svg"){
                value.hardMuteVideo(function () {});
                elem.src = "../img/video_off.svg";
                return;
            }else if(elem.src.split("/")[elem.src.split("/").length-1] === "video_off.svg"){
                value.hardUnmuteVideo(function () {});
                elem.src = "../img/video_on.svg";
                return;
            }

        }
    });
}

$( "#btn-device-apply" ).click(function() {
    $( "#btn-device-apply" ).attr("disabled","disabled");
    EnxRtc.switchMediaDevice(localStream,$("#mic option:selected").attr('id'),$("#cam option:selected").attr('id'),function(stream){
        if(stream && stream.getID){
            localStream = stream;
            clearLocalView();
            showLocalView();
            toastr.success("Switched to chosen Media Devices");
            localStorage.setItem("mic", $("#mic option:selected").attr('id'));
            localStorage.setItem("cam", $("#cam option:selected").attr('id'));
            setCookie("vcxMicId",  $("#mic option:selected").val());
            setCookie("vcxCamId", $("#cam option:selected").val());
            $( "#btn-device-apply" ).removeAttr("disabled");
        }
        else
        {
            toastr.error("Error switching media devices ");
            $( "#btn-device-apply" ).removeAttr("disabled");
        }
    });
});
$( ".btn-mute-all" ).click(function() {
    var elem = $(this);
    if($(this).text()=="muteAll"){
        room.hardMute(function(res){
            if(res.result==0){
                alert("Muted all successfully");
                elem.text("unmuteAll")
            }
        });
    }
    if($(this).text()=="unmuteAll"){
        room.hardUnmute(function(res){
            if(res.result==0){
                alert("Unmuted all successfully");
                elem.text("muteAll")
            }
        });
    }

});
$( "#btn-invite" ).click(function() {
    $( "#btn-invite" ).attr("disabled","disabled");
    var details= {};
    details.username = localStorage.getItem("userName");
    details.room_id = room.roomID;
    details.topic = room.roomSettings.description;
    details.message = "";
    var inviteEmailDivs = document.getElementById("invite-email").value.split(",");
    var users = [];
    for(var i=0;i<inviteEmailDivs.length;i++){
        if(inviteEmailDivs[i] !== ""){
            if(inviteEmailDivs[i].trim().match("(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")) {
                users.push(inviteEmailDivs[i].trim());
            }else{
                toastr.error("Invalid Email ID: "+inviteEmailDivs[i]);
                $( "#btn-invite" ).removeAttr("disabled");
                return;
            }
        }
    }
    if(users.length < 1){
        toastr.error("Enter atleast one participant");
        document.getElementById("invite-email").style.border= "solid 1px red";
        $( "#btn-invite" ).removeAttr("disabled");
        return;
    }
    details.inviteUsers = users;
    inviteRoom(details,function (res) {
        if(res){
            toastr.success("Invitation has been sent to "+ document.getElementById("invite-email").value);
            $( "#btn-invite" ).removeAttr("disabled");
            $("#invite-dialog").modal("hide");
            document.getElementById("invite-email").style.border= "solid 1px rgb(169, 169, 169)";
            document.getElementById("invite-email").value = "";
        }else{
            toastr.error("Error when sending Invitation");
            $( "#btn-invite" ).removeAttr("disabled");

        }

    });


});
function getDevice(callback , devices = {cam:'cam',mic:'mic'}){
    EnxRtc.getDevices(function (arg) {
        if(arg.result === 0)
        {
            var camLst = arg.devices.cam;
            var micLst = arg.devices.mic;
            listOutCam(camLst,devices.cam);
            listOutMic(micLst,devices.mic);

           
            callback();
        }
        else if(arg.result === 1153)
        {
           toastr.error("Media devices access denied");
            $("#btn-device-apply").hide();
        }
        else{
            toastr.error("Media devices access denied");
            $("#btn-device-apply").hide();
        }
    });
}

function listOutMic(micLst,device){
    document.getElementById(device).innerHTML = "";
    for(var j=0;j<micLst.length;j++){
        var x = document.getElementById(device);
        var option = document.createElement("option");
        option.text = micLst[j].label;
        var micoptId = micLst[j].deviceId;
        option.setAttribute("id",micoptId);
        x.add(option);
    }
}
function listOutCam(camLst,device){
    document.getElementById(device).innerHTML = "";
    for(var i=0;i<camLst.length;i++){
        var x = document.getElementById(device);
        var option = document.createElement("option");
        option.text = camLst[i].label;
        var camoptId = camLst[i].deviceId;
        option.setAttribute("id",camoptId);
        x.add(option);
    }
}
