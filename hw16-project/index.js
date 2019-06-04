const express = require('express');
const app = express();
const fs = require('fs');
/*
app.get('/', function (req, res) {
  res.send('Hello World!');
});
*/

app.use(express.static('public'));

app.post('/upload', (req, res) => {
	let fileName = Math.random().toString('36');
	fileName = `upload/${fileName}`;
	let fileStream = fs.createWriteStream('public/' + fileName);

	req.pipe(fileStream);
	req.on('end', () => {
		res.end(fileName);
	})
})

app.get('/upload', (req, res) => {
	fs.readdir('public/upload/', (err, files) => {
		res.send(JSON.stringify(files));
	})
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});