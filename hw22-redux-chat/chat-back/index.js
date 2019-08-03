const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(express.static('public'))


var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/chat', {useNewUrlParser: true})
const Schema = mongoose.Schema

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  // we're connected!
})

var messageSchema = new Schema({
 	nick: String,
 	message: String,
 	chatRoomId: {type: Schema.Types.ObjectId, ref: 'ChatRoom'}
})

var chatRoomSchema = new Schema({
	name: String,
	messages: [{type: Schema.Types.ObjectId, ref: 'Message'}]
})

var Message = mongoose.model('Message', messageSchema)
var ChatRoom = mongoose.model('ChatRoom', chatRoomSchema)

app.post('/message', async (req, res) => {
	var message = new Message(req.body)
	await message.save()
	res.status(201).send(req.body)
})

app.post('/createChat', async (req, res) => {
	var newChat = new ChatRoom(req.body)
	await newChat.save()
	res.status(201).send(req.body)
})

app.get('/chatRooms', async (req, res) => {
	res.send(JSON.stringify(await ChatRoom.find()))
})

app.get('/message/:ids', async(req, res) => {
	let roomId = req.params.ids.split('&')[0].split('=')[1]
	let mesId = req.params.ids.split('&')[1].split('=')[1]

	if(!mesId) res.send(JSON.stringify(await Message.find({chatRoomId: roomId})))
	else res.send(JSON.stringify(await Message.find({chatRoomId: roomId, _id: {$gt: mongoose.Types.ObjectId(mesId)}})))
})

app.listen(4000, function () {
	console.log('app listening on port 4000!')
})