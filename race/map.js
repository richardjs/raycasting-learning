function Map(){
}

Map.prototype.at = function(x, y){
	if(x < -5 || x > 5){
		if(y % 10 == 0){
			return 0;
		}
		return 1;
	}
	return 0;
}

var map = new Map();
