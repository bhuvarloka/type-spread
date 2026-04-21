// Expose mutable state so the panel UI can read/write it
window._sketchTangent = false;
window._sketchCycleFill = true;
window._sketchFillColors = ["#000000", "#ff0000", "#0000ff"];
window._sketchMessage = "EVERYWHERE IS JUST ONE PLACE";
window._sketchMessageChanged = false;

window._sketchFillSteps = 1;
window._sketchClearCanvas = false;

let blocks = [];
let lastX, lastY, lastW, lastH;
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

  // sync message input default into sketch state
  const input = document.getElementById("message-input");
  if (input) window._sketchMessage = input.value || window._sketchMessage;
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
        window._sketchMessage = input.value || window._sketchMessage;
        window._sketchMessageChanged = true;
      }
    });
  }
});

function mousePressed() {
  firstBlock = true;
}

function getCycleFill() {
  const colors = window._sketchFillColors;
  let n = colors.length;
  const steps = window._sketchFillSteps;

  if (steps === 0) {
    let c = color(colors[fillStep % n]);
    fillStep++;
    return c;
  }

  let segments = n - 1;
  let totalSlots = segments * (steps + 1) + 1;
  let period = (totalSlots - 1) * 2;
  let slot = fillStep % period;
  fillStep++;

  let pos = slot < totalSlots ? slot : period - slot;
  if (pos === totalSlots - 1) return color(colors[n - 1]);
  let segIndex = floor(pos / (steps + 1));
  let t = (pos % (steps + 1)) / (steps + 1);

  return lerpColor(color(colors[segIndex]), color(colors[segIndex + 1]), t);
}

function getRectDistanceToEdge(rectW, rectH, dirX, dirY) {
  let halfW = rectW / 2;
  let halfH = rectH / 2;
  if (dirX === 0) return halfH;
  if (dirY === 0) return halfW;
  return min(halfW / abs(dirX), halfH / abs(dirY));
}

function draw() {
  if (window._sketchClearCanvas) {
    blocks = [];
    background(255);
    firstBlock = true;
    fillStep = 0;
    messageIndex = 0;
    window._sketchClearCanvas = false;
  }

  if (window._sketchMessageChanged) {
    messageIndex = 0;
    window._sketchMessageChanged = false;
  }

  const hovered = document.elementFromPoint(mouseX, mouseY);
  const blocked =
    hovered?.closest("#settings-panel") ||
    hovered?.closest("#settings-trigger");

  if (mouseIsPressed && !blocked) {
    let d = dist(mouseX, mouseY, lastX, lastY);
    if (firstBlock || d > 45) {
      let w = random(40, 90);
      let h = random(40, 90);
      let newX = mouseX;
      let newY = mouseY;

      if (!firstBlock) {
        let dx = mouseX - lastX;
        let dy = mouseY - lastY;
        const OVERLAP = 1;

        if (window._sketchTangent) {
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
        char: window._sketchMessage[
          messageIndex % window._sketchMessage.length
        ],
        s: 0.1,
        fillColor: window._sketchCycleFill ? getCycleFill() : color(0),
      });

      messageIndex = (messageIndex + 1) % window._sketchMessage.length;
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
