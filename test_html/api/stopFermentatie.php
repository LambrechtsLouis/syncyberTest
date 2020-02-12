<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$driver = new mysqli_driver();
$driver->report_mode = MYSQLI_REPORT_ALL;

header('Access-Control-Allow-Origin: *');  
$servername = "ID248955_syncyber.db.webhosting.be";
$username = "ID248955_syncyber";
$password = "R1234-56";
$dbname = "ID248955_syncyber";
    
// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$response = array(
    "status" => null,
    "error-message" => null
);
    
$stmtZetVatOpBeschikbaar = $conn->prepare(
    "UPDATE `Vat` 
    SET `beschikbaar` = '1' 
    WHERE `Vat`.`vat_id` = ?;"
);    

if ($stmtZetVatOpBeschikbaar === FALSE) {
    die ("Mysql Error: " . $mysqli->error);
} else {
    // check if parameters are passed
    if(isset($_POST["vatId"]) && isset($_POST["logboekId"])) {
        $vatId = $_POST["vatId"];
        $stmtZetVatOpBeschikbaar->bind_param("i", $vatId);
        // set vat op beschikbaar
        if ($stmtZetVatOpBeschikbaar->execute() === false) {
            $response["status"] = "error";
            $response["error-message"] = "vat is niet ";
        } else {
            $response["status"] = "succes";
        }
    } else {
        $response["status"] = "error";
        $response["error-message"] = "Onvoldoende gegevens doorgekregen!";
    }
}

echo json_encode($response);

$conn->close();
?>