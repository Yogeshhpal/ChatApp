const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../Models/userModel');
const { ConversationModel, MessageModel } = require('../Models/conversationModel');
const getConversation = require('../helpers/getConversation');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://my-chat-app-frontend-j9nk.onrender.com",
        credentials: true
    }
});

// Online users set
const onlineUsers = new Set();

io.on('connection', async (socket) => {
    try {
        const token = socket.handshake.auth.token;

        // Retrieve user details from token
        const user = await getUserDetailsFromToken(token);

        if (!user) {
            throw new Error('User details could not be retrieved');
        }

        // Join user to their room based on user id
        socket.join(user._id.toString());
        onlineUsers.add(user._id.toString());
        io.emit('onlineUser', Array.from(onlineUsers));

        // Handle 'message-page' event
        socket.on('message-page', async (userId) => {
            // Fetch user details
            const userDetails = await UserModel.findById(userId).select('-password');
            const payload = {
                _id: userDetails._id,
                name: userDetails.name,
                email: userDetails.email,
                profile_pic: userDetails.profilePic,
                online: onlineUsers.has(userId),
            };
            socket.emit('message-user', payload);

            // Fetch conversation messages
            const conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: user._id, receiver: userId },
                    { sender: userId, receiver: user._id },
                ]
            }).populate('messages').sort({ updateAt: -1 });

            socket.emit('message', conversation?.messages || []);
        });

        // Handle 'new-message' event
        socket.on('new-message', async (data) => {
            // Logic for handling new messages
            // Ensure user and conversation logic is correctly handled here
        });

        // Handle 'disconnect' event
        socket.on('disconnect', () => {
            onlineUsers.delete(user._id.toString());
            io.emit('onlineUser', Array.from(onlineUsers));
        });

    } catch (error) {
        console.error('Socket connection error:', error);
        socket.disconnect(true); // Disconnect socket on error
    }
});

server.listen(8080, () => {
    console.log('Socket server is running on port 8080');
});

module.exports = { app, server };
