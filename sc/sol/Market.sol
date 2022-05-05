// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.3;

import "./IES1.sol";
import "./ISwapRouter.sol";

contract Market {

	uint constant e18 = 1e18;

	address public ScoinAddress;
	address public SwapRouterAddress;
	IES1 public Scoin;
	SwapRouter public swapRouter;
	
	mapping(address=>uint32) public Assets;
	uint32 public LastAssetId;
	
	mapping(address=>uint64) public Users;
	uint64 public LastUserId;

	uint public orderId = 1;
	struct Order {
	    uint64 userId;
	    uint amount;
	    uint id;
	}

	struct PriceData {
	    uint firstIndex;
	    uint lastIndex;
	    mapping(uint=>Order) orders;
	    uint amount;
	}

	struct PLO {
		uint64 userId;
		uint32 targetAssetId;
		uint32 assetForId;
		uint index;
		uint orderId;	
	}

	struct CLO {
		uint64 userId;
		uint32 targetAssetId;
		uint32 assetForId;
		uint index;
		uint orderAmount;
		uint remnant;
		uint i;
		uint orderId;
	}

	struct MO {
		uint64 userId;
		uint32 assetForId;
		uint32 targetAssetId;
		uint8 contrAction;
		uint firstIndex;
		uint lastIndex;
		uint orderAmount;
		uint executedTargetAssetAmount;
		uint i;
		uint price;
		uint numerator;
		uint denominator;
		bool deleteOrder;
		bool _break;	
	}	

	mapping(uint32=> mapping(uint32=>mapping( uint8=>mapping(uint=>PriceData) ))) public Orders;

	mapping(uint64=>mapping(uint32=>mapping(uint32=>mapping(uint8=>mapping(uint=>uint))))) public MyOrdersIndex;

	mapping(uint64=>mapping(uint32=>uint)) public Accounts;
	
	mapping(uint32=>mapping(uint32=>uint[2])) public ND;
	mapping(uint32=>mapping(uint32=>uint)) public Prices;

	constructor(address scoinAddress, address swapRouterAddress) {
		ScoinAddress = scoinAddress;
	    Assets[ScoinAddress] = 1;
	    LastAssetId++;
	    Scoin = IES1(ScoinAddress);
	    SwapRouterAddress = swapRouterAddress;
	    swapRouter = SwapRouter(swapRouterAddress);
	}

	fallback() payable external {
	    deposit(swapCoinToScoin(msg.value), ScoinAddress, false);    
	}

	receive() payable external {
	    deposit(swapCoinToScoin(msg.value), ScoinAddress, false);     
	}

	function UserId(address account) public view returns(uint64) {
	    return Users[account];
	}

	function AssetId(address asset) public view returns(uint32) {
	    return Assets[asset]; 	     
	}

	function coinToScoin(uint coin) public view returns(uint[] memory amounts) {
	    if(coin==0) return new uint[](2);
	    address[] memory path = new address[](2);   
	    path[0] = swapRouter.WETH();
	    path[1] = ScoinAddress;
	    amounts = swapRouter.getAmountsOut(coin, path);
	}

    function scoinToCoin(uint scoin) public view returns(uint[] memory amounts) {
        if(scoin==0) return new uint[](2);
        address[] memory path = new address[](2);   
        path[1] = swapRouter.WETH();
        path[0] = ScoinAddress;
        amounts = swapRouter.getAmountsOut(scoin, path);              
    }	

	function swapCoinToScoin(uint coin) public returns(uint) {
	    uint scoin = coinToScoin(coin)[1] * 95/100;       
		address[] memory path = new address[](2);
		path[0] = swapRouter.WETH();
		path[1] = ScoinAddress;
		return swapRouter.swapExactETHForTokens{value:coin}(scoin, path, address(this), block.timestamp+5)[1];
	}

    function swapScoinToCoin(uint scoin) public returns(uint) {
        uint coin = scoinToCoin(scoin)[1] * 95/100;        
        address[] memory path = new address[](2);
        path[1] = swapRouter.WETH();
        path[0] = ScoinAddress;
        return swapRouter.swapExactTokensForETH(scoin, coin, path, address(this), block.timestamp+5)[1];           
    }	

	function accountAmount(address account, address asset) public view returns(uint) {
		return Accounts[UserId(account)][AssetId(asset)];	
	}

	function deposit(uint amount, address asset) public {
		deposit(amount, asset, true);
	}

	event Deposited(address from, address asset, uint amount, uint time);
	function deposit(uint amount, address asset, bool transferFrom) internal {
		uint64 userId = UserId(msg.sender);
		if(userId==0) {
			LastUserId++;
			Users[msg.sender] = userId = LastUserId;
		}
		uint32 assetId = AssetId(asset);
		if(assetId==0) {
			LastAssetId++;
			Assets[asset] = assetId = LastAssetId;
		}
	    Accounts[userId][assetId] += amount;
	    if(transferFrom){
	        IES1 assetContract = asset==address(0)? Scoin : IES1(asset);
	        assetContract.transferFrom(msg.sender, address(this), amount);
	    }    
	    emit Deposited(msg.sender, asset, amount, block.timestamp);
	}

	event Withdrawn(address to, address asset, uint amount, uint time);
	function withdraw(address asset, uint amount) public {
		uint64 userId = UserId(msg.sender);
		uint32 assetId = AssetId(asset); 
		if(amount == 0) amount = Accounts[userId][assetId];
		Accounts[userId][assetId] -= amount;						
		if(asset == address(0)) 
			payable(msg.sender).transfer(swapScoinToCoin(amount));
		else {
			IES1 assetContract = IES1(asset);
			assetContract.transfer(msg.sender, amount);
		}		
		emit Withdrawn(msg.sender, asset, amount, block.timestamp);
	}

	event LimitOrderPut(uint orderId,address by, uint8 action, address targetAsset, address assetFor, uint orderAmount, uint priceAmount, uint price, uint time);
	function putLimitOrder(address targetAsset, address assetFor, uint8 action, uint amount, uint price, uint[] memory prices) public returns(bool) {
	    PLO memory plo;
	    if(prices.length > 0) amount -= marketOrder(targetAsset, assetFor, action, amount, prices);
	    if(amount == 0) return false;
	    plo.userId = UserId(msg.sender);    
	    plo.targetAssetId = AssetId(targetAsset);
	    plo.assetForId = AssetId(assetFor);
	    require(Accounts[plo.userId][plo.assetForId] >= amount);
	    plo.index = MyOrdersIndex[plo.userId][plo.targetAssetId][plo.assetForId][action][price];
	    PriceData storage priceData = Orders[plo.targetAssetId][plo.assetForId][action][price];
	    if(priceData.firstIndex == 0) priceData.firstIndex = 1;
	    if(plo.index == 0) {
	        plo.index = ++priceData.lastIndex;
	        plo.orderId = orderId;
	        priceData.orders[plo.index] = Order(plo.userId, amount, orderId);
	        orderId++;
	        MyOrdersIndex[plo.userId][plo.targetAssetId][plo.assetForId][action][price] = plo.index;
	    } else {
	    	plo.orderId = priceData.orders[plo.index].id;
	        priceData.orders[plo.index].amount += amount;
	    }
	    priceData.amount += amount;
	    Accounts[plo.userId][plo.assetForId] -= amount;
	    emit LimitOrderPut(plo.orderId, msg.sender, action, targetAsset, assetFor, priceData.orders[plo.index].amount, priceData.amount, price, block.timestamp);
	    return true;
	}
	
	event LimitOrderCancel(uint orderId, address by, uint8 action, address targetAsset, address assetFor, uint price, uint remnant, uint time);
	function cancelLimitOrder(address targetAsset, address assetFor, uint8 action, uint amount, uint price) public {
	    if(action == 1) require(amount > price);
	    CLO memory clo;
	    clo.userId = UserId(msg.sender);
	    clo.targetAssetId = AssetId(targetAsset); 
	    clo.assetForId = AssetId(assetFor);
	    clo.index = MyOrdersIndex[clo.userId][clo.targetAssetId][clo.assetForId][action][price];
	    require(clo.index > 0);
	    PriceData storage priceData = Orders[clo.targetAssetId][clo.assetForId][action][price];
	    clo.orderAmount = priceData.orders[clo.index].amount;
	    clo.orderId = priceData.orders[clo.index].id;
	    require(clo.orderAmount >= amount);
	    clo.remnant = clo.orderAmount - amount;
	    if(clo.remnant==0) {
	        MyOrdersIndex[clo.userId][clo.targetAssetId][clo.assetForId][action][price] = 0;
	        delete priceData.orders[clo.index];
	        if(clo.index != priceData.lastIndex) {
	            for(clo.i = clo.index; clo.i < priceData.lastIndex; clo.i++) {
	                priceData.orders[clo.i] = Order(priceData.orders[clo.i+1].userId, priceData.orders[clo.i+1].amount, priceData.orders[clo.i+1].id);
	                MyOrdersIndex[priceData.orders[clo.i].userId][clo.targetAssetId][clo.assetForId][action][price] = clo.i;
	            }
	            delete priceData.orders[priceData.lastIndex];
	        }        
	        priceData.lastIndex--;
	        if(priceData.firstIndex > priceData.lastIndex) priceData.firstIndex = priceData.lastIndex;  
	    } else {
	        priceData.orders[clo.index].amount = clo.remnant;
	    }
	    priceData.amount -= amount;
	    Accounts[clo.userId][clo.assetForId] += amount;
	    emit LimitOrderCancel(clo.orderId, msg.sender, action, targetAsset, assetFor, price, clo.remnant, block.timestamp);
	}

	event OrderExecuted(uint orderId, uint8 action, address targetAsset, address assetFor, uint initialAmount, uint remainingAmount, uint price, uint time);
	event MarketOrder(address by, uint8 action, address targetAsset, address assetFor, uint executedAmountFor, uint executedTargetAssetAmount, uint price, uint time);
	function marketOrder(address targetAsset, address assetFor, uint8 action, uint amount, uint[] memory prices) public returns(uint executedAmountFor) {
	    if(prices.length == 0) return 0;
	    MO memory mo;
	    mo.userId = UserId(msg.sender);
	    mo.assetForId = AssetId(assetFor);
	    require(Accounts[mo.userId][mo.assetForId] >= amount);
	    mo.targetAssetId = AssetId(targetAsset);	    
	    mo.contrAction = action == 0? 1 : 0;
	    Order storage order;
	    PriceData storage priceData;
	    for(uint n = 0; n < prices.length; n++) {
	        if(mo._break) break;
	        mo.price = prices[n];
	        if(action == 1 && mo.price > amount) break;
	        priceData = Orders[mo.assetForId][mo.targetAssetId][mo.contrAction][mo.price];
	        mo.firstIndex = priceData.firstIndex;
	        mo.lastIndex = priceData.lastIndex;        
	        if(mo.lastIndex == 0) {
	        	if(n == 0) return 0;
	        	else continue;
	        }
	        for(mo.i = mo.firstIndex; mo.i <= mo.lastIndex; mo.i++) {
	            order = priceData.orders[mo.i];
	            mo.orderAmount = action == 1 ? order.amount * mo.price : order.amount / mo.price;
	            //if(action == 0) order.amount = order.amount / e18 * e18;  
	            if(amount >= mo.orderAmount) {
	                amount -= mo.orderAmount;
	                Accounts[mo.userId][mo.assetForId] -= mo.orderAmount;
	                priceData.amount -= order.amount;                                  
	                MyOrdersIndex[order.userId][mo.assetForId][mo.targetAssetId][mo.contrAction][mo.price] = 0;
	                Accounts[order.userId][mo.assetForId] += mo.orderAmount;
	                executedAmountFor += mo.orderAmount;
	                mo.executedTargetAssetAmount += order.amount;  
					mo.deleteOrder = true;	                
	                if(mo.userId != order.userId) {
	                	mo.numerator += (action == 1? mo.orderAmount : order.amount);
	                	mo.denominator += (action == 1? order.amount : mo.orderAmount);	                                              	                	
	                }	                
	                emit OrderExecuted(order.id, action, targetAsset, assetFor, order.amount, 0, mo.price, block.timestamp);                                
	            } else {                
	                if(action == 1) {
	                	if(amount < mo.price) {
			            	mo._break = true;
			            	break;	                		
	                	}
	                	amount = (amount / mo.price) * mo.price;
	                }                
	                Accounts[mo.userId][mo.assetForId] -= amount;
	                mo.orderAmount = action == 1?  amount / mo.price  : amount * mo.price; 
	                order.amount -= mo.orderAmount;
	                if(action == 0 && order.amount < mo.price) {
	                    Accounts[order.userId][mo.targetAssetId] += order.amount;
	                    mo.deleteOrder = true;
	                    emit OrderExecuted(order.id, action, targetAsset, assetFor, order.amount + mo.orderAmount, 0, mo.price, block.timestamp);                                           
	                } else emit OrderExecuted(order.id, action, targetAsset, assetFor, order.amount + mo.orderAmount, order.amount, mo.price, block.timestamp); 
	                priceData.amount -= mo.orderAmount;
	                Accounts[order.userId][mo.assetForId] += amount;
	                executedAmountFor += amount;
	                mo.executedTargetAssetAmount += mo.orderAmount;
	                if(mo.userId != order.userId) {
	                	mo.numerator += (action == 1 ? amount : mo.orderAmount);
	                	mo.denominator += (action == 1 ? mo.orderAmount : amount);	                	
	            	}
	                amount = 0;                  
	            }
	            if(mo.deleteOrder) {	            	
	                delete priceData.orders[mo.i];
	                if(mo.i == mo.lastIndex) {
	                    priceData.lastIndex = 0;
	                    priceData.firstIndex = 1;
	                }
	                else priceData.firstIndex++;
	                mo.deleteOrder = false;                
	            }
	            if(amount == 0) {
	            	mo._break = true;
	            	break;
	            }
	        }
	    }
	    uint32 asset1 = action == 1? mo.targetAssetId : mo.assetForId;
	    uint32 asset2 = action == 1? mo.assetForId : mo.targetAssetId;
	    if(mo.denominator > 0){
	    	ND[asset1][asset2][0] += mo.numerator;
	    	ND[asset1][asset2][1] += mo.denominator;
	    	mo.price = ND[asset1][asset2][0] / ND[asset1][asset2][1];     
	    	Prices[asset1][asset2] = mo.price;
	    } else mo.price = Prices[asset1][asset2];
	    emit MarketOrder(msg.sender, action, targetAsset, assetFor, executedAmountFor, mo.executedTargetAssetAmount, mo.price, block.timestamp);
	}
}