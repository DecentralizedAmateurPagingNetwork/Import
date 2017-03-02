# DAPNET Import
Node.js script to import users and their callsigns from a csv-file.

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

### Download & Run
```bash
git clone https://github.com/DecentralizedAmateurPagingNetwork/Import.git
cd Import

npm install
npm run import-user
npm run import-callsigns
```

### Configuration
Edit `config.json` and fill in the url to the API-server (eg. `http://localhost:8080`) and the authentication header of an admin-user (eg. `Basic ABCDEFG1234567`).
