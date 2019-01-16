import { Router, Request, Response } from 'express';
import { connect, getUsers } from '../utils/db';

connect();

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    const users = await getUsers();
    res.send(users);
});

export const UserController: Router = router;
