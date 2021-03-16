////////////////////////////////////////////////////////////////////////////////////
//
// File: util.js - Utility functions
//
////////////////////////////////////////////////////////////////////////////////////

var btoa        =   require('btoa');
var https       =   require('https');
var basic       =   require('http-auth');
var config      =   require('./config');
var logger      =   require('./util/logger/logger');
var vcxutil     =   {};



// Function: To create Basic Authorization Header to access Server API
// Returns: Encoded user:pass

vcxutil.getBasicAuthToken = function(){
    var APP_ID = config.APP_ID;
    var APP_KEY = config.APP_KEY;
    var authorizationBasic = btoa(APP_ID + ':' + APP_KEY);
    return authorizationBasic;
}



// Function: To initiate Rest API Call to Server API

vcxutil.connectServer=function(options,data,callback){
    logger.info("REQ URI:- "+options.method+" "+options.host+":"+options.port+options.path);
    logger.info("REQ PARAM:- "+data);
    var request = https.request(options,function(res){
        res.on('data', function (chunk) {
            logger.info("RESPONSE DATA:- "+chunk);
             callback(JSON.parse(chunk));
        });
    });
    request.on('error', function(err) {
        logger.info("RESPONSE ERROR:- "+JSON.stringify(err));
    });
    if(data==null)
    request.end();
    else
    request.end(data);
}


var module = module || {};
module.exports = vcxutil;