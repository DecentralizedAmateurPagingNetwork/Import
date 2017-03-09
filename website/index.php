<?php
DEFINE('API_URL', 'http://localhost:8080');
DEFINE('AUTH', 'Basic ABCDEFG1234567');

$message = '';

if (isset($_POST['inputCallsign'])) {
	$callsign = trim(strtolower($_POST['inputCallsign']));

	// open database
	$db = new SQLite3("database.sqlite");

	// look for callsign in database
	$stmt = $db->prepare("SELECT * FROM importData WHERE callsign = :callsign");
	$stmt->bindParam(':callsign', $callsign);
	$res = $stmt->execute();

	$data = $res->fetchArray();

	if (!$data) {
		$message = '<div class="alert alert-danger"><h4>Not Found</h4>Unable to find the given callsign.</div>';
	} else {
		// check if user exists
		$ch = curl_init(API_URL.'/users');
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'Content-Type: application/json',
			'Authorization: '.AUTH
		));
		$result = curl_exec($ch);

		if (!$result) {
			$message = '<div class="alert alert-danger"><h4>Internal Error</h4>Unable to contact DAPNET Core. Please try again later.</div>';
		} else {
			$alreadyImported = false;
			foreach (json_decode($result, true) as &$user) {
			    if ($user["name"] === $callsign) {
					$alreadyImported = true;
					$message = '<div class="alert alert-danger"><h4>Already imported</h4>Your callsign is already imported.</div>';
				}
			}

			if (!$alreadyImported) {
				// enter user
				$ch = curl_init(API_URL.'/users/'.$data["callsign"]);
				curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
				curl_setopt($ch, CURLOPT_POSTFIELDS, $data["requestUser"]);
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
				curl_setopt($ch, CURLOPT_HTTPHEADER, array(
					'Content-Type: application/json',
					'Authorization: '.AUTH
				));
				$result = curl_exec($ch);

				if (!$result) {
					$message = '<div class="alert alert-danger"><h4>Internal Error</h4>Unable to contact DAPNET Core. Please try again later.</div>';
				} else {
					// enter callsign
					$ch = curl_init(API_URL.'/callsigns/'.$data["callsign"]);
					curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
					curl_setopt($ch, CURLOPT_POSTFIELDS, $data["requestCallsign"]);
					curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
					curl_setopt($ch, CURLOPT_HTTPHEADER, array(
						'Content-Type: application/json',
						'Authorization: '.AUTH
					));
					$result = curl_exec($ch);

					if (!$result) {
						$message = '<div class="alert alert-danger"><h4>Internal Error</h4>Unable to contact DAPNET Core. Please try again later.</div>';
					} else {
						$message = '<div class="alert alert-success"><h4>Success</h4>Your callsign was successfully imported!</div>';
					}
				}
			}
		}
	}
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>DAPNET Import</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="icon" type="image/png" href="./assets/favicon.png">
	<link rel="stylesheet" href="./assets/bootstrap.min.css" media="screen">
</head>
<body style="padding-top: 50px;">
	<div class="navbar navbar-default navbar-fixed-top">
		<div class="container">
			<div class="navbar-header">
				<a href="index.php" class="navbar-brand"><img src="./assets/dapnet-logo.png" alt="DAPNET Logo" style="width:6em"/></a>
			</div>
		</div>
	</div>

	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<div class="jumbotron">
					<h1>DAPNET Import</h1>
					<p>Import your existing callsign into DAPNET.</p>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-8">
				<?=$message?>
				<form class="form-horizontal well" method="post" action="index.php">
					<fieldset>
						<legend>Import</legend>
						<div class="form-group">
							<label for="inputCallsign" class="col-lg-2 control-label">Callsign</label>
							<div class="col-lg-10">
								<input type="text" class="form-control" name="inputCallsign" placeholder="Callsign">
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-10 col-lg-offset-2">
								<button type="submit" class="btn btn-primary">Submit</button>
							</div>
						</div>
					</fieldset>
				</form>
			</div>

			<div class="col-lg-4">
				<h2>Information</h2>
				<p>Enter your callsign and the system will create a new user and import your callsign into it.</p>
				<p>Your new login-credentials are your callsign as username and password. Please change your password immediately and enter a current email-address.</p>
			</div>
		</div>
	</div>
</body>
</html>
