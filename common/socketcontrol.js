module.exports = function(io){
    var usernames = [];
    io.sockets.on("connection", function(socket){
        console.log("Co user moi ket noi");

        //Listen adduser event
        socket.on("adduser", function(username){
            //save
            socket.username = username;
            usernames.push(username);

            //notify to myself
            var data = {
                sender : "SERVER",
                message : "You have join chat room"
            }
            socket.emit("update-message", data);
            //notify to other users
            var data = {
                sender : "SERVER",
                message : username + " have join chat room"
            }
            socket.broadcast.emit("update-message", data);
        })

        //Listen send_message event
        socket.on("send_message", function(message){
            //notify to myself
            var data = {
                sender: "You ",
                message: message
            }
            socket.emit("update-message", data);
            var data = {
                sender: socket.username,
                message: message
            }
            socket.broadcast.emit("update-message", data);

        });

        //Listen disconnect
        socket.on("disconnect", function(){
            //Delete username
            for( var i = 0; i < usernames.length; i++){
                if (usernames[i] == socket.username) {
                    usernames.splice(i,1);
                }
            }
            //Notify to other users
            var data = {
                sender: "SERVER",
                message: socket.username + " left chat room"
            }
            socket.broadcast.emit("update-message", data);
        })
    });
}