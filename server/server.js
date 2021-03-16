////////////////////////////////////////////////////////////////////////////////////
//
// Application: Contact Center
// Service: Customer to Agent Call Router
// File: server.js - Executable to start the Service
// Description: Each End Point viz. Customer, Agent, Supervisor gets connected with this Service using
// Secured Web Sockets to announce their presence. The Service manages availability and does incoming
// Call-Routing to available agents.
//
////////////////////////////////////////////////////////////////////////////////////

var express = require("express");
var cors = require("cors");
var https = require("https");
var http = require("http");
var fs = require("fs");
var morgan = require("morgan");
var app = express();
var bodyParser = require("body-parser");
var Logger = require("./util/logger/logger"); // Import Logger

var config = require("./config"); // Import App Config
var room = require("./room"); // Import Room Management Service
var server = null;

app.use(cors());
// Set SSL Certificates

// var options = {
//     key: fs.readFileSync(config.cert.key).toString(),
//     cert: fs.readFileSync(config.cert.crt).toString(),
//     ca: fs.readFileSync(config.cert.caBundle).toString()
// }
var options = {
  key: fs.readFileSync(config.cert.key).toString(),
  cert: fs.readFileSync(config.cert.crt).toString(),
};
if (config.cert.caBundle) {
  options.ca = [];
  for (var ca in config.cert.caBundle) {
    options.ca.push(fs.readFileSync(config.cert.caBundle[ca]).toString());
  }
}

let agentsID = [];

// Map to store logged in User List viz. Agents, Clients, Supervisors
// Key: socket_id, Value:- User Meta data
var users = new Map();

// Map to store Call Hunting Status for an Incoming Call. HUnt Count is increased when call is not attended.
// huntReq: contains agent id in an array,
// Key:- client_socket_id, Value:- Agent List array named "agentQ"
var huntReq = new Map();

// Map to store user types (Agent/Client/Supervisor)
var usertype = new Map();
usertype.set("AG", { id: "AG", name: "AGENT" });
usertype.set("SV", { id: "SV", name: "SUPERVISOR" });
usertype.set("CU", { id: "CU", name: "CUSTOMER" });

// Array to store live session data data when an agent is connected with Customer for a Session
var inCallQ = [];

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.use(morgan("dev"));
console.log(config.clientPath, "config.clientPath");
app.use(express.static(config.clientPath));

// To create Secured or Unsecured Service
if (config.ssl) {
  if (config.appIP == "" && config.appIP === undefined) {
    server = https
      .createServer(options, app)
      .listen(config.appPort, function () {
        console.log(
          "Application Server Started on port " + config.appPort + "!"
        );
        Logger.info(
          "Secure Application Server Started on port " + config.appPort + "!"
        );
      });
  } else {
    server = https
      .createServer(options, app)
      .listen(config.appPort, config.appIP, function () {
        console.log(
          "Application Server Started on port " +
            config.appIP +
            " : " +
            config.appPort +
            "!"
        );
        Logger.info(
          "Secure Application Server Started on port " + config.appPort + "!"
        );
      });
  }
} else {
  if (config.appIP == "" && config.appIP == undefined) {
    server = http.createServer(app).listen(config.appPort, function () {
      console.log("Application Server Started on port " + config.appPort + "!");
      Logger.info("Application Server Started on port " + config.appPort + "!");
    });
  } else {
    server = http
      .createServer(app)
      .listen(config.appPort, config.appIP, function () {
        console.log(
          "Application Server Started on port " +
            config.appIP +
            " : " +
            config.appPort +
            "!"
        );
        Logger.info(
          "Application Server Started on port " + config.appPort + "!"
        );
      });
  }
}

const socket_opt = {
  reconnection: true,
  reconnectionAttempts: 10,
  forceNew: true,
  transports: ["websocket"],
  pingInterval: 25000,
  pingTimeout: 600000,
};
// HTTP/HTTPS Service Starts
var call_io = require("socket.io").listen(server, socket_opt);
var token_part = "";
call_io.set("origins", "*:*"); //

// SOcket Listener: On new Connection
call_io.on("connection", function (socket_made) {
  Logger.info("User Connected, ID: " + socket_made.id);
  users.set(socket_made.id, { socket: socket_made });
  sendMessage(users.get(socket_made.id).socket, "connected", {
    success: { id: socket_made.id },
    error: false,
  });
  listen(socket_made);
});

const findUser = function(candidate_id){
     var userSocket ;        
      users.forEach(function (user) {            
          if (user.meta && user.type === "CU") {
                  // if (user.type === usertype.get("AG").id && user.meta.user_category_id[cat] === job_id && user.status === 'A') {
                  if (parseInt(user.meta.candidate_id) === parseInt(candidate_id)) {
                      userSocket = user.socket;     
                  }

          }
      });
      return userSocket;

}

// Agent Hunting: To get the next available Agent
const huntAgent = function (job_id, req_id) {
  var retAgentSocket = null;
  var agentFound = false;
  console.log(
    "Getting into hunt Agent: for  " + job_id + "and request id" + req_id
  );
  if (huntReq.get(req_id) === undefined) {
    // Initial Hunting for an Available Agent
    Logger.info("USER INFO at agent hunt" + users);
    users.forEach(function (user) {
      if (agentFound) {
        return retAgentSocket;
      }
      if (user.meta && user.type === "AG" && user.status === "A") {
        for (var cat in user.meta.job_id) {
          // if (user.type === usertype.get("AG").id && user.meta.user_category_id[cat] === job_id && user.status === 'A') {
          if (parseInt(user.meta.job_id[cat]) === parseInt(job_id)) {
            retAgentSocket = user.socket;
            agentFound = true;
            break;
          }
        }
      }
    });
  } else {
    // Subsequent Hunting for an Available Agent
    var reqAgentList = huntReq.get(req_id).agentQ;
    users.forEach(function (user) {
      if (agentFound) {
        return retAgentSocket;
      }
      if (
        user.meta &&
        user.type === "AG" &&
        user.status === "A" &&
        !reqAgentList.includes(user.socket.id)
      ) {
        for (var cat in user.meta.job_id) {
          //if(user.type  === usertype.get("AG").id && user.meta.user_category_id[cat] === job_id && user.status ==='A' && !reqAgentList.includes(user.socket.id)){
          if (parseInt(user.meta.job_id[cat]) === parseInt(job_id)) {
            retAgentSocket = user.socket;
            agentFound = true;
            break;
          }
        }
      }
    });
  }
  return retAgentSocket;
};

// EVENT LISTNERS - To manage call-flow between Customers & Agents.

var listen = function (socket_made) {
  // Event: Agent logs in
  users.get(socket_made.id).socket.on("panelist-logged-in", function (res) {
    Logger.info("Event Received: panelist-logged-in, ID: " + socket_made.id);
    Logger.info("res Data: " + JSON.stringify(res));
    if (res !== undefined) {
      var filterAgentID = agentsID.filter(function (id) {
        return id === res.panelist_id;
      });
      if (filterAgentID.length) {
        console.log(filterAgentID, "filterAgentID");
        sendMessage(users.get(socket_made.id).socket, "disallowed", {
          result: 5000,
          desc: "Duplicate panelist entry denied",
        });
        Logger.error("Event: disallowed, Duplicate panelist entry denied");
      } else {
        agentsID.push(res.panelist_id);
        res["user_status"] = "A";
        res["usertype"] = "AG";
        users.get(socket_made.id).meta = res;
        users.get(socket_made.id).type = usertype.get(res.usertype).id;
        var job_id = res.job_id;
        setAgentAvailable(socket_made.id);
        var room_id = res.room_id;

          room.getToken(
              {
                  name: res.panelist,
                  role: "moderator",
                  user_ref: "panelist",
                  roomId: room_id,
              },
              function (token) {
                  if (token && token.result !== undefined && token.result === 0) {
                      var g = new Date();
                      console.log("time after moderator creation" + g.getTime());

                      sendMessage(users.get(socket_made.id).socket, "token", {
                          result: 0,
                          token: token.token,
                      });
                  }
              });
                var user_meta =[];
                users.forEach(function (user) {
                    if (user.meta && user.type === "CU"  && parseInt( user.meta.job_id) ==  parseInt(job_id)) {
                          // if (user.type === usertype.get("AG").id && user.meta.user_category_id[cat] === job_id && user.status === 'A') {
                          user_meta.push(user.meta)                
                    }
                });
                sendMessage(users.get(socket_made.id).socket,'users',user_meta);                  
                Logger.info("BroadCast Emitted")
                }

            

    } else {
      Logger.error("Event: agent-logged-in,  usertype is not defined");
    }
  });
  // Event: Customer logs in
  users.get(socket_made.id).socket.on("candidate-logged-in", function (res) {
    Logger.info("Event Received: customer-logged-in, ID: " + socket_made.id);
    Logger.info("User-Meta Info, ID: " + JSON.stringify(res));
    console.log("User-Meta Info, ID: " + JSON.stringify(res));
    console.log("Users meta: " + users.get(socket_made.id).meta);
    res["usertype"] = "CU";
    users.get(socket_made.id).meta = res;
    users.get(socket_made.id).type = usertype.get("CU").id;
    users.get(socket_made.id).meta.user_status = 'A';
    sendMessage(users.get(socket_made.id).socket, "wait", {
      "message" : "Please wait for your turn"
    });
    sendBroadCast(users.get(socket_made.id).socket,'users', users, res.job_id);
  });



//  Event: Customer Initiates Call to get connected to an Agent
  users.get(socket_made.id).socket.on("connect-candidate", function (res) {
      Logger.info("Req for call to agent, Client ID: " + socket_made.id);
      var callData = {};
      callData.client = { id: socket_made.id };
      callData.job_id = { id: res.job_id };
      var client_id = res.candidate_id;
      var agentFound = findUser(client_id);
      console.log("agent_fount",agentFound);
      var room_id = users.get(socket_made.id).meta.room_id;
      var client_name = users.get(agentFound.id).meta.candidate;
      room.getToken(
          {
              name: client_name,
              role: "participant",
              user_ref: "customer",
              roomId: room_id,
          },
          function (token) {
              if (
                  token &&
                  token.result !== undefined &&
                  token.result === 0
              ) {
                  var h = new Date();
                  console.log(
                      "time after participant creation" + h.getTime()
                  );
                    token_part = token.token;
                    sendMessage(agentFound,'join-call',{
                        token: token_part,
                        agent: users.get(socket_made.id).meta,
                        license: null,
                    });
                  setAgentBusy(agentFound.id);

              }
          })



    // chkHunt(callData);
  });



  // Event: Agent rejects an Incoming Call... Fallback to Customer to Submit Ticket
  // users.get(socket_made.id).socket.on("call-rejected", function (res) {
  //   deleteHuntQueue(res.client_id);
  //   if (users.get(res.client_id).socket !== undefined) {
  //     agentNotFound(users.get(res.client_id).socket);
  //   }
  //   setAgentAvailable(socket_made.id);
  // });
  //
  // // Event: Agent denies to pick an Incoming call - Fallback to hunt for next available agent
  // users.get(socket_made.id).socket.on("call-denied", function (res) {
  //   if (users.get(socket_made.id) && users.get(socket_made.id).callQ) {
  //     users.get(socket_made.id).callQ = undefined;
  //   }
  //   setAgentAvailable(socket_made.id);
  //   Logger.info(
  //     "Req for call to agent After Deny from AGent:" +
  //       socket_made.id +
  //       ", from Client ID: " +
  //       res.client_id
  //   );
  //   var callData = {};
  //   callData.client = { id: res.client_id };
  //   callData.stall = { id: res.job_id };
  //   chkHunt(callData);
  // });

  // Event: Agent accepts incoming call.
  // Service creates ad-hoc room and moderator & Participant token to the room
  users.get(socket_made.id).socket.on("call-accepted", function (res) {
    var client_id = res.client_id;
    if (users.get(socket_made.id) && users.get(socket_made.id).callQ) {
      users.get(socket_made.id).callQ = undefined;
    }
    Logger.info(
      "Call Accepted From AGent:" +
        socket_made.id +
        ", from Client ID: " +
        client_id
    );
    Logger.info("Creating Token ....");
    setAgentBusy(socket_made.id);
    sendMessage(socket_made, "join-call", {});
    sendMessage(users.get(client_id).socket, "join-call", {
      token: token_part,
      agent: users.get(socket_made.id).meta,
      license: null,
    });
    addCallData(socket_made.id, client_id);
  });

  //  Function: Get Users List connected to the Service.
  //  Parameters: Type of User, Category ID
  //  Returns: JSON contains data set of "users" Map

  const processUserstat = function (type, panel_id) {
    var json = [];
    users.forEach(function (value, key, map) {
      if (value.meta && value.type !== type) {
        for (var cat in panel_id) {
          if (
            value.meta.job_id.includes &&
            value.meta.job_id.includes(panel_id[cat])
          ) {
            json.push(value.meta);
            break;
          }
        }
      }
    });
    return json;
  };
  // Function: To get Session / Call Stats - i.e. Users connected in a call.
  // Parameters: Type of user
  // Returns:  Array

  const processCallstat = function (type) {
    var calls = [];
    for (var call in inCallQ) {
      for (var cat in type) {
        if (inCallQ[call].agent.job_id.includes(type[cat])) {
          calls.push(inCallQ[call]);
          break;
        }
      }
    }
    return calls;
  };

  // Function: To get Users and Calls Stats in single call. i.e. "processUserstat()" + "processCallstat()"
  // Parameters: Category ID
  // Returns: JSON contains data set of "users" and "call" Map

  const processStat = function (panel_id) {
    var stats = {
      users: processUserstat("SV", panel_id),
      call: processCallstat(panel_id),
    };
    return stats;
  };

  // Event: To request for Call Status
  // It emits "got-call-stats" event with JSON Response

  users.get(socket_made.id).socket.on("send-call-stats", function (res) {
    Logger.info(
      "Req Received For Call stats, ID: " +
        users.get(socket_made.id).meta +
        " : " +
        socket_made.id
    );
    if (users.get(socket_made.id).meta) {
      var stats = processStat(users.get(socket_made.id).meta.job_id);

      if (users.get(socket_made.id).type === usertype.get("SV").id) {
        sendMessage(socket_made, "got-call-stats", stats);
      }
    }
  });

  // Event: Explicit Disconnect Request from Call

  users.get(socket_made.id).socket.on("disconnect-call", function (res) {
    // console.log(users.get(socket_made.id).meta, "disconnect-call");
    // Logger.info("User Req for Call Disconnect, ID: " + socket_made.id);
    // if (res !== undefined) {
    //   roomDisconnect(socket_made.id, res.error);
    // } else roomDisconnect(socket_made.id, "");
  });

  // Event: Implicit Disconnect from Call due to network issues or browser reload

  users.get(socket_made.id).socket.on("disconnect", function (res) {
    // Logger.info("User Disconnected, ID: " + socket_made.id);
    // Logger.info(
    //   "DISCONNECT due to " +
    //     JSON.stringify(res) +
    //     " by " +
    //     users.get(socket_made.id).type
    // );
    // if (users.get(socket_made.id) && users.get(socket_made.id).callQ) {
    //   var callQ = users.get(socket_made.id).callQ;
    //   callQ.client = { id: callQ.clientId };
    //   callQ.stall = { id: callQ.panel_id };
    //   users.get(socket_made.id).callQ = undefined;
    //   chkHunt(callQ);
    // }
    // roomDisconnect(socket_made.id, res.error);
    if (users.get(socket_made.id).meta) {
      const filterAgentID = agentsID.filter(function (id) {
        return id !== users.get(socket_made.id).meta.panelist_id;
      });
      agentsID = filterAgentID;
    }
    users.delete(socket_made.id);
  });
};

// Function: Send Message - To emit an event on Socket with a JSON Message
// Parameters: Target Socket,  Event Name, JSON Data

const sendMessage = function (socket, type, data) {
  socket.emit(type, data);
  Logger.info("Event Emmited : " + type + ", ID: " + socket.id);
};

const sendBroadCast = function(socket, type, data, job_id){
  var user_meta =[];
    data.forEach(function (user) {
        // if( parseInt( user.meta.job_id) ===  parseInt(job_id))
        // {
          if (user.meta && user.type === "CU" && parseInt( user.meta.job_id) ==  parseInt(job_id)) {
            // if (user.type === usertype.get("AG").id && user.meta.user_category_id[cat] === job_id && user.status === 'A') {
          user_meta.push(user.meta)

      // }
        }
      
    });
    console.log(user_meta);
    socket.broadcast.emit(type,user_meta)
    Logger.info("BroadCast Emitted")
}
// Function: Agent Not Found - To emit an event "not-available" on Socket with NO JSON Message
// Parameters: Target Socket

const agentNotFound = function (socket) {
  sendMessage(socket, "not-available", {});
};

// Function: Check Agent Hung - To find next available Agent.
// Parameter: Call Queue

const chkHunt = function (callQ) {
  token_part = "";
  // No hunting if it exceeded maximum permissible hop to find next agent.
  // Fallback to client to move to Ticket Submit Form
  if (
    huntReq.get(callQ.client.id) !== undefined &&
    huntReq.get(callQ.client.id).agentQ.length >= config.maxHunt &&
    users.get(callQ.client.id) !== undefined
  ) {
    Logger.info("Agent Maximum Hunting Limit Exceeded");
    deleteHuntQueue(callQ.client.id);
    Logger.info("Deleting Hunting Agent Queue");
    agentNotFound(users.get(callQ.client.id).socket);
  } else if (users.get(callQ.client.id) !== undefined) {
    // Hunt for next available agent in the desired stall and
    // if the agent is not hunted earlier for the same client previously
    var agentFound = huntAgent(callQ.stall.id, callQ.client.id);
    if (agentFound !== null) {
      //console.log("Agent found");
      //console.log(agentFound);
      // Next available Agent found - Send Incoming call notification & update status
      if (huntReq.get(callQ.client.id) === undefined) {
        addHuntQueue(callQ.client.id, { agentQ: [agentFound.id] });
      } else {
        updateHuntQueue(callQ.client.id, agentFound.id);
      }
      users.get(agentFound.id).callQ = {
        clientId: callQ.client.id,
        panel_id: callQ.stall.id,
      };
      setAgentEngaged(agentFound.id);

      var chkRes = { roomCreation: false, tokenMod: false, tokenPar: false };
      var d = new Date();
      console.log("time before room creation" + d.getTime());

      const agentRoomID = users.get(agentFound.id).meta.room_id;
      console.log(agentRoomID, "agentRoomID");
      //room.createAdhocRoom(joinData, function (roomRes) {
      if (agentRoomID) {
        var f = new Date();
        console.log("time after room creation" + f.getTime());
        chkRes.roomCreation = true;
        if (users.get(agentFound.id) == undefined) {
          sendMessage(users.get(client_id).socket, "disconnect-call", {});
        } else {
          setTimeout(function () {
            // Get moderator token for agent
            room.getToken(
              {
                name: users.get(agentFound.id).meta.agent,
                role: "moderator",
                user_ref: "Agent",
                roomId: agentRoomID,
              },
              function (token) {
                if (token && token.result !== undefined && token.result === 0) {
                  var g = new Date();
                  console.log("time after moderator creation" + g.getTime());
                  chkRes.tokenMod = token;
                  Logger.info("Token Got for Agent, Token: ");
                  Logger.info(token);

                  setTimeout(function () {
                    // Get participant token for Customer
                    if (users.get(callQ.client.id) == undefined) {
                      sendMessage(
                        users.get(agentFound.id).socket,
                        "disconnect-call",
                        {}
                      );
                    } else {
                      room.getToken(
                        {
                          name: users.get(callQ.client.id).meta.customer,
                          role: "participant",
                          user_ref: "customer",
                          roomId: agentRoomID,
                        },
                        function (token) {
                          if (
                            token &&
                            token.result !== undefined &&
                            token.result === 0
                          ) {
                            var h = new Date();
                            console.log(
                              "time after participant creation" + h.getTime()
                            );
                            token_part = token.token;
                            Logger.info("Token Got for Client, Token: ");
                            Logger.info(token);

                            if (
                              chkRes.roomCreation &&
                              chkRes.tokenMod &&
                              token_part
                            ) {
                              console.log(
                                users.get(callQ.client.id),
                                "allQ.client.id emitting join call to moderator and participant"
                              );
                              Logger.info(
                                "emitting join call to moderator and participant"
                              );
                              if (users.get(agentFound.id) == undefined) {
                                console.log(
                                  users.get(agentFound.id),
                                  "users.get(agentFound.id)"
                                );
                                sendMessage(
                                  users.get(callQ.client.id).socket,
                                  "disconnect-call",
                                  {}
                                );
                              } else if (
                                users.get(callQ.client.id) == undefined
                              ) {
                                console.log(
                                  users.get(callQ.client.id),
                                  "users.get(callQ.client.id)"
                                );
                                sendMessage(
                                  users.get(agentFound.id).socket,
                                  "disconnect-call",
                                  {}
                                );
                              } else {
                                sendMessage(agentFound, "incoming-call", {
                                  job_id: callQ.stall.id,
                                  client_id: callQ.client.id,
                                  client: users.get(callQ.client.id).meta,
                                  token: chkRes.tokenMod,
                                });
                                sendMessage(
                                  users.get(callQ.client.id).socket,
                                  "agent-found",
                                  { agent: users.get(agentFound.id).meta }
                                );
                              }
                            } else {
                              Logger.info(
                                "failed to emit join call to moderator and participant"
                              );
                            }
                          }
                        }
                      );
                    }
                  }, 100); // 1ms wait - it was earlier made 1000ms
                }
              }
            );
          }, 100); // 1ms wait - it was earlier made 1000ms
        }
      } else {
        Logger.info("Failed to create Room, Error: ");
        //Logger.info(roomRes.result);
      }
      //});
    } else {
      console.log("Agent not found");
      // Agent not available, fallback to client to move to Ticket Submit Form
      deleteHuntQueue(callQ.client.id);
      agentNotFound(users.get(callQ.client.id).socket);
    }
  }
};

// Function: Add Call Data - to map connected Agent / Customer for RTC Session
// Parameters: Agent Socket, Customer Socket

const addCallData = function (agent_socket_id, client_socket_id) {
  var agentMeta = users.get(agent_socket_id).meta;
  agentMeta.status = users.get(agent_socket_id).status;
  agentMeta.socket_id = agent_socket_id;
  var clientMeta = users.get(client_socket_id).meta;
  clientMeta.status = users.get(client_socket_id).status;
  clientMeta.socket_id = client_socket_id;

  var call = {
    agent: agentMeta,
    client: clientMeta,
    startTime: new Date().getTime(),
    status: true,
  };

  inCallQ.push(call);
  Logger.info("Adding call Data to Queue");
};

// Function: Update Call Data - to update Call Status
// Parameter: Queue Position

const updateCallData = function (pos) {
  inCallQ[pos].status = false;
  inCallQ[pos].endTime = new Date().getTime();
  Logger.info("Changing Status of call to ended");
};

// Function: To check connected Agent/Client
// Parameters: Socket ID of Customer or Agent
// Returns: JSON with position of element in array, socket id of agent/client , user type of agent/client

const checkConnected = function (socket_id) {
  var connected = undefined;
  for (var call in inCallQ) {
    if (
      inCallQ[call].agent.socket_id === socket_id ||
      inCallQ[call].client.socket_id === socket_id
    ) {
      connected = {};
      connected.pos = call;
    }
    if (inCallQ[call].agent.socket_id === socket_id) {
      connected.socket_id = inCallQ[call].client.socket_id;
      connected.userType = usertype.get("AG").id;
    } else if (inCallQ[call].client.socket_id === socket_id) {
      connected.socket_id = inCallQ[call].agent.socket_id;
      connected.userType = usertype.get("CU").id;
    }
  }
  return connected;
};

// Function: To handle Implicit or Explicit Room Disconnection - does housekeeping work
// Parameters: Socket ID
// Returns: Void

const roomDisconnect = function (socket_id, error) {
  // var connectedCall = checkConnected(socket_id);
  // sendMessage(users.get(socket_id).socket, "disconnect-call", error);
  // if (connectedCall && users.get(connectedCall.socket_id)) {
  //   sendMessage(
  //     users.get(connectedCall.socket_id).socket,
  //     "disconnect-call",
  //     error
  //   );
  //   updateCallData(connectedCall.pos);
  //   if (connectedCall.userType === usertype.get("CU").id) {
  //     setAgentAvailable(connectedCall.socket_id);
  //     users.get(connectedCall.socket_id).callQ = undefined;
  //     deleteHuntQueue(socket_id);
  //   } else {
  //     console.log("deleteHuntQueue.................");

  //     deleteHuntQueue(connectedCall.socket_id);
  //     setAgentAvailable(socket_id);
  //   }
  // }
};

// Function: Set Agent Status to "Available" for incoming call.
// Parameters: Socket ID
// Returns: Void

const setAgentAvailable = function (socket_id) {
  if (users.get(socket_id) !== undefined) {
    users.get(socket_id).status = "A";
    users.get(socket_id).meta.user_status = "A";
    Logger.info("Agent Set as Available, ID: " + socket_id);
  }
};

// Function: Set Agent Status to "Engaged" to prevent any further call.
// This status is set when Agent is being alerted with an Incoming Call
// Parameters: Socket ID
// Returns: Void

const setAgentEngaged = function (socket_id) {
  if (users.get(socket_id) !== undefined) {
    users.get(socket_id).status = "E";
    users.get(socket_id).meta.user_status = "E";
    Logger.info("Agent Set as Engaged, ID: " + socket_id);
  }
};

// Function: Set Agent Status to "Busy" to prevent any further call.
// This status is set when Agent is on an RTC Session with a Customer
// Parameters: Socket ID
// Returns: Void

const setAgentBusy = function (socket_id) {
  if (users.get(socket_id) !== undefined) {
    users.get(socket_id).status = "B";
    users.get(socket_id).meta.user_status = "B";
    job_id = users.get(socket_id).meta.job_id;
    Logger.info("Agent Set as Busy, ID: " + socket_id);
    sendBroadCast(users.get(socket_id).socket,'users', users, job_id);
  }
};

// Function: To delete Agent IDs from HUNT Queue for an incoming call from a Customer which
// was previously rejected  by the Agents.
// Parameters: Socket ID pf Customer
// Returns: Void

const deleteHuntQueue = function (socket_id) {
  if (huntReq.get(socket_id) !== undefined) {
    huntReq.delete(socket_id);
    Logger.info("Deleted Client Hunt Queue, ID: " + socket_id);
  }
};

// Function: To add Agent IDs to HUNT Queue who rejected an incoming call from a Customer.
// This is to prevent re-hunting same Agents for the Customers Call
// Parameters: Socket ID pf Customer, Agent IDs
// Parameter Sample: { <client_id>,{agentQ:[<panelist_id>]} }
// Returns: Void

const addHuntQueue = function (socket_id, data) {
  huntReq.set(socket_id, data);
  Logger.info("Added Client Hunt Queue, ID: " + socket_id);
};

// Function: To update Agent IDs to HUNT Queue who rejected an incoming call from a Customer.
// This is to prevent re-hunting same Agents for the Customers Call
// Parameters: Socket ID pf Customer, Agent IDs
// Parameter Sample: { <client_id>,{agentQ:[<panelist_id>]} }
// Returns: Void

const updateHuntQueue = function (socket_id, data) {
  if (huntReq.get(socket_id) && huntReq.get(socket_id).agentQ) {
    huntReq.get(socket_id).agentQ.push(data);
    Logger.info("Updated Client Hunt Queue, ID: " + socket_id);
  }
};




