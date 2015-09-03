var speedX = 5;
var speedY = 5;
var speedLevel = 1;

var singlePlayer = null;

if (Math.sign == undefined) {
	Math.sign = function(value) {
		return value == 0 ? 0 : (value < 0 ? -1 : 1);
	}
}

// .player-button are the first two buttons
// [ 1 Player Mode ]
// [ 2 Player Mode ]
// so, just get which one was clicked and set singlePlayer mode
$(".player-button").on("click",function() {
	var button = $(this);
	var html = button.html();

	if (html == "1 Player Mode") {
		singlePlayer = true;
		$(".levels").show();
		$(".player-button").hide();
	} else if (html == "2 Player Mode") {
		singlePlayer = false;
		$(".controls").show();
		$(".player-button").hide();
	}
});

// .player-level are the 3 level buttons
// [ Level 1 ]
// [ Level 2 ]
// [ Level 3 ]
// get the level and tell Artifical Intelligence
$(".player-level").on("click",function() {
	var lvl = $(this).html().replace("Level ","");

	AI.level = parseInt(lvl);

	$(".start-menu").hide();

	Cat.start();
});

// you get it
$(".exit").on("click",function() {
	Cat.reset();
	Scores.reset();
	GoalKeepers.reset();
	$("#awesome-background-music")[0].pause();
	$("#awesome-background-music")[0].currentTime = 0;
});

// .player-got-it button which hides the tutorial and initializes the game
$(".player-got-it").on("click",function() {
	$(".controls").hide();
	Cat.start();
})

// YAS!
$("#awesome-background-music")[0].loop = true;

// AI of the game, only used if singlePlayer == true
var AI = {
	// class of the goalkeeper which will be controller by AI
	// @param {string} "right" | "left"
	goalkeeperClass: null,
	// level of goalkeeper (will be used for max speed)
	// @param {number} level
	level: 1,
	// set goalkeeper class
	setAIGoalKeeper: function(goalkeeperClass) {
		this.goalkeeperClass = goalkeeperClass;
	},
	// returns Cat's current Y position
	getCatY: function() {
		return $(".cat").position().top;
	},
	// returns current position of AI's goalkeeper
	getMyY: function() {
		return this.getGoalKeeperNode().position().top;
	},
	// returns AI's speed
	getMySpeed: function() {
		// speed of AI is it's speed * level * 0,7 (user's speed is * 1)
		// so it means that theoritically, user can always win because users speed is
		// ~1.33 of AI's speed, and at some point for AI it will be impossible to keep up with the ball
		return Math.abs(speedY * this.level * 0.7);
	},
	// returns the node object of goalkeeper
	getGoalKeeperNode: function() {
		return $("." + this.goalkeeperClass.toLowerCase() + "-goalkeeper");
	},	
	// well, just does it's job!
	doYourJob: function() {
		// get catY, AI's Y
		var catY = this.getCatY();
		var myY = this.getMyY();

		// updateLeft or updateRight, depends on given keeper class
		var func = "update" + this.goalkeeperClass;
		// speed
		var speed = this.getMySpeed();

		// calculate difference between me and cat
		if (catY > myY) {
			// if cat is lower (if Y is more, the lower it gets since Y starts from top)
			GoalKeepers[func](myY + speed);
		}
		if (catY < myY) {
			GoalKeepers[func](myY - speed);
		}
	}
}

AI.setAIGoalKeeper("Right");

var Cat = {
	// just chooses random direction 1 or -1
	chooseRandomDirection: function() {
		var random = Math.round(Math.random());
		if (random == 0) {
			random = -1;
		}
		return random;
	},
	// acceleration, later it decreases
	acceleration: 0.001,
	// interval, to later clear it
	moveInterval: 0,
	// nyez
	createRainbow: true,
	// resets the interval, speedX, speedY, removes the rainbows, sets all goalkeepers to their positions, centers the cat
	// hides pause menu (just in case) and every other tutorial stuff
	reset: function() {
		clearInterval(Cat.moveInterval);

		speedX = 5;
		speedY = 5;
		speedLevel = 1;

		$(".rainbow").remove();

		setTimeout(function() {
			$('.cat').css({
				"top": $(window).height() / 2 - 25,
				"left": $(window).width() / 2 - 25,
				"-webkit-transform": "none"
			})[0].className = "cat";
			$(".pause-menu").hide();
			$(".start-menu").show();
			$(".player-button").show();
			$(".levels").hide();
			$(".controls").hide();
		},1);
	},
	// this is reset where it shows pause menu, if the user wants to exit
	pause: function() {
		Cat.reset();

		setTimeout(function() {
			$(".start-menu").hide();
			$(".pause-menu").show();
		},2);
	},
	// starts the game
	start: function() {

			$(".start-menu").hide();
		// i know this is very simple but well why not?
		$(".pause-menu").hide();

		// speedX might be 5 or -5
		// speedY might be 5 or -5
		// so there are 4 permutations of direction (top left, top right, bottom left, bottom right)
		speedX *= this.chooseRandomDirection();
		speedY *= this.chooseRandomDirection();

		$("#awesome-background-music")[0].play();

		Cat.moveInterval = setInterval(Cat.update,10);
	},
	// so depending on cat direction, change it's transform (face direction so it doesn't move forwards with it's ass)
	changeImageDirection: function(x,y) {
		var cat = $(".cat");

		var className = "";

		if (x > 0 && y > 0) {
			className = "right-down";
		}
		if (x > 0 && y < 0) {
			className = "right-up";
		}
		if (x < 0 && y > 0) {
			className = "left-down";
		}
		if (x < 0 && y < 0) {
			className = "left-up";
		}

		cat[0].className = "cat" + " " + className;
	},
	// MAIN FUNCTION! just like in unity :3
	// this method is really light and smooth
	update: function() {

		// get cat position
		var realX = parseInt($(".cat").css("left"));
		var realY = parseInt($(".cat").css("top"));

		var rainbow = document.createElement("div");
		var height = 40; // global height (in update scope) used for rainbo height

		// goalkeeper left position (only top needed)
		var currLeft = $(".left-goalkeeper").position().top;
		// goalkeeper right position
		var currRight = $(".right-goalkeeper").position().top;

		// the faster the cat moves, the faster the goalkeepers should be allowed to move right?
		var speed = Math.abs(speedY);

		// pressed keys object is set by keydown, keydown repeat was really slow so i just capture the keydown and use it later in update method
		if (pressedKeys[keys.w]) {
			GoalKeepers.updateLeft(currLeft - speed);
		}
		if (pressedKeys[keys.s]) {
			GoalKeepers.updateLeft(currLeft + speed);
		}
		if (!singlePlayer) {
			// only allow up and down buttons if the user is playing multiplayer
			if (pressedKeys[keys.up]) {
				GoalKeepers.updateRight(currRight - speed);
			}
			if (pressedKeys[keys.down]) {
				GoalKeepers.updateRight(currRight + speed);
			}
		}

		if (Cat.createRainbow) {
			// create rainbow, the cat height is 50 so rainbow height (which is currently 40) should be centered by position top
			$(rainbow).css({
				// position absolute, top should be cats top + centered value
				"top": realY + (50 - height) / 2,
				"left": realX + 22.5,
				"width": Math.abs(speedX) * 2,
				"height": height
			}).addClass("rainbow").appendTo(document.body);

			setTimeout(function() {
				$(rainbow).animate({
					opacity: 0
				}, 250, function() {
					// on aniamtion end, remove the rainbow
					$(this).remove();
				});
			},1000);
		}

		// new X and newY
		var newX = realX + speedX;
		var newY = realY + speedY;

		// element which is at left and vertical Y part of cat
		var leftHit = document.elementFromPoint(newX, newY + 25);
		// element which is at right and vertical Y part of cat
		var rightHit = document.elementFromPoint(newX + 50, newY + 25);

		// if single player is on, let the AI do it's job
		if (singlePlayer) {
			AI.doYourJob();
		}

		// if cat is hitting bottom or top, reverse speedY so from next update the cat will change Y direction
		if (newY >= $(window).height() - $(".cat").height() || newY <= 0) {
			speedY *= -1;
		}
		// if left hit exists and it hits the goalkeeper
		if ($(leftHit).hasClass("goalkeeper")) {
			// reverse X speed
			speedX *= -1;
			// so on next round cat will move speedX + acceleration
			// so upper if statement will not work properly, it will change cats direction
			// then it will still stay in range and it'll change X again and again
			// so lets add 0.1px so it gets out of the range
			var value = Math.abs(speedX);
			newX += value;

			var speed = $(".left-goalkeeper")[0].speed;

			// depending on speed, if the cat Y direction matches Y direction of goalkeeper, speed the cat a bit
			if (Math.sign(speedY) == Math.sign(speed)) {
				speedY += speed / 60;
			} else {
				speedY -= speed / 60;
			}
		}
		// if the cat hits right goalkeeper
		if ($(rightHit).hasClass("goalkeeper")) {
			speedX *= -1;
			// move cat left a bit
			newX -= Math.abs(speedX);

			var speed = $(".right-goalkeeper")[0].speed;

			if (Math.sign(speedY) == Math.sign(speed)) {
				speedY += speed / 60;
			} else {
				speedY -= speed / 60;
			}
		}
		// if the cat hit the right wall, POINT!
		if (newX >= $(window).width() - $(".cat").width()) {
			Scores.setLeft(Scores.getLeft() + 1);
			Scores.play();
			Cat.pause();
			GoalKeepers.reset();
		}
		if (newX <= 0) {
			Scores.setRight(Scores.getRight() + 1);
			Scores.play();
			Cat.pause();
			GoalKeepers.reset();
		}

		// calculate the acceleration for cat
		function accelerate(val) {

			var tmpVal = Math.abs(val);
			var acc = Cat.acceleration;

			var tmpLevel = speedLevel;
			// from speed > 5 to speed > 10, acceleration should be 0.001
			// but after that, decrease acceleration 10 times on every 5 speed
			while (tmpVal > 10) {
				acc /= 10;
				tmpLevel++;
				tmpVal -= 5;
			}

			if (acc != 0.001 && window.log) console.log(acc);

			return Math.sign(val) * (Math.abs(val) + acc);
		}

		speedX = accelerate(speedX);
		speedY = accelerate(speedY);

		Cat.changeImageDirection(speedX, speedY);

		$(".cat").css({
			"top": newY,
			"left": newX
		});
	}
}

var GoalKeepers = {
	// update left goalkeeper's position
	updateLeft: function(position) {
		var height = $(".left-goalkeeper").outerHeight();
		var windowHeight = $(window).height();
		var topMax = windowHeight - height - 5;

		if (position < 5) position = 5;
		if (position > topMax) position = topMax;

		// update the speed as well
		var speed = position - $(".left-goalkeeper").position().top;

		$(".left-goalkeeper").css("top",position)[0].speed = speed;
	},
	// update right goalkeeper's position
	updateRight: function(position) {
		var height = $(".right-goalkeeper").outerHeight();
		var windowHeight = $(window).height();
		var topMax = windowHeight - height - 5;

		if (position < 5) position = 5;
		if (position > topMax) position = topMax;

		var speed = position - $(".right-goalkeeper").position().top;

		$(".right-goalkeeper").css("top",position)[0].speed = speed;
	},
	// reset them
	reset: function() {
		$(".goalkeeper").css({
			"top": "35%",
			"height": "30%"
		});
	}
}

var Scores = {
	// set lsef tscore with animation
	setLeft: function(n) {
		n = n || 0;

		if ($(".left-score span").text() == n) return;

		$(".left-score-overflow").fadeIn(200);

		setTimeout(function() {
			$(".left-score span").text(n);
			$(".left-score-overflow").fadeOut(200);
		},200);
	},
	// set right score with animation
	setRight: function(n) {
		n = n || 0;

		if ($(".right-score span").text() == n) return;

		$(".right-score-overflow").fadeIn(200);

		setTimeout(function() {
			$(".right-score span").text(n);
			$(".right-score-overflow").fadeOut(200);
		},200);
	},
	// returns left score
	getLeft: function() {
		return parseInt($(".left-score span").text());
	},
	// returns right score
	getRight: function() {
		return parseInt($(".right-score span").text());
	},
	// resets the scores [ 0 - 0 ]
	reset: function() {
		$(".left-score span").text(0);
		$(".right-score span").text(0);
	},
	// plays the audio
	play: function() {
		$("#score")[0].play();
	}
}

Cat.reset();

$(window).resize(function() {
	Cat.reset();
	GoalKeepers.reset();
});

var pressedKeys = {};
var keys = {
	"w": 87,
	"s": 83,
	"up": 38,
	"down": 40,
	"space": 32,
	"r": 82,
	"f": 70
};

$(document).keydown(function(e) {
	// on keydown get keyCode
	var key = e.which || e.keyCode;

	// log it in the pressedkeys object
	pressedKeys[key] = true;

	// if space was pressed. if game has already begun, dont do anything, other wise start the game
	// i check if game has begun or not by checking if cat is in the center or not XD
	if (pressedKeys[keys.space]) {
		var catPos = $(".cat").position();
		var top = catPos.top;
		var left = catPos.left;

		// i guess the only solid way to check if the game has not started yet.
		// YES, i was too lazy to create 1 variable containing game status
		if (top == $(window).height() / 2 - 25 && left == $(window).width() / 2 - 25 && $(".start-menu").css("display") == "none") Cat.start();
	}
	// yea, the R key actually resets the game but nobody knows that
	if (pressedKeys[keys.r]) {
		Cat.reset();
		Scores.reset();
		GoalKeepers.reset();
	}
});

$(document).keypress(function(e) {
	var pressedKey = e.keyCode || e.which;
	var currentFullScreenElement = document.webkitCurrentFullScreenElement || document.mozCurrentFullscreenElement || document.msCurrentFullScreenElement || document.currentFullScreenElement;
	var html = $("html")[0];

	// just fullscreen, easy stuff

	if (pressedKey == 102) {
		if (currentFullScreenElement == null) {
			if (html.webkitRequestFullScreen) {
				html.webkitRequestFullScreen();
			} else if (html.mozRequestFullScreen) {
				html.mozRequestFullscreen();
			} else if (html.msRequestFullScreen) {
				html.msRequestFullScreen();
			} else if (html.requestFullScreen) {
				html.requestFullScreen();
			}
		} else {
			if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			} else if (document.mozExitFullscreen) {
				document.mozExitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	}
});


// onkeyup reset everything
$(document).keyup(function(e) {
	var keyUp = e.which || e.keyCode;
	pressedKeys[keyUp] = false;
	$(".left-goalkeeper")[0].speed = 0;
	$(".right-goalkeeper")[0].speed = 0;
});

// on music checkbox change, toggle awesome background music
$("#music-checkbox").on("change",function() {
	$("#awesome-background-music")[0].volume = $(this)[0].checked;
});

// on rainbox checkbox change, toggle awesome rainboow fart
$("#rainbow-checkbox").on("change",function() {
	Cat.createRainbow = $(this)[0].checked;
});