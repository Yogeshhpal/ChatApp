const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../Models/userModel');
const app = express();
const { ConversationModel, MessageModel } = require('../Models/conversationModel');
const getConversation = require('../helpers/getConversation');

// Sockets Connections 
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // origin: "http://localhost:3000",
        origin: "https://omegle-frontend-diex.onrender.com",
        credentials: true
    }
});

// Socket running at localhost:8080

// online user
const onlineUser = new Set();

// Declare user variable outside to make it global
let user;

io.on('connection', async (socket) => {
    console.log('User connected', socket.id);
    console.log("online users", onlineUser);
    const token = socket.handshake.auth.token;
    // current user details
    user = await getUserDetailsFromToken(token);
    // console.log('user', user);
    // create a room with the user id
    socket.join(user?._id.toString());
    onlineUser.add(user?._id?.toString());
    io.emit('onlineUser', Array.from(onlineUser));


    socket.on('message-page', async (userId) => {
        console.log('userId', userId);
        const userDetails = await UserModel.findById(userId).select('-password');
        console.log('userDetails', userDetails);
        const payload = {
            _id: userDetails?._id,
            name: userDetails?.name,
            email: userDetails?.email,
            profile_pic: userDetails?.profilePic,
            online: onlineUser.has(userId),
        };
        socket.emit('message-user', payload);


        //Get Previous Message 
        const getConversationMessage = await ConversationModel.findOne({
            "$or": [
                { sender: user?._id, receiver: userId },
                { sender: userId, receiver: user?._id },
            ]
        }).populate('messages').sort({ updateAt: -1 });

        // console.log('getConversationMessage', getConversationMessage.messages);


        socket.emit('message', getConversationMessage?.messages || []);
    });


    // New Message
    socket.on('new-message', async (data) => {
        try {
            // console.log('new-message', data);
            // Check conversation in db whether it is present or not
            let conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: data?.sender, receiver: data?.receiver },
                    { sender: data?.receiver, receiver: data?.sender },
                ]
            });

            // console.log('conversation', conversation);

            // If conversation is not present, create a new conversation
            if (!conversation) {
                const createConversation = new ConversationModel({
                    sender: data?.sender,
                    receiver: data?.receiver,
                });
                conversation = await createConversation.save();
                console.log('Created new conversation', conversation);
            }

            const message = new MessageModel({
                text: data?.text,
                imageUrl: data?.imageUrl,
                videoUrl: data?.videoUrl,
                msgByUserId: data?.msgByUserId,
            });

            console.log('message', message);

            const saveMessage = await message.save();
            // console.log('Saved message', saveMessage);

            const updateConversation = await ConversationModel.updateOne(
                { _id: conversation._id },
                { "$push": { messages: saveMessage._id } }
            );

            // console.log('Updated conversation', updateConversation);

            const getConversationMessage = await ConversationModel.findOne({
                "$or": [
                    { sender: data?.sender, receiver: data?.receiver },
                    { sender: data?.receiver, receiver: data?.sender },
                ]
            }).populate('messages').sort({ updateAt: -1 });

            // console.log('getConversationMessage', getConversationMessage.messages);

            io.to(data?.sender).emit('message', getConversationMessage?.messages || []);
            io.to(data?.receiver).emit('message', getConversationMessage?.messages || []);

            //Send conversation message
            const conversationSender = await getConversation(data?.sender);
            const conversationReceiver = await getConversation(data?.receiver);

            io.to(data?.sender).emit('conversation', conversationSender);
            io.to(data?.receiver).emit('conversation', conversationReceiver);

        } catch (error) {
            console.error('Error in new-message handler', error);
        }
    });

    //Side bar message
    socket.on('sidebar', async (currentUserId) => {
        // console.log('sidebarId', currentUserId);

        const conversation = await getConversation(currentUserId);
        socket.emit('conversation', conversation);
    })

    socket.on('seen', async (msgByUserId) => {

        let conversation = await ConversationModel.findOne({
            "$or": [
                { sender: user?._id, receiver: msgByUserId },
                { sender: msgByUserId, receiver: user?._id }
            ]
        })

        const conversationMessageId = conversation?.messages || []

        const updateMessages = await MessageModel.updateMany(
            { _id: { "$in": conversationMessageId }, msgByUserId: msgByUserId },
            { "$set": { seen: true } }
        )

        //send conversation
        const conversationSender = await getConversation(user?._id?.toString())
        const conversationReceiver = await getConversation(msgByUserId)

        io.to(user?._id?.toString()).emit('conversation', conversationSender)
        io.to(msgByUserId).emit('conversation', conversationReceiver)
    })

    socket.on('disconnect', () => {
        onlineUser.delete(user?._id?.toString());
        // console.log("online users after disconnect", onlineUser);
        // console.log('User disconnected', socket.id);
    });
});

module.exports = { app, server };
