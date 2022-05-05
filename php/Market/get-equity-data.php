<?
	$data = $F->Select(['fields'=>'eId,value','table'=>'smartcontractsvalues','where'=>"pId=$PID",'key'=>'eId']);
	$ideaData = json_decode($F->Select('data','ideas',"id=$PID"),1);
	$data[0] = $ideaData['logo'];
	echo json_encode($data);
?>