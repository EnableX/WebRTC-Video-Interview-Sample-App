var localStream = null;
var username = null;
var room, localId;
var streamShare;
var bootStrapAngular;
var VideoSize, shareStart = false;
const layoutManualSwitching = false;
const SUPPORT_URL = "https://enablex.io";
var roomShareStarted = false;
var ATShareStarted = false;
var attendance = [];
var ATUserList = [];
var isModerator = false;
var ATSize = undefined;
var chatCount = 0;
var ATLayoutMap = new Map();
var SubscribedStreamMap = new Map();
var streamLoopBack = null;
var shareStream = null;
var token = null;
var audio_muted_all = false;
var mostTalkerStreamId = null;
var active_talker = false;
var audio_muted = false;
var video_muted = false;
var screen_shared = false;
var recording_stared = false;

var leftSidebarView = true, rightSidebarView = false;
var options = {
    player: {
        'height': '100%',
        'width': '100%',
        'minHeight': 'inherit',
        'minWidth': 'inherit'
    },
    toolbar: {
        displayMode: false,
        branding: {
            display: false
        }
    }
};
var optionsLocal = {
    player: {
        'height': '140px',
        'width': '100%',
        'minHeight': 'inherit',
        'minWidth': 'inherit'
    },
    toolbar: {
        displayMode: false,
        branding: {
            display: false
        }
    }
};
var layoutEl;
var layout;

function rejoin() {
    window.location.href = "../";
}

window.onload = function () {
    // window.addEventListener("beforeunload", function (event) {
    //     // Cancel the event as stated by the standard.
    //     event.preventDefault();
    //     // Chrome requires returnValue to be set.
    //     event.returnValue = '';
    // });


    toastr.options.timeOut = 10000;
    username = localStorage.getItem("userName");
    token = window.location.href.split("/")[(window.location.href.split("/").length - 1)];

    localStorage.setItem('token', token);
    var videoSupportRating = 0;
    $("#invite_btn").on("click",function(){
        $("#invite-dialog").modal("toggle")
    });
    $("#feedback_btn").on("click",function(){
        $("#feedback-dialog").modal("toggle")
    });

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

    $("#send_feedback").on("click",function () {
        var logs_sent =  'Not sent';
        if(document.querySelector('#attach_logs').checked)
        {
            postLog();
            logs_sent = "Sent"
        }
        audio_issues = "<ul>";
        video_issues = "<ul>";
        if(document.querySelector('#audio_not_present').checked)
        {
            audio_issues += "<li>I cannot hear anyone</li>";
        }
        if(document.querySelector('#video_not_present').checked)
        {
            video_issues += "<li>I cannot see anyone </li>";
        }
        if(document.querySelector('#audio_was_bad').checked)
        {
            audio_issues += "<li>Poor Audio Quality</li>";
        }
        if(document.querySelector('#video_is_bad').checked)
        {
            video_issues += "<li>Poor Video quality</li>";
        }
        if(document.querySelector('#other_participant_not_hear_me').checked)
        {
            audio_issues += "<li>Others cannot hear me</li>";
        }
        if(document.querySelector('#other_participant_not_see_me').checked)
        {
            video_issues += "<li>Others cannot see me</li>";
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

        var tok =JSON.parse(window.atob(token));
        send_mail({"name":username,"ratings":videoSupportRating,"log_id":tok.logId,"console_logs_status":logs_sent,"audio":audio_issues,"video":video_issues},function (res) {
            if(res){
                toastr.success("Thank you for your valuable feedback.");
                $("#feedback-dialog").modal("hide");
            }
        });
    });

    // document.getElementById('chat-file-btn').onchange = processFile;
    // $('.nav-tabs a').click(function (e) {
    //     $('.nav-tabs a').removeClass('active')
    //     $(this).addClass('active')
    // });
    // $("#attendance-layout").slimScroll({color:"#d43f3a"});
    // function processFile(e) {
    //     e.stopImmediatePropagation();
    //     var file = document.getElementById('chat-file-btn').files[0];
    //     localStream.sendFile(file, function (res) {
    //         if (res.result === 0) {
    //             addFileLocal(file.name, res.dataUrl);
    //         } else if (res && res.message && res.result !== 0) {
    //             alert(res.message);
    //         }
    //     });
    // }

    layoutEl = document.getElementById("layout_manager");
    layout;
    function ValidateEmail(mail)
    {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
        {
            return (true)
        }

        return (false)
    }
    function updateLayoutValues() {
        layout = initLayoutContainer(layoutEl, {
            animate: {
                duration: eval(200),
                easing: 'swing'
            },
            maxRatio: eval('3/2'),
            minRatio: eval('9/16'),
            fixedRatio: eval('false'),
            bigPercentage: eval('0.8'),
            bigFixedRatio: eval('false'),
            bigMaxRatio: eval('3/2'),
            bigMinRatio: eval('9/16'),
            bigFirst: eval('true'),
        }).layout;
    }

    updateLayoutValues();

    function getRandomRGB() {
        Math.round(Math.random() * 255);
    }

    function getRandomColour() {
        return 'rgb(' + getRandomRGB() + ',' + getRandomRGB() + ',' + getRandomRGB();
    }

    var ratios = [4/3, 3/4, 16/9];

    function addElement(stream) {
        if (stream) {
            checkOnlyParMsg();
            var el = document.createElement("div");
            el.setAttribute("id", "con_" + stream.getID())
            el.style.overflow = 'hidden';
            el.videoHeight = 480;
            var ratio = ratios[Math.round(Math.random() * (ratios.length - 1))];
            el.videoWidth = 480 * ratio;
            el.style.backgroundColor = getRandomColour();
            layoutEl.appendChild(el);
            layout();
            options.player.width = "100%";
            stream.play("con_" + stream.getID(), options);
        }
    }

    function removeElement(stream) {
        if (document.getElementById("con_" + stream.getID()) !== null) {
            layoutEl.removeChild(document.getElementById("con_" + stream.getID()));
            layout();
            checkOnlyParMsg();
        }
    }



    $("#layout_manager>*").on("dblclick", function () {
        if (layoutManualSwitching) {
            switchLayout($(this));
        }
    });

    bootStrapAngular = function () {
        angular.bootstrap(document, ['userJoinListApp']);
    };

    $(window).resize(function () {
        setInfoContainerHeight();
        setChatContainerHeight();
    });

    function setInfoContainerHeight() {
        $('.info-container').css("height", (window.innerHeight - 10) + "px");
    }

    function setChatContainerHeight() {
        $('.chat-container').css("height", (window.innerHeight - 84) + "px");
    }

    setInfoContainerHeight();
    setChatContainerHeight();
    // document.getElementById("user-name-div").innerText = localStorage.getItem("userName");

    function getScope(elementID) {
        var sel = document.getElementById(elementID);
        return angular.element(sel).scope();
    }

    VideoSize = {"HD": [640, 480, 1280, 720], "SD": [640, 480, 640, 480]};
    var config = {
        video: {deviceId: localStorage.getItem("cam")},
        audio: {deviceId: localStorage.getItem("mic")},
        data: true,
        videoSize: VideoSize[localStorage.getItem("quality")],
        attributes: {name: localStorage.getItem("userName"), type: localStorage.getItem("usertype")},
        maxVideoLayers: localStorage.getItem("video-layers")
    };

    localStorage.setItem("streamConfig", JSON.stringify(config));

    joinRoom(token);

    function populateSetTalker() {
        room.getTalkerCount(function (res) {
            if (res.result === 0) {
                for (var c = 1; c <= res.numTalkers; c++) {
                    var sel = '';
                    if (c === res.numTalkers) {
                        sel = 'selected';
                    }
                    document.getElementById("selected").innerHTML += ' <option value="' + c + '" ' + sel + '>' + c + ' Participant(s)</option>';
                }
            }
        });

    }

    function populateSetRecvVideoQuality() {
        //room.getReceiveVideoQuality(function (res) {
        //});
        document.getElementById("video-quality").innerHTML += ' <option value="' + 'Auto' + '" ' + 'selected' + '>' + 'Auto' + '</option>';
        document.getElementById("video-quality").innerHTML += ' <option value="' + 'HD' + '" ' + '' + '>' + 'High' + '</option>';
        document.getElementById("video-quality").innerHTML += ' <option value="' + 'SD' + '" ' + '' + '>' + 'Med' + '</option>';
        document.getElementById("video-quality").innerHTML += ' <option value="' + 'LD' + '" ' + '' + '>' + 'Low' + '</option>';
    }
    function reJoinRoom(){
        var mic_id = $("#micp option:selected").attr('id')
        var cam_id = $("#camc option:selected").attr('id')
        config.audio.deviceId = mic_id;
        config.video.deviceId = cam_id;
        localStorage.setItem("cam",cam_id);
        localStorage.setItem("mic",mic_id);
        joinRoom(token);

    }
    // document.getElementById("device-selected").addEventListener('click',reJoinRoom);
    function joinRoom(token) {
        localStream = EnxRtc.joinRoom(token, config, function (success, error) {
            if (error && error != null) {
                Logger.error("can't get access from local media" + JSON.stringify(error));
                if(error.type == "media-access-denied")
                {
                    rejoin();
                }

                if (error.type && error.type === "room-error") {
                    alert("Token Expired. Rejoin from shared link");
                } else if (error.msg && error.msg.name && (error.msg.name === "NotFoundError" || error.msg.name === "NotReadableError" || error.msg.name === "NotSupportedError")) {
                    $("#media-denied-info").dialog({width: 360});
                }
                else if((error.msg && error.msg.name && (error.msg.name === "InvalidDeviceId")) )
                {
                    rejoin();
                }
                 else if (error.msg && error.msg.name === "OverconstrainedError") {
                    localStorage.setItem("quality", "SD");
                    config.videoSize = VideoSize[localStorage.getItem("quality")];
                    joinRoom(token);
                }
            }
            if (success && success != null) {
                // $( "#device-selection-dialog" ).dialog( "close" );
                startDuration();
                if(error && error !== null && error.result=== 1152)
                {
                    toastr.warning(error.error);
                }

                $('.meeting-title').text(success.roomData.name);
                active_talker = success.roomData.settings.active_talker;
                 showLocalView();
                bootStrapAngular();
                localId = success.publishId;
                room = success.room;
                populateSetTalker();
                populateSetRecvVideoQuality();
                ATSize = success.streams.length;
                if (window.navigator.userAgent.match('.NET') === null)
                    for (var i = 0; i < success.streams.length; i++) {
                        room.subscribe(success.streams[i]);
                    }
                room.whoAmI(function (me) {
                    isModerator = (me.role === "moderator") ? true : false;
                    if (isModerator) {
                        // $("#btn-settings").show();

                        // $(document).find("#user-icon").addClass('fa fa-user-secret  fa-fw');
                        document.getElementById("user-name-div").innerText = "You joined as moderator";
                    }
                    else {
                        $("#recording_btn").remove();
                        $("#invite_btn").remove();
                        $("#mute_all").hide();
                        // $(document).find("#user-icon").addClass('fa fa-user  fa-fw');
                        document.getElementById("user-name-div").innerText = "You joined as participant"
                    }
                });
                if(room.mute) {
                    $("#audio_mute_btn").html('<span><i class="fa fa-microphone-slash fa-fw"></i></span><br>Unmute');
                    $("#audio_mute_btn").prop("title","Unmute")
                    audio_muted = true;
                    toastr.success("Your audio is muted by moderator");
                    /* event JSON = {type: "hard-unmute-room", streams: "", message: "room hard unmuted", room: "", users: undefined} */
                };
                room.addEventListener("room-record-on", function () {
                    // var elem = document.getElementsByClassName("icon-confo-record")[0];
                    // if(elem !== undefined)
                    // {
                    //     elem.src = '../img/stop_record.svg';
                    //     blinkImgStart(elem);
                    // }
                    //
                    $("#rec-notification").show();
                });
                room.addEventListener("hard-mute-room", function(event) {

                    $("#audio_mute_btn").html('<span><i class="fa fa-microphone-slash fa-fw"></i></span><br>Unmute');
                    $("#audio_mute_btn").prop("title","Unmute")
                    audio_muted = true;
                    toastr.success("Your audio is muted by moderator");
                });

                /* When room is unmuted, all participants are notified */
                room.addEventListener("hard-unmute-room", function(event) {
                    $("#audio_mute_btn").html('<span><i class="fa fa-microphone fa-fw"></i></span><br>Mute');
                    $("#audio_mute_btn").prop("title","Mute")
                    audio_muted = false;
                    toastr.success("Your audio is un-muted by moderator");
                });


                room.addEventListener("room-record-off", function () {
                    // var elem = document.getElementsByClassName("icon-confo-record")[0];
                    // if(elem !== undefined)
                    // {
                    //     elem.src = '../img/start_record.svg';
                    //     blinkImgStop(elem);
                    // }
                    //
                    $("#rec-notification").hide();
                });
                var plugin = (document.getElementById('WebrtcEverywherePluginId') !== null) ? document.getElementById('WebrtcEverywherePluginId') : room;
                room.addEventListener("active-talker-data-in", function (data) {
                    var obj = {
                        'msg': data.message.message,
                        'timestamp': data.message.timestamp,
                        'username': data.message.from
                    };

                    plotChat(obj);
                });
                room.addEventListener('active-talkers-updated', function (event) {

                    if (event.message && event.message !== null && event.message.activeList && event.message.activeList !== null) {
                        var oldList = ATUserList;
                        ATUserList = event.message.activeList;
                        if (SubscribedStreamMap.size > 0) {
                            for (var stream in room.remoteStreams.getAll()) {
                                callStreamForLayout(room.remoteStreams.getAll()[stream]);
                            }
                            updateATNameLayout(ATUserList);
                            callOutStreamLayout(oldList, ATUserList);
                        }
                    }
                    console.log("Active Talker List :- " + JSON.stringify(event));
                });
                plugin.addEventListener('user-connected', function (streamEvent) {
                    checkModerator();
                    updateUserList();
                });
                plugin.addEventListener('user-disconnected', function (streamEvent) {
                    updateUserList();
                });
                plugin.addEventListener('stream-subscribed', function (streamEvent) {

                    setTimeout(function() {
                        $('.preloader').fadeOut();
                    }, 500);
                    // setTimeout(function() {
                    //     $("footer").animate({bottom:'-125px'}, 500);
                    //     $(".scw-form").animate({bottom:'-0px'}, 500);
                    //     $("#back2Top").show();
                    // }, 5000);
                    checkOnlyParMsg();
                    var stream = (streamEvent.data && streamEvent.data.stream) ? streamEvent.data.stream : streamEvent.stream;
                    if (active_talker === true) {
                        SubscribedStreamMap.set(stream.getID(), stream);
                        if (!stream.ifScreen()) {
                            callStreamForLayout(stream);
                        } else {
                            shareStream = stream;
                            if (roomShareStarted == true) {
                                callLayout(shareStream);
                            }
                        }
                    } else {
                        callLayout(stream);
                    }
                });
                plugin.addEventListener("share-started", function (event) {
                    if (roomShareStarted === false) {
                        if (mostTalkerStreamId !== null) {
                            switchLayout($("#con_" + mostTalkerStreamId));
                        }
                        if (shareStream !== null)
                            callLayout(shareStream);
                        roomShareStarted = true;
                    }
                });
                plugin.addEventListener("share-stopped", function (event) {
                    removeUpdateLayout(shareStream);
                    roomShareStarted = false;
                    if (mostTalkerStreamId !== null) {
                        switchLayout($("#con_" + mostTalkerStreamId));
                    }
                });
                plugin.addEventListener("stream-removed", function (event) {
                    var stream = (event.data && event.data.stream) ? event.data.stream : event.stream;
                    removeUpdateLayout(stream);
                });
            }
        });

    }

    function callOutStreamLayout(oldList, newList) {
        for (var i = 0; i < oldList.length; i++) {
            var chkFlag = false;
            for (var j = 0; j < newList.length; j++) {
                if (newList[j].streamId === oldList[i].streamId) {
                    chkFlag = true;
                    break;
                }
            }
            if (chkFlag === false) {
                removeUpdateLayout(room.remoteStreams.get(oldList[i].streamId));
                ATLayoutMap.delete(oldList[i].streamId);
            }
        }
    }
    function switchLayout(elem) {
        if (elem.hasClass("VC_big")) {
            elem.removeClass("VC_big");
        } else {
            elem.addClass("VC_big");
        }
        layout();
    }
    function callStreamForLayout(stream) {
        for (var i = 0; i < ATUserList.length; i++) {
            if (ATUserList[i] && ATUserList[i].streamId === stream.getID() && SubscribedStreamMap.get(stream.getID()) && !ATLayoutMap.get(stream.getID())) {
                callLayout(stream);
                ATLayoutMap.set(stream.getID(), stream);
                updateATNameLayout(ATUserList);
            }
        }
    }

    function updateATNameLayout(updatedList) {
        for (var elem in updatedList) {
            appendTitle(updatedList[elem].streamId, updatedList[elem].name);
        }
        if (updatedList[0] && document.getElementById("con_" + updatedList[0].streamId)) {
            if (roomShareStarted === true) {
                document.getElementById("con_" + updatedList[0].streamId).style.border = "2px solid #f16c0f";
            } else {

                if(updatedList.length > 2)
                {
                    if (mostTalkerStreamId !== null) {
                        switchLayout($("#con_" + mostTalkerStreamId));
                    }
                    switchLayout($("#con_" + updatedList[0].streamId));
                    mostTalkerStreamId = updatedList[0].streamId;
                }
                else
                {
                    if (mostTalkerStreamId == null) {

                        mostTalkerStreamId = updatedList[0].streamId;
                        switchLayout($("#con_" + updatedList[0].streamId));
                    }
                    else
                    {
                        switchLayout($("#con_" + mostTalkerStreamId));
                        // switchLayout($("#con_" + updatedList[0].streamId));
                    }
                }
                document.getElementById("con_" + updatedList[0].streamId).style.border = "2px solid #f16c0f";
            }

        }

        for (var i = 1; i < ATSize; i++) {
            if (updatedList[i] && document.getElementById("con_" + updatedList[i].streamId))
            {
                if(updatedList.length > 2) {
                    if ($("#con_" + updatedList[i].streamId).hasClass("VC_big")) {
                        $("#con_" + updatedList[i].streamId).removeClass("VC_big");
                    }
                }
                document.getElementById("con_" + updatedList[i].streamId).style.border = "1px solid #fff";
            }

        }
    }

    function removeUpdateLayout(stream) {
        if (!stream.ifScreen()) {
            //removeArrayElement(attendance, stream.getAttributes().name);
            updateUserList();
        } else {
            checkShare(stream, false);
            shareStart = false;
        }
        if (Object.keys(room.remoteStreams.getAll()).length === 1) {
            addElement(streamLoopBack);
        }
        removeElement(stream);
    }

    function callLayout(stream) {
        if (stream.getID && stream.getID() !== localId) {
            stream.addEventListener("stream-data-in", function (data) {
                var obj = {
                    'msg': data.msg.message,
                    'timestamp': data.msg.timestamp,
                    'username': data.msg.from
                };
                plotChat(obj);
            });
            stream.addEventListener("stream-file-in", function (data) {
                addFileLocal(data.msg.filename, data.msg.file);
            });
            checkShare(stream, true);
        }
        if (stream.getID && stream.getID() === localId) {
            streamLoopBack = stream;
            streamLoopBack.stream.getAudioTracks()[0].enabled = false;

        } else if (streamLoopBack != null && document.getElementById("con_" + streamLoopBack.getID()) !== null && Object.keys(room.remoteStreams.getAll()).length > 1) {
            removeElement(streamLoopBack);
        } else if (Object.keys(room.remoteStreams.getAll()).length === 1 && streamLoopBack !== null) {
            addElement(streamLoopBack);
            addTitle(streamLoopBack);
            if (stream.ifScreen()) {
                addMaximizeOption(stream.getID());
            }
        }
        if (!(Object.keys(room.remoteStreams.getAll()).length > 1 && stream.getID() === localId)) {
            addElement(stream);
            addTitle(stream);
            if (stream.ifScreen()) {
                addMaximizeOption(stream.getID());
            }
        }
        if (!stream.ifScreen()) {
            attendance.push({
                "username": stream.getAttributes().name,
                "usertype": ""
            });
        }

        updateUserList();
        Logger.info('user joined: ' + stream.getAttributes().name);
        if (stream && stream.ifScreen()) {
            switchLayout($("#con_" + stream.getID()));
            shareStart = true;
        }
    }

    // document.getElementsByClassName("icon_nav_hide")[0].addEventListener('click', hideNavigation);

    function hideNavigation(event) {
        var element = event.target;
        element.parentNode.parentNode.parentNode.style.display = 'none';
        if (rightSidebarView) {
            document.getElementsByClassName("confo-container")[0].parentNode.parentNode.classList.remove('col-sm-7');
            document.getElementsByClassName("confo-container")[0].parentNode.parentNode.classList.add('col-sm-9');
        } else {
            document.getElementsByClassName("confo-container")[0].parentNode.parentNode.classList.remove('col-sm-10');
            document.getElementsByClassName("confo-container")[0].parentNode.parentNode.classList.add('col-sm-12');
        }
        layout();
        document.getElementsByClassName("icon_nav_show")[0].style.display = "block";
        leftSidebarView = false;
    }

    // document.getElementsByClassName("icon_nav_show")[0].addEventListener('click', showNavigation);

    function showNavigation(event) {
        var element = event.target;
        if (rightSidebarView) {
            document.getElementsByClassName("confo-container")[0].parentNode.parentNode.classList.remove('col-sm-9');
            document.getElementsByClassName("confo-container")[0].parentNode.parentNode.classList.add('col-sm-7');
        } else {
            document.getElementsByClassName("confo-container")[0].parentNode.parentNode.classList.remove('col-sm-12');
            document.getElementsByClassName("confo-container")[0].parentNode.parentNode.classList.add('col-sm-10');
        }
        document.getElementsByClassName("info-container")[0].style.display = 'block';
        element.style.display = 'none';
        layout();
        leftSidebarView = true;
    }

    // document.getElementById("icon-view-toolbar").addEventListener('click', showHideControllBar);

    function showHideControllBar(event) {
        var element = document.getElementById("icon-view-toolbar");
        var toolbar = document.getElementById("vcx_confo_toolbar");
        var toolbarStyle = window.getComputedStyle(toolbar, null);
        if (toolbarStyle.display === "block") {
            element.classList.remove("fa-chevron-down");
            element.classList.add("fa-chevron-up");
            toolbar.style.display = "none";
            element.style.bottom = "20px";
        } else if (toolbarStyle.display === "none") {
            element.classList.remove("fa-chevron-up");
            element.classList.add("fa-chevron-down");
            toolbar.style.display = "block";
            element.style.bottom = "83px";
        }
    }
}

function addTitle(stream) {
    var titleDiv = document.createElement('div');
    titleDiv.classList.add("stream-title");
    titleDiv.innerText = (stream.getAttributes().name) ? stream.getAttributes().name : "";
    $("#con_" + stream.getID()).prepend(titleDiv);
}

function appendTitle(id, title) {
    if (document.getElementById("con_" + id)) {
        if (document.getElementById("con_" + id).getElementsByClassName("stream-title")[0]) {
            document.getElementById("con_" + id).getElementsByClassName("stream-title")[0].innerText = title;
        } else {
            var titleDiv = document.createElement('div');
            titleDiv.classList.add("stream-title");
            titleDiv.innerText = title;
            $("#con_" + id).prepend(titleDiv);
        }

    }

}

function addMaximizeOption(id) {
    var imgDiv = document.createElement('img');
    imgDiv.classList.add("stream-max-icon");
    imgDiv.classList.add("minimized");
    imgDiv.src = '../img/maximize.svg';
    $("#con_" + id).prepend(imgDiv);
    imgDiv.addEventListener('click', maxMinScreen);
}

function showLocalView() {
    localStream.play("local_div", optionsLocal);
}

function closeLoader() {
    var elem = document.getElementById('vcx-loader-container');
    elem.style.display = 'none';
}

function removeArrayElement(array, data) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].username === data) {
            array.splice(i, 1);
        }
    }
}

function updateUserList() {
    var uList = [];
    var userList = room.userList.forEach(function (user, clientId) {
        if (clientId !== room.clientId) {
            uList.push({
                "username": user.name,
                "usertype": user.role,
                "mod": isModerator,
                "clientId": clientId,
                "icon" : user.role=='participant' ?  'fa fa-user fa-fw' : 'fa fa-user-secret  fa-fw'
            });
        }
    });
    var $scope = getScope('attendance-layout');
    $scope.updateAttendanceLayout(uList);
    $scope.$apply();
}

function hangUp() {
    var tok =JSON.parse(window.atob(token));
    $.confirm({
        title: 'Are you sure ? ',
        content: '',
        animation:'opacity',
        closeAnimation: 'opacity',
        columnClass: 'col-md-4 offset-md-4 col-sm-6 offset-sm-3 col-xs-10 offset-xs-1',
        boxWidth: '50%',
        scrollToPreviousElement: true,
        scrollToPreviousElementAnimate: true,
        useBootstrap: true,
        offsetTop: 40,
        offsetBottom: 40,
        container: 'body',
        bootstrapClasses: {
            container: 'container',
            containerFluid: 'container-fluid',
            row: 'row',
        },
        buttons: {
                confirm: {
                    text :"Yes",
                    btnClass: 'btn-blue w-min-md text-transform-none',
                    action: function(){
                        window.location.href = "/feedback/"+tok.logId;
                    }
                },
                cancel : {
                    text :"Cancel",
                    btnClass: 'btn-danger w-min-md text-transform-none',
                    action: function(){
                        this.close();
                    }
                }
        }
    });

}
$("#cancel_feedback").on("click",function(){
    $("#feedback-dialog").modal("toggle");
})

function checkShare(stream, show) {
    var name = "";
    if (stream.getAttributes().name)
        name = stream.getAttributes().name.split('_')[0];
    $(".attendance-user-name").each(function (i, elem) {
        if (name === $(elem).text()) {
            var element = $(elem).closest('.attendance-card').find('.icon_share');
            if (show) {
                element.show();
            } else {
                element.hide();
            }
        }
    });
}

function audioMute() {
    if (audio_muted) {
        if(room.mute)
        {
            toastr.error("Your audio is muted by moderator")
        }
        else
        {
            localStream.unmuteAudio(function (arg) {

                $("#audio_mute_btn").html('<span><i class="fa fa-microphone fa-fw"></i></span><br>Mute');
                $("#audio_mute_btn").prop("title","Mute")
                audio_muted = false;
            });
        }

    }
    else {
        localStream.muteAudio(function (arg) {
            $("#audio_mute_btn").html('<span><i class="fa fa-microphone-slash fa-fw"></i></span><br>Unmute');
            $("#audio_mute_btn").prop("title","Unmute")
            audio_muted = true;
        });

    }
};


function muteUnmuteAll(){
    if (audio_muted_all) {
        room.hardUnmute(function (arg) {
            if(arg.result == 0)
            {
                $("#mute_all").html('<span><i class="fa fa-microphone fa-fw"></i></span><br>Mute All');
                $("#mute_all").prop("title","Mute All")

                audio_muted_all = false;
            }
            else {
                toastr.error(arg.msg);
            }
        });
    }
    else {
        room.hardMute(function (arg) {
            if(arg.result ==0)
            {
                $("#mute_all").html('<span><i class="fa fa-microphone-slash fa-fw"></i></span><br>Unmute All');
                $("#mute_all").prop("title","Unmute All");

                audio_muted_all = true;
            }
            else {
                toastr.error(arg.msg);
            }
        });
    }
}

function postLog() {
    room.postClientLogs(token, function (res) {
    });
}

function clearLocalView() {
    document.getElementById('local_div').innerHTML = "";
}
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
var muteUnmuteBtn = document.querySelector('#video_mute_btn');

function enableMuteButton (){
    muteUnmuteBtn.removeAttribute('disabled');
    muteUnmuteBtn.style.cursor = 'pointer';
    muteUnmuteBtn.style.pointerEvents = 'auto';
}
function videoMute() {
    muteUnmuteBtn.style.cursor = 'wait';
    muteUnmuteBtn.style.pointerEvents = 'none';
    muteUnmuteBtn.disabled = true;
    muteUnmuteBtn.setAttribute('disabled', 'disabled');

    if (video_muted) {
        localStream.unmuteVideo(function (res) {
            if (res === true) {
                clearLocalView();
                showLocalView();
                $("#video_mute_btn").html('<span><i class="fa fa-video fa-fw"></i></span><br>Stop');
                $("#video_mute_btn").prop("title","Stop");
                video_muted = false;
                enableMuteButton();
            }
            else if (res.result === 1140) {
                toastr.error(res.error);
                enableMuteButton();
            }
        });
    }
    else {
        localStream.muteVideo(function (res) {
            if (res === true) {
                $("#video_mute_btn").html('<span><i class="fa fa-video-slash fa-fw"></i></span><br>Start');
                $("#video_mute_btn").prop("title","Start");
                video_muted = true;
                enableMuteButton();
            }
            else if (res.result === 1140) {
                toastr.error(res.error);
                enableMuteButton();
            }
        });
    }
}



function screenShare() {
    if (ATShareStarted === false) {
        streamShare = room.startScreenShare(function (rs) {
            if (rs.result === 0) {
                ATShareStarted = true;
                $('.fa-desktop').addClass("blink-image");
                $("#share_screen_btn").prop('title', 'Stop Share');
                $(".watermark").hide();
                $(".only-par-msg").hide();
            }
            else if(rs.result === 1151){
                toastr.error(rs.error);
            }
            else if(rs.result === 1144){
                toastr.error(rs.error);
            }
            else if(rs.result === 1150) {
                $("#extension-dialog").modal("toggle");

            }
            else {
                toastr.error("Screen share not supported");
            }
        });
    } else {
        room.unpublish(streamShare);
        $('.fa-desktop').removeClass("blink-image");
        $("#share_screen_btn").prop('title', 'Start Share');
        ATShareStarted = false;
        checkOnlyParMsg();

    }

    if(streamShare){
        streamShare.addEventListener("stream-ended", function (event) {
            room.unpublish(streamShare);
            $('.fa-desktop').removeClass("blink-image");
            $("#share_screen_btn").prop('title', 'Start Share');
            ATShareStarted = false;
            checkOnlyParMsg();
        });
    }
}


function blinkImgStart(elem) {
    elem.classList.add("blink-image");
}

function blinkImgStop(elem) {
    elem.classList.remove("blink-image");
}

function startRoomRec() {
    if (recording_stared) {
        room.stopRecord(function (success, error) {
            if (success !== null)
            {
                $('.fa-circle').removeClass("blink-image");
                $('.fa-circle').removeClass("text-danger");
                recording_stared = false;
                $("#recording_btn").prop('title', 'Start Record');
                $("#rec-notification").hide();
                $('#record_text').text("Record");
            } else {
                Logger.info(error);
            }
        });

    } else {
        room.startRecord(function (success, error) {
            if (success !== null) {
                $('.fa-circle').addClass("blink-image");
                $('.fa-circle').addClass("text-danger");
                $('#record_text').text("Stop");
                recording_stared = true;
                $("#recording_btn").prop('title', 'Stop Record');
                $("#rec-notification").show();
            } else {
                toastr.error("Error starting recording");
            }

        });

    }
}

$(".email-chat-script").on("click",function () {
    $("#email-chat-dialog").modal("toggle");
});
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

$("#btn-send-chat").on("click",function () {
    var chat_email = $("#send-chat-email").val();
    if($("#email-chat-details").html().trim() == "")
    {
        toastr.error("Unable to send empty chat");
    }
    else if (!validateEmail(chat_email))
    {
        toastr.error("Enter a valid email address");
    }
    else {
        var tok =JSON.parse(window.atob(token));
        sendChatEmail({"chat":$("#email-chat-details").html(),"email":chat_email,"log_id":tok.logId},function (res) {
            var resp = JSON.parse(res);
            if(resp.success)
            {
                toastr.success("Chat transcript mailed successfully.");
                $("#email-chat-dialog").modal("hide");
            }
            else {
                toastr.error("Problem Sending email. Please check your email.");
            }
        });

    }
})


$('.toggle-button-second').click(function() {

    var compact = 'compact-sidebar';
    $('.template-options').toggle();
    $('.template-options').removeClass('opened');
    // $(this).toggleClass('active');
    $("#chat-tag").html(0);
    chatCount=0;
    $('.site-sidebar-second').toggleClass('opened');
    if($('body').hasClass(compact)) {
        $('body').removeClass(compact);
    }
});
$('.hide-chat').click(function() {

    var compact = 'compact-sidebar';
    $('.template-options').toggle();
    $('.template-options').removeClass('opened');
    // $(this).toggleClass('active');
    $("#chat-tag").html(0);
    chatCount=0;
    $('.site-sidebar-second').toggleClass('opened');
    if($('body').hasClass(compact)) {
        $('body').removeClass(compact);
    }
});

function updateChatNotify() {
    chatCount++;
    $("#chat-tag").html(chatCount);
}

function getScope(elementID) {
    var sel = document.getElementById(elementID);
    return angular.element(sel).scope();
}

function sendChat(event) {
    if (event.keyCode === 13) {
        addText();
    }
}

function sendFile() {
    document.getElementById("chat-file-btn").click();
}

function addText() {
    var text = document.getElementById('chat-text-area').value;
    var elem = document.getElementById("chat");
    var text_email =  document.getElementById("email-chat-details");
    if (/<[a-z][\s\S]*>/i.test(text)) {
        text = "'" + text + "'";
    }
    if (text !== "") {
        var template = createChatText(text);
        var text_template = createEmailChatTemplate(text);
        $(template).appendTo(elem);
        $(text_template).appendTo(text_email);
        document.getElementById('chat-text-area').value = '';
        sendChatToServer(text);
        scrollDivLast(elem);
    }
}

function addFileLocal(fileName, dataUrl) {
    var text = '<a href="' + dataUrl + '" download="' + fileName + '" target="_blank"><i class="fa fa-file-text-o fa-2x"></i> ' + fileName + '</a>';
    var elem = document.getElementById("vcx-chat-container").getElementsByTagName("ul")[0];
    var templete = createChatText(text, 'html');
    elem.appendChild(templete);
    document.getElementById('chat-text-area').value = '';
    scrollDivLast(elem);
}

function createChatText(text) {
    var templete = '<div class="scw-item self"><span class="name-title">Me</span>' +
        '<span>'+text+'</span>' +
        '</div>';


   return templete;
}

function createEmailChatTemplate(text)
{
    var text_chat = "<span>"+localStorage.getItem("userName") +'</span><br><span>'+text +'</span><br><br>' ;
    return text_chat;
}

function sendChatToServer(text) {
    if (localStream !== null)
        localStream.sendData({
            "type": "public",
            "from": localStorage.getItem("userName"),
            "message": text,
            "timestamp": moment()._d.getTime()
        });
}

function plotChat(obj) {
    var templete = '<div class="scw-item" ><span class="name-title-left">'+obj.username+'</span>' +
        '<span>'+obj.msg+'</span>' +
        '</div>';
    var remote_text_chat = "<span>"+ obj.username + '</span><br><span>' + obj.msg +'</span><br><br>';
    var elem = document.getElementById("chat");
    var text_email =  document.getElementById("email-chat-details");
    $(templete).appendTo(elem);
    $(remote_text_chat).appendTo(text_email);
    scrollDivLast(elem);
    updateChatNotify();
}

function scrollDivLast(elem) {
    elem.scrollTop = elem.scrollHeight;
}

function maxMinScreen(event) {
    var element = event.target;
    if (element.classList.contains('minimized')) {
        element.classList.remove('minimized');
        element.classList.add('maximized');
        element.parentNode.classList.add('fullScreen');
        element.src = '../img/minimize.svg';
    } else if (element.classList.contains('maximized')) {
        element.classList.add('minimized');
        element.classList.remove('maximized');
        element.parentNode.classList.remove('fullScreen');
        element.src = '../img/maximize.svg';
    }
};

function checkModerator() {
    var arr = room.userList;
}

function getMeDetails() {
    room.whoAmI(function (arg) {
        console.log(arg);
    })
}

function setActiveTalker(q) {
    $("#btn-at-selection-apply").attr("disabled","disabled");
    console.log("Max Active talker");
    var e = document.getElementById(q);
    var selValue = e.options[e.selectedIndex].value;
    room.setTalkerCount(parseInt(selValue), function (result) {
        if(result.result == 0)
        {
            toastr.success("Requested to receive "+selValue+" Active Talker(s)");
            $("#btn-at-selection-apply").removeAttr("disabled");
        }
        else {
            toastr.error("Probles setting max Active Talker");
            $("#btn-at-selection-apply").removeAttr("disabled");
        }
    });
}

function setReceiveVideoQuality(q) {

    $("#btn-quality-selection-apply").attr("disabled","disabled");
    var e = document.getElementById(q);
    var selValue = e.options[e.selectedIndex].value;
    console.log("Setting Receive Video Quality : " + selValue);
    room.setReceiveVideoQuality(selValue, function (result) {
        if(result.result == 0)
        {
            toastr.success("Requested to change Video Quality");
            $("#btn-quality-selection-apply").removeAttr("disabled");
        }
        else
        {
            toastr.error(result.message);
            $("#btn-quality-selection-apply").removeAttr("disabled");
        }
    });
}
