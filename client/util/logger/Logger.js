const Logger = {};

Logger.DEBUG   = "D";
Logger.INFO    = "I";
Logger.WARNING = "W";
Logger.ERROR   = "E";

Logger.debug = function(message){
  Logger.log("D",message);
}
Logger.info = function(message){
    Logger.log("I",message);
}
Logger.error = function(message){
    Logger.log("E",message);
}
Logger.warning = function(message){
    Logger.log("W",message);
}
Logger.log = function (level,message) {
  var logString = "";
  logString += moment().format('YYMMDDHHmmSS')+'::';
    if (level === Logger.DEBUG) {
        logString += "D";
    } else if (level === Logger.INFO) {
        logString += "I";
    } else if (level === Logger.WARNING) {
        logString += "W";
    } else if (level === Logger.ERROR) {
        logString += "E";
    }
    logString += "::WB::";
    logString += ((localStorage.getItem('logID') !== null)?localStorage.getItem('logID')+'::':'');
    logString += " "+message;
    console.log(logString);
}