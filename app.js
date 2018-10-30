var experss = require("express");
var config = require("config");
var bodyParser = require("body-parser");
var session = require('express-session');

var socketio = require("socket.io");

var app = experss();
//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: config.get("secret_key"),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));


app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");

//Static folder
app.use("/static", experss.static(__dirname + "/public"));

var controllers = require(__dirname + "/apps/controllers");

app.use(controllers);

var host = config.get("server.host");
var port = config.get("server.port")

var server = app.listen(port,host, function(){
    console.log("Server is running " + port);
});

var io = socketio(server);

var socketcontrol = require("./common/socketcontrol")(io);

