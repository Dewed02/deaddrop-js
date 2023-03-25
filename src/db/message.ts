import { connect } from "./db";
import { sha256 } from 'js-sha256';
import * as fs from 'fs';

export const getMessagesForUser = async (user: string): Promise<string[]> => {
    let db = await connect();

    let messages: string[] = [];

    await db.each(`
        SELECT data FROM Messages
        WHERE recipient = (
            SELECT id FROM Users WHERE user = :user
        );
    `, {
        ":user": user,
    }, (err, row) => {
        if (err) {
            throw new Error(err);
        }
        messages.push(row.data);
    });
    if(!(await authenticateMessage(messages[0].toString(), user))) {
        throw new Error("Integrity of the message cannot be verified.");
        const tamperWarning = "WARNING: MESSAGE HAS BEEN TAMPERED WITH FOR USER" + user.toString();
        fs.writeFileSync('logging/logs.txt', tamperWarning);
    }
    
    let sender = getMessageSender(user);
    messages.push(" From: " + sender);

    return messages;
}

export const saveMessage = async (message: string, recipient: string, sender: string) => {
    let db = await connect();

    let secureMessage = sha256(message);

    await db.run(`
        INSERT INTO Messages 
            (recipient, sender, data, secureMessage)
        VALUES (
            (SELECT id FROM Users WHERE user = :user),
            :sender,
            :message,
            :secureMessage
        )
    `, {
        ":user": recipient,
        ":sender": sender,
        ":message": message,
        ":secureMessage": secureMessage,
    });
}

export const authenticateMessage = async (message: string, user: string): Promise<boolean> => {
    let secureMessage = await getSecureMessage(user);
    return secureMessage.toString()  == sha256(message.toString());
}


export const getMessageSender = async (user: string): Promise<string> => {
    let db = await connect();
    
     let sender: string[] = [];


    let result = await db.each(`
        SELECT sender FROM Messages
        WHERE recipient = (
            SELECT id FROM Users 
            WHERE user = :user
        );
    `, {
        ":user": user,
    }, (err, row) => {
        if (err) {
            throw new Error(err);
        }
        sender.push(row.sender);
    });
    

    return sender.toString();
}


export const getSecureMessage = async (user: string): Promise<string> => {
    let db = await connect();
    
     let secureMessage: string[] = [];


    let result = await db.each(`
        SELECT secureMessage FROM Messages
        WHERE recipient = (
            SELECT id FROM Users 
            WHERE user = :user
        );
    `, {
        ":user": user,
    }, (err, row) => {
        if (err) {
            throw new Error(err);
        }
        secureMessage.push(row.secureMessage);
    });
    

    return secureMessage.toString();
}
