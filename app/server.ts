import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import path from 'path';
import * as admin from 'firebase-admin';
import './utils/exit';

dotenv.config();

var serviceAccount = require('./independent-studies-firebase-service-account.json');
const cors = require('cors');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

import {
    WelcomeController,
    ChatsController,
    UserController
} from './Controllers';
import { getUsersForChat, getUsers, getUser, createMessage } from './utils/db';

const app = express();
const port: number = Number(process.env.PORT) || 3000;

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'static')));

app.use('/api/welcome', WelcomeController);
app.use('/api/chats', ChatsController);
app.use('/api/users', UserController);

app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname + '/static/index.html'));
});

io.use(function(socket: any, next: any) {
    if (socket.handshake.query && socket.handshake.query.token) {
        admin
            .auth()
            .verifyIdToken(socket.handshake.query.token)
            .then(decodedToken => {
                socket.decoded = decodedToken;
                socket.join(decodedToken.uid);
                next();
            })
            .catch(err => {
                next(new Error('Authentication error'));
            });
    }
}).on('connection', function(socket: any) {
    // Connection now authenticated to receive further events
    socket.on('chat', async (message: any) => {
        if (message.chat_id) {
            const userSent = await getUser(socket.decoded.uid);
            const users = await getUsersForChat(message.chat_id);
            const db_message = await createMessage(
                message.chat_id,
                socket.decoded.uid,
                message.message
            );
            const msgToSend = {
                Chat_ID: 1,
                ID: socket.decoded.uid,
                Message: message.message,
                Owner: socket.decoded.uid,
                Time_Sent: db_message.Time_Sent,
                last_login: userSent.last_login,
                name: userSent.name,
                profile_picture: userSent.profile_picture
            };
            users.forEach(user => {
                io.to(user.User_ID).emit('chat', msgToSend);
            });
        }
    });
});

server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/`);
});
