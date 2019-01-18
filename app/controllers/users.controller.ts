import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';

import { connect, getUsers, createUser } from '../utils/db';

connect();

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    const users = await getUsers();
    res.send(users);
});

router.post('/', async (req: Request, res: Response) => {
    const token = req.headers.authorization;
    const decodedToken = await admin.auth().verifyIdToken(<string>token);
    console.log(req.body.name);
    createUser(decodedToken.uid, req.body.name, req.body.profile_picture);
    res.send({ message: 'Created User!' });
});

export const UserController: Router = router;
