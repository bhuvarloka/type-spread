let TANGENT = true; // true = axis-locked tangency; false = directional edge-touching
let CYCLE_FILL = true; // true = rectangles cycle through FILL_COLORS ping-pong style

const FILL_COLORS = ["#000000", "#ff0000", "#0000ff"];
const FILL_STEPS = 255; // rectangles to transition between each color pair

let blocks = [];
let lastX, lastY, lastW, lastH;
let message = "EVERYWHERE IS JUST ONE PLACE";
let messageIndex = 0;
let fillStep = 0;
let firstBlock = true;

function setup() {
  const main = document.querySelector("main");
  let w = main ? main.offsetWidth : windowWidth;
  let h = main ? main.offsetHeight : windowHeight;
  let canvas = createCanvas(w, h);
  if (main) canvas.parent(main);
  background(255);
  noStroke();
  textFont("Outfit");
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
}

function windowResized() {
  const main = document.querySelector("main");
  let w = main ? main.offsetWidth : windowWidth;
  let h = main ? main.offsetHeight : windowHeight;
  resizeCanvas(w, h);
  background(255);
  firstBlock = true;
}

document.addEventListener("DOMContentLoaded", function () {
  let input = document.getElementById("message-input");
  if (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        message = input.value || message;
        messageIndex = 0;
      }
    });
  }
});

function mousePressed() {
  firstBlock = true;
}

function getCycleFill() {
  let n = FILL_COLORS.length;
  let totalSteps = (n - 1) * FILL_STEPS;
  // ping-pong: forward 0..totalSteps-1, then mirror back
  let cycle = fillStep % (totalSteps * 2);
  let pos = min(
    cycle < totalSteps ? cycle : totalSteps * 2 - cycle,
    totalSteps - 1,
  );
  let segIndex = floor(pos / FILL_STEPS);
  let segT = (pos % FILL_STEPS) / FILL_STEPS;
  fillStep++;
  return lerpColor(
    color(FILL_COLORS[segIndex]),
    color(FILL_COLORS[segIndex + 1]),
    segT,
  );
}

function getRectDistanceToEdge(rectW, rectH, dirX, dirY) {
  let halfW = rectW / 2;
  let halfH = rectH / 2;
  if (dirX === 0) return halfH;
  if (dirY === 0) return halfW;
  return min(halfW / abs(dirX), halfH / abs(dirY));
}

function draw() {
  if (mouseIsPressed) {
    let d = dist(mouseX, mouseY, lastX, lastY);
    if (firstBlock || d > 45) {
      let w = random(40, 90);
      let h = random(40, 90);
      let newX = mouseX;
      let newY = mouseY;

      if (!firstBlock) {
        let dx = mouseX - lastX;
        let dy = mouseY - lastY;
        const OVERLAP = 1; // 1px overlap to close sub-pixel gaps

        if (TANGENT) {
          if (abs(dx) > abs(dy)) {
            newX = lastX + (dx > 0 ? 1 : -1) * (lastW / 2 + w / 2 - OVERLAP);
            newY = lastY;
          } else {
            newX = lastX;
            newY = lastY + (dy > 0 ? 1 : -1) * (lastH / 2 + h / 2 - OVERLAP);
          }
        } else {
          let distance = sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            let dirX = dx / distance;
            let dirY = dy / distance;
            let centerDist =
              getRectDistanceToEdge(lastW, lastH, dirX, dirY) +
              getRectDistanceToEdge(w, h, -dirX, -dirY) -
              OVERLAP;
            newX = lastX + dirX * centerDist;
            newY = lastY + dirY * centerDist;
          } else {
            newX = lastX + lastW - OVERLAP;
            newY = lastY;
          }
        }
      }

      blocks.push({
        x: newX,
        y: newY,
        w: w,
        h: h,
        char: message[messageIndex],
        s: 0.1,
        fillColor: CYCLE_FILL ? getCycleFill() : color(0),
      });

      messageIndex = (messageIndex + 1) % message.length;
      lastX = newX;
      lastY = newY;
      lastW = w;
      lastH = h;
      firstBlock = false;
    }
  }

  for (let i = blocks.length - 1; i >= 0; i--) {
    let b = blocks[i];
    b.s += 0.15;

    push();
    translate(b.x, b.y);
    scale(min(b.s, 1.0));
    fill(b.fillColor);
    rect(0, 0, b.w, b.h);
    fill(255);
    textSize(32);
    text(b.char, 0, 0);
    pop();

    if (b.s >= 1.0) blocks.splice(i, 1);
  }
}
