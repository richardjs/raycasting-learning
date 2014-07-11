'use strict';

function Controller(camera){
	this.camera = camera;
	this.rotateDir = 0;

	this.states = {
		left: false,
		right: false,
		up: false,
		down: false
	}
	
	var controller = this;
	document.addEventListener('keydown', function(event){
		switch(event.keyCode){
			case 39:
			case 68:
				controller.states.right = true
				break;
			case 37:
			case 65:
				controller.states.left = true
				break;
			case 38:
			case 87:
				controller.states.up = true;
				break;
			case 40:
			case 83:
				controller.states.down = true;
				break;
		}
	});
	document.addEventListener('keyup', function(event){
		switch(event.keyCode){
			case 39:
			case 68:
				controller.states.right = false;
				break;
			case 37:
			case 65:
				controller.states.left = false;
				break;
			case 38:
			case 87:
				controller.states.up = false;
				break;
			case 40:
			case 83:
				controller.states.down = false;
				break;
		}
	});
}

Controller.prototype.ROTATE_SPEED = 2*Math.PI/3/1000;
Controller.prototype.MOVE_SPEED = 7/1000;

Controller.prototype.update = function(delta){
	var camera = this.camera;
	var map = camera.map;
	
	if(this.states.right){
		camera.rotate(-this.ROTATE_SPEED * delta);
	}
	if(this.states.left){
		camera.rotate(this.ROTATE_SPEED * delta);
	}
	if(this.states.up){
		if(!map.at(Math.floor(camera.pos.x + camera.dir.x*this.MOVE_SPEED*delta), Math.floor(camera.pos.y))){
			camera.pos.x += camera.dir.x * this.MOVE_SPEED * delta;
		}
		if(!map.at(Math.floor(camera.pos.x), Math.floor(camera.pos.y + camera.dir.y*this.MOVE_SPEED*delta))){
			camera.pos.y += camera.dir.y * this.MOVE_SPEED * delta;
		}
	}
	if(this.states.down){
		if(!map.at(Math.floor(camera.pos.x - camera.dir.x*this.MOVE_SPEED*delta), Math.floor(camera.pos.y))){
			camera.pos.x -= camera.dir.x * this.MOVE_SPEED * delta;
		}
		if(!map.at(Math.floor(camera.pos.x), Math.floor(camera.pos.y - camera.dir.y*this.MOVE_SPEED*delta))){
			camera.pos.y -= camera.dir.y * this.MOVE_SPEED * delta;
		}
	}
}
