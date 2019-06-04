process.stdin.setEncoding('utf8');
let string = '', string2 = '';

process.stdin.on('data', chunk => {
	string += chunk;
	for(let i = 0; i < string.length; i++){
		let char = string[i];
		let code = string.charCodeAt(i);
		if((code >= 65 && code <= 89) || (code >= 1040 && code <= 1071))
			char = String.fromCharCode(code + 32);
		else if((code >= 97 && code <= 121) || (code >= 1072 && code <= 1103))
			char = String.fromCharCode(code - 32);
		else if(code == 1025)
			char = String.fromCharCode(code + 80);
		else if(code == 1105)
			char = String.fromCharCode(code - 80);
		string2 += char;
	}
});
process.stdin.on('end', () => process.stdout.write(string2));