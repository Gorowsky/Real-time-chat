// Initialize variable.
var newSocket;
// Create new app module.
var chatApp = angular.module('chatApp', [])
    // Create controller.
    .controller('mainController', ['$scope', function($scope){
        // Initialize object and variables.
        $scope.chat = {};
        $scope.chat.nick = "";
        $scope.chat.message = "";
        // Javascript reference to DOM.
        var textarea = document.getElementById("message");
        // Function called after set a Nickname.
        $scope.chat.chooseNick = function(){
            // Check if string is not empty.
            if($scope.chat.nick){
                // References.
                var nickBox = document.getElementById("nick_container");
                var chatBox = document.getElementById("chat_container");
                // Trigger an event listener with data as a nickname.
                newSocket.emit('new user', $scope.chat.nick, function(data){
                    if(data){
                        // Hide nickname setting and show chat.
                        nickBox.style.display = "none";
                        chatBox.style.display = "flex";
                    }
                });
            }
        }
        // Hit enter to send message.
        textarea.addEventListener("keypress", function(e){
            if (e.keyCode == '13'){
                newSocket.emit('send message', $scope.chat.message);
                textarea.value = "";
            }
        });
        // Hit send button to send message.
        $scope.chat.submitMessage = function(){
            // Triggers send message event listener.
            newSocket.emit('send message', $scope.chat.message);
            // Clear textarea.
            textarea.value = "";
            $scope.chat.message = "";
        }
        // Update chat field.
        newSocket.addEventListener('new message', function(data){
            var container = document.getElementById("chat_area");
            var prev_msg = container.innerHTML;
            container.innerHTML = prev_msg + '<div class = "new_msg"><strong>'+data.user+'</strong>: '+data.msg+'</div>';
        })
        // Update Users Online field when new user occours.
        newSocket.addEventListener('get users', function(data){
            var nicks = "";
            var userBox = document.getElementById("current");
            for(i = 0; i < data.length; i++){
                nicks += '<li class = "nick_group">'+data[i]+'</li>';
            }
            userBox.innerHTML = nicks;
        })

    }])
    // Create new socket after page is loaded.
    .run(function(){
        newSocket = io.connect();
    })