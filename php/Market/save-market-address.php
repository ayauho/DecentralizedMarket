<?
	$F->Update('smartcontractsenitities','by_default',"'$address'","variable='marketAddress'");
	$F->Query("INSERT INTO smartcontractsvalues VALUES($PID,34,'$blockNumber') ON DUPLICATE KEY UPDATE value='$blockNumber'");
	$F->Query('TRUNCATE marketevents');
	$F->Query('TRUNCATE marketorders');
?>