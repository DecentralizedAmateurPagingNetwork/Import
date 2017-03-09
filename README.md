# DAPNET Import
Node.js script to import users and their callsigns from a csv-file.

## Commands
* `npm run import-user`
	* Imports all users into DAPNET (if they don't exist)
* `npm run import-callsigns`
	* Imports all callsigns into DAPNET (if they don't exist)
* `npm run import-user-db`
	* Extracts all users into a SQLite database (as JSON-body for DAPNET-import)
* `npm run import-callsigns-db`
	* Extracts all callsigns into a SQLite database (as JSON-body for DAPNET-import)
* `npm run deport-user`
	* Removes all imported, but not edited, users from DAPNET

## CSV source file
* three columns
	1. Callsign
	2. Pagernumber
	3. Name
* save as CSV-file
	* Field delimiter: `,`
	* Text delimiter: `"`
	* UTF-8
* example: `"DB0BIG",101725.3,"Andreas"`

## Installation

### Requirements
* Node.js >= `4.6.0`
* npm >= `2.15.0`

### Download
```bash
git clone https://github.com/DecentralizedAmateurPagingNetwork/Import.git
cd Import

npm install
```

### Configuration
Edit `config.json` and fill in the url to the API-server (eg. `http://localhost:8080`) and the authentication header of an admin-user (eg. `Basic ABCDEFG1234567`).
