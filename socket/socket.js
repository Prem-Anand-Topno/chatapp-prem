module.exports = function(io,rooms){
	var chatrooms = io.of('/roomlist').on('connection',function(socket){
		console.log("connection established on the server! of chatrooms");
		socket.emit('roomupdate',JSON.stringify(rooms));


		socket.on('newroom',function(data){
		rooms.push(data);
		socket.broadcast.emit('roomupdate',JSON.stringify(rooms));//broadcast to all(except active user) about new room
		socket.emit('roomupdate',JSON.stringify(rooms));//emit to active user who created new room so that he does not get broadcast
	})


	})

	var messages = io.of("/messages").on('connection',function(socket){
		console.log("connection established of messages");

		socket.on('joinroom',function(data){
			socket.username = data.user;//assigning user name to socket
			socket.userPic = data.userPic;//assigning userPic to socket
			socket.join(data.room);//joining or pushing a user to a particular room
			updateUserList(data.room,true);
		})

		socket.on('newMessage',function(data){
			socket.broadcast.to(data.room_number).emit('messagefeed',JSON.stringify(data));// to others users present in that room
		})

		function updateUserList(room,updateALL){
			var getUsers = io.of('/messages').clients(room);
			var userlist = [];
			for(var i in getUsers){
				console.log("yes"+getUsers[i].username+" "+getUsers[i].userPic);
				userlist.push({user:getUsers[i].username,userPic:getUsers[i].userPic})
			}
		
			socket.to(room).emit('updateUsersList',JSON.stringify(userlist));//to room for updation of active users

			if(updateALL){
				socket.broadcast.to(room).emit('updateUsersList',JSON.stringify(userlist));			
			}
		}

		socket.on('updateList',function(data){
			updateUserList(data.room,true);
		})

	})

	
} 