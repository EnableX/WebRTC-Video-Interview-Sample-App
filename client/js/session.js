$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

$(".logout_div").on("click", function () {
  window.location.href = "https://enablex.io/";
});
updateChatHeight();

window.addEventListener("resize", function () {
  updateChatHeight();
});

$("#chat-window").scrollbar({
  autoBottom: true,
});
// var user_name = agentData.agent;
// $("#username").html(user_name);
// $(".first-latter-icon").html(user_name.slice(0, 1));
var user_type = "AG";
var user_status = "A";
// var user_id = agentData.agent_id;

const stallIds = [];

var user_info_div = $("#guest-user-info");
var audio_muted = false;
var video_muted = false;
var ATList = null;
var clientID;
var socket_opt = {
  reconnection: true,
  reconnectionAttempts: 10,
  forceNew: true,
  transports: ["websocket"],
  pingInterval: 25000,
  pingTimeout: 600000,
};

var socket = io.connect(user_data.service, socket_opt);

var VideoSize = { HD: [320, 180, 1280, 720], SD: [320, 180, 640, 480] };
var config = {
  video: { deviceId: localStorage.getItem("cam") },
  audio: { deviceId: localStorage.getItem("mic") },
  data: true,
  videoSize: VideoSize["SD"],
  attributes: { name: 'test', type: user_type },
};
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
var annotateStreamID = null;
var isAnnotate = false;
var presentationStarted = false;
var desktop_shared = false;
var streamShare = null;
var shareStream = null;
var shareStart = false;
var ischatViewOpen = false;
var  arousal_data , valence_data = 0
EnxRtc.getDevices(function (arg) {
  if (arg.result === 0) {
  } else if (arg.result === 1145) {
    $(".error_div").html(
      "Your media devices might be in use with some other application."
    );
    $(".error_div").show();
    return false;
  } else {
    $(".error_div").show();

    return false;
  }
});




socket.on("connected", function (data) {
  if (data.success) {
    clientID = data.success.id;

    console.log("Panelist data :", user_data);
    if (
      user_data.job_id
    ) {
      socket.emit("panelist-logged-in", user_data);
      socket.on("users", function (data) {
        console.log("user-daata", data);
        document.querySelector('#invite-users-list').innerHTML = "";
        data.forEach(element => {
          if (user_data.job_id === element.job_id && (element.user_status && element.user_status !== 'B')) {
            let li = document.createElement('li');
            li.classList.add('candidate');
            let liItems = `<div class="candidate-item">
            <span>${element.candidate}</span>
            <a href="#" class="btn btn-success btn-sm" onclick="inviteCandidate('${element.candidate_id}')">Invite</a>
          </div>`;
            li.innerHTML = liItems;
            document.querySelector('#invite-users-list').append(li);
          }
        });

      })
      socket.on("token", function (data) {
        if (data.result == 0) {
          ConnectCall(data.token)
        }
      });
      // document.getElementById("stall_name").innerHTML = agentData.stall;
    } else alert("Re login");
  }
});
var tm = false;
var room = null;
var inCallData = null;
var timer = null;
var network_error_showed = false;
var token = "";
var stats_enabled = false;
var SubscribedStreamMap = new Map();
var localStream,
  remote_view,
  sAMute = true,
  sVMute = true,
  rAmute = true,
  rVMute = true;
socket.on("incoming-call", function (data) {
  $(".div_info").hide();
  client_id = parseInt(data.client.customer_id);
  inCallData = data;
  token = data.token.token;
  var client_name = data.client.customer;
  var info_html =
    "<h4>" +
    client_name +
    " <small> (Guest User)</small>  </h4> " +
    '<div class="media" style="margin-top: 0px;">' +
    '<a class="pull-left" href="#">' +
    '<img style="border-radius: 100px;margin-bottom:0px;width: 90px;" class="thumb media-object" src="../img/user-vacant-seat.jpg" alt="">' +
    "</a>" +
    '<div class="media-body" style="margin-top: 10px;">' +
    "<address>" +
    //'<strong>NRIC</strong> :'+client_ssn+' <br>'+
    //'<strong>Phone</strong> :'+client_phone+' <br>'+
    //'<strong>Email.</strong> : '+client_email+'<br>'+
    "</address>" +
    "</div>" +
    "</div>";
  user_info_div.html(info_html);
  //$("#documents-info").html("No document found!")

  var div_html =
    '<audio loop  style="display: none" id="audio-player" controls="controls" src="../assets/oldbell3.mp3" autoplay type="audio/mpeg"></audio>' +
    '<div class="panel widget-info-twt blue-box" style="margin-bottom: -25px;">' +
    '<h5 style="font-weight: normal;color:#000000">Incoming Call from <b>' +
    client_name +
    "</b></h5>" +
    '<div class="avatar" style="margin-top:30px;"><img alt="" src="../img/telephone.gif"></div>' +
    '<div class="followers">' +
    '<div class="col-md-4">' +
    '<div class="col-md-12">' +
    '<button type="button" data-toggle="tooltip" title="To get connected on call" role="button" tabindex="0" class="col-md-12 btn btn-success" id="accept">' +
    "Accept" +
    "</button>" +
    "</div>" +
    "</div>" +
    '<div class="col-md-4">' +
    '<div class="col-md-12">' +
    '<button type="button" data-toggle="tooltip" title="To pass-on to next agent." role="button" tabindex="0" class="col-md-12 btn btn-primary" id="skip">' +
    "Skip" +
    "</button>" +
    "</div>" +
    "</div>" +
    '<div class="col-md-4">' +
    '<div class="col-md-12">' +
    '<button type="button" role="button" data-toggle="tooltip" title="To hang-up incoming call" tabindex="0" class="col-md-12 btn btn-danger" id="reject">' +
    "Reject" +
    "</button>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";
  timer = setTimeout(function () {
    socket.emit("call-denied", data);
    user_info_div.html("");
    $("#audio-player").removeAttr("src");
    swal.close();
  }, 20000);
  swal({
    title: "",
    html: true,
    text: div_html,
    showCancelButton: false,
    showConfirmButton: false,
  });
});

socket.on("join-call", function (data) { });

socket.on("disallowed", function (data) {
  swal(
    {
      title: data.desc,
      text: "",
      type: "warning",
      timer: 2000,
      buttons: false,
    },
    function () {
      window.open("", "_self").close();
    }
  );
});

socket.on("disconnect-call", function (res) {
  $("#overlay").hide();

  $(".information_divs").show();
  $("#call_container_div").hide();
  swal(
    {
      title: "Call Disconnected",
      text: "",
      type: "warning",
      timer: 2000,
      confirmButtonClass: "btn-danger",
      confirmButtonText: "Ok",
      cancelButtonText: "",
      showCancelButton: false,
      closeOnConfirm: true,
      buttons: false,
    },
    function () {
      resetAllConfig();
    }
  );

  if (room && room !== null && room.disconnect) {
    room.destroy();
    $("#user_info").html("");
    $("#stream_view").hide();
    $("#disconnect_call").hide();
    $("#self-view-div").hide();
    $("#form-div").hide();
  }
});

socket.on("agent-duplicate", function (res) {
  alert("agent-duplicate");
});
function updateChatHeight() {
  var sitebar_height =
    $(window).innerHeight() -
    $(".card-header").innerHeight() -
    $(".card-block").innerHeight();
  $("#frame").css("height", sitebar_height - 118);
}

function ConnectCall(token) {
  var reconnectInfo = {
    allow_reconnect: true,
    number_of_attempts: 3,
    timeout_interval: 45000,
  };
  EnxRtc.Logger.setLogLevel(5);
  room = EnxRtc.EnxRoom({ token: token });
  room.connect();

  room.addEventListener("room-connected", function (streamEvent) {
    if (!streamEvent.room.canvas) {
      $("#annotate").hide();
    }
    var VideoSize = { HD: [480, 270, 1280, 720], SD: [480, 270, 640, 480] };
    for (var i = 0; i < streamEvent.streams.length; i++) {
      room.subscribe(streamEvent.streams[i]);
    }
    localStream = EnxRtc.EnxStream({ audio: true, video: true });
    localStream.init();
    localStream.addEventListener("media-access-allowed", function (event) {
      var info = {
        scheme: "notify-break-recover",
        maxVideoLayers: 1,
        videoSize: VideoSize["SD"],
        maxVideoBW: 1024,
        minVideoBW: 270,
      };

      room.publish(localStream, info, function (response) {
        if (response.result == 0) {
        } else {
          alert("Error publishing localStream");
        }
      });
      $("#self-view").html("");
      localStream.play("self-view", optionsLocal);
    });
  });

  room.addEventListener("active-talkers-updated", function (event) {
    console.table(ATList);
    ATList = event.message.activeList;
    for (var j = 0; j < ATList.length; j++) {
      var st = room.remoteStreams.getAll()[ATList[j].streamId];

      if (ATList[j].streamId == st.getID()) {
        startDuration();
        $(".self-name").html(room.me.name);
        $("#disconnect_call").show();
        $("#self-view-div").show();
        $("#form-div").show();
        $("#stream_view").show();
        $("#overlay").hide();
        $(".logout_div").hide();
        $(".information_divs").hide();
        remote_view = st;
        $(".remote-name").html(ATList[j].name);

        console.log(findParticipant(), ATList[j].clientId);
          if(findParticipant() !== "" && room.roomSettings.facex  && room.roomSettings.facex == true)
          {
              document.querySelector(".customer_details_panel").style.display = "block";
              document.querySelector(".face_ai_tools").style.display = "block";
          }
          else {
              document.querySelector(".customer_details_panel").style.display = "none";
              document.querySelector(".face_ai_tools").style.display = "none";
          }

        if (findParticipant() === ATList[j].clientId && presentationStarted) {
          if (document.querySelector(`#ss-candidate #box_${ATList[j].clientId}`) === null) {
            let parentCont = document.getElementById('ss-candidate');
            let boxId = `box_${ATList[j].clientId}`;
            let newStreamDiv = document.createElement("div");
            newStreamDiv.setAttribute("id", boxId);
            newStreamDiv.setAttribute("class", `box`);
            parentCont.append(newStreamDiv);
            st.show(boxId, remoteOptions);
            addNameToPlayer(ATList[j].clientId, ATList[j].name);
          }
        }


        else if (findParticipant() !== ATList[j].clientId) {
          if (document.querySelector(`#call_div #box_${ATList[j].clientId}`) === null) {
            let parentCont = document.getElementById('call_div');
            let boxId = `box_${ATList[j].clientId}`;
            let newStreamDiv = document.createElement("div");
            newStreamDiv.setAttribute("id", boxId);
            newStreamDiv.setAttribute("class", `box`);
            parentCont.append(newStreamDiv);
            st.show(boxId, remoteOptions);
            addNameToPlayer(ATList[j].clientId, ATList[j].name);
          }
          else {
            addNameToPlayer(ATList[j].clientId, ATList[j].name, true);
          }
        }
        else {
          if (document.querySelector(`#show_stream_div #box_${ATList[j].clientId}`) === null) {
            let parentCont = document.getElementById('show_stream_div');
            let boxId = `box_${ATList[j].clientId}`;
            let newStreamDiv = document.createElement("div");
            newStreamDiv.setAttribute("id", boxId);
            newStreamDiv.setAttribute("class", `box`);
            parentCont.append(newStreamDiv);
            st.show(boxId, {
              player: {
                height: "100%",
                width: "100%",
                minHeight: "180px",
                minWidth: "180px",
              }
            });
            addNameToPlayer(ATList[j].clientId, ATList[j].name);
          }
        }
        $("#call_container_div").show();
      }
    }
    console.log("Active Talker List :- " + JSON.stringify(event));
  });

  function findParticipant(userList = null) {
    let participant = null;
    room.userList.forEach(function (item, clientId) {

      console.log(item, item.role, clientId);

      if (item.role != 'moderator') {
        participant = clientId;
      }
    });

    return participant;
  }


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
        document.querySelector(`#box_${streamId}`).append(titleNIconsDiv);
      }
    }
  }

  room.addEventListener("stream-subscribed", function (streamEvent) {
    if (streamEvent.stream.getID() !== localStream.getID()) {
      SubscribedStreamMap.set(streamEvent.stream.getID(), streamEvent.stream);
      var stream =
        streamEvent.data && streamEvent.data.stream
          ? streamEvent.data.stream
          : streamEvent.stream;
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
    setTimeout(() => {
      rejoin();
    }, 3000);
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
    setTimeout(() => {
      rejoin();
    }, 3000);
  });
  room.addEventListener("network-disconnected", function (event) {
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
      setTimeout(() => {
        rejoin();
      }, 3000);
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
  room.addEventListener("room-disconnected",function(event){
      console.log("room-disconnected",event);

  })

  room.addEventListener("user-disconnected", function (streamEvent) {
    // socket.emit("disconnect-call", {});
    console.log(streamEvent);
    let toRemove = document.querySelector(`#box_${streamEvent.clientId}`);
    if (toRemove) {
      toRemove.remove();
    }
      if(streamEvent.role == "participant")
      {
          document.querySelector(".customer_details_panel").style.display = "none";
          document.querySelector(".face_ai_tools").style.display = "none";
      }

  });
  room.addEventListener("user-connected",function(event){
      if(event.role == "participant" && room.roomSettings.facex  && room.roomSettings.facex == true)
      {
        document.querySelector(".customer_details_panel").style.display = "block";
        document.querySelector(".face_ai_tools").style.display = "block";
      }
  })

  room.addEventListener("share-started", function (event) {

    if (presentationStarted == false && desktop_shared == false && shareStream == null) {
      var st = room.remoteStreams.get(event.message.streamId);
      if (st.stream !== undefined) {
        presentationStarted = true;
        shareStart = true;
        var clientId = event.message.clientId;
        if (clientId !== room.clientId) {
          document.querySelector('#show_stream_div').innerHTML = "";
          st.play('show_stream_div', {
            player: {
              height: "100%",
              width: "100%",
              minHeight: "180px",
              minWidth: "180px",
            }
          });
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
        localStream.updateConfiguration(ConfigSpecs, function (result) { });
      }
    }
    desktop_shared = false;
    shareStart = false;
    presentationStarted = false;
    streamShare = null;
    document.querySelector('#show_stream_div').innerHTML = "";
  });
  var data_size = 0
    room.addEventListener("user-data-received", function (event) {
        const data = JSON.parse(event.message.message);
        remoteTrackingData = null;
        remoteTrackingData = data;
        const size = new TextEncoder().encode(JSON.stringify(data)).length
        const kiloBytes = size / 1024;
        data_size = data_size + kiloBytes
       console.log("data-recived-size",data_size);
        // console.log(data);
        handleRemoteFaceData(remoteTrackingData);
        //optimizeRemoteData(faceTrackingData);
        //appendRemoteFaceDetail(data);
        //console.log(data, "faceTrackingData.......");
    });
}
function startTimer(){
    var timer = $("#timer");

    function updateTimer() {
        var myTime = timer.html();
        var ss = myTime.split(":");
        var dt = new Date();
        dt.setHours(0);
        dt.setMinutes(ss[0]);
        dt.setSeconds(ss[1]);

        var dt2 = new Date(dt.valueOf() + 1000);
        var temp = dt2.toTimeString().split(" ");
        var ts = temp[0].split(":");

        timer.html(ts[1]+":"+ts[2]);
        setTimeout(updateTimer, 1000);
    }

    setTimeout(updateTimer, 1000);
}
function rejoin() {
  window.location.reload();
}
function enable_stats() {
  if (stats_enabled == false) {
    room.subscribeStreamStatsForClient(localStream, true);
    stats_enabled = true;
  } else {
    room.subscribeStreamStatsForClient(localStream, false);
    stats_enabled = false;
  }
}
$("#self_aMute").click(function (e) {
  if (audio_muted) {
    if (room.mute) {
      toastr.error("Your audio is muted by moderator");
    } else {
      localStream.unmuteAudio(function (arg) {
        $("#self_aMute").removeClass("fa-microphone-slash");
        $("#self_aMute").addClass("fa-microphone");

        audio_muted = false;
      });
    }
  } else {
    localStream.muteAudio(function (arg) {
      $("#self_aMute").removeClass("fa-microphone");
      $("#self_aMute").addClass("fa-microphone-slash");

      audio_muted = true;
    });
  }
});

function toggleStreamView(layout, stream, action) {
  if (action) {
    $("#call_div").hide();
    $(".remote-name").hide();
    $(`#${layout}`).html("");
    $(`#${layout}`).show();
    stream.play(layout, remoteOptions);
    $("#self-view").append(
      `<div id='user_view' style='margin-top: 25px; display: flex; justify-content: center;'></div>`
    );
    const rs = room.remoteStreams.get(ATList[0].streamId);
    rs.play("user_view", optionsLocal);
    $("#self-view, #user_view").css({
      "min-height": "100px",
      "min-width": "100px",
      background: "#000",
    });
    $("#user_view").append(`<div id='remote-name'></div>`);
    $("#remote-name").html(ATList[0].name);
  } else {
    $(`#${layout}`).hide();
    $(`#user_view`).remove();
    $(`#remote-name`).remove();
    $("#call_div").show();
    $(".remote-name").show();
    $("#self-view").css({ "min-height": "150px", "min-width": "150px" });
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
  } else if (isAnnotate) {
    toastr.error("Please stop the Annotate to start Screen Share.");
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
        toastr.error("Screen share not supported");
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
  room.sendMessage(text, true, [], function () { });
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

function clearLocalView() {
  document.getElementById("self-view").innerHTML = "";
}
function showLocalView() { }
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
    localStream.unmuteVideo(function (res) {
      if (res.result === 0) {
        document.getElementById("self-view").innerHTML = "";
        localStream.play("self-view", optionsLocal);
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
    localStream.muteVideo(function (res) {
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

function callAjax(client_id, user_info_div, type) { }

//   socket.emit("disconnect-call", {});
$("#disconnect_call").on("click", function () {
  $(".information_divs").show();
  $("#call_container_div").hide();
  room.destroy();
  socket.emit("disconnect-call", {});
});

$(document).on("click", "#accept", function () {
  ConnectCall(token);
  $("#overlay").show();
  // $("#information_divs").show();
  var ply = document.getElementById("audio-player");
  swal.close();
  ply.src = "";
  socket.emit("call-accepted", { client_id: inCallData.client_id });
  $("#caller_name").text(inCallData.client.user_name);
  clearTimeout(timer);
});

$(document).on("click", "#reject", function () {
  $(".information_divs").show();
  var ply = document.getElementById("audio-player");
  swal.close();
  ply.src = "";
  user_info_div.html("");
  socket.emit("call-rejected", inCallData);
  clearTimeout(timer);
});

$(document).on("click", "#skip", function () {
  $(".information_divs").show();
  var ply = document.getElementById("audio-player");
  swal.close();
  ply.src = "";
  user_info_div.html("");
  socket.emit("call-denied", inCallData);
  clearTimeout(timer);
});

function toggleChat() {
  ischatViewOpen ? (ischatViewOpen = false) : (ischatViewOpen = true);
  if (ischatViewOpen) {
    $("#chat_window-popup").show();
    $("#chat-tag").hide();
  } else {
    $("#chat_window-popup").hide();
  }
}

function resetAllConfig() {
  audio_muted = false;
  video_muted = false;
  presentationStarted = false;
  desktop_shared = false;
  streamShare = null;
  shareStream = null;
  shareStart = false;
  ischatViewOpen = false;
  ATList = null;
  tm = false;
  room = null;
  inCallData = null;
  timer = null;
  network_error_showed = false;
  token = "";
  stats_enabled = false;
  SubscribedStreamMap = new Map();
  localStream = null;
  remote_view = null;
  sAMute = true;
  sVMute = true;
  rAmute = true;
  rVMute = true;
  $("#chat-tag").hide();
  $("#call_div").empty();
  $("#self_vMute").removeClass("fa-video-slash").addClass("fa-video");
  $("#self_aMute")
    .removeClass("fa-microphone-slash")
    .addClass("fa-microphone");
}


function inviteCandidate(candidate_id) {
  socket.emit("connect-candidate", {
    candidate_id: candidate_id
  }, function (test) { console.log(test) });
}

var attention_axis_data = 0,
    happy_data = 0,
    sad_data = 0,
    disguest_data = 0,
    fear_data = 0,
    surprise_data = 0,
    angry_data = 0,
    neutral_data = 0;
var highest_emotion = "";
function handleRemoteFaceData(data){

    if(!data){
        return;
    }
    if (data.emotions) {
        console.table(data.emotions)
        let highest_emotion_val = sortObject(data.emotions)[0];
        highest_emotion = getKeyByValue(data.emotions, highest_emotion_val);
        // document.querySelector("#mood").innerHTML = highest_emotion;
        if(highest_emotion == 'Angry' || highest_emotion == 'Disgust' || highest_emotion == 'Sad' ||  highest_emotion == 'Fear')
        {
            // document.querySelector("#mood").style.backgroundColor = "red";
        }
        else
        {
            // document.querySelector("#mood").style.backgroundColor = "green";
        }
        angry_data = data.emotions.Angry ? data.emotions.Angry : angry_data ;
        disguest_data = data.emotions.Disgust ? data.emotions.Disgust : disguest_data ;
        fear_data = data.emotions.Fear ? data.emotions.Fear : fear_data;
        happy_data = data.emotions.Happy ? data.emotions.Happy : happy_data;
        sad_data = data.emotions.Sad ? data.emotions.Sad : sad_data;
        surprise_data = data.emotions.Surprise ? data.emotions.Surprise : surprise_data ;
        neutral_data = data.emotions.Neutral ? data.emotions.Neutral : neutral_data;
    }

    if (data.attention >=0) {
        console.log("Attention",data.attention)
        if(data.attention >=0 && data.attention <= 30)
        {
            attention_axis_data = 0;
            document.querySelector("#attention").innerHTML = "Low";
            document.querySelector("#attention").style.backgroundColor = "red";
        }
        if(data.attention >=30 && data.attention <= 70)
        {
            attention_axis_data = 1;
            document.querySelector("#attention").innerHTML = "Medium";
            document.querySelector("#attention").style.backgroundColor = "purple";
        }
        if(data.attention >=70 )
        {
            attention_axis_data = 2;
            document.querySelector("#attention").innerHTML = "High";
            document.querySelector("#attention").style.backgroundColor ="Green"
        }

    }
    if (data.gender) {
        console.log("GENDER",data.gender)
        document.querySelector("#gender").innerHTML = data.gender
    }
    if(data.arousalValence)
    {
      arousal_data = (data.arousalValence.arousal && data.arousalValence.arousal > 0)  ? data.arousalValence.arousal : 0;
      valence_data = (data.arousalValence.valence && data.arousalValence.valence > 0) ? data.arousalValence.valence : 0

    }

    if (data.features) {
        console.table("feature",data.features);

    }
    if (data.age) {
        console.log("AGE",data.age)
        document.querySelector("#age").innerHTML = data.age;
    }


}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

const sortObject = obj => {
    const arr = Object.keys(obj).map(el => {
        return obj[el];
});
    arr.sort((a, b) => {
        return b-a;
});
    return arr;
};



// highcharts

var yCategories = ['Low', 'Medium', 'High'];
Highcharts.chart('attention_chart', {
    chart: {
        type: 'spline',
        animation: Highcharts.svg, // don't animate in old IE
        marginRight: 10,
        events: {
            load: function () {
                // set up the updating of the chart each second
                var series = this.series[0];
                setInterval(function () {
                    var x = (new Date()).getTime(), // current time
                        y = attention_axis_data;
                    series.addPoint([x, y], true, true);
                }, 1000);
            }
        }
    },
    title: {
        text: 'Attention',
        style: {
            fontSize: '10px'
        }
    },
    time: {
        useUTC: false
    },
    plotOptions: {
        spline: {
            marker: {
                enabled: false
            }
        }
    },
    xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        zoomEnabled : false
    },
    tooltip:false,

    yAxis: {
        zoomEnabled : false,
        title:false,
        categories : yCategories,
        plotLines: [{
            color: 'green', // Color value
            dashStyle: 'longdashdot', // Style of the plot line. Default to solid
            value: 1, // Value of where the line will appear
            width: 2 // Width of the line
        }]
    },
    legend: {
        enabled: false
    },
    exporting: {
        enabled: false
    },
    series: [{
        data: (function () {
            // generate an array of random data
            var data = [],
                time = (new Date()).getTime(),
                i;
            for (i = -19; i <= 0; i += 1) {
                data.push({
                    x: time + i * 1000,
                    y: attention_axis_data
                });
            }
            return data;
        }())
    }]
});


window.addEventListener('load', function () {

   function setPolarityData(){
     setInterval(function(){
         const date_time = (new Date()).getTime();
         // const angry = [date_time, angry_data];
         //const disguest = [date_time, disguest_data];
         const engagement_data = [date_time, arousal_data];
         const pleasentness_data = [date_time, valence_data];
         //const sad = [date_time,sad_data];
         const surprise = [date_time, surprise_data];
         //const neutral = [date_time, neutral_data];

         const series = chart2.series[0],
             shift = series.data.length > 20;

         chart2.series[0].addPoint(engagement_data, true, shift);
         // chart2.series[1].addPoint(pleasentness_data, true, shift);

     }, 1000);
   }

    function requestData() {

        setInterval(function () {
            const date_time = (new Date()).getTime();
           // const angry = [date_time, angry_data];
            //const disguest = [date_time, disguest_data];
            const fear = [date_time, fear_data];
            const happy = [date_time, happy_data];
            //const sad = [date_time,sad_data];
            const surprise = [date_time, surprise_data];
            //const neutral = [date_time, neutral_data];

            const series = chart.series[0],
                shift = series.data.length > 20;

            chart.series[0].addPoint(surprise, true, shift);
            chart.series[1].addPoint(happy, true, shift);
            chart.series[2].addPoint(fear, true, shift);
            // chart.series[0].addPoint(angry, true, shift);
            // chart.series[1].addPoint(disguest, true, shift);
            // chart.series[2].addPoint(fear, true, shift);
            // chart.series[3].addPoint(happy, true, shift);
            // chart.series[4].addPoint(sad, true, shift);
            // chart.series[5].addPoint(surprise, true, shift);
            // chart.series[6].addPoint(neutral, true, shift);

        }, 1000);
    }
    chart = new Highcharts.Chart({
        chart: {
            renderTo: 'emotion_chart',
            defaultSeriesType: 'area',
            events: {
                load: requestData
            }
        },
        title: {
            text: 'Emotions data',
            style: {

                fontSize: '10px'
            }
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        plotOptions: {
            area: {
                marker: {
                    enabled: false
                }
            }
        },
        yAxis: {
            labels: {
                format: '{value}%'
            },
            title: {
                enabled: false
            }
        },
        // legend: false,
        legend: {
            itemStyle: {
                fontSize: "9px"
            }
        },
        series: [
            {
                name: 'Surprise',
                data: []
            },
            {
                name: 'Happy',
                data: []
            },

            {
                name: 'Fear',
                data: []
            }


        ]
    });

    chart2 = new Highcharts.Chart({
        chart: {
            renderTo: 'polarity_chart',
            defaultSeriesType: 'spline',
            events: {
                load: setPolarityData
            }
        },
        title: {
            text: 'Polarity data',
            style: {

                fontSize: '10px'
            }
        },
        tooltip:false,
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        plotOptions: {
            area: {
                marker: {
                    enabled: false
                }
            }
        },
        yAxis: {
            labels: {
                format: '{value}%'
            },
            title: {
                enabled: false
            }
        },
        // legend: false,
        legend: {
            itemStyle: {
                fontSize: "9px"
            }
        },
        series: [
            {
                name: 'Engagement',
                data: []
            }
            // {
            //     name: 'Pleasantness',
            //     data: []
            // }

    //
    //
    //
         ]
     });


});

