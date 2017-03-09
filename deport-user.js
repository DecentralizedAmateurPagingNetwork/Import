var fs = require("fs");
var pkg = require("./package.json");
var config = require("./config.json");
var request = require("request");

// initial message
console.log("[INFO] DAPNET User Deport v" + pkg.version);

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

	// check every user for the default 'imported@user.com'-email
	var jsonData = JSON.parse(body);
	jsonData.forEach((u) => {
		if (u.mail === "imported@user.com") {
			console.log("[INFO] Removing user '" + u.name + "'...");

			// remove user from DAPNET (preparations)
			let options = {
				url: config.apiUrl + "/users/" + u.name,
				method: "DELETE",
				headers: {
					"Authorization": config.authHeader
				}
			};

			request(options, function(err, response, body) {
				if (err) {
					console.log("[WARN] Unable to remove user '" + u.name + "': " + err);
				}
				if (response && response.statusCode !== 200) {
					console.log("[WARN] Unable to remove user '" + u.name + "': " + response.statusCode);
				}
			});
		}
	});
});
