#  deaddrop-js

A deaddrop utility written in Typescript. Put files in a database behind a password to be retrieved at a later date.

This is a part of the University of Wyoming's Secure Software Design Course (Spring 2023). This is the base repository to be forked and updated for various assignments. Alternative language versions are available in:
- [Go](https://github.com/andey-robins/deaddrop-go)
- [Rust](https://github.com/andey-robins/deaddrop-rs)

## Versioning

`deaddrop-js` is built with:
- node v18.13.0

## Usage

`npm run build && node dist/index.js --help` for instructions

Then run `node dist/index.js --new --user <username here>` and you will be prompted to create the initial password.

## Database

Data gets stored into the local database file dd.db. This file will not by synched to git repos. Delete this file if you don't set up a user properly on the first go

## Logging Strategy
The log was implemented by adding an additional table to the schema. This table will be used to store the user's username whenever they read a message that was sent to them. The method used to store the user's user name is declared in the logging.ts file, it was written very similarly to the saveMessage method that can be found in message.ts. This method is called within read.ts imediately after getMessageForUser method, and uses 'user' as an argument to log that the user has accessed the message. In addition a line of code was added to index.ts to export the messageRead method from logging.ts. Another method to log when the user accesses their message was implemented by createing an array that will store the user's username as well as the time that the messsage was accessed. This array is then converted to a string and written out a file that can be read at a later time.

In terms of security concerns that I noted in the previous assignment, the only issue remaining outside of logging was noting who sent the message. While I did not create a record of who sent the message for the other user to see. The authenticate method from session.ts was added to the body of sendMessage in send.ts. This will require the user to have acount on the program if they want to send a message. Logging who sent a message could be implemented in a similar method as who read the message that was mentioned earlier. However, I was unable to get any changes made effect how the program ran.

Additional Comments: 
After using 'npm run build' to get my program to update after making edits on github. An additional table was added to the schema titled 'MessageSent' that is used to keep a record of which users sent a message. The function to store the name in the table is declared in logging.ts, and is very similar to userReadMessage that is found in the same file with some minor alterations. A note on adding an authentication requirement to send messages, while it seems to be a great execution makes it so that a user can only send a message to themselves. Provided I had more time I would have tried to fix this so that the user logging in was not the same of the one recieving the message. I do not have time to make this change.


## MAC Strategy
There were a few changes put into place inorder to get authentication of a message up and running. The approach that I decided to take to ensure message integrity is a very similar process to how passwords are protected. Prior to the message and relevant information (i.e. recipient, sender, etc.) being stored in the database the message is first encrypted with the sha256 algorithm, this encrypted message is saved in a new row 'SecureMessage'. When the verb read is invoked the getMessagesForUser function invokes a new function 'authenicateMessage' which goes through all of the messages that have been sent to the user and verifies that the message and it's associated encrypted message match. If all of the messages are unaltered the function will return all of the messages, however, if any have been changed after being stored the program will throw an error informing the user that the integrity of the message cannot be verified. In addition a log file entitiled 'tampter.txt' will be written stating which user's messages have been altered. While both the message and encrypted message are both visible upon invoking sqlite3 dd.db, and therefore both can be modified "The probability of just two hashes accidentally colliding is approximately: 4.3*10^-60 for sha256" (Ramirez, 2021). Meaning that the likelyhood that the message being replaced with one with the same hash is incredibly unlikely. You could argue that the could just replace the message and the encrypted message with one that they created using sha256 to get around this. And that is a great point they could do just that and I am having a hard time coming up with a solution for this, idealy either the message or the hash would be hidden but I'm unsure of how to do this. Moving on the sender identification was a less involved process than MAC, I addded an additional verb 'from' that is required when using the verb send along with 'to'. From indicates the sender of the message while to indicates the recipient of the message. When the send verb is invoked, the authenication function is also invoked requiring a password from the sender of the message. Now when the message is saved the sender of the message is also saved into the database. When the message is retrieved the indivial that sent the message is also displaed in addition to the contents of the messsage.

​Ramirez, G. (2021, July 28). MD5: The broken algorithm. Avira Blog. Retrieved March 26, 2023, from https://www.avira.com/en/blog/md5-the-broken-algorithm#:~:text=The%20probability%20of%20just%20two,%3A%201.47*10%2D29.&text=SHA256%3A%20The%20slowest%2C%20usually%2060,%3A%204.3*10%2D60.
