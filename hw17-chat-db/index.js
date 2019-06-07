const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.static('public'));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat', {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

var messageSchema = new mongoose.Schema({
  nick: String,
  message: String
});

var Message = mongoose.model('Message', messageSchema);

app.post('/message', async (req, res) => {
	var message = new Message(req.body);
	await message.save();
	res.status(201).send(req.body);
})

app.get('/message', async (req, res) => {
	res.send(JSON.stringify(await Message.find()));
})

app.listen(3000, function () {
	console.log('app listening on port 3000!');
});
