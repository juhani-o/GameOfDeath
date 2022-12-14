/* Game Of Death Version 0.9999
      By Juhani Ovalo */

var angle = 0;  // Rotating angle of scythe
var cnv = null; // Canvas
var c = null; // context
var models = []; // Path2D models are stored here
var updatefrequency = (1000 / 60) * (60 / 30) - (1000 / 60) * 0.5; // Frequency how often page is updated. Currently 30fps.
var lastFrameTime = 0;  // Check with this when page was updated last time. Don't touch this :)
var move_history_x = [];  // Store mouse movement history X here
var move_history_y = [];  // Store mouse movement history Y here
var g_x = 0;  // Grim's x location
var g_y = 0;  // Grim's y location

var collisionChart = {}; // Game items collision maps stored here
var scythe_x = 0; // Initial x location of scythe
var scythe_y = 0; // Initial y location of scythe
var debug = false;  // is debugging on. Key D is used to switch this
var scy_xv = 0; // Scythes x speed
var scy_yv = 0; // Scythes y speed
var scythe_speed = 25; // How fast scythe is flying
var x_testsize = 50; // Value for define bounding box Grim. 
var y_testsize = 70; // Height, same as row above.
var scy_ltc = 0; // Count how long scythe flies. Use this also to check is scythe flying.
var enemyLocationX = 0; // Initial enemy location X
var enemyLocationY = -30; // Initial enemy location Y
var enemy = null; // Active enemy.
var scythe_hit = false; // Has scythe hit enemy?

var enemylist = ["sun", "triskele", "ankh"];

var lifes = 3; // Count of lifes
var score = 0; // well, score
var difficulty = 0; // this will increase very slowly and affect to enemy speed

// After game over, reset values
resetValues = () => {
  playtime = 0;
  score = 0;
  difficulty = 0;
  lifes = 3;
};

// Create path from SVG data
create2DPath = (paths) => {
  if (!paths || paths.length === 0) return false;

  var tmp = new Path2D();
  for (let i = 0; i < paths.length; i++) {
    tmp.addPath(new Path2D(paths[i]));
  }
  return tmp;
};

// Mouse listerner event.
mouseEventListener = (e) => {
  if (e.type === "click" && !isMouseCaptured()) {
    if (lifes === 0) resetValues();
    cnv.requestPointerLock();
    return true;
  }
  if (e.type === "click" && scy_ltc === 0) {
    scy_ltc = 40;
  }
  if (scy_ltc === 0) {
    let x = e.movementX;
    let y = e.movementY;

    // Store history of movement
    if (move_history_x.push(x) > 10) move_history_x.shift();
    if (move_history_y.push(y) > 10) move_history_y.shift();

    // Calculate average of movement points. Trying to increase accuracy.
    let x_history = move_history_x.reduce((a, b) => a + b, 0) / 10;
    let y_history = move_history_y.reduce((a, b) => a + b, 0) / 10;

    // Let's calculate steady speed for thrown scythe
    let direction = Math.atan2(y_history, x_history);
    var y_motion = scythe_speed * Math.sin(direction);
    var x_motion = scythe_speed * Math.cos(direction);

    // set motion of scythe
    scy_xv = x_motion;
    scy_yv = y_motion;
  }
  // Move Grim
  g_x += e.movementX;
  g_y += e.movementY;

  // Keep main hero inside screen
  if (g_x > cnv.width - x_testsize) g_x = cnv.width - x_testsize;
  if (g_y > cnv.height - y_testsize) g_y = cnv.height - y_testsize;
  if (g_x < x_testsize) g_x = x_testsize;
  if (g_y < -y_testsize) g_y = cnv.height + y_testsize;
};

// Start point
main = () => {
  cnv = document.getElementById("ca");
  c = cnv.getContext("2d");
  cnv.requestPointerLock = cnv.requestPointerLock || cnv.mozRequestPointerLock;
  cnv.addEventListener("mousemove", mouseEventListener);
  cnv.addEventListener("click", mouseEventListener);
  window.addEventListener("keypress", handleKeybEvents);
  createModelsFromData(getObjectsData());
  window.requestAnimationFrame(update);
};

// Keyboard events
handleKeybEvents = (e) => {
  if ((e.key = "d")) {
    debug = !debug;
  }
};

// Calculate item's locations and check hits
calculateLocations = () => {
  // randomly create enemy.
  if (enemy === null && Math.random() > 0.99) {
    enemy = enemylist[Math.round(Math.random() * 2)];
    enemyLocationX = Math.round(Math.random() * cnv.width);
  }

  // If there is enemy
  if (enemy !== null) {
    enemyLocationY += 10 + difficulty;
    difficulty += 0.01; //  This speeds up enemies

    // Schythe hit's enemy, add points and delete current enemy
    if (scythe_hit) {
      enemy = null;
      enemyLocationY = -20;
      scythe_hit = false;
      score += 20;
    }

    // Enemy has passed through field, one life removed.
    if (enemyLocationY > cnv.height) {
      enemy = null;
      enemyLocationY = -20;
      lifes -= 1;
    }
  }

  //  If scythe lifetime counter is above zero, scythe is flying to given direction.
  //  If lifetime has passed, reset scythe's location to Grims hand
  if (scy_ltc > 0) {
    scythe_x = scythe_x + scy_xv;
    scythe_y = scythe_y + scy_yv;
    scy_ltc -= 1;
  } else {
    scythe_x = g_x;
    scythe_y = g_y;
  }
};

//  update collision coordinates of given item (scythe, grim, enemies etc.)
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

// Not so pixel-perfect check of object location, but should do the job.
testCollision = (item1, item2) => {
  return collisionChart[item1].some((object1) => {
    return collisionChart[item2].some((object2) => {
      return object1.x === object2.x && object1.y === object2.y;
    });
  });
};

// Check if mouse is captured in canvas
isMouseCaptured = () => {
  return (
    document.pointerLockElement === cnv ||
    document.mozPointerLockElement === cnv
  );
};

// Draw menu
drawMenu = (item) => {
  // Draw dialog base for menu
  let d_w = 800;
  let d_h = 400;
  let dlg_x = cnv.width / 2 - d_w / 2;
  let dlg_y = cnv.height / 2 - d_h / 2;
  c.fillStyle = "cornsilk";
  c.fillRect(dlg_x, dlg_y, d_w, d_h);
  c.strokeStyle = "black";
  c.strokeRect(dlg_x, dlg_y, d_w, d_h);

  // Game over menu
  if (item == "gameover") {
    c.fillStyle = "black";
    c.font = "36px serif";
    c.textAlign = "center";
    c.fillText("Game OVER!", dlg_x + d_w / 2, dlg_y + 48);
    c.font = "24px serif";
    c.fillText(
      "Your final result; Score:" +
        score +
        " difficulty/speed factor:" +
        Math.round(difficulty),
      dlg_x + d_w / 2,
      dlg_y + 90
    );
    c.fillText("Please try again!", dlg_x + d_w / 2, dlg_y + 120);
    return true;
  }

  //  Main menu
  c.fillStyle = "black";
  c.font = "36px serif";
  c.textAlign = "center";
  c.fillText("Game of death", dlg_x + d_w / 2, dlg_y + 48);
  c.font = "20px serif";
  c.fillText(
    "Control Grim with mouse, and throw scythe's to intercept incoming 'enemies'.",
    dlg_x + d_w / 2,
    dlg_y + 90
  );
  c.fillText(
    "You can pause game with 'ESC' (which also releases mouse) and ",
    dlg_x + d_w / 2,
    dlg_y + 120
  );
  c.fillText(
    "by pressing 'D' You can see some debug stuff.",
    dlg_x + d_w / 2,
    dlg_y + 150
  );
  c.fillText(
    "Hit 'enemies' with scythe before they hit You!",
    dlg_x + d_w / 2,
    dlg_y + 180
  );
};

// Main draw routine
draw = () => {
  angle = angle + 0.1;
  c.clearRect(0, 0, c.canvas.clientWidth, c.canvas.clientHeight);
  //  Did not finish good looking background color so let's keep clearRect
  // var g = c.createLinearGradient(0, 0, 0, cnv.height);
  // g.addColorStop(0, "#0000ff");
  // g.addColorStop(0.3, "#ffffff");
  // c.fillStyle = g;
  // c.fillRect(0, 0, cnv.width, cnv.height);

  // show life's(deaths) and score
  c.save();
  c.fillStyle = "black";
  c.font = "36px serif";
  c.textAlign = "left";
  c.fillText("Deaths:" + lifes + " Score:" + score, 20, 30);
  c.restore();

  // draw some minimalistic landscape as background
  c.save();
  c.translate(0, 0);
  c.scale(1.5, 1.5);
  c.stroke(models["vuoristo"]);
  c.restore();

  // moon
  c.save();
  c.fillStyle="yellow";
  c.translate(0, 0);
  c.scale(1.5, 1.5);
  c.fill(models["kuu"]);
  c.stroke(models["kuu"]);
  c.restore();

  // grim reaper
  c.save();
  c.translate(g_x, g_y);
  c.fillStyle = "white";
  c.fill(models["viikatemies"]);
  c.stroke(models["viikatemies"]);
  updateCollisionMap("viikatemies");
  c.restore();

  // scythe
  c.save();
  c.translate(50 + scythe_x, 20 + scythe_y);

  // If scythe is thrown, rotate it
  if (scy_ltc > 0) c.rotate(angle);

  c.fillStyle = "white";
  c.fill(models["viikate"]);
  c.stroke(models["viikate"]);
  updateCollisionMap("viikate");
  c.restore();

  // If there is enemy, draw it
  if (enemy !== null) {
    c.save();
    c.translate(enemyLocationX, enemyLocationY);
    c.scale(3, 3);
    // Some hard-coded coloring for sun. Did not have time to
    // create working export from Inkscape
    if (enemy === "sun") {
      c.fillStyle = "yellow";
      c.fill(models["sun"]);
      c.strokeStyle = "black";
      c.stroke(models["sun"]);
    } else {
      c.fillStyle = "black";
      c.fill(models[enemy]);
    }
    updateCollisionMap(enemy);
    c.restore();
    if (testCollision("viikate", enemy) && scy_ltc > 0) {
      scythe_hit = true;
    }
  }

  // Debug to show collision points.
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
    if (enemy !== null) {
      collisionChart[enemy].forEach((item) => {
        c.beginPath();
        c.rect(item.x, item.y, 5, 5);
        c.stroke();
      });
    }
  }
};

//  Update 
update = (time) => {
  if (time - lastFrameTime < updatefrequency) {
    requestAnimationFrame(update);
    return;
  }

  if (lifes === 0) {
    document.exitPointerLock();
    drawMenu("gameover");
  } else if (!isMouseCaptured()) {
    drawMenu();
  } else {
    calculateLocations();
    draw();
  }
  lastFrameTime = time;
  requestAnimationFrame(update);
};

// Create Path2D objects. Data below is stripped from SVG
createModelsFromData = (data) => {
  let modelsTemp = [];
  for (const [key, value] of Object.entries(data)) {
    modelsTemp[key] = create2DPath(value["data"]);
  }
  models = modelsTemp;
};

// Main objects for game. Data is extracted from Inkscape optimized SVG
getObjectsData = () => {
  return {
    viikate: {
      transform: "",
      data: [
        "m34-100-.89 2.9c-1.7-.15-3.4-.29-5.1-.35l1.1-3.7zm-5.9 19-53 178-5.1-1.7 53-175z",
        "m25-99-5.5 19c30-7 68 11 82 19-16-30-66-37-77-38z",
      ],
    },
    viikatemies: {
      transform: "",
      data: [
        "m-.79-66c0 6.4-3.2 14-8.7 14s-10-2.7-10-9.1 4.8-14 10-14c5.5 0 8.7 2.9 8.7 9.3z",
        "m2.5-66c0 6.4 3.2 14 8.7 14s10-2.7 10-9.1-4.8-14-10-14c-5.5 0-8.7 2.9-8.7 9.3z",
        "m3.2-50c.13 1.5-.37 1.6-1 2-.63.34-1.4-.6-1.4-.6s-.67.94-1.3.6-1.1-.45-1-2c.13-1.5 2.3-3.9 2.3-3.9s2.2 2.4 2.3 3.9z",
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
        "m48 15c1.8.37 4 .26 4.2-.67s-.37-1.9-2.2-2.3c-1.8-.37-4.1 6e-4-4.3.93-.2.93.48 1.6 2.3 2z",
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
        "m13 6.7c.7-5.6 7.9 3.3 2 4.8-6.8 4.2-13-6.6-7.3-11 6-6.6 18-.48 17 8 .16 8.9-11 15-18 10-5.4-2.2-7.9-8-8.6-13-2.1-8-15-11-19-3.3-4.8 5.8 1.8 16 9 13 7.2-1.9 1-15-3.1-7.4.79 1.9 4.7 1.1 1.7 3.9-7.3 2.4-7.2-9.6-.45-9.7 8.2-1.7 12 10 5.8 15-6.4 6.3-18 .63-18-7.9-1.4-9.9 10-18 19-13 7 3.2 16-2.3 16-10 .39-7.7-11-12-15-5.8-4.7 4.7 3.1 13 7.5 7.7 2.1-4-3-3.7-3.7-2-4.8-5.7 8.6-7.9 7.7-.29.75 8.4-12 11-15 3.2-4.9-7.8 3.8-18 12-15 8.8 1.4 13 12 8.4 20-2.1 4.5-8 6.3-8.2 12-1.4 6.7 4.7 14 12 12 7.3-.84 9.8-13 2.1-15-6-3.1-10 8.8-2.6 7.2l.11-.42-.36-1.3z",
      ],
    },
    sun: {
      transform: "",
      data: [
        "m20-.28a20 20 0 01-20 20 20 20 0 01-20-20 20 20 0 0120-20 20 20 0 0120 20z",
        "m35-.28c-8.5 3.2-21 5.7-2.8 14-7.1.89-22-3-7.6 11-8.2-3.6-19-11-11 7.6-6.1-6.4-14-18-14 2.8-3.5-6.2-4.8-21-14-2.8-.036-7.2 4.2-20-11-7.6 10-15 3.3-15-7.6-11-1.8-4.2 9.6-8.5 9.6-13 0-4.9-9.4-14-9.4-14s23 13 6.2-9.8c8.9 5.3 18 6 13-9.8 5.9 9.4 12 16 14-2.8 2.2 10 4.7 19 14 2.8-1.9 11-1.5 19 11 7.6-5.4 9.4-8.3 17 7.6 11-6 6.4-19 15 2.8 14z",
      ],
    },
    kuu: {
      transform: "",
      data: [
        "m136 57a47 47 0 00-47 47 47 47 0 0047 47 47 47 0 0016-2.7 47 47 0 01-33-45 47 47 0 0132-45 47 47 0 00-14-2.2z",
      ],
    },
    vuoristo: {
      transform: "",
      data: [
        "m1.6 340 109-33 105 33 15-43 22 42 54-42 21 44 97-20 24 17 53-31 35 28 44-26 54 28 44-55 14 32 46-26",
        "m1.2 256 62-74s5.1 43 44 68c39 25 89 21 89 21s59-27 92-58c33-31 32-36 32-36s6 39 17 57c11 18 72 39 72 39l140 3.6s54-13 89-47c34-34 71-82 71-82s20 57 31 74",
        "m266 232c23 7.4 47 8.7 71 4.1",
        "m25 228c19 3.3 39 2 58 .077",
      ],
    },
  };
};
