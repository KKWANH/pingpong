import React from "react";
import { styled } from "@stitches/react";
import ReactDOM from "react-dom";
import { convert } from "html-element-to-react";

// setting definition
let gameStatus = "playing";
let muteStatus = true;

const resetButton = document.getElementById("reset");
const muteButton = document.getElementById("mute");
// setting definition end

// sound definition
const hit = new Audio();
const wall = new Audio();
const goal = new Audio();
const win = new Audio();
const fail = new Audio();
const countdown = new Audio();

hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
goal.src = "sounds/goal.mp3";
win.src = "sounds/win.mp3";
fail.src = "sounds/fail.mp3";
countdown.src = "sounds/countdown.mp3";

function musicPlay(argMusic) {
  if (muteStatus === true) argMusic.play();
}

function soundToggle() {
  muteStatus = !muteStatus;
  if (muteStatus === false) {
  	muteButton.textContent = "Unmute";
  } else {
    muteButton.textContent = "Mute";
  }
}
// sound end

// const canvas definition
const canvas = document.getElementById("pong") as HTMLCanvasElement;
const contxt = canvas.getContext("2d");
// const canvas definition end

// const element definition
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  velocityX: 5,
  velocityY: 5,
  speed: 7,
  color: "#FFF",
};

const user = {
  x: 0, // left side of canvas
  y: (canvas.height - 100) / 2, // -100 the height of paddle
  width: 10,
  height: 100,
  score: 0,
  color: "#FFF"
};

const com = {
  x: canvas.width - 10, // - width of paddle
  y: (canvas.height - 100) / 2, // -100 the height of paddle
  width: 10,
  height: 100,
  score: 0,
  color: "#FFF"
};

const net = {
  x: (canvas.width - 2) / 2,
  y: 0,
  height: 10,
  width: 2,
  color: "#FFF"
};
// const element definition end

// calculator functions
function collision(b, p) {
  p.top = p.y;
  p.bottom = p.y + p.height;
  p.left = p.x;
  p.right = p.x + p.width;

  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;

  return (p.left < b.right) && (p.top < b.bottom) && (p.right > b.left) && (p.bottom > b.top);
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.velocityX = -ball.velocityX;
  ball.speed = 7;
}
// calculator functions end

// updater function
function update() {
  if (gameStatus === "playing") {
    // change the score of players,
    // if the ball goes to the left "ball.x<0" computer win,
    // else if "ball.x > canvas.width" the user win
    if (ball.x - ball.radius < 0) {
      com.score += 1;
      resetBall();
	  musicPlay(goal);
    } else if (ball.x + ball.radius > canvas.width) {
      user.score += 1;
      resetBall();
	  musicPlay(goal);
    }
    if (user.score === 5) {
	  gameStatus = "user";
      musicPlay(win);
    } else if (com.score === 5) {
      gameStatus = "com";
      musicPlay(fail);
    } else {
   	  // the ball has a velocity
      ball.x += ball.velocityX;
      ball.y += ball.velocityY;

      // computer plays for itself,
      // and we must be able to beat it
      // -> simple AI
      com.y += ((ball.y - (com.y + com.height / 2))) * 0.1;

      // when the ball collides with bottom and top walls
      // we inverse the y velocity.
      if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
        musicPlay(wall);
      }

      // we check if the paddle hit the user or the com paddle
      const player = (ball.x + ball.radius < canvas.width / 2)
        ? user : com;

      // if the ball hits a paddle
      if (collision(ball, player)) {
        musicPlay(hit);
        // we check where the ball hits the paddle
        let collidePoint = (ball.y - (player.y + player.height / 2));

        // normalize the value of collidePoint, we need to get numbers between -1 and 1.
        // -player.height/2 < collide Point < player.height/2
        collidePoint /= (player.height / 2);

        // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
        // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
        // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
        // Math.PI/4 = 45degrees
        const angleRad = (Math.PI / 4) * collidePoint;

        // change the X and Y velocity direction
        const direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // speed up the ball everytime a paddle hits it.
        ball.speed += 0.1;
      }
    }
  }
}
// updater function end

// draw functions
function drawRect(x, y, width, height, color) {
  contxt.fillStyle = color;
  contxt.fillRect(x, y, width, height);
}

function drawText(text, x, y, font, color) {
  contxt.fillStyle = color;
  contxt.font = `${font}px fantasy`;
  contxt.fillText(text, x, y);
}

function drawNet() {
  for (let i = 0; i <= canvas.height; i += 15) {
    drawRect(net.x, net.y + i, net.width, net.height, net.color);
  }
}

function drawArc(x, y, r, color) {
  contxt.fillStyle = color;
  contxt.beginPath();
  contxt.arc(x, y, r, 0, Math.PI * 2, true);
  contxt.closePath();
  contxt.fill();
}
// drawer functions end

// renderer function
function render() {
  drawRect(0, 0, canvas.width, canvas.height, "#000");
  drawNet();
  drawRect(user.x, user.y, user.width, user.height, user.color);
  drawRect(com.x, com.y, com.width, com.height, com.color);
  if (gameStatus === "user") {
    drawText("You Win!", (canvas.width / 5), (canvas.height / 1.8), 100, "#12A0F9");
  } else if (gameStatus === "com") {
    drawText("You Die!", (canvas.width / 5), (canvas.height / 1.8), 100, "#FE3F3F");
  } else {
    drawText(user.score, canvas.width / 4, canvas.height / 5, 75, "#FFF");
    drawText(com.score, (3 * canvas.width / 4), (canvas.height / 5), 75, "#FFF");
    drawArc(ball.x, ball.y, ball.radius, ball.color);
  }
}
// renderer function end

// game control buttons
function resetGame() {
  gameStatus = "com";
  musicPlay(countdown);
  setTimeout(() => { gameStatus = "playing"; resetBall(); user.score = 0; com.score = 0; }, 3000);
}
// game control buttons end

// mouse and key
function controlByKey(evt) {
  if (evt.key === "m" || evt.key === "M") {
    soundToggle();
  } else if (evt.key === "ArrowUp") {
  } else if (evt.key === "ArrowDown") {
  }
}

function controlByMouse(evt) {
  const rect = canvas.getBoundingClientRect();
  user.y = evt.clientY - rect.top - user.height / 2;
}
// mouse and key end

// event listeners
canvas.addEventListener("mousemove", controlByMouse);
document.addEventListener("keydown", controlByKey);
resetButton.addEventListener("click", resetGame);
muteButton.addEventListener("click", soundToggle);
// event listeners end

// main parts
function Game() {
  update();
  render();
  return (canvas);
}

const App = convert(Game());
ReactDOM.render(App, document.getElementById("pong"));
// main parts end

// loop
const framePerSecond = 50;
const loop = setInterval(Game, 1000 / framePerSecond);
// loop end
