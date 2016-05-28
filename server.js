// Initialize and setup server.

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var server = require('http').createServer(app);

var bodyParser = require('body-parser');
// to support JSON-encoded bodies
app.use( bodyParser.json() );

var io = require('socket.io').listen(server);

// Users is an array where new users is added.
users = [];
// Connection is an array which shows how many users is connected.
connection = [];
// Server is running on port 3000.
server.listen(process.env.PORT || 3000);
console.log("Server running...");
/* 
    Database is set up on default port 27017.
    For proper application work, collection dbtest got to be created.
*/
var url = 'mongodb://localhost:27017/dbtest';

// Connection to database.
mongoose.connect(url);
// Schema.
var FormSchema = new mongoose.Schema({
    nick: String,
    message: String,
    when: {type: Date, default: Date.now}
}, {collection: 'history'});

var Form = mongoose.model("history", FormSchema);

// Set up root directory.
app.use(express.static(__dirname + '/'));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// Type this address to display collection (Only for checking Is collection works properly. It is a bad practice).
app.get('/database', function(req, res){
    Form.find(function(error, data){
        res.json(data);
    });
});

// Event listeners.
io.sockets.on('connection', function(socket){
    // Add new socket to connection array.
    connection.push(socket);
    
    // Disconnect event listener.
    socket.on('disconnect', function(data){
        // Remove user from users array.
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        // Remove socket from connection array.
        connection.splice(connection.indexOf(socket), 1);
    });
    // Send message event listener.
    socket.on('send message', function(data){
        // Trigger event new message.
        io.sockets.emit('new message', {msg: data, user: socket.username});
        // Create json object to format data.
        var item = {
            nick: socket.username, 
            message: data
        };
        // Add data to collection.
        Form.collection.insert(item);
    })
    // New user event listener.
    socket.on('new user', function(data, callback){
        callback(true);
        // Add new user to users array.
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    })
    
    // Update function which fires get users listener.
    function updateUsernames(){
        io.sockets.emit('get users', users);
    }
});