'use strict';

function Camera(map){
	// Camera position
	this.pos = {x: 22, y: 12};
	// Direction vector (from position to direction)
	this.dir = {x: -1, y: 0};
	// Camera plane vector (from direction to plane)
	this.plane = {x: 0, y: .66};

	this.map = map;
}

Camera.prototype.SKY_COLOR = '#55a';
Camera.prototype.GROUND_COLOR = '#757';
Camera.prototype.WALL_X_COLOR = '#5a5';
Camera.prototype.WALL_Y_COLOR = '#272';
Camera.prototype.WALL_HEIGHT = 1.6;

Camera.prototype.rotate = function(angle){
	// TODO -- understand exactly what is going on with this rotation matrix
	var oldDirX = this.dir.x;
	this.dir.x = this.dir.x * Math.cos(angle) + this.dir.y * -Math.sin(angle);
	this.dir.y = oldDirX * Math.sin(angle) + this.dir.y * Math.cos(angle);

	var oldPlaneX = this.plane.x;
	this.plane.x = this.plane.x * Math.cos(angle) + this.plane.y * -Math.sin(angle);
	this.plane.y = oldPlaneX * Math.sin(angle) + this.plane.y * Math.cos(angle);
}
Camera.prototype.update = function(delta){
}
Camera.prototype.render = function(canvas, ctx){
	ctx.fillStyle = this.SKY_COLOR;
	ctx.fillRect(0, 0, canvas.width, canvas.height/2);
	ctx.fillStyle = this.GROUND_COLOR;
	ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);

	// Cast a ray for each vertical column on the canvas
	for(var canvasX=0; canvasX < canvas.width; canvasX++){
		// Ray starts at camera position
		var rayOrigin = {x: this.pos.x, y: this.pos.y};

		// Map coordinates for ray's current posisition
		var mapPos = {x: Math.floor(rayOrigin.x), y: Math.floor(rayOrigin.y)};

		// Position scalar for camera plane, range is [-1, 1]
		// The left end of the canvas is -1, the center is 0, and right is 1
		var planeScalar = (2*canvasX / canvas.width) - 1;

		// Ray direction vector -- add the plane vector multiplied by
		// the plane scalar to the camera direction
		var rayDir = {
			x: this.plane.x*planeScalar + this.dir.x,
			y: this.plane.y*planeScalar + this.dir.y
		};

		// Distance the ray must travel to move one map column or row
		// TODO -- understand this formula
		var colDelta = Math.sqrt(1 + (rayDir.y*rayDir.y)/(rayDir.x*rayDir.x));
		var rowDelta = Math.sqrt(1 + (rayDir.x*rayDir.x)/(rayDir.y*rayDir.y));

		// Move ray to closest map grid lines in its direction
		// rayDistance is a vector representing the distance traveled
		// from the ray origin
		// The mapStep variables store the direction to move on the map
		// grid as the ray moves through grid squares
		var rayDistance = {x: 0, y: 0};
		var mapStepX;
		var mapStepY;
		if(rayDir.x < 0){
			rayDistance.x = (rayOrigin.x - mapPos.x) * colDelta;
			mapStepX = -1;
		}else{
			rayDistance.x = (mapPos.x - rayOrigin.x + 1) * colDelta;
			mapStepX = 1;
		}
		if(rayDir.y < 0){
			rayDistance.y = (rayOrigin.y - mapPos.y) * rowDelta;
			mapStepY = -1;
		}else{
			rayDistance.y = (mapPos.y - rayOrigin.y + 1) * rowDelta;
			mapStepY = 1;
		}

		// Move ray until it hits a wall
		// TODO -- understand this walking algorithm better
		var hit = false;
		var SIDES = {X: 0, Y: 1}
		var lastSide;
		while(!hit){
			if(rayDistance.x < rayDistance.y){
				// Move the ray one map column
				rayDistance.x += colDelta;
				mapPos.x += mapStepX;
				lastSide = SIDES.X;
			}else{
				// Move the ray one map row
				rayDistance.y += rowDelta;
				mapPos.y += mapStepY;
				lastSide = SIDES.Y;
			}

			//TODO -- integrate map into the rewritten code
			if(this.map.at(mapPos.x, mapPos.y) > 0){
				hit = true;
			}
		}

		// Calculate the distance to hit wall
		// TODO -- also figure out this formula
		var wallDistance;
		if(lastSide == SIDES.X){
			wallDistance = Math.abs(
				(mapPos.x - rayOrigin.x + (1 - mapStepX)/2) / rayDir.x
			);
		}else{
			wallDistance = Math.abs(
				(mapPos.y - rayOrigin.y + (1 - mapStepY)/2) / rayDir.y
			);
		}

		// Calculate height of line and canvas y value for top of
		// this vertical slice
		var lineHeight = Math.abs(Math.floor(canvas.height / wallDistance)) * this.WALL_HEIGHT;
		var lineTop = canvas.height/2 - lineHeight/2;

		// And draw it
		if(lastSide == SIDES.X){
			ctx.fillStyle = this.WALL_X_COLOR;
		}else{
			ctx.fillStyle = this.WALL_Y_COLOR;
		}
		ctx.fillRect(canvasX, lineTop, 1, lineHeight);
	}
}
