EnxRtc.getDevices(function (arg) {

    if(arg.result === 0)
    {
        var camLst = arg.devices.cam;
        var micLst = arg.devices.mic;
        listOutMic(micLst);
        listOutCam(camLst);
        listOutVideoLayers();
        localStorage.setItem("mic", $(document).find('#mic').find('option:eq(0)').attr('id'));
        localStorage.setItem("cam", $(document).find('#cam').find('option:eq(0)').attr('id'));
        localStorage.setItem("video-layers", $(document).find('#video-layers').find('option:eq(0)').attr('id'));
        var camPrevSel = getCookie("vcxCamId");
        var micPrevSel = getCookie("vcxMicId");

        if (camPrevSel && $("#cam option[value='"+camPrevSel+"']").length >= 0) {
            $("#cam").val(camPrevSel);
        }
        else{
            $("#cam").val($("#cam option:first").val());

        }
        if (micPrevSel  && $("#mic option[value='"+micPrevSel+"']").length >= 0) {
            $("#mic").val(micPrevSel);
        }
        else{
            $("#mic").val($("#mic option:first").val());
        }

        $("#device-selection-con").show();
        $("#joinRoomByPin").show();
    }
    else if(arg.result === 1153)
    {
        $("#login_form").hide();
        $("#unsupported_browser_message").show();

    }
    else{
        $("#login_form").hide();
        $("#media-device-permission-error").show();

    }

});

$(document).on("change", '#mic', function () {
    localStorage.setItem("mic", $(this).find("option:selected").attr('id'));
    setCookie("vcxMicId", $(this).find("option:selected").val());
});
$(document).on("change", '#cam', function () {
    localStorage.setItem("cam", $(this).find("option:selected").attr('id'));
    setCookie("vcxCamId", $(this).find("option:selected").val());
});
if(check_QA_Debug("qa"))
{
    $('#video_layer_container').show();
    $(document).on("change", '#video-layers', function () {
        localStorage.setItem("video-layers", $(this).find("option:selected").attr('id'));
    });
}
else {
    $('#video_layer_container').hide();
    localStorage.setItem("video-layers", '3');
}

function check_QA_Debug(query_field){
    var field = query_field;
    var url = window.location.href;
    if(url.indexOf('?' + field + '=') != -1)
        return true;
    else if(url.indexOf('&' + field + '=') != -1)
        return true;
    return false
}

function listOutMic(micLst) {
    for (var j = 0; j < micLst.length; j++) {
        var x = document.getElementById("mic");
        var option = document.createElement("option");
        option.text = micLst[j].label;
        var micoptId = micLst[j].deviceId;
        option.setAttribute("id", micoptId);
        x.add(option);
    }
}

function listOutCam(camLst) {
    for (var i = 0; i < camLst.length; i++) {
        var x = document.getElementById("cam");
        var option = document.createElement("option");
        option.text = camLst[i].label;
        var camoptId = camLst[i].deviceId;
        option.setAttribute("id", camoptId);
        x.add(option);
    }
}
function listOutVideoLayers() {
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    var maxLayers = isChrome ? 3 : 1;
    for (var i = maxLayers; i > 0; i--) {
        var x = document.getElementById("video-layers");
        var option = document.createElement("option");
        if (i == 1){
            option.text = i  + " Video Layer";
        }else{
            option.text = i + " Video Layers";
        }
        //var camoptId = i;
        option.setAttribute("id", i);
        x.add(option);
    }
}