import { Client } from 'pg';

import User from '../Model/User';

let client: Client;

export const connect = async () => {
    const connectionString = process.env.DATABASE_URL;
    client = new Client({
        connectionString: connectionString,
        ssl: true
    });
    await client.connect();
};

export const disconnect = async () => {
    await client.end();
};

export const getChats = async (UserID: any) => {
    const res = await client.query(
        'SELECT DISTINCT * FROM public."Chats", public."Members" WHERE "User_ID" = $1 AND public."Chats"."ID" = public."Members"."Chat_ID"',
        [UserID]
    );
    return res.rows;
};

export const getUsers = async () => {
    const res = await client.query('SELECT * FROM public."Users"');
    return res.rows;
};

export const createChat = async (
    chat_name: String,
    members: [String],
    owner: String
) => {
    const res = await client.query(
        'INSERT INTO public."Chats"(chat_name, owner) VALUES ($1, $2) RETURNING "ID";',
        [chat_name, owner]
    );

    members.forEach(async member => {
        await client.query(
            'INSERT INTO public."Members"("Chat_ID", "User_ID") VALUES ($1, $2);',
            [res.rows[0].ID, member]
        );
    });
};

export const getMessages = async (chat_id: number) => {
    const res = await client.query(
        'SELECT DISTINCT * FROM public."Messages", public."Users" WHERE "Chat_ID" = $1 AND public."Messages"."Owner" = public."Users"."ID" ORDER BY "Time_Sent";',
        [chat_id]
    );
    return res.rows;
};

export const createMessage = async (
    chat_id: number,
    owner: string,
    message: string
) => {
    const res = await client.query(
        'INSERT INTO public."Messages"("Owner", "Message", "Chat_ID") VALUES ($1, $2, $3) RETURNING *;',
        [owner, message, chat_id]
    );
    return res.rows[0];
};

export const getMemberForUser = async (chat_id: number, user: string) => {
    const res = await client.query(
        'SELECT DISTINCT * FROM public."Chats", public."Members" WHERE "User_ID" = $1 AND public."Chats"."ID" = $2;',
        [user, chat_id]
    );
    return res.rows;
};

export const getUsersForChat = async (chat_id: number) => {
    const res = await client.query(
        'SELECT DISTINCT * FROM public."Members" WHERE "Chat_ID" = $1;',
        [chat_id]
    );
    return res.rows;
};

export const getUser = async (user_id: string) => {
    console.log(user_id);
    const res = await client.query(
        'SELECT * FROM public."Users" WHERE "ID" = $1;',
        [user_id]
    );
    console.log(res.rows[0]);
    return res.rows[0];
};
