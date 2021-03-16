var conf_duration = 0;
var createToken=function(details,callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    xhttp.open("POST", "/createToken/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(details));
};
var setCookie = function (cname, cvalue, exdays) {
    if(!exdays){
        exdays = 106666;
    }
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
var getCookie = function (cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
var importLib = function (path) {
    var imported = document.createElement('script');
    imported.src = path;
    document.head.appendChild(imported);
}
var getClientIP = function(callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    xhttp.open("GET", "/getIP/", false);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
};
var sendOTP = function(data,callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    xhttp.open("POST", "/sendOTP/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
};
var verifyOTP = function(data,callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    xhttp.open("POST", "/verifyOTP/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
};

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
        $(".duration").text(hour+" : "+minute+" : "+second);
    },1000)
}