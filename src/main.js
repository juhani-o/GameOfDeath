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
};

keybEventListener = (e) => {
  console.log(e.type)
  if (e.type === "keydown") {
    var x = v_x,
      y = v_y;
    switch (e.key) {
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
    }
    v_x = x;
    v_y = y;
    console.log(vx,vy)
  }
};

main = () => {
  cnv = document.getElementById("ca");
  c = cnv.getContext("2d");
  cnv.addEventListener("mousemove", mouseEventListener);
  window.addEventListener("keydown", keybEventListener);
  window.addEventListener("keyup", keybEventListener);
  createModelsFromData(getObjectsData());
  window.requestAnimationFrame(update);
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
  c.scale(0.5, 0.5);
  c.stroke(models["g1045"]);
  updateCollisionMap("g1045");
  c.restore();
  c.save();
  c.translate(100, 120);
  c.scale(0.5, 0.5);
  //c.rotate(angle);
  c.fillStyle = "white";
  c.fill(models["g939"]);
  c.stroke(models["g939"]);
  updateCollisionMap("g939");
  c.restore();
  // collisionChart["g939"].forEach((item) => {
  //   c.beginPath();
  //   c.rect(item.x, item.y, 5, 5);
  //   c.stroke();
  // });
  // collisionChart["g1045"].forEach((item) => {
  //   c.beginPath();
  //   c.rect(item.x, item.y, 5, 5);
  //   c.stroke();
  // });
  //console.log(testCollision('g939','g1045'));
};

update = (time) => {
  if (time - lastFrameTime < updatefrequency) {
    requestAnimationFrame(update);
    return;
  }

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
    g939: {
      transform: "",
      data: [
        "m61-155-1.5 5.3c3 1.4 6.1 2.9 9.3 4.4l2-6.9zm-9.8 34-97 328 11 2.1 96-324z",
        "m74-143-11 35c-44-40-128-48-161-50 60-31 153 5.8 172 15z",
      ],
    },
    g1045: {
      transform: "",
      data: [
        "m-5.9-108c0 13-6.3 28-17 28s-20-5.3-20-18c0-13 9.5-28 20-28s17 5.6 17 18z",
        "m0.69-108c0 13 6.3 28 17 28 11 0 20-5.3 20-18 0-13-9.5-28-20-28-11 0-17 5.6-17 18z",
        "m2-77c0.25 3-0.72 3.2-2 3.8-1.2 0.67-2.7-1.2-2.7-1.2s-1.3 1.9-2.6 1.2-2.2-0.88-2-3.8c0.25-3 4.6-7.7 4.6-7.7s4.4 4.7 4.6 7.7z",
        "m-60-97c-2.2 18 25 31 37 22",
        "m56-99c1.3 10-27 33-41 25",
        "m-32-72c1.5 8.9 3.7 8.6 8.5 11 6.4 3.5 49 5.5 49-12",
        "m-18-59 0.27-6",
        "m-3.4-58 0.18-6.2",
        "m10-59 0.17-7.1",
        "m3.5-125c-4.4-3.5-3.3-5.9-2.5-8.4",
        "m-7.9-125c4.7-2.9 3.8-5.5 3.3-8",
        "m58-77c1.5-66-60-82-60-82-38 23-60 49-62 83-1.1 27 62 28 59 36 7.1-16 63-17 63-37z",
        "m91 49a6.1 19 14 0 1-11 16 6.1 19 14 0 1-1.1-20 6.1 19 14 0 1 11-16 6.1 19 14 0 1 1.1 20z",
        "m-4.3-40c-82-11-73-31-72-34 10-54 38-83 72-105 50 17 71 52 80 104-8.7 30-47 31-80 35z",
        "m-31-44c-5.5 0.91-13 13-13 19-4.2 40-14 116-28 138l8.1-2.3 4.7 8.4 7-5.4 5 7.7",
        "m31-44c18 182 76 232 69 232l-36-8.2c-3.9 12-19 24-24 18-10-11-19 2.5-37 3.7-12 0.82-29-20-39-9.2-14 14-39 7.7-52 9.7 54-39 49-163 58-247",
        "m32-43c6.7-0.7 16 7.8 20 21 8.9 26 33 53 39 51",
        "m38 6.5c9.9 24 20 38 42 59",
        "m93 41c3.6 1 8.1 1 8.5-0.98 0.5-2-0.54-4.2-4.1-5.2-3.6-1-8.3-0.45-8.8 1.5-0.5 2 0.79 3.6 4.4 4.6z",
        "m92 47c3.8 1 8.6 0.99 9.1-1 0.52-2-0.6-4.2-4.4-5.2-3.8-1-8.8-0.42-9.3 1.6-0.52 2 0.86 3.7 4.7 4.7z",
        "m90 52c3.5 0.73 7.9 0.52 8.3-1.3 0.39-1.8-0.73-3.7-4.3-4.5-3.5-0.73-8.2 0.0012-8.6 1.8-0.39 1.8 0.95 3.2 4.5 4z",
        "m84 39c-0.89 4.1-0.93 9.2 0.78 9.7 1.7 0.55 3.6-0.66 4.5-4.7 0.89-4.1 0.45-9.5-1.3-10-1.7-0.55-3.1 0.94-4 5z",
      ],
    },
  };
};
