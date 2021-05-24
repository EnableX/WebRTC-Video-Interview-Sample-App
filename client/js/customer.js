// var server_url = "https://infosys.vcloudx.com/"; //"https://kamalvm.vcloudx.com:8443/";
var socket_opt = {
    reconnection: true,
    reconnectionAttempts: 10,
    forceNew: true,
    transports: ["websocket"],
    pingInterval: 25000,
    pingTimeout: 600000,
};

// face AI Config params


// facex configurations

let faceTrackStream = 'localStream';
let joinRoomRes = null;
let faceX = null;
let faceComp = null;
let isCheckSimilarity = false;
let selectedImage = [];
let selectedImgIndex = 0;
let facexRunning = false;
const faceConfig = {
    maxInputFrameSize: 160,
    smoothness: 0.99,
    enableBalancer: false,
    threshold: 0.7,
    fullFrameDetection: true,
};

let isAppendFaceDetail = false;
let faceTrackingData = {
    attention: null,
    age: null,
    gender: null,
    pose: null,
    face: null,
    liveness: "",
    similarity: "",
    emotions: null,
    features: null,
    arousalValence: null,
};
var remoteTrackingData = {};
let previousSendData = null;
let imgURL = null;
let isCheckLiveness = false;
let facesURL = [];

let faceAIConfig = {
    faceDetector: {minFaceSizeAt640: 50, maxInputFrameSize: 720, multiFace: true},
    facePose: {},
    faceAge: {},
    faceEmotion: {},
    faceGender: {smoothness: 0.95, threshold: 0.70},
    faceFeatures: {smoothness: 0.90},
    faceArousalValence: {},
    faceAttention: {},
}


// const searchParams = new URLSearchParams(window.location.search);
// console.log('searchParams: ', searchParams)
// const tokenData = searchParams.get("panelist");
// console.log(tokenData);

var socket = io.connect(user_data.service, socket_opt);
socket.on("connected", function (data) {
    if (data.success) {
        clientID = data.success.id;

        faceX = new EnxFaceAI();
        faceComp = new EnxFaceCompare();


        console.log("agent data :", user_data);
        if (
            user_data.job_id
        ) {
            socket.emit("candidate-logged-in", user_data);
            socket.on("join-call", function (data) {
                if (data.token) {
                    document.querySelector('#wait-msg').innerHTML = "You are getting into the interview";
                    setTimeout(function () {
                        ConnectCall(data.token);
                    }, 3000);
                }
            });
            socket.on("wait", function (data) {
                document.querySelector('#wait-msg').innerHTML = data.message;
            });
        } else alert("Re login");
    }
});


// var streamShare = false;
// const searchParams = new URLSearchParams(window.location.search);
// const tokenData = searchParams.get("token");

var sitebar_height =
    $(document).innerHeight() -
    $(".card-header").innerHeight() -
    $(".card-block").innerHeight();
$("#frame").css("height", sitebar_height - 150);

$(".logout_div").on("click", function () {
    window.location.href = "https://www.enablex.io/";
});
$("#chat-window").scrollbar({
    autoBottom: true,
});
var user_id = null;
// var server_url = "https://cc-digi.enablex.io/";
var user_name = null;
var user_type = $("#user_type").val();
var ischatViewOpen = false;
// var user_data;
var cate_id;
var clientID;
var stats_enabled = false;
var audio_muted = false;
var video_muted = false;
var SubscribedStreamMap = new Map();
var ATList = null;
var local_view,
    remote_view,
    sAMute = true,
    sVMute = true,
    rAmute = true,
    rVMute = true;
var network_error_showed = false;
var socket_opt = {
    reconnection: true,
    reconnectionAttempts: 10,
    forceNew: true,
    transports: ["websocket"],
    pingInterval: 25000,
    pingTimeout: 600000,
};

var VideoSize = {HD: [480, 270, 1280, 720], SD: [480, 270, 640, 480]};
var config = {
    video: true,
    audio: true,
    data: true,
    videoSize: [],
    maxVideoLayers: 1,
    attributes: {name: 'user_name', type: user_type},
    maxVideoBW: 1024,
    minVideoBW: 270,
};
var room = null;
var options = {
    player: {
        height: "100%",
        width: "100%",
    },
    toolbar: {
        displayMode: false,
    },
    resizer: false,
};
// var optionsLocal = {
//   player: {
//     height: "150px",
//     width: "150px",
//     minHeight: "150px",
//     minWidth: "150px",
//   },
//   toolbar: {
//     displayMode: false,
//   },
//   resizer: false,
// };

var optionsLocal = {
    player: {
        height: "180px",
        width: "180px",
        minHeight: "180px",
        minWidth: "180px",
    },
    toolbar: {
        displayMode: false,
    },
    resizer: false,
};

var remoteOptions = {
    player: {
        height: "180px",
        width: "180px",
        minHeight: "180px",
        minWidth: "180px",
    },
    resizer: false,
    toolbar: {
        displayMode: false,
    },
};

$(".icheck").iCheck({
    checkboxClass: "icheckbox_minimal",
    radioClass: "iradio_minimal",
});
var dept_json = {"1": "Billing", "2": "Sales", "3": "Support"};
var canvasStream = null;
var isModerator = false;
var presentationStarted = false;
var ATUserList = null;
var desktop_shared = false;
var shareStream = null;

$(".icheck").on("ifToggled", function (event) {
    document.querySelector("#agree_terms").checked
        ? joinButton.removeAttribute("disabled")
        : joinButton.setAttribute("disabled", "disabled");
});
EnxRtc.getDevices(function (arg) {
    if (arg.result === 0) {
    } else if (arg.result === 1145) {
        $(".error_div").html(
            "Your media devices might be in use with some other application."
        );
        $(".error_div").show();
        $("#call_now").hide();
    } else {
        $(".error_div").show();
        $("#call_now").hide();
    }
});

function ConnectCall(token) {
    EnxRtc.Logger.setLogLevel(0);
    local_view = EnxRtc.joinRoom(token, config, function (success, error) {
        if (success && success !== null) {
            joinRoomRes = success;
            room = success.room;
            showLocalView();

            $("#self_mute_buttons").show();

            isModerator = room.me.role == "moderator" ? true : false;
            var ownId = success.publishId;
            for (var i = 0; i < success.streams.length; i++) {
                room.subscribe(success.streams[i]);
            }

            room.addEventListener("active-talkers-updated", function (event) {
                console.log("Active Talker List :- " + JSON.stringify(event));
                var video_player_len = document.querySelector("#call_div").childNodes;
                ATList = event.message.activeList;
                ATUserList = event.message.activeList;


                for (var stream in room.remoteStreams.getAll()) {
                    var st = room.remoteStreams.getAll()[stream];
                    for (var j = 0; j < ATList.length; j++) {
                        if (ATList[j].streamId == st.getID()) {
                            startDuration();
                            showDivs();
                            remote_view = st;
                            // $(".self-name").html(room.me.name);
                            $(".remote-name").html(ATList[j].name);
                            $(".logout_div").hide();
                            $("#option_container").hide();
                            $("#call_container").show();

                            if (document.querySelector(`#call_div #box_${st.getID()}`) === null) {
                                let parentCont = document.getElementById('call_div');
                                let boxId = `box_${st.getID()}`;
                                let newStreamDiv = document.createElement("div");
                                newStreamDiv.setAttribute("id", boxId);
                                newStreamDiv.setAttribute("class", `box`);
                                parentCont.append(newStreamDiv);
                                st.show(boxId, remoteOptions);
                                addNameToPlayer(st.getID(), ATList[j].name);
                            }
                            else {
                                addNameToPlayer(st.getID(), ATList[j].name, true);
                            }

                        }
                    }
                }
            });

            function addNameToPlayer(streamId, name, update = false) {
                if (update) {
                    let name_div = document.querySelector("#stream_username_" + streamId);
                    if (name_div) {
                        if (name != name_div.innerText) {
                            name_div.innerText = name;
                        }
                    }
                } else {
                    if (!document.querySelector("#stream_username_" + streamId)) {
                        let titleNIconsDiv = document.createElement('div');
                        titleNIconsDiv.classList.add("stream-name-and-icons");
                        titleNIconsDiv.innerHTML = `<div class="stream-user-name" id="stream_username_${streamId}">${name}</div>`;
                        document.querySelector(`#call_div #box_${streamId}`).append(titleNIconsDiv);
                    }
                }
            }


            room.addEventListener("message-received", function (data) {
                var obj = {
                    msg: data.message.message,
                    timestamp: data.message.timestamp,
                    username: data.message.sender,
                };
                if (!ischatViewOpen) {
                    $("#chat-tag").show();
                }
                plotChat(obj);
            });
            room.addEventListener("room-record-on", function () {
                $("#rec_notification").show();
            });
            room.addEventListener("room-record-off", function () {
                $("#rec_notification").hide();
            });
            room.addEventListener("network-reconnect-timeout", function (event) {
                var error_string = "Reconnection timeout";
                swal({
                    title: error_string,
                    type: "error",
                    text: "",
                    showConfirmButton: false,
                    showCancelButton: false,
                    timer: 3000,
                });
                setTimeout(function(){
                    rejoin();
                    },3000);
            });
            room.addEventListener("network-reconnect-failed", function (event) {
                var error_string = "Reconnection failed";
                swal({
                    title: error_string,
                    type: "error",
                    text: "",
                    showConfirmButton: false,
                    showCancelButton: false,
                    timer: 3000,
                });
                setTimeout(function(){
                    rejoin();
                },3000);
            });
            room.addEventListener("network-disconnected", function (event) {
                if (presentationStarted) {
                    canvasStream == null;
                    presentationStarted = false;
                    toggleStreamView("show_stream_div", null, false);
                }

                var str = "";
                if (room.reconnectionAllowed == true) {
                    str = "Reconnecting...";
                }
                swal({
                    title: str,
                    type: "error",
                    text: "",
                    showConfirmButton: false,
                    showCancelButton: false,
                    timer: 3000,
                });
                if (room.reconnectionAllowed == false) {
                    setTimeout(function(){
                        rejoin();
                    },3000);
                }
            });
            room.addEventListener("network-reconnected", function (event) {
                var error_string = "Reconnected";
                swal({
                    title: error_string,
                    type: "success",
                    text: "",
                    showConfirmButton: false,
                    showCancelButton: false,
                    timer: 3000,
                });
            });
            room.addEventListener("network-failed", function (event) {
                if (network_error_showed == false) {
                    if (event.error === 1160) {
                        network_error_showed = true;
                        swal({
                            title: event.message,
                            text: "You are being redirected to login page!",
                            type: "error",
                            showCancelButton: false,
                            showConfirmButton: false,
                            timer: 4000,
                        });
                        setTimeout(function () {
                            window.location.reload();
                        }, 4000);
                    } else if (event.error === 1161) {
                        network_error_showed = true;
                        swal({
                            title: event.message,
                            text: "You are being redirected to login page!",
                            type: "error",
                            showCancelButton: false,
                            showConfirmButton: false,
                            timer: 4000,
                        });
                        setTimeout(function () {
                            window.location.reload();
                        }, 4000);
                    }
                }
            });
            room.addEventListener("stream-subscribed", function (streamEvent) {
                if (streamEvent.stream.getID() !== ownId) {
                    SubscribedStreamMap.set(
                        streamEvent.stream.getID(),
                        streamEvent.stream
                    );
                    var stream =
                        streamEvent.data && streamEvent.data.stream
                            ? streamEvent.data.stream
                            : streamEvent.stream;
                    stream.addEventListener("stream-data-in", function (data) {
                        var obj = {
                            msg: data.msg.message,
                            timestamp: data.msg.timestamp,
                            username: data.msg.from,
                        };
                        plotChat(obj);
                    });
                }


                if (room.shareStatus && stream.ifScreen() && stream.stream !== undefined) {
                    presentationStarted = true;
                    shareStart = true;
                    stream.play('show_stream_div', {
                        player: {
                            height: "100%",
                            width: "100%",
                            minHeight: "180px",
                            minWidth: "180px",
                        }
                    });
                }

            });

            room.addEventListener("canvas-started", function (event) {
                var ua = navigator.userAgent.toLowerCase();
                var ConfigSpecs = {
                    maxVideoBW: 120,
                };
                if (ua.indexOf("safari") != -1) {
                    if (ua.indexOf("chrome") > -1) {
                        local_view.updateConfiguration(ConfigSpecs, function (result) {
                        });
                    }
                }
                if (!isModerator) {
                    var canvas_stream_id = event.message.streamId;
                    if (presentationStarted == false) {
                        presentationStarted = true;
                        const st = room.remoteStreams.get(canvas_stream_id);
                        toggleStreamView("show_stream_div", st, true);
                    }
                }
            });
            room.addEventListener("canvas-stopped", function (event) {
                canvasStream == null;
                presentationStarted = false;
                toggleStreamView("show_stream_div", null, false);
            });

            room.addEventListener("share-started", function (event) {
                var ua = navigator.userAgent.toLowerCase();
                var ConfigSpecs = {
                    maxVideoBW: 120,
                };
                if (ua.indexOf("safari") != -1) {
                    if (ua.indexOf("chrome") > -1) {
                        local_view.updateConfiguration(ConfigSpecs, function (result) {
                        });
                    }
                }
                var clientId = event.message.clientId;
                if (presentationStarted == false && desktop_shared == false) {
                    if (shareStream == null) {
                        var st = room.remoteStreams.get(event.message.streamId);
                        if (st.stream !== undefined) {
                            presentationStarted = true;
                            shareStart = true;
                            document.querySelector('#show_stream_div').innerHTML = "";
                            st.play('show_stream_div', {
                                player: {
                                    height: "100%",
                                    width: "100%",
                                    minHeight: "180px",
                                    minWidth: "180px",
                                }
                            });
                            document.getElementById("self-view").innerHTML = "";
                            local_view.play("self-view", optionsLocal);
                        }
                    }
                }
            });

            room.addEventListener("share-stopped", function (event) {
                var ua = navigator.userAgent.toLowerCase();
                var ConfigSpecs = {
                    maxVideoBW: 0,
                };
                if (ua.indexOf("safari") != -1) {
                    if (ua.indexOf("chrome") > -1) {
                        local_view.updateConfiguration(ConfigSpecs, function (result) {
                        });
                    }
                }
                desktop_shared = false;
                shareStart = false;
                presentationStarted = false;
                streamShare = null;
                // toggleStreamView("show_stream_div", null, false);
                // local_view.play("show_stream_div", optionsLocal);
                document.querySelector('#show_stream_div').innerHTML = "";
                local_view.play('show_stream_div', {
                    player: {
                        height: "100%",
                        width: "100%",
                        minHeight: "180px",
                        minWidth: "180px",
                    }
                });
                document.querySelector('#self-view').innerHTML = "";
            });

            room.addEventListener("user-disconnected", function (streamEvent) {
                room.destroy();
                window.open("", "_self").close();
            });

            room.addEventListener("room-disconnected", function (streamEvent) {
                swal(
                    {
                        title: "Call Disconnected",
                        text: "",
                        type: "warning",
                        timer: 2000,
                        buttons: false,
                    },
                    function () {
                        room.destroy();
                        window.open("", "_self").close();
                    }
                );
            });
        } else if (error && error != null) {
            var errMsg = {};
            if (
                error.msg &&
                error.msg.name &&
                (error.msg.name === "NotFoundError" ||
                    error.msg.name === "NotReadableError" ||
                    error.msg.name === "NotSupportedError")
            ) {
                $("#call_now").show();
                $("#form-div").show();
                $("#overlay").hide();
                swal({
                    title: "Requested device not found!",
                    text: "",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonClass: "btn-danger",
                    confirmButtonText: "Ok",
                    cancelButtonText: "",
                    showCancelButton: false,
                    closeOnConfirm: true,
                });
                errMsg.message = "Hardware issues in client's system";
            }
            if (error.msg && error.msg.name === "OverconstrainedError") {
                swal({
                    title: "Camera quality not supported",
                    text: "",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonClass: "btn-danger",
                    confirmButtonText: "Ok",
                    cancelButtonText: "",
                    showCancelButton: false,
                    closeOnConfirm: true,
                });
                errMsg.message = "Hardware issues in client's system";
            }
            // socket.emit("disconnect-call", {error:errMsg});
        }
    });
}

function rejoin() {
    window.location.reload();
}

function enable_stats() {
    if (stats_enabled == false) {
        room.subscribeStreamStatsForClient(local_view, true);
        stats_enabled = true;
    } else {
        room.subscribeStreamStatsForClient(local_view, false);
        stats_enabled = false;
    }
}

function plotChat(obj) {
    var f_name = obj.username;
    var name = obj.username.slice(0, 1);
    var template =
        ' <li class="left clearfix">' +
        '<span class="chat-img pull-left">' +
        '<div  class="img-circle red" >' +
        name +
        "</div>" +
        "</span>" +
        '<div class="chat-body clearfix">' +
        '<div class="header1">' +
        '<strong class="primary-font">' +
        f_name +
        "</strong> " +
        " </div>" +
        "<p>" +
        obj.msg +
        " </p>" +
        "</div>" +
        " </li>";

    var elem = document.getElementById("chat-message");
    $(template).appendTo(elem);
}

function sendChat(event) {
    if (event.keyCode === 13) {
        addText();
    }
}

function addText() {
    var text = document.getElementById("chat-text-area").value;
    var elem = document.getElementById("chat-message");

    if (/<[a-z][\s\S]*>/i.test(text)) {
        text = "'" + text + "'";
    }
    if (text !== "") {
        var template = createChatText(text);
        $(template).appendTo(elem);
        document.getElementById("chat-text-area").value = "";
        sendChatToServer(text);
    }
}

function sendChatToServer(text) {
    room.sendMessage(text, true, [], function () {
    });
}

function createChatText(text) {
    var f_name = room.me.name;
    var name = room.me.name.slice(0, 1);
    var template =
        '<li class="right clearfix"><span class="chat-img pull-right">' +
        '<div  class="img-circle sky_blue" >Me</div>' +
        "</span>" +
        '<div class="chat-body clearfix">' +
        ' <div class="header1">' +
        ' <strong class="pull-right primary-font">' +
        f_name +
        "</strong><br/>" +
        " </div>" +
        "<p>" +
        text +
        " </p>" +
        "</div>" +
        "</li>";

    return template;
}

function toggleStreamView(layout, stream, action) {
    if (action) {
        $("#call_div").hide();
        $(".remote-name").hide();
        $(`#${layout}`).html("");
        $(`#${layout}`).show();
        stream.play(layout, options);
        $("#self-view").append(
            `<div id='user_view' style='margin-top: 25px; display: flex; justify-content: center;'></div>`
        );
        const rs = room.remoteStreams.get(ATUserList[0].streamId);
        rs.play("user_view", optionsLocal);
        $("#self-view, #user_view").css({
            "min-height": "100px",
            "min-width": "100px",
            background: "#000",
        });
        $("#user_view").append(`<div id='remote-name'></div>`);
        $("#remote-name").html(ATUserList[0].name);
    } else {
        $(`#${layout}`).hide();
        $(`#user_view`).remove();
        $(`#remote-name`).remove();
        $("#call_div").show();
        $(".remote-name").show();
        //$("#self-view").css({ "min-height": "200px", "min-width": "250px" });
    }
}

function screenShare() {
    if (
        navigator.userAgent.indexOf("QQBrowser") > -1 &&
        room.Connection.getBrowserVersion() < 72
    ) {
        toastr.error(language.ss_unsupport_qq);
        return;
    } else if (
        navigator.userAgent.indexOf("Chrome") > -1 &&
        room.Connection.getBrowserVersion() < 72
    ) {
        toastr.error(language.ss_unsupport_chrome_below72);
        return;
    }

    if (presentationStarted === false) {
        desktop_shared = true;
        streamShare = room.startScreenShare(function (rs) {
            if (rs.result === 0) {
                presentationStarted = true;
                shareStart = true;
                $("#share_screen_btn").prop("title", "Stop Share");
            } else if (rs.result === 1151) {
                desktop_shared = false;
                toastr.error(rs.error);
            } else if (rs.result === 1144) {
                desktop_shared = false;
                toastr.error(rs.error);
            } else if (rs.result === 1150) {
                desktop_shared = false;
                $("#extension-dialog").modal("toggle");
            } else {
                desktop_shared = false;
                toastr.error(language.ss_not_supported);
            }
        });
    } else if (streamShare) {
        room.stopScreenShare(function (res) {
            if (res.result == 0) {
                $("#share_screen_btn").prop("title", "Start Share");
                presentationStarted = false;
                shareStart = false;
                streamShare = null;
            }
        });
    }

    if (streamShare) {
        streamShare.addEventListener("stream-ended", function (event) {
            room.stopScreenShare(function (res) {
                if (res.result == 0) {
                    $("#share_screen_btn").prop("title", "Start Share");
                    $(".SSicon").removeClass("blink-image");
                    presentationStarted = false;
                    streamShare = null;
                }
            });
        });
    }
}

function showUserInfo(user_data) {
    var client_name = user_data.user_name;
    var client_email = user_data.user_email;
    var client_ssn = user_data.user_ssn;
    var client_phone = user_data.user_phone;
    var info_html =
        "<h4>" +
        client_name +
        " <small></small>  </h4> " +
        '<div class="media" style="margin-top: 0px;">' +
        '<a class="pull-left" href="#">' +
        '<img style="border-radius: 100px;margin-bottom:0px;width: 90px;" class="thumb media-object" src="/images/user-vacant-seat.jpg" alt="">' +
        "</a>" +
        '<div class="media-body" style="margin-top: 10px;">' +
        "<address>" +
        //'<strong>NRIC</strong> :'+client_ssn+' <br>'+
        //'<strong>Phone</strong> :'+client_phone+' <br>'+
        //'<strong>Email.</strong> : '+client_email+'<br>'+
        "</address>" +
        "</div>" +
        "</div>";
    $("#guest-user-info").html(info_html);
    // $("#documents-info").html("No Available Documents")
}

function showDivs() {
    $("#form-div").hide();
    $("#video-div").show();
    $("#support-div").hide();
    $("#overlay").hide();
    $("#disconnect_call").show();
    $("#self-view-div").show();
    $(".rLine").show();
}

$("#disconnect_call").on("click", function () {
    room.destroy();
    window.open("", "_self").close();
});
if ($(".category").val() == "0") $(".call_now").prop("disabled", true);
else $(".call_now ").prop("disabled", false);

$(".category").on("change", function () {
    if ($(".category").val() == "0") $(".call_now").prop("disabled", true);
    else $(".call_now").prop("disabled", false);
});
// $("#remote_aMute").click(function (e) {
//     remote_view.stream.getAudioTracks()[0].enabled = !rAmute;
//     rAmute = !rAmute;
//     if($("#remote_aMute").hasClass('fa-volume-up')){
//         $("#remote_aMute").removeClass('fa-volume-up');
//         $("#remote_aMute").addClass('fa-volume-off');
//     }else{
//         $("#remote_aMute").removeClass('fa-volume-off');
//         $("#remote_aMute").addClass('fa-volume-up');
//     }
// });
// $("#remote_vMute").click(function (e) {
//     remote_view.stream.getVideoTracks()[0].enabled = !rVMute;
//     rVMute = !rVMute;
//     if($("#remote_vMute").hasClass('fa-video-camera')){
//         $("#remote_vMute").removeClass('fa-video-camera');
//         $("#remote_vMute").addClass('fa-stop');
//     }else{
//         $("#remote_vMute").removeClass('fa-stop');
//         $("#remote_vMute").addClass('fa-video-camera');
//     }
// });
$("#self_aMute").click(function (e) {
    if (audio_muted) {
        if (room.mute) {
            toastr.error("Your audio is muted by moderator");
        } else {
            local_view.unmuteAudio(function (arg) {
                $("#self_aMute").removeClass("fa-microphone-slash");
                $("#self_aMute").addClass("fa-microphone");

                audio_muted = false;
            });
        }
    } else {
        local_view.muteAudio(function (arg) {
            $("#self_aMute").removeClass("fa-microphone");
            $("#self_aMute").addClass("fa-microphone-slash");
            audio_muted = true;
        });
    }
});

function clearLocalView() {
    document.getElementById("self-view").innerHTML = "";
}

function showLocalView() {
    $("#show_stream_div").html("");
    // local_view.play("self-view", optionsLocal);
    local_view.play('show_stream_div', {
        player: {
            height: "100%",
            width: "100%",
            minHeight: "180px",
            minWidth: "180px",
        }
    });
    if(room.roomSettings.facex && room.roomSettings.facex == true)
    {
        faceTrackInit(joinRoomRes, local_view);
    }

}

function faceTrackInit(data, stream) {
    faceX.init(data, null, faceAIConfig, (res) => {
        console.log(res, "init result");
    if (res.result === 0) {
        startFaceTrack();
    }
})
    ;
}

function startFaceTrack() {
    faceX.startFaceDetector((res) => {
        if(res.result === 0)
    {
        if (faceTrackStream == "localStream") {
            appendRemoteFaceDetail();
        }
        window.addEventListener(`face-detector`, (evt) => {
            const faces = evt.detail.totalFaces;
        //console.log('Face detector result', faces);
        //faceTrackingData.face = faces.length;
    })
        ;
    }
})
    ;

    // faceX.startFacePose((res) => {
    //   if (res.result === 0) {
    //     window.addEventListener(`face-pose`, (evt) => {
    //       //console.log(evt.detail, "facex pose event...........");
    //       const pitch = evt.detail.output.pose.pitch.toFixed(2);
    //       const yaw = evt.detail.output.pose.yaw.toFixed(2);
    //       //const roll = evt.detail.output.pose.yaw.toFixed(2);
    //       if (yaw > 0.2 || yaw < -0.2 || pitch > 0.2 || pitch < -0.2)
    //         faceTrackingData.pose = "Please look into the camera";
    //       else faceTrackingData.pose = "Good";
    //     });
    //   }
    // });

    faceX.startFaceAge((res) => {
        if(res.result === 0
)
    {
        window.addEventListener(`face-age`, (evt) => {
            //console.log(evt.detail, "facex age event...........");
            //const age = Math.ceil(evt.detail.output.numericAge / 5) * 5;
            faceTrackingData.age = evt.detail.output.numericAge; // age - 5 + "-" + age;
        // if (faceTrackStream === "localStream") {
        //     likelyAge.noUiSlider.set(faceTrackingData.age);
        // }else{
        //     //sendFaceData(faceTrackingData);
        // }

    })
        ;
    }
})
    ;
    faceX.startFaceEmotion((res) => {
        if(res.result === 0
)
    {
        window.addEventListener(`face-emotion`, (evt) => {
            const emotions = evt.detail.output.emotion;
        const tempEmotion = {};
        for (const emotion in emotions) {
            tempEmotion[emotion] = parseInt(emotions[emotion].toFixed(2) * 100);
        }
        faceTrackingData.emotions = tempEmotion;
        // if (faceTrackStream === "localStream") {
        //     emoAngryId.style.height = faceTrackingData.emotions.Angry + "px";
        //     emoDisgust.style.height = faceTrackingData.emotions.Disgust + "px";
        //     emoFear.style.height = faceTrackingData.emotions.Fear + "px";
        //     emoHappy.style.height = faceTrackingData.emotions.Happy + "px";
        //     emoSad.style.height = faceTrackingData.emotions.Sad + "px";
        //     emoSurprise.style.height = faceTrackingData.emotions.Surprise + "px";
        //     emoNutral.style.height = faceTrackingData.emotions.Neutral + "px";
        // }
        // else{
        //   sendFaceData(faceTrackingData);
        // }
    })
        ;
    }
})
    ;
    faceX.startFaceGender((res) => {
        if(res.result === 0
)
    {
        window.addEventListener(`face-gender`, (evt) => {
            //console.log(evt.detail, "facex gender event...........");
            const gender = evt.detail.output.mostConfident;
        faceTrackingData.gender = gender ? gender : "";
        // if (faceTrackStream === "localStream") {
        //     genderDiv.innerHTML = `<li>${faceTrackingData.gender}</li>`;
        // }else{
        //     //sendFaceData(faceTrackingData);
        // }
    })
        ;
    }
})
    ;
    faceX.startFaceFeatures((res) => {
        if(res.result === 0
)
    {
        window.addEventListener(`face-features`, (evt) => {
            const features = evt.detail.output.features;
        const tempFeatures = {};
        for (const feature in features) {
            if (features[feature] >= 0.4) {
                tempFeatures[feature] = features[feature].toFixed(2);
            }
        }
        faceTrackingData.features = tempFeatures;
        //console.log(faceTrackingData.features, "facex features event...........");
        // if (faceTrackStream === "localStream") {
        //     appendNode.innerHTML = "";
        //     for (let key in faceTrackingData.features) {
        //         if (faceTrackingData.features.hasOwnProperty(key)) {
        //             let value = faceTrackingData.features[key];
        //             //if (value >= 0.4) {
        //             let node = document.createElement("LI");
        //             let textnode = document.createTextNode(key);
        //             node.appendChild(textnode);
        //             appendNode.appendChild(node);
        //             // }
        //         }
        //     }
        // }else{
        //     //sendFaceData(faceTrackingData);
        // }
    })
        ;
    }
})
    ;
    faceX.startFaceArousalValence((res) => {
        if(res.result === 0
)
    {
        window.addEventListener(`face-arousal-valence`, (evt) => {
            const arousalValence = evt.detail.output.arousalvalence;
        faceTrackingData.arousalValence = {
            arousal: arousalValence.arousal.toFixed(2)*100,
            valence: arousalValence.valence.toFixed(2)*100
        };
        // if (faceTrackStream === "localStream") {
        //     affectsArousal.noUiSlider.set(faceTrackingData.arousalValence.arousal);
        //     affectsValence.noUiSlider.set(faceTrackingData.arousalValence.valence);
        // }else{
        //     //sendFaceData(faceTrackingData);
        // }
        //console.log(evt.detail, "facex arousal-valence event...........");
    })
        ;
    }
})
    ;
    faceX.startFaceAttention((res) => {
        if(res.result === 0
)
    {
        window.addEventListener(`face-attention`, (evt) => {
            //console.log(evt.detail.output.attention.toFixed(2), "facex attention event...........");
            const attention = evt.detail.output.attention.toFixed(2) * 100;
        faceTrackingData.attention = attention;
        // if (faceTrackStream === "localStream") {
        //     attentionId.style.height = attention + "px";
        // }else{
        //     //sendFaceData(faceTrackingData);
        // }
    })
        ;
    }
})
    ;
}

var muteUnmuteBtn = document.querySelector("#self_vMute");

function enableMuteButton() {
    muteUnmuteBtn.removeAttribute("disabled");
    muteUnmuteBtn.style.cursor = "pointer";
    muteUnmuteBtn.style.pointerEvents = "auto";
}

function videoMute() {
    muteUnmuteBtn.style.cursor = "wait";
    muteUnmuteBtn.style.pointerEvents = "none";
    muteUnmuteBtn.disabled = true;
    muteUnmuteBtn.setAttribute("disabled", "disabled");

    if (video_muted) {
        local_view.unmuteVideo(function (res) {
            if (res.result === 0) {
                $("#self_vMute").removeClass("fa-video-slash");
                $("#self_vMute").addClass("fa-video");
                video_muted = false;
                enableMuteButton();
            } else if (res.result === 1140) {
                toastr.error(res.error);
                enableMuteButton();
            }
        });
    } else {
        local_view.muteVideo(function (res) {
            if (res.result === 0) {
                $("#self_vMute").removeClass("fa-video");
                $("#self_vMute").addClass("fa-video-slash");
                video_muted = true;
                enableMuteButton();
            } else if (res.result === 1140) {
                enableMuteButton();
            }
        });
    }
}

$("#self_vMute").click(function (e) {
    videoMute();
});
document.querySelector("#overlay").style.display = 'flex';

function toggleChat() {
    ischatViewOpen ? (ischatViewOpen = false) : (ischatViewOpen = true);
    if (ischatViewOpen) {
        $("#chat_window-popup").show();
        $("#chat-tag").hide();
    } else {
        $("#chat_window-popup").hide();
    }
}

function sendFaceData(faceData) {
    //previousSendData = {...faceData};
    faceTrackingData = {};
    // room.sendUserData(JSON.stringify(faceData), true, [], function (data) {
    //     faceTrackingData = {};
    //     // Message sent
    // });
    room.sendUserData(JSON.stringify(faceData), true, []);
}

function appendRemoteFaceDetail(remoteData) {
    isAppendFaceDetail = true;
    setInterval(function () {
        optimizeRemoteData(faceTrackingData);
    }, 1000 / 3);
}

function stopFaceTracking() {
    faceX.stopFaceAI((evt) => {
        console.log(evt, "stop face ai");
})
    ;
}

function startFaceEmo() {
    faceX.startFaceEmotion({}, (res) => {
        if(res.result === 0
)
    {
        window.addEventListener("facex-emotion", (evt) => {
            console.log(evt.detail, "facex emotion event...........");
    })
        ;
    }
})
    ;
}

function stopFaceEmo() {
    faceX.stopFaceEmotion((evt) => {
        console.log(evt, "stop face emotion evt..............");
})
    ;
}

var diffPer = 1;

function optimizeRemoteData(data) {
    if (!previousSendData) {
        //setTimeout(function(){ sendFaceData(data); }, 5000);
        previousSendData = {...data
    }
        ;
        sendFaceData(data);
        return;
    }

    let optimizeData = {};
    if (data && data.age) {
        if (!previousSendData.age) {
            optimizeData.age = data.age;
        } else {
            let diffAge = getPercentageChange(previousSendData.age, data.age);
            if (diffAge >= diffPer || diffAge <= -diffPer) {
                optimizeData.age = data.age;
            }
        }
    }

    if (data && data.attention) {
        if (!previousSendData.attention) {
            optimizeData.attention = data.attention;
        } else {
            let diffAttention = getPercentageChange(previousSendData.attention, data.attention);
            if (diffAttention >= diffPer || diffAttention <= -diffPer) {
                optimizeData.attention = data.attention;
            }
        }
    }
    if (data && data.gender) {
        if (data.gender !== previousSendData.gender || !previousSendData.gender) {
            optimizeData.gender = data.gender;
        }
    }

    if (data && data.arousalValence) {
        if (!previousSendData.arousalValence) {
            optimizeData.arousalValence = data.arousalValence;
        } else {
            for (const av in data.arousalValence) {
                const tempArousalValence = {};
                const diffArrousal = getPercentageChange(previousSendData.arousalValence
            ?.
                arousal, data.arousalValence
            ?.
                arousal
            )
                ; //valence
                const diffValence = getPercentageChange(previousSendData.arousalValence
            ?.
                valence, data.arousalValence
            ?.
                valence
            )
                ;
                if (diffArrousal >= diffPer || diffArrousal <= -diffPer) {
                    tempArousalValence.arousal = data.arousalValence.arousal;
                }
                if (diffValence >= diffPer || diffValence <= -diffPer) {
                    tempArousalValence.valence = data.arousalValence.valence;
                }
                if (tempArousalValence.arousal || tempArousalValence.valence) {
                    optimizeData.arousalValence = tempArousalValence;
                }
            }
        }
    }

    if (data && data.emotions) {
        if (!previousSendData.emotions) {
            optimizeData.emotions = data.emotions;
        } else {
            const tempEmo = {};
            for (const emo in data.emotions) {
                if (previousSendData.emotions?.
                [emo]
            )
                {
                    const diffEmo = getPercentageChange(previousSendData.emotions[emo], data.emotions[emo]);
                    if (diffEmo >= diffPer || diffEmo <= -diffPer) {
                        tempEmo[emo] = data.emotions[emo];
                    }
                }
            }
            if (Object.keys(tempEmo).length !== 0) {
                optimizeData.emotions = tempEmo;
            }
        }
    }

    if (data && data.features) {
        if (!previousSendData.features) {
            optimizeData.features = data.features;
        } else {
            const tempFeatures = {};
            for (const fea in data.features) {
                if (previousSendData.features?.
                [fea]
            )
                {
                    if (previousSendData.features[fea] !== data.features[fea]) {
                        const diffFea = getPercentageChange(previousSendData.features[fea], data.features[fea]);
                        if (diffFea >= diffPer || diffFea <= -diffPer) {
                            tempFeatures[fea] = data.features[fea];
                        }

                    }
                }
            else
                {
                    tempFeatures[fea] = data.features[fea];
                }
            }
            if (Object.keys(tempFeatures).length !== 0) {
                optimizeData.features = tempFeatures;
            }
        }
    }

    if (Object.keys(optimizeData).length !== 0) {
        sendFaceData(optimizeData);
    }
    previousSendData = {...data
}
    ;
}

function getPercentageChange(oldNumber, newNumber) {
    const decreaseValue = oldNumber - newNumber;
    return (decreaseValue / oldNumber) * 100;
}


