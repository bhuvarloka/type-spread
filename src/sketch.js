import p5 from "p5";

// Expose mutable state so the panel UI can read/write it
window._sketchTangent = false;
window._sketchCycleFill = true;
window._sketchFillColors = ["#000000", "#ff0000", "#0000ff"];
window._sketchMessage = "EVERYWHERE IS JUST ONE PLACE";
window._sketchMessageChanged = false;

window._sketchFillSteps = 12;
window._sketchClearCanvas = false;

new p5((p) => {
  let blocks = [];
  let lastX, lastY, lastW, lastH;
  let messageIndex = 0;
  let fillStep = 0;
  let firstBlock = true;

  p.setup = function () {
    const main = document.querySelector("main");
    let w = main ? main.offsetWidth : p.windowWidth;
    let h = main ? main.offsetHeight : p.windowHeight;
    let canvas = p.createCanvas(w, h);
    if (main) canvas.parent(main);
    p.background(255);
    p.noStroke();
    p.textFont("Outfit");
    p.textAlign(p.CENTER, p.CENTER);
    p.rectMode(p.CENTER);

    const input = document.getElementById("message-input");
    if (input) window._sketchMessage = input.value || window._sketchMessage;
  };

  p.windowResized = function () {
    const main = document.querySelector("main");
    let w = main ? main.offsetWidth : p.windowWidth;
    let h = main ? main.offsetHeight : p.windowHeight;
    p.resizeCanvas(w, h);
    p.background(255);
    firstBlock = true;
  };

  p.mousePressed = function () {
    firstBlock = true;
  };

  function getCycleFill() {
    const colors = window._sketchFillColors;
    let n = colors.length;
    const steps = window._sketchFillSteps;

    if (steps === 0) {
      let c = p.color(colors[fillStep % n]);
      fillStep++;
      return c;
    }

    let segments = n - 1;
    let totalSlots = segments * (steps + 1) + 1;
    let period = (totalSlots - 1) * 2;
    let slot = fillStep % period;
    fillStep++;

    let pos = slot < totalSlots ? slot : period - slot;
    if (pos === totalSlots - 1) return p.color(colors[n - 1]);
    let segIndex = p.floor(pos / (steps + 1));
    let t = (pos % (steps + 1)) / (steps + 1);

    return p.lerpColor(p.color(colors[segIndex]), p.color(colors[segIndex + 1]), t);
  }

  function getRectDistanceToEdge(rectW, rectH, dirX, dirY) {
    let halfW = rectW / 2;
    let halfH = rectH / 2;
    if (dirX === 0) return halfH;
    if (dirY === 0) return halfW;
    return p.min(halfW / p.abs(dirX), halfH / p.abs(dirY));
  }

  p.draw = function () {
    if (window._sketchClearCanvas) {
      blocks = [];
      p.background(255);
      firstBlock = true;
      fillStep = 0;
      messageIndex = 0;
      window._sketchClearCanvas = false;
    }

    if (window._sketchMessageChanged) {
      messageIndex = 0;
      window._sketchMessageChanged = false;
    }

    const hovered = document.elementFromPoint(p.mouseX, p.mouseY);
    const blocked =
      hovered?.closest("#settings-panel") ||
      hovered?.closest("#settings-trigger");

    if (p.mouseIsPressed && !blocked) {
      let d = p.dist(p.mouseX, p.mouseY, lastX, lastY);
      if (firstBlock || d > 45) {
        let w = p.random(40, 90);
        let h = p.random(40, 90);
        let newX = p.mouseX;
        let newY = p.mouseY;

        if (!firstBlock) {
          let dx = p.mouseX - lastX;
          let dy = p.mouseY - lastY;
          const OVERLAP = 1;

          if (window._sketchTangent) {
            if (p.abs(dx) > p.abs(dy)) {
              newX = lastX + (dx > 0 ? 1 : -1) * (lastW / 2 + w / 2 - OVERLAP);
              newY = lastY;
            } else {
              newX = lastX;
              newY = lastY + (dy > 0 ? 1 : -1) * (lastH / 2 + h / 2 - OVERLAP);
            }
          } else {
            let distance = p.sqrt(dx * dx + dy * dy);
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
          fillColor: window._sketchCycleFill ? getCycleFill() : p.color(0),
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

      p.push();
      p.translate(b.x, b.y);
      p.scale(p.min(b.s, 1.0));
      p.fill(b.fillColor);
      p.rect(0, 0, b.w, b.h);
      p.fill(255);
      p.textSize(32);
      p.text(b.char, 0, 0);
      p.pop();

      if (b.s >= 1.0) blocks.splice(i, 1);
    }
  };
});
