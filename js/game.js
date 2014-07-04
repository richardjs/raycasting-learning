'use strict';

function Game(canvas){
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
	this.lastTime = 0;
}
Game.prototype.start = function(){
	var gameloop = this;

	var camera = new Camera(map);
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
