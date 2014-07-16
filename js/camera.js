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

Camera.prototype.RESOLUTION = 500;
Camera.prototype.SKY_COLOR = '#55a';
Camera.prototype.GROUND_COLOR = '#757';
Camera.prototype.WALL_X_COLOR = '#5a5';
Camera.prototype.WALL_Y_COLOR = '#272';
Camera.prototype.WALL_HEIGHT = 1.6;
Camera.prototype.MAX_DISTANCE = 0;

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

	var stripeWidth = canvas.width/this.RESOLUTION

	// Cast a ray for each vertical column on the canvas
	var zBuffer = new Array();
	for(var renderX=0; renderX < this.RESOLUTION; renderX++){
		// Ray starts at camera position
		var rayOrigin = {x: this.pos.x, y: this.pos.y};

		// Map coordinates for ray's current posisition
		var mapPos = {x: Math.floor(rayOrigin.x), y: Math.floor(rayOrigin.y)};

		// Position scalar for camera plane, range is [-1, 1]
		// The left end of the canvas is -1, the center is 0, and right is 1
		var planeScalar = (2*renderX / this.RESOLUTION) - 1;

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

				if(this.MAX_DISTANCE){
					var distance = Math.abs(
						(mapPos.x - rayOrigin.x + (1 - mapStepX)/2) / rayDir.x
					);
					if(distance > this.MAX_DISTANCE){
						break;
					}
				}
			}else{
				// Move the ray one map row
				rayDistance.y += rowDelta;
				mapPos.y += mapStepY;
				lastSide = SIDES.Y;

				if(this.MAX_DISTANCE){
					var distance = Math.abs(
						(mapPos.y - rayOrigin.y + (1 - mapStepY)/2) / rayDir.y
					);
					if(distance > this.MAX_DISTANCE){
						break;
					}
				}
			}

			if(this.map.at(mapPos.x, mapPos.y)){
				hit = true;
			}
		}

		// If the ray didn't hit a wall (e.g. it hit its max distance),
		// don't draw a wall at that distance; just move on
		if(!hit){
			continue;
		}

		var wallType = this.map.at(mapPos.x, mapPos.y);

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
		var lineHeight = Math.abs(Math.floor(canvas.height * this.WALL_HEIGHT / wallDistance));
		var lineTop = canvas.height/2 - lineHeight/2;

		// TODO -- understand these formulas for texture drawing

		var wallTexture = wallType.texture;

		var wallScalar;
		if(lastSide == 1){
			wallScalar = rayOrigin.x + ((mapPos.y - rayOrigin.y + (1 - mapStepY) / 2) / rayDir.y) * rayDir.x;
		}else{
			wallScalar = rayOrigin.y + ((mapPos.x - rayOrigin.x + (1 - mapStepX) / 2) / rayDir.x) * rayDir.y;
		}
		wallScalar -= Math.floor(wallScalar);

		var textureX = Math.floor(wallScalar * wallTexture.width);
		if(lastSide == 0 && rayDir.x > 0){
			textureX = wallTexture.width - textureX - 1;
		}else if(lastSide == 1 && rayDir.y < 0){
			textureX = wallTexture.width - textureX - 1;
		}

		ctx.drawImage(
			wallTexture,
			textureX, 0, 1, wallTexture.height,
			renderX*stripeWidth, lineTop, stripeWidth, lineHeight
		)

		if(lastSide == 1){
			ctx.fillStyle = 'rgba(0, 0, 0, .6)';
			ctx.fillRect(renderX*stripeWidth, lineTop, stripeWidth, lineHeight);
		}

		// zBuffer for sprites
		zBuffer[renderX] = wallDistance;
		window.zBuffer = zBuffer;
	}

	// Draw sprites
	// TODO -- this code is largely transcribed from the lodev tutorial, with the rest
	//		somewhat haphazardly coded; change it to be more idiomatic JS and fit
	//		better with the rest of the code (and be sounder in general)
	// TODO -- figure out how all the math with sprites works
	
	var sprites = map.sprites;

	var spriteOrder = new Array();
	var spriteDistSquared = new Array();
	for(var i = 0; i < sprites.length; i++){
		var sprite = sprites[i];
		spriteOrder[i] = i;
		var spriteXDist = this.pos.x - sprite.x;
		var spriteYDist = this.pos.y - sprite.y;
		spriteDistSquared[i] = spriteXDist*spriteXDist + spriteYDist*spriteYDist;
	}

	spriteOrder.sort(function(a, b){
		return spriteDistSquared[b] - spriteDistSquared[a];
	});

	for(var i = 0; i < sprites.length; i++){
		var spriteX = sprites[spriteOrder[i]].x - this.pos.x;
		var spriteY = sprites[spriteOrder[i]].y - this.pos.y;

		var invDet = 1.0 / (this.plane.x*this.dir.y - this.dir.x*this.plane.y)

		var transformX = invDet * (this.dir.y*spriteX - this.dir.x*spriteY);
		var transformY = invDet * (-this.plane.y*spriteX + this.plane.x*spriteY);

		var spriteScreenX = Math.floor((this.RESOLUTION/2) * (1 + transformX/transformY));

		var spriteHeight = Math.abs(Math.floor(canvas.height/transformY));
		var drawStartY = -spriteHeight/2 + canvas.height/2;
	
		// The (this.RESOLUTION/canvas.width) part was added by me
		// Without it, the sprite is streched along the x-axis
		// I should probably figure out why
		var spriteWidth = Math.abs(Math.floor((this.RESOLUTION/canvas.width)*canvas.height/transformY));
		var drawStartX = -Math.floor(spriteWidth/2) + spriteScreenX;
		var drawEndX = spriteWidth/2 + spriteScreenX;
		
		var spriteTexture = sprites[spriteOrder[i]].image;
		for(var stripe = drawStartX; stripe < drawEndX; stripe++){
			window.transformY = transformY;
			window.stripe = stripe;
			if(transformY <= 0 || stripe <= 0 || stripe >= this.RESOLUTION || transformY >= zBuffer[stripe]){
				window.clipping = true;
				continue;
			}
			else{
				window.clipping = false;
			}

			var texX = Math.floor((stripe - (-spriteWidth/2 + spriteScreenX)) * spriteTexture.width/spriteWidth);

			ctx.drawImage(
				spriteTexture,
				texX, 0, 1, spriteTexture.height,
				stripe*stripeWidth, drawStartY, stripeWidth, spriteHeight
			)
		}
	}
}
