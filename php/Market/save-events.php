<?
	function processLimitOrder($v){
		global $PID;
		global $F;
		$existing = $F->Select('*','marketorders',"orderId=$v[0]");
		if(!$existing){
			$F->Query("INSERT INTO marketorders VALUES(null,$v[0],$PID,$v[1],'$v[2]','$v[3]','$v[4]','$v[5]','0','$v[7]',1,$v[8],0)");
		}else{
			$F->Update('marketorders','amount,time',"'$v[5]','$v[8]'","orderId=$v[0]");
		}
	}
	function processExecutedOrder($v){
		global $F;
		$status=$v[5]?1:2;
		$F->Update('marketorders','amount,status,executed',"'$v[5]','$status','$v[7]'","orderId=$v[0]"); 	
	}
	function processMarketOrder($v){
		global $PID;
		global $F;
		$F->Query("INSERT INTO marketorders VALUES(null,0,$PID,$v[0],'$v[1]','$v[2]','$v[3]','$v[4]','$v[5]','$v[6]',1,$v[7],$v[7])");
		return $F->LastInsertId();
	}
	function processCancelOrder($v){
		global $PID;
		global $F;
		$status = $v[6]?1:0;
		$F->Update('marketorders','amount,status,time',"'$v[6]','$status','$v[7]'","orderId=$v[0]");		
	}
	$scoinAddress = $F->Select('by_default','smartcontractsenitities',"variable='busdAddress'");
	$lasEventBlockNumber = $F->Select('block','marketevents','','block DESC','0,1');
	$ordersUpdated = [];
	$marketOrders = [];
	#$toBlock=$fromBlock=$lasEventBlockNumber+1;	
	$blocks=[];
	foreach($events as $event){
		$input=[];
		$input['block']=$event['blockNumber'];
		if($input['block']<=$lasEventBlockNumber)continue;
		$blocks[] = $input['block'];
		$input['name']=$event['event'];		
		$values = [];
		for($i=0;;$i++){
			$v=$event['returnValues'][$i];
			if(isset($event['returnValues'][$i])){
				if(strlen($v)==42) {
					if($v==$scoinAddress) $v=0;
					else {
						$try=$F->Select('pId','smartcontractsvalues',"eId='22' AND value='$v'");
						if($try)$v=$try;
						else {
							$try = $F->Select('id','useraddresses',"address='$v'");
							if(!$try){
								$F->Insert('useraddresses','address',"'$v'");
								$v = $F->LastInsertId();
							} else $v=$try;
						}						
					}
				}
				$input["v".($i+1)]=$v;	
				$values[] = $v;
			}else break;
		}
		if($event['event']=='LimitOrderPut') {
			processLimitOrder($values);
			if($PID == $values[3] && $values[2]==1 || $PID == $values[4] && $values[2]==0){
				$ordersUpdated[] = $F->Select('*','marketorders',"orderId=$values[0]");
			}
		}
		if($event['event']=='OrderExecuted') {
			processExecutedOrder($values);
			$ordersUpdated[] = $F->Select('*','marketorders',"orderId=$values[0]");	
		}
		if($event['event']=='MarketOrder') {
			$id = processMarketOrder($values);
			$marketOrders[] = $F->Select('*','marketorders',"id=$id");		
		}
		if($event['event']=='LimitOrderCancel') {
			processCancelOrder($values);
			$ordersUpdated[] = $F->Select('*','marketorders',"orderId=$values[0]");			
		}
		#print_r($input);
		$F->Insert('marketevents',$input);		
	}
	$fromBlock = min($blocks);
	$toBlock = max($blocks);
	$events=[];
	if(!empty($blocks)){
		$id = $F->Select('id','useraddresses',"address='$equityAddress'");
		if(!$id) $id = $F->Select('pId','smartcontractsvalues',"eId='22' AND value='$equityAddress'");
		$q="SELECT * FROM marketevents WHERE 
			((name='MarketOrder' AND (v3='$id' OR v4='$id')) OR
			(name='LimitOrderPut' AND (v4='$id' OR v5='$id')) OR
			(name='OrderExecuted' AND (v3='$id' OR v4='$id')) OR
			(name='LimitOrderCancel' AND (v4='$id' OR v5='$id'))) AND block >= $fromBlock AND block <= $toBlock
				ORDER BY id DESC";
		$events = $F->Select($q,[]);
	}
	echo je($out=compact('ordersUpdated','marketOrders','events'),JSON_NUMERIC_CHECK);
?>