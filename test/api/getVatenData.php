<?php
header('Access-Control-Allow-Origin: *');  
$servername = "192.168.137.10";
$username = "gregory";
$password = "badmuts";
$dbname = "syncyber";
    
// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 
    
$stmtHaalVatenDataOp = "SELECT v.vat_id, v.label, v.beschikbaar, v.online, g.achternaam, g.voornaam, l.opmerkingen, l.aanmaak_datum, d.naam, l.logboek_id
                        FROM Vat as v
                        LEFT JOIN Logboek AS l ON v.vat_id=l.vat_id
                        LEFT JOIN Gebruiker AS g ON l.gebruiker_id=g.gebruiker_id
                        LEFT JOIN Druivensoort AS d ON l.druiven_soort_id=d.druiven_soort_id
                        ORDER BY v.vat_id;";    
$result = $conn->query($stmtHaalVatenDataOp);

$response = array(
    "status" => null,
    "answer" => null,
    "error-message" => null
);

if($result->num_rows > 0){
    $vaten = array();
    while($row = $result->fetch_assoc()) {
        array_push($vaten, $row);
    }
    $response["status"] = "succes";
    $response["answer"] = $vaten;
} else {
    $response["status"] = "error";
    $response["error-message"] = "Geen vaten gevonden!";
}

echo json_encode($response);

$conn->close();
?>