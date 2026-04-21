<?php if ( !isset( $_SESSION ) ) session_start();

if ( !$_POST ) exit;

if ( !defined( "PHP_EOL" ) ) define( "PHP_EOL", "\r\n" );

// Enter the email address that you want to emails to be sent to.
$address = "john.doe@gmail.com";


$postValues = array();
foreach ( $_POST as $name => $value ) {
	$postValues[$name] = trim( $value );
}
extract( $postValues );

$subject = "You've been contacted by: " . $name;

$msg  = "You have been contacted by $name" . PHP_EOL . PHP_EOL;
$msg .= $message . PHP_EOL . PHP_EOL;
$msg .= "You can contact $name via email at $email" . PHP_EOL;

$msg = wordwrap( $msg, 70 );

$headers  = "From: $address" . PHP_EOL;
$headers .= "Reply-To: $email" . PHP_EOL;
$headers .= "MIME-Version: 1.0" . PHP_EOL;
$headers .= "Content-type: text/plain; charset=utf-8" . PHP_EOL;
$headers .= "Content-Transfer-Encoding: quoted-printable" . PHP_EOL;

if ( mail( $address, $subject, $msg, $headers ) ) {
	echo "<h2>SUCCESS</h2>";
	echo "<p>Thank you, your email has been sent.</p>";
	return false;
}
echo "<h2>ERROR</h2>";
echo "<p>There was a problem sending the message, please try again.</p>";
return false;

?>
