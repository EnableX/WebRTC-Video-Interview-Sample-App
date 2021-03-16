
//alocal object[Application Specific]
//usedax to capture the users willingness to create a pin for this room
var createPinBasedRoom = {};

$('#schedule_meeting_time').clockpicker({autoclose: true, default: 'now',});
$('#schedule_meeting_date').datepicker({
    format: 'dd-mm-yyyy',
    autoclose:true
   });
$("#schedule_meeting_date").datepicker().datepicker("setDate", new Date());
function scheduleMeeting() {
    var obj = {};
    if(document.getElementById("schedule_meeting_topic").value !== ""){
        obj.topic = document.getElementById("schedule_meeting_topic").value.trim();
    }else{
        alert("Topic is important");
        return;
    }
    if(document.getElementById("schedule_meeting_username").value !== ""){
        obj.username = document.getElementById("schedule_meeting_username").value.trim();
    }else{
        alert("Username is mandatory");
        return;
    }
    if(document.getElementById("schedule_meeting_useremail").value !== ""){
        obj.useremail = document.getElementById("schedule_meeting_useremail").value.trim();  //
    }else if(document.getElementById("schedule_meeting_useremail").value === ""){
        alert("Can't proceed without your email");
        return;
    }else if(!document.getElementById("schedule_meeting_useremail").value.match("(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")){
        alert("Invalid email ID")
    }
    if(document.getElementById("schedule_meeting_date").value !== ""){
        //obj.datetime = document.getElementById("schedule_meeting_date").value.trim();
    }else{
        alert("Needs to schedule time for meeting");
        return;
    }
    if(document.getElementById("schedule_meeting_time").value !== ""){
        //obj.datetime = document.getElementById("schedule_meeting_time").value.trim();
    }else{
        alert("Needs to schedule time for meeting");
        return;
    }
    if(document.getElementById("schedule_meeting_message").value !== ""){
        obj.message = document.getElementById("schedule_meeting_message").value.trim();
    }
    var inviteEmailDivs = document.getElementsByClassName("schedule_meeting_user");
    var date = document.getElementById("schedule_meeting_date").value.trim();
    var time = document.getElementById("schedule_meeting_time").value.trim();
    obj.scheduled_time = moment(date+" "+time,"DD-MM-YYYY HH:mm").utc().format("YYYY-MM-DD HH:mm:ss");
    // alert(moment(date+" "+time,"DD-MM-YYYY HH:mm").utc().format("YYYY-MM-DD HH:mm:ss"));
    obj.video_codec_h264 = $("#pH264ChkSchd").prop("checked");
    var users = [];
    for(var i=0;i<inviteEmailDivs.length;i++){
        if(inviteEmailDivs[i].value !== ""){
            if(inviteEmailDivs[i].value.trim().match("(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")) {
                users.push(inviteEmailDivs[i].value.trim());
            }else{
                alert("Invalid Email ID");
                return;
            }
        }
    }
    if(users.length < 1){
        alert("Atleast one invite is required");
        return;
    }
    obj.scheduled = true;
    obj.adhoc = false;
    obj.inviteUsers = users;
    createRoom(obj,function (result) {
        var res = JSON.parse(result);
        if(res.result === 0){
            alert("Invited To Room Successfully");
            // window.location.reload();
        }else{
            alert("Unable To contact Server, Try after sometime");
        }
    });
}

function adhocMeeting() {
    var obj = {};
    if(document.getElementById("adhoc_meeting_topic").value !== ""){
        obj.topic = document.getElementById("adhoc_meeting_topic").value.trim();
    }else{
        alert("Topic is important");
        return;
    }
    if(document.getElementById("adhoc_meeting_username").value !== ""){
        obj.username = document.getElementById("adhoc_meeting_username").value.trim();
    }else{
        alert("Username is mandatory");
        return;
    }
    if(document.getElementById("adhoc_meeting_useremail").value !== ""){
        obj.useremail = document.getElementById("adhoc_meeting_useremail").value.trim();  //
    }else if(document.getElementById("adhoc_meeting_useremail").value === ""){
        alert("Can't proceed without your email");
        return;
    }else if(!document.getElementById("adhoc_meeting_useremail").value.match("(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")){
        alert("Invalid email ID")
    }
    if(document.getElementById("adhoc_meeting_message").value !== ""){
        obj.message = document.getElementById("adhoc_meeting_message").value.trim();
    }
    obj.scheduled = false;
    obj.adhoc = true;
    obj.video_codec_h264 = $("#pH264ChkADHOC").prop("checked");

    var inviteEmailDivs = document.getElementsByClassName("adhoc_meeting_user");
    obj.dateTime = moment()._d.getTime();
    var users = [];
    for(var i=0;i<inviteEmailDivs.length;i++){
        if(inviteEmailDivs[i].value !== ""){
            if(inviteEmailDivs[i].value.trim().match("(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")) {
                users.push(inviteEmailDivs[i].value.trim());
            }else{
                alert("Invalid Email ID");
                return;
            }
        }
    }
    if(users.length < 1){
        alert("Atleast one invite is required");
        return;
    }
    obj.inviteUsers = users;
    createRoom(obj,function (res) {
        if(res){
            alert("Invited To Room Successfully");
            // window.location.reload();
        }else{
            alert("Error when sending Invitation");
        }

    });
}
// function createdMeeting() {
//     var obj = {};
//     if(document.getElementById("created_meeting_roomID").value !== ""){
//         obj.topic = document.getElementById("created_meeting_roomID").value.trim();
//         obj.room_id = document.getElementById("created_meeting_roomID").value.trim();
//     }else{
//         alert("Topic is important");
//         return;
//     }
//     if(document.getElementById("created_meeting_username").value !== ""){
//         obj.username = document.getElementById("created_meeting_username").value.trim();
//     }else{
//         alert("Username is mandatory");
//         return;
//     }
//     if(document.getElementById("created_meeting_useremail").value !== ""){
//         obj.useremail = document.getElementById("created_meeting_useremail").value.trim();  //
//     }else if(document.getElementById("created_meeting_useremail").value === ""){
//         alert("Can't proceed without your email");
//         return;
//     }else if(!document.getElementById("created_meeting_useremail").value.match("(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")){
//         alert("Invalid email ID")
//     }
//     if(document.getElementById("created_meeting_message").value !== ""){
//         obj.message = document.getElementById("created_meeting_message").value.trim();
//     }
//     obj.scheduled = false;
//     obj.adhoc = false;
//     var inviteEmailDivs = document.getElementsByClassName("created_meeting_user");
//     obj.dateTime = moment()._d.getTime();
//     var users = [];
//     for(var i=0;i<inviteEmailDivs.length;i++){
//         if(inviteEmailDivs[i].value !== ""){
//             if(inviteEmailDivs[i].value.trim().match("(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")) {
//                 users.push(inviteEmailDivs[i].value.trim());
//             }else{
//                 alert("Invalid Email ID");
//                 return;
//             }
//         }
//     }
//     if(users.length < 1){
//         alert("Atleast one invite is required");
//         return;
//     }
//     obj.inviteUsers = users;
//     inviteRoom(obj,function (res) {
//         if(res){
//             alert("Invited To Room Successfully");
//             // window.location.reload();
//         }else{
//             alert("Error when sending Invitation");
//         }
//
//     });
// }
function parmanentRoom() {
    var obj = {};
    if(document.getElementById("pRoomName").value !== ""){
        obj.topic = document.getElementById("pRoomName").value.trim();
    }else{
        alert("Topic is important");
        return;
    }
    if(document.getElementById("pRoomUserName").value !== ""){
        obj.username = document.getElementById("pRoomUserName").value.trim();
    }else{
        alert("Username is mandatory");
        return;
    }
    if(document.getElementById("pRoomUserEmail").value !== ""){
        obj.useremail = document.getElementById("pRoomUserEmail").value.trim();  //
    }else if(document.getElementById("pRoomUserEmail").value === ""){
        alert("Can't proceed without your email");
        return;
    }else if(!document.getElementById("pRoomUserEmail").value.match("(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")){
        alert("Invalid email ID")
    }
    if(document.getElementById("pRoomInviteMsg").value !== ""){
        obj.message = document.getElementById("pRoomInviteMsg").value.trim();
    }
    obj.active_talker = true;
    obj.video_codec_h264 = $("#pH264Chk").prop("checked");
    obj.scheduled = false;
    obj.adhoc = false;
    var inviteEmailDivs = document.getElementsByClassName("pRoomInviteUser");
    obj.dateTime = moment()._d.getTime();
    var users = [];
    for(var i=0;i<inviteEmailDivs.length;i++){
        if(inviteEmailDivs[i].value !== ""){
            if(inviteEmailDivs[i].value.trim().match("(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")) {
                users.push(inviteEmailDivs[i].value.trim());
            }else{
                alert("Invalid Email ID");
                return;
            }
        }
    }
    obj.inviteUsers = users;
    //createPinBasedRoom
    /*if(document.getElementById('pRoomMPIN').value.trim()!=="" && document.getElementById('pRoomPPIN').value.trim()!==""){*/
    // if(createPinBasedRoom.status != "undefined" && createPinBasedRoom.status == "yes" && createPinBasedRoom.status != "no"){
    obj.pin = {};
    /*obj.pin.mpin = document.getElementById('pRoomMPIN').value.trim();
    obj.pin.ppin = document.getElementById('pRoomPPIN').value.trim();*/
    obj.pin.mpin = Math.floor(100000 + Math.random() * 900000);
    obj.pin.ppin = Math.floor(100000 + Math.random() * 900000);
    if(obj.pin.mpin == obj.pin.ppin){
        obj.pin.mpin = Math.floor(100000 + Math.random() * 900000);
        obj.pin.ppin = Math.floor(100000 + Math.random() * 900000);
    }
    obj.pin.mpin = obj.pin.mpin.toString();
    obj.pin.ppin = obj.pin.ppin.toString();
    // }
    createRoom(obj,function (res) {
        if(res){
            alert("Invited To Room Successfully");
            // window.location.reload();
        }else{
            alert("Error when sending Invitation");
        }

    });
}
var createRoom = function(details,callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    xhttp.open("POST", "/createRoom/", true);
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

// $("#pPinChk").on("click",function (ev) {
//    var chk = $(ev.currentTarget).prop("checked");
//    if(chk){
//        createPinBasedRoom.status = "yes";
//
//    }else{
//        createPinBasedRoom.status = "no";
//    }
// });
