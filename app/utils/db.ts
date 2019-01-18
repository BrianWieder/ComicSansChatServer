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
    try {
        const res = await client.query(
            'SELECT DISTINCT * FROM public."Chats", public."Members" WHERE "User_ID" = $1 AND public."Chats"."ID" = public."Members"."Chat_ID"',
            [UserID]
        );
        return res.rows;
    } catch (err) {
        console.error('ERROR GETTING CHATS!!!');
        console.error(err);
        return [];
    }
};

export const getUsers = async () => {
    try {
        const res = await client.query('SELECT * FROM public."Users"');
        return res.rows;
    } catch (err) {
        console.error('ERROR GETTING USERS!!!');
        console.error(err);
        return [];
    }
};

export const createChat = async (
    chat_name: String,
    members: [String],
    owner: String
) => {
    try {
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
    } catch (err) {
        console.error('ERROR CREATING CHATS!!!');
        console.error(err);
    }
};

export const getMessages = async (chat_id: number) => {
    try {
        const res = await client.query(
            'SELECT DISTINCT * FROM public."Messages", public."Users" WHERE "Chat_ID" = $1 AND public."Messages"."Owner" = public."Users"."ID" ORDER BY "Time_Sent";',
            [chat_id]
        );
        return res.rows;
    } catch (err) {
        console.error('ERROR GETTING MESSAGES!!!');
        console.error(err);
        return [];
    }
};

export const createMessage = async (
    chat_id: number,
    owner: string,
    message: string
) => {
    try {
        const res = await client.query(
            'INSERT INTO public."Messages"("Owner", "Message", "Chat_ID") VALUES ($1, $2, $3) RETURNING *;',
            [owner, message, chat_id]
        );
        return res.rows[0];
    } catch (err) {
        console.error('ERROR CREATING MESSAGE!!!');
        console.error(err);
        return {};
    }
};

export const getMemberForUser = async (chat_id: number, user: string) => {
    try {
        const res = await client.query(
            'SELECT DISTINCT * FROM public."Chats", public."Members" WHERE "User_ID" = $1 AND public."Chats"."ID" = $2;',
            [user, chat_id]
        );
        return res.rows;
    } catch (err) {
        console.error('ERROR GETTING MEMBER!!!');
        console.error(err);
        return [];
    }
};

export const getUsersForChat = async (chat_id: number) => {
    try {
        const res = await client.query(
            'SELECT DISTINCT * FROM public."Members" WHERE "Chat_ID" = $1;',
            [chat_id]
        );
        return res.rows;
    } catch (err) {
        console.error('ERROR GETTING USERS FOR CHAT!!!');
        console.error(err);
        return [];
    }
};

export const getUser = async (user_id: string) => {
    try {
        const res = await client.query(
            'SELECT * FROM public."Users" WHERE "ID" = $1;',
            [user_id]
        );
        return res.rows[0];
    } catch (err) {
        console.error('ERROR GETTING USER!!!');
        console.error(err);
        return {};
    }
};

export const createUser = async (
    user_id: string,
    name: string,
    profile_picture: string
) => {
    try {
        const res = await client.query(
            'INSERT INTO public."Users" ("ID", name, profile_picture, last_login) VALUES ($1, $2, $3, NOW());',
            [user_id, name, profile_picture]
        );
        return res.rows[0];
    } catch (err) {
        console.error('ERROR CREATING USER!!!');
        console.error(err);
        return {};
    }
};
