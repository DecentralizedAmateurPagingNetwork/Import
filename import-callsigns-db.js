var fs = require("fs");
var pkg = require("./package.json");
var config = require("./config.json");
var csvparser = require("csv-parse");
var request = require("request");
var sqlite3 = require('sqlite3');

// initial message
console.log("[INFO] DAPNET Callsign Import to DB v" + pkg.version);

// prepare sqlite database
var db = new sqlite3.Database("database.sqlite");

// read csv-file
console.log("[INFO] Reading 'import.csv'-file...");
var fileContent = fs.readFileSync("import.csv", "utf8");

// read existing callsigns from DAPNET (preparations)
let options = {
	url: config.apiUrl + "/callsigns",
	headers: {
		"Authorization": config.authHeader
	}
};

// read existing callsigns from DAPNET (actual request)
console.log("[INFO] Reading existing callsigns from DAPNET...");
request(options, function(err, response, body) {
	if (err) {
		console.log("[ERROR] Unable to read existing callsigns: " + err);
		process.exit(1);
	}
	if (response && response.statusCode !== 200) {
		console.log("[ERROR] Unable to read existing callsigns: " + response.statusCode);
		process.exit(1);
	}

	// put all callsigns into an array
	var jsonData = JSON.parse(body);
	var existingCallsigns = [];
	jsonData.forEach((c) => {
		existingCallsigns.push(c.name.toLowerCase());
	});

	// parse csv-file
	console.log("[INFO] Parsing 'import.csv'-file...");
	csvparser(fileContent, {comment: "#", delimiter: ","}, function(err, output) {
		if (err) {
			console.log("[ERROR] Unable to parse 'import.csv'-file: " + err);
			process.exit(1);
		}

		// run through every callsign from csv-file
		output.forEach((c) => {
			// gather information about the callsign
			var callsignName = c[0].toLowerCase().split("-")[0].trim();

			var callsignDesc = c[2].trim();
			if (callsignDesc === "") callsignDesc = "none (imported)";

			// do not import callsigns with invalid addresses
			if (c[1].split(".")[1] != 3) {
				console.log("[WARN] Unable to import callsign '" + c[0].toLowerCase().trim() + "' because of invalid address (does not end on .3)!");
				return true;
			}

			var callsignNumber = c[1].split(".")[0].trim();
			if (callsignNumber.toString().length < 4) {
				console.log("[WARN] Unable to import callsign '" + c[0].toLowerCase().trim() + "' because of invalid address (too short)!");
				return true;
			}

			// check if the current callsign already exists
			if (existingCallsigns.indexOf(callsignName) !== -1) return true;

			// callsign does not exist --> insert
			console.log("[INFO] Importing callsign '" + c[0].toLowerCase().trim() + "'...");
			existingCallsigns.push(callsignName);

			// add current pager to array
			var pagersArray = [
				{
					number: callsignNumber,
					name: "default"
				}
			];

			// find additional pagers in 'import.csv'-file
			output.forEach((iC) => {
				var innerCallsignName = iC[0].toLowerCase().split("-")[0].trim();

				// not the callsign we are looking for
				if (callsignName !== innerCallsignName) return true;

				// no suffix --> skip
				if (iC[0].toLowerCase().split("-")[1] === undefined) return true;

				// invalid address --> skip
				if (iC[1].split(".")[1] != 3) return true;

				console.log("[INFO] Adding additional pager to '" + callsignName + "'");
				pagersArray.push({
					number: iC[1].split(".")[0].trim(),
					name: "default" + pagersArray.length
				});
			});

			// create json for body
			var body = {
				description: callsignDesc,
				pagers: pagersArray,
				ownerNames: [
					callsignName
				]
			};

			// insert callsign into database
			db.run("UPDATE importData SET requestCallsign = ? WHERE callsign = ?", JSON.stringify(body), callsignName, function(error) {
				if (error && error.errno !== 19) console.log("[ERROR] " + error);
			});
		});
	});
});
