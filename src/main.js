var angle = 0;
var cnv = null;
var c = null;
var models = [];
var updatefrequency = (1000 / 60) * (60 / 30) - (1000 / 60) * 0.5;
var lastFrameTime = 0;
var g_x = 0;
var g_y = 0;
var v_x = 0;
var v_y = 0;
var collisionChart = {};
var s_vx = 0;
var s_vy = 0;
var debug = false;
var keysDown = new Set();

create2DPath = (paths) => {
  if (!paths || paths.length === 0) return false;

  var tmp = new Path2D();
  for (let i = 0; i < paths.length; i++) {
    tmp.addPath(new Path2D(paths[i]));
  }
  return tmp;
};

mouseEventListener = (e) => {
  var cRect = cnv.getBoundingClientRect();
  m_x = e.clientX - cRect.left;
  m_y = e.clientY - cRect.top;
  if (e.type === "click") {
    s_vx = g_x + m_x - 135;
    s_vy = g_y + m_y - 120;
  }
};

main = () => {
  cnv = document.getElementById("ca");
  c = cnv.getContext("2d");
  cnv.addEventListener("mousemove", mouseEventListener);
  cnv.addEventListener("click", mouseEventListener);
  window.addEventListener("keydown", (e) => keysDown.add(e.key));
  window.addEventListener("keyup", (e) => keysDown.delete(e.key));
  createModelsFromData(getObjectsData());
  window.requestAnimationFrame(update);
};

handleKeysPressed = () => {
  keysDown.forEach((key) => {
    var x = v_x,
      y = v_y;
    switch (key) {
      case " ":
        scy_xv = 1;
        break;
      case "a":
        x = x - 2;
        break;
      case "d":
        x = x + 2;
        break;
      case "w":
        y = y - 4;
        break;
      case "s":
        y = y + 4;
        break;
      case "o":
        debug = !debug;
        break;
    }
    v_x = x;
    v_y = y;
  });
};

calculateLocations = () => {
  v_x = v_x / 1.1;
  v_y = v_y / 1.1;
  var x = g_x,
    y = g_y;
  var _x = v_x,
    _y = v_y;
  x = x + _x;
  y = y + _y;
  g_x = x;
  g_y = y;
};

updateCollisionMap = (item) => {
  var tempChart = [];
  for (var i = 0; i < cnv.clientWidth; i = i + 10) {
    for (var j = 0; j < cnv.clientHeight; j = j + 10) {
      if (c.isPointInPath(models[item], i, j)) {
        tempChart.push({ x: i, y: j });
      }
    }
  }
  collisionChart[item] = tempChart;
};

testCollision = (item1, item2) => {
  return collisionChart[item1].some((object1) => {
    return collisionChart[item2].some((object2) => {
      return object1.x === object2.x && object1.y === object2.y;
    });
  });
};

draw = () => {
  angle = angle + 0.1;
  c.clearRect(0, 0, c.canvas.clientWidth, c.canvas.clientHeight);
  c.save();
  c.translate(100 + g_x, 120 + g_y);
  // c.scale(3.5, 3.5);
  c.stroke(models["viikatemies"]);
  updateCollisionMap("viikatemies");
  c.restore();
  c.save();
  c.translate(135 + g_x, 120 + g_y);
  //c.scale(0.5, 0.5);
  if (s_vx !== 0) c.rotate(angle);
  c.fillStyle = "white";
  c.fill(models["viikate"]);
  c.stroke(models["viikate"]);
  updateCollisionMap("viikate");
  c.restore();
  c.save();
  //c.fillStyle = "blue";
  c.translate(135 + g_x, 120 + g_y);
  //c.fill(models["triskele"]);
  c.stroke(models["triskele"]);
  c.restore();
  if (debug) {
    collisionChart["viikate"].forEach((item) => {
      c.beginPath();
      c.rect(item.x, item.y, 5, 5);
      c.stroke();
    });
    collisionChart["viikatemies"].forEach((item) => {
      c.beginPath();
      c.rect(item.x, item.y, 5, 5);
      c.stroke();
    });
  }
  //console.log(testCollision('g939','g1045'));
};

update = (time) => {
  if (time - lastFrameTime < updatefrequency) {
    requestAnimationFrame(update);
    return;
  }
  handleKeysPressed();
  calculateLocations();
  draw();
  lastFrameTime = time;
  requestAnimationFrame(update); // get next farme
};

createModelsFromData = (data) => {
  let modelsTemp = [];
  for (const [key, value] of Object.entries(data)) {
    modelsTemp[key] = create2DPath(value["data"]);
  }
  models = modelsTemp;
};

getObjectsData = () => {
  return {
    viikate: {
      transform: "",
      data: [
        "m24-92-.82 2.9c1.5.8 3 1.6 4.5 2.5l1.1-3.7zm-5.3 19-52 178 5.2 1.3 51-176z",
        "m31-86-5.8 19c-21-22-63-28-79-29 30-16 75 4.8 85 10z",
      ],
    },
    viikatemies: {
      transform: "",
      data: [
        "m-.79-66c0 6.4-3.2 14-8.7 14-5.5 0-10-2.7-10-9.1 0-6.4 4.8-14 10-14 5.5 0 8.7 2.9 8.7 9.3z",
        "m2.5-66c0 6.4 3.2 14 8.7 14 5.5 0 10-2.7 10-9.1 0-6.4-4.8-14-10-14-5.5 0-8.7 2.9-8.7 9.3z",
        "m3.2-50c.13 1.5-.37 1.6-1 2-.63.34-1.4-.6-1.4-.6s-.67.94-1.3.6c-.63-.34-1.1-.45-1-2 .13-1.5 2.3-3.9 2.3-3.9s2.2 2.4 2.3 3.9z",
        "m-28-60c-1.1 9.2 13 16 19 11",
        "m31-61c.68 5.1-14 17-21 13",
        "m-14-48c.79 4.5 1.9 4.4 4.3 5.7 3.2 1.8 25 2.8 25-6",
        "m-6.7-41 .14-3.1",
        "m.46-41 .09-3.1",
        "m7.5-41 .089-3.6",
        "m4-75c-2.2-1.8-1.7-3-1.3-4.2",
        "m-1.8-75c2.4-1.5 1.9-2.8 1.7-4.1",
        "m32-51c.77-33-30-42-30-42-19 12-30 25-31 42-.57 13 31 14 30 19 3.6-7.9 32-8.8 32-19z",
        "m48 14a3.1 9.6 14 01-5.4 8.3 3.1 9.6 14 01-.57-10 3.1 9.6 14 015.4-8.3 3.1 9.6 14 01.57 10z",
        "m-.0091-32c-41-5.6-37-15-37-17 5.2-28 19-42 37-53 25 8.9 36 26 41 53-4.4 15-24 16-41 18z",
        "m-14-34c-2.8.46-6.5 6.7-6.8 9.6-2.1 20-7.3 59-14 70l4.1-1.1 2.4 4.3 3.6-2.8 2.5 3.9",
        "m18-34c9.3 93 38 118 35 118l-18-4.2c-2 6-9.5 12-12 9.4-5.1-5.4-9.7 1.2-19 1.9-6.1.42-15-10-20-4.7-7.1 7.2-20 3.9-27 4.9 27-20 25-83 29-125",
        "m18-33c3.4-.36 7.9 4 10 11 4.5 13 17 27 20 26",
        "m21-8c5 12 10 19 21 30",
        "m50 9.6c1.8.51 4.1.51 4.3-.5.25-1-.28-2.1-2.1-2.6-1.8-.51-4.2-.23-4.5.78-.25 1 .4 1.8 2.2 2.3z",
        "m49 13c1.9.51 4.3.5 4.6-.53.26-1-.3-2.2-2.2-2.7-1.9-.51-4.5-.21-4.7.82-.26 1 .44 1.9 2.4 2.4z",
        "m48 15c1.8.37 4 .26 4.2-.67.2-.93-.37-1.9-2.2-2.3-1.8-.37-4.1 6e-4-4.3.93-.2.93.48 1.6 2.3 2z",
        "m45 8.3c-.45 2.1-.47 4.7.39 4.9.87.28 1.8-.33 2.3-2.4.45-2.1.23-4.8-.64-5.1-.87-.28-1.6.47-2 2.5z",
      ],
    },
    ankh: {
      transform: "",
      data: [
        "m15 2.5-13-.91 2.7 24h-9.2l2.7-24-13 .91v-6l11 1.4c-2.1-3.2-5.5-8.8-5.5-14 0-5.5 3.6-11 8.6-11s8.6 5.2 8.6 11c0 5.3-3.4 11-5.5 14l11-1.4zm-18-24c-.52.65-.91 1.5-1.2 2.5-.26.97-.45 1.9-.45 3 0 1.9.52 4.2 1.7 6.7.97 2.3 2.3 4.4 3.4 6.2 1.1-1.8 2.4-3.9 3.4-6.2 1.1-2.5 1.7-4.8 1.7-6.7 0-.97-.13-2-.45-3-.26-.91-.71-1.8-1.2-2.5-.65-.84-1.8-1.9-3.4-1.9-1.7 0-2.9 1-3.5 1.9z",
      ],
    },
    triskele: {
      transform: "",
      data: [
        "m129 15c.7-5.6 7.9 3.3 2 4.8-6.8 4.2-13-6.6-7.3-11 6-6.6 18-.48 17 8 .16 8.9-11 15-18 10-5.4-2.2-7.9-8-8.6-13-2.1-8-15-11-19-3.3-4.8 5.8 1.8 16 9 13 7.2-1.9 1-15-3.1-7.4.79 1.9 4.7 1.1 1.7 3.9-7.3 2.4-7.2-9.6-.45-9.7 8.2-1.7 12 10 5.8 15-6.4 6.3-18 .63-18-7.9-1.4-9.9 10-18 19-13 7 3.2 16-2.3 16-10 .39-7.7-11-12-15-5.8-4.7 4.7 3.1 13 7.5 7.7 2.1-4-3-3.7-3.7-2-4.8-5.7 8.6-7.9 7.7-.29.75 8.4-12 11-15 3.2-4.9-7.8 3.8-18 12-15 8.8 1.4 13 12 8.4 20-2.1 4.5-8 6.3-8.2 12-1.4 6.7 4.7 14 12 12 7.3-.84 9.8-13 2.1-15-6-3.1-10 8.8-2.6 7.2l.11-.42-.36-1.3z",
      ],
    },
    sun: {
      transform: "",
      data: [
        "m63-14c-4.2.54-8.5 1.5-12 4.1-3.8 1.8-7.8 3.5-10 7-2.8 3.4-4.4 8-3.3 12 .1 2.6-.065 6 2.9 7.1 3.5 1.6 7.5.85 11 .6 4.7-.63 9.2-3.1 12-6.6 3.9-3.8 8-8.2 9-14 .5-3.2-1.7-6.9-5.2-6.7-8.1-.21-17 2.5-22 9.2-2.9 3.4-3.5 9.1-.11 12 4 3.3 10 1.8 14-1 3.3-2.5 6.9-6.3 6-11-.089-4.1-5-3.1-7.6-2.4-3.9.64-8.6 2.9-9.1 7.3.34 3.6 5.2 4.3 8 3 2.5.11 5.3-4.9 1.5-4.5-1.7.86-6.6 1.3-4.6-1.8 2.5-2 7-3.4 9.4-.71 1.4 2.9-1.3 5.4-3.3 7.1-2.9 2.5-7.4 4.5-11 1.9-2.6-1.6-3.5-5.1-2-7.8 2.5-5.2 8.5-7.4 14-8.1 3.2-1 8.7-.6 8.4 3.9-.37 4-2.9 7.3-5.5 10-2.9 3.2-6.5 5.9-11 6.7-4.3 1-10 .076-12-4.4-1.8-4.5.78-9.3 3.7-13 4.3-4.6 10-7.3 16-8.5 1.9.011 6.4-3.1 1.8-3z",
        "m57-16c-.21-3.3-2.3-7.6-.061-10 3.4.52 2.5 5.2 2.7 7.7.64 1.6-1.3 5.3-2.7 2.6z",
        "m68-15c-.87-3.3 2-6.1 3-9 2.3-1.9 3.4 1.5 1.8 3.1-1.2 1.9-2 6.3-4.8 5.9z",
        "m75-4.4c.3-3.3 4.5-3.7 7-3.1 3.2 1.3-1.3 4-3.3 3.2-1.2-.28-2.8.64-3.7-.097z",
        "m72 6.8c3-1.6 8.6 4.1 5.1 6-2.4-.39-5.5-3.1-5.4-5.5z",
        "m66 16c3.1-.31 6.8 4.8 4.5 6.8-2.8-.08-4.6-3.4-5.1-5.9.047-.39.3-.74.63-.95z",
        "m56 20c3.1 1.2 1.4 5.2 1.9 7.6-1.6 3.1-4.3-.06-3.2-2.5.059-1.7-.16-4.1 1.4-5.2z",
        "m47 20c1.5 2.3.9 6.8-2 7.7-2.2-1.7-1.3-6.3 1-7.6l.46-.11z",
        "m46-11c1-3.4-2.6-5.8-3.6-8.7-1.9-2.4-5.5.34-2.8 2.5 1.7 2 3.6 6 6.4 6.2z",
        "m38-4.3c.33-3.3-2.8-5.9-4.9-8-3.4-.4-1.8 3.4-.064 4.5 1.1 1.4 2.9 4.3 5 3.5z",
        "m35 4.3c-.94-3.4-5.2-1.4-7.7-2.2-2.2-.35-4 2.9-.85 2.9 2.7.14 6.1 1.1 8.4-.46l.068-.15z",
        "m35 12c-2.7-.57-6.8 1.3-7.6 3.8 2 2.6 5.7-.48 7.5-2.1.38-.5.39-1.2.1-1.7z",
        "m39 18c1.8 2.3-.72 7.9-3.2 7.2-.9-2.2 1-6.4 3.2-7.2z",
      ],
    },
  };
};
