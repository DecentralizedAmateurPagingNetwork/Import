var fs = require("fs");
var pkg = require("./package.json");
var config = require("./config.json");
var csvparser = require("csv-parse");
var request = require("request");
var sqlite3 = require('sqlite3');

// initial message
console.log("[INFO] DAPNET User Import to DB v" + pkg.version);

// prepare sqlite database
var db = new sqlite3.Database("database.sqlite");
db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS importData (id INTEGER PRIMARY KEY AUTOINCREMENT, callsign TEXT UNIQUE, requestUser TEXT, requestCallsign TEXT);");
});

// read csv-file
console.log("[INFO] Reading 'import.csv'-file...");
var fileContent = fs.readFileSync("import.csv", "utf8");

// read existing users from DAPNET (preparations)
let options = {
	url: config.apiUrl + "/users",
	headers: {
		"Authorization": config.authHeader
	}
};

// read existing users from DAPNET (actual request)
console.log("[INFO] Reading existing users from DAPNET...");
request(options, function(err, response, body) {
	if (err) {
		console.log("[ERROR] Unable to read existing users: " + err);
		process.exit(1);
	}
	if (response && response.statusCode !== 200) {
		console.log("[ERROR] Unable to read existing users: " + response.statusCode);
		process.exit(1);
	}

	// put all usernames into an array
	var jsonData = JSON.parse(body);
	var existingUsers = [];
	jsonData.forEach((u) => {
		existingUsers.push(u.name.toLowerCase());
	});

	// parse csv-file
	console.log("[INFO] Parsing 'import.csv'-file...");
	csvparser(fileContent, {comment: "#", delimiter: ","}, function(err, output) {
		if (err) {
			console.log("[ERROR] Unable to parse 'import.csv'-file: " + err);
			process.exit(1);
		}

		// run through every user from csv-file
		output.forEach((u) => {
			// check if the current user already exists
			var userName = u[0].toLowerCase().split("-")[0].trim();
			if (existingUsers.indexOf(userName) !== -1) return true;

			// user does not exist --> insert
			console.log("[INFO] Importing user '" + userName + "'...");
			existingUsers.push(userName);

			// create json for body
			var body = {
				hash: userName,
				mail: "imported@user.com",
				admin: false
			};

			// insert user into database
			db.run("INSERT INTO importData (callsign, requestUser) VALUES (?, ?)", userName, JSON.stringify(body), function(error) {
				if (error && error.errno !== 19) console.log("[ERROR] " + error);
			});
		});
	});
});
