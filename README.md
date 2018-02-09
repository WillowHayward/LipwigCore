# What is Lipwig?

Lipwig is a NodeJS based service designed to pass simple messages between connected users using WebSockets.

Within a Lipwig instance there are several **Room**. A room is created by a **Host** user, and can contain any number of **Client** users. 

The role of the host is to run the game or application logic. The host can send or recieve messages from any client at any time, as well as being able to kick users or close down the game.

Client users are the players of the game. They can only send or receive messages from the host. 

# What is Lipwig for?

Lipwig is designed with games like [The Jackbox Party Pack](http://jackboxgames.com/project/jbpp3/) in mind. A central computer runs the game, and players connect via mobile devices using web browsers.

This means that only one player needs to own the game, and players don't even have to download an app - it's all run through a browser.

Lipwig exists to make games like that easier to make. Developers can use Lipwig to bypass *all* of the networking usually required to make online games, and instead just focus on making the game itself. 

# What **isn't** Lipwig?

Lipwig is not a game server, it's a message server designed for games. No game logic happens on the serverside of Lipwig, it is purely responsible from getting messages between a host and the clients.

The format of Lipwig is also designed with slow-paced, "question and response" style games in mind. While it's possible that Lipwig could handle other games such as First Person Shooters or Real Time Strategy games, this is *not* what it is designed for.

# Getting started with Lipwig

Lipwig can be installed by running

    npm install lipwig

And then added to a NodeJS project with

    var lipwig = new Lipwig();

Lipwig can also be run from commandline by installing lipwig globally using `npm install lipwig -g`

Then you can start the server using `lipwig` in your commandline.

To start developing users for Lipwig, you'll need to use the [Lipwig JavaScript library](https://github.com/WilliamHayward/LipwigJS)