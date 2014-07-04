'use strict';

function Game(canvas){
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
	this.lastTime = 0;
}
Game.prototype.start = function(){
	var gameloop = this;

	var camera = new Camera(map);
	camera.pos = {x: 0, y: 0};
	camera.dir = {x: 0, y: 1};
	camera.plane = {x: .66, y: 0};
	window.camera = camera;

	var controller = new Controller(camera);

	function frame(time){
		var delta = time - gameloop.lastTime;
		gameloop.lastTime = time;

		camera.update(delta);
		controller.update(delta);

		camera.render(gameloop.canvas, gameloop.ctx);

		window.requestAnimationFrame(frame);
	}
	window.requestAnimationFrame(frame);
}

var game = new Game(document.getElementById('canvas'));
game.start();
