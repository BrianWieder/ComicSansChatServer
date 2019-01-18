import { Router, Request, Response } from 'express';
import {
    connect,
    disconnect,
    getChats,
    createChat,
    getMessages,
    createMessage,
    getMemberForUser
} from '../utils/db';
import * as admin from 'firebase-admin';

connect();

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    const token = req.headers.authorization;
    if (token) {
        const decodedToken = await admin.auth().verifyIdToken(<string>token);
        const chats = await getChats(decodedToken.uid);
        res.send(chats);
    } else {
        res.send({ error: 'You must be authenticated' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    let members = req.body.members.map((mem: any) => mem.id);
    const token = req.headers.authorization;
    const decodedToken = await admin.auth().verifyIdToken(<string>token);
    members.push(decodedToken.uid);
    createChat(req.body.chat_name, members, decodedToken.uid);
    res.send({ message: 'Created Chat!' });
});

router.get('/messages/:id', async (req: Request, res: Response) => {
    let { id } = req.params;
    const token = req.headers.authorization;
    if (token) {
        const decodedToken = await admin.auth().verifyIdToken(<string>token);
        const memberChat = await getMemberForUser(id, decodedToken.uid);
        if (memberChat.length > 0) {
            const messages = await getMessages(id);
            res.send(messages);
        } else {
            res.send({ error: 'You are not a member of this chat' });
        }
    } else {
        res.send({ error: 'You are not authenticated' });
    }
});

router.post('/messages/:id', async (req: Request, res: Response) => {
    let { id } = req.params;
    const token = req.headers.authorization;
    let message = req.body.message;
    const decodedToken = await admin.auth().verifyIdToken(<string>token);
    await createMessage(id, decodedToken.uid, message);
    res.send({ message: 'Created Message!' });
});

export const ChatsController: Router = router;
