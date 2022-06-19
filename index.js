var tokens = require('./_token.js');
var fs = require('fs');
var Telegraf = require('telegraf');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var bot = new Telegraf(tokens.BOT_TOKEN);
var app = express();

app.set('port', tokens.PORT || tokens.DEFAULT_PORT);
app.use(express.static(path.join(__dirname + '/html')));
app.use(bot.webhookCallback('/bot'+tokens.BOT_TOKEN));

bot.telegram.setWebhook(tokens.WEBHOOK+"bot"+tokens.BOT_TOKEN);
 
bot.gameQuery((ctx) => {
    var uid = ctx.from.id;
    var url;
    
    if (ctx.callbackQuery.message) {
        var msgid = ctx.callbackQuery.message.message_id;
        var chatid = ctx.chat.id;
        url = tokens.GAME_URL + "?uid=" + uid + "&chatid=" + chatid + "&msgid=" + msgid;
    }
    else if (ctx.callbackQuery.inline_message_id) {
        var iid = ctx.callbackQuery.inline_message_id;
        url = tokens.GAME_URL + "?uid=" + uid + "&iid=" + iid;
    }
    else {
        console.log("No detail for update from callback query.")
        url = tokens.GAME_URL;
    }

    ctx.answerGameQuery(url);
});

bot.command(['/start', '/help'], (ctx) => {
     var reply = "Hi! This is test bot for flappy bird"
    ctx.reply(reply);
});
bot.command('/game', (ctx) => {
    ctx.replyWithGame(tokens.GAME_NAME);
});

app.get(['/index.html', '/'], (req, res) => {
    res.sendFile('/index.html');
});
app.get('/game.js', (req, res) => {
    res.sendFile('/game.js');
});
app.get('/libs/*', (req, res) => {
    res.sendFile(req.path);
});
app.get('/assets/*', (req, res) => {
    res.sendFile(req.path);
});

app.get('/setscore/uid/:user_id/chat/:chat_id/msg/:msg_id/score/:score', (req, res) => {
    bot.telegram.setGameScore(req.params.user_id, req.params.score, null, req.params.chat_id, req.params.msg_id);
    res.sendStatus(200);
});

app.get('/setscore/uid/:user_id/iid/:iid/score/:score', (req, res) => {
    bot.telegram.setGameScore(req.params.user_id, req.params.score, req.params.iid);
    res.sendStatus(200);
});

app.listen(app.get('port'), () => {
    console.log("Listening on port:" + app.get('port'));
});
