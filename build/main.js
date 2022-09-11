var angle=0,cnv=null,c=null,models=[],updatefrequency=25,lastFrameTime=0,g_x=0,g_y=0,v_x=0,v_y=0,collisionChart={},scythe_x=0,scythe_y=0,debug=!1,keysDown=new Set,scy_xv=0,scy_yv=0,scythe_speed=5,x_testsize=100,y_testsize=200;create2DPath=e=>{if(!e||0===e.length)return!1;var t=new Path2D;for(let c=0;c<e.length;c++)t.addPath(new Path2D(e[c]));return t},mouseEventListener=e=>{console.log(e.type),cnv.requestPointerLock(),g_x+=e.movementX,g_y+=e.movementY,g_x>cnv.width+x_testsize&&(g_x=-x_testsize),g_y>cnv.height+y_testsize&&(g_y=-y_testsize),g_x<-x_testsize&&(g_x=cnv.width-x_testsize),g_y<-y_testsize&&(g_y=cnv.height+y_testsize)},main=()=>{cnv=document.getElementById("ca"),c=cnv.getContext("2d"),cnv.requestPointerLock=cnv.requestPointerLock||cnv.mozRequestPointerLock,cnv.addEventListener("mousemove",mouseEventListener),cnv.addEventListener("click",mouseEventListener),window.addEventListener("keypress",handleKeybEvents),createModelsFromData(getObjectsData()),window.requestAnimationFrame(update)},handleKeybEvents=e=>{(e.key="d")&&(debug=!debug)},calculateLocations=()=>{var e=g_x,t=g_y;g_x=e+=v_x/=1.1,g_y=t+=v_y/=1.1,0!==scy_xv||0!==scy_yv?(scythe_x+=scy_xv,scythe_y+=scy_yv):(scythe_x=g_x,scythe_y=g_y)},updateCollisionMap=e=>{for(var t=[],s=0;s<cnv.clientWidth;s+=10)for(var a=0;a<cnv.clientHeight;a+=10)c.isPointInPath(models[e],s,a)&&t.push({x:s,y:a});collisionChart[e]=t},testCollision=(e,t)=>collisionChart[e].some((e=>collisionChart[t].some((t=>e.x===t.x&&e.y===t.y)))),isMouseCaptured=()=>document.pointerLockElement===cnv||document.mozPointerLockElement===cnv,drawMenu=()=>{let e=800,t=cnv.width/2-400,s=cnv.height/2-200;c.fillStyle="cornsilk",c.fillRect(t,s,e,400),c.strokeStyle="black",c.strokeRect(t,s,e,400),c.fillStyle="black",c.font="36px serif",c.textAlign="center",c.fillText("Game of death",t+400,s+48),c.font="24px serif",c.fillText("Control Grim with mouse, and throw scythe's to intercept incoming 'enemies'.",t+400,s+90),c.fillText("You can pause game with 'ESC' (which also releases mouse) and ",t+400,s+120),c.fillText("by pressing 'D' You can see some debug stuff.",t+400,s+150),c.fillText("Hit 'enemies' with scythe before they hit You!",t+400,s+180)},draw=()=>{angle+=.1,c.clearRect(0,0,c.canvas.clientWidth,c.canvas.clientHeight),c.save(),c.translate(g_x,g_y),c.stroke(models.viikatemies),updateCollisionMap("viikatemies"),c.restore(),c.save(),c.translate(50+scythe_x,20+scythe_y),0===scy_yv&&0===scy_xv||c.rotate(angle),c.fillStyle="white",c.fill(models.viikate),c.stroke(models.viikate),updateCollisionMap("viikate"),c.restore(),c.save(),c.translate(260,120),c.stroke(models.sun),c.restore(),debug&&(collisionChart.viikate.forEach((e=>{c.beginPath(),c.rect(e.x,e.y,5,5),c.stroke()})),collisionChart.viikatemies.forEach((e=>{c.beginPath(),c.rect(e.x,e.y,5,5),c.stroke()})))},update=e=>{e-lastFrameTime<updatefrequency||(isMouseCaptured()?(calculateLocations(),draw()):drawMenu(),lastFrameTime=e),requestAnimationFrame(update)},createModelsFromData=e=>{let t=[];for(const[c,s]of Object.entries(e))t[c]=create2DPath(s.data);models=t},getObjectsData=()=>({viikate:{transform:"",data:["m34-100-.89 2.9c-1.7-.15-3.4-.29-5.1-.35l1.1-3.7zm-5.9 19-53 178-5.1-1.7 53-175z","m25-99-5.5 19c30-7 68 11 82 19-16-30-66-37-77-38z"]},viikatemies:{transform:"",data:["m-.79-66c0 6.4-3.2 14-8.7 14s-10-2.7-10-9.1 4.8-14 10-14c5.5 0 8.7 2.9 8.7 9.3z","m2.5-66c0 6.4 3.2 14 8.7 14s10-2.7 10-9.1-4.8-14-10-14c-5.5 0-8.7 2.9-8.7 9.3z","m3.2-50c.13 1.5-.37 1.6-1 2-.63.34-1.4-.6-1.4-.6s-.67.94-1.3.6-1.1-.45-1-2c.13-1.5 2.3-3.9 2.3-3.9s2.2 2.4 2.3 3.9z","m-28-60c-1.1 9.2 13 16 19 11","m31-61c.68 5.1-14 17-21 13","m-14-48c.79 4.5 1.9 4.4 4.3 5.7 3.2 1.8 25 2.8 25-6","m-6.7-41 .14-3.1","m.46-41 .09-3.1","m7.5-41 .089-3.6","m4-75c-2.2-1.8-1.7-3-1.3-4.2","m-1.8-75c2.4-1.5 1.9-2.8 1.7-4.1","m32-51c.77-33-30-42-30-42-19 12-30 25-31 42-.57 13 31 14 30 19 3.6-7.9 32-8.8 32-19z","m48 14a3.1 9.6 14 01-5.4 8.3 3.1 9.6 14 01-.57-10 3.1 9.6 14 015.4-8.3 3.1 9.6 14 01.57 10z","m-.0091-32c-41-5.6-37-15-37-17 5.2-28 19-42 37-53 25 8.9 36 26 41 53-4.4 15-24 16-41 18z","m-14-34c-2.8.46-6.5 6.7-6.8 9.6-2.1 20-7.3 59-14 70l4.1-1.1 2.4 4.3 3.6-2.8 2.5 3.9","m18-34c9.3 93 38 118 35 118l-18-4.2c-2 6-9.5 12-12 9.4-5.1-5.4-9.7 1.2-19 1.9-6.1.42-15-10-20-4.7-7.1 7.2-20 3.9-27 4.9 27-20 25-83 29-125","m18-33c3.4-.36 7.9 4 10 11 4.5 13 17 27 20 26","m21-8c5 12 10 19 21 30","m50 9.6c1.8.51 4.1.51 4.3-.5.25-1-.28-2.1-2.1-2.6-1.8-.51-4.2-.23-4.5.78-.25 1 .4 1.8 2.2 2.3z","m49 13c1.9.51 4.3.5 4.6-.53.26-1-.3-2.2-2.2-2.7-1.9-.51-4.5-.21-4.7.82-.26 1 .44 1.9 2.4 2.4z","m48 15c1.8.37 4 .26 4.2-.67s-.37-1.9-2.2-2.3c-1.8-.37-4.1 6e-4-4.3.93-.2.93.48 1.6 2.3 2z","m45 8.3c-.45 2.1-.47 4.7.39 4.9.87.28 1.8-.33 2.3-2.4.45-2.1.23-4.8-.64-5.1-.87-.28-1.6.47-2 2.5z"]},ankh:{transform:"",data:["m15 2.5-13-.91 2.7 24h-9.2l2.7-24-13 .91v-6l11 1.4c-2.1-3.2-5.5-8.8-5.5-14 0-5.5 3.6-11 8.6-11s8.6 5.2 8.6 11c0 5.3-3.4 11-5.5 14l11-1.4zm-18-24c-.52.65-.91 1.5-1.2 2.5-.26.97-.45 1.9-.45 3 0 1.9.52 4.2 1.7 6.7.97 2.3 2.3 4.4 3.4 6.2 1.1-1.8 2.4-3.9 3.4-6.2 1.1-2.5 1.7-4.8 1.7-6.7 0-.97-.13-2-.45-3-.26-.91-.71-1.8-1.2-2.5-.65-.84-1.8-1.9-3.4-1.9-1.7 0-2.9 1-3.5 1.9z"]},triskele:{transform:"",data:["m13 6.7c.7-5.6 7.9 3.3 2 4.8-6.8 4.2-13-6.6-7.3-11 6-6.6 18-.48 17 8 .16 8.9-11 15-18 10-5.4-2.2-7.9-8-8.6-13-2.1-8-15-11-19-3.3-4.8 5.8 1.8 16 9 13 7.2-1.9 1-15-3.1-7.4.79 1.9 4.7 1.1 1.7 3.9-7.3 2.4-7.2-9.6-.45-9.7 8.2-1.7 12 10 5.8 15-6.4 6.3-18 .63-18-7.9-1.4-9.9 10-18 19-13 7 3.2 16-2.3 16-10 .39-7.7-11-12-15-5.8-4.7 4.7 3.1 13 7.5 7.7 2.1-4-3-3.7-3.7-2-4.8-5.7 8.6-7.9 7.7-.29.75 8.4-12 11-15 3.2-4.9-7.8 3.8-18 12-15 8.8 1.4 13 12 8.4 20-2.1 4.5-8 6.3-8.2 12-1.4 6.7 4.7 14 12 12 7.3-.84 9.8-13 2.1-15-6-3.1-10 8.8-2.6 7.2l.11-.42-.36-1.3z"]},sun:{transform:"",data:["m20-.28a20 20 0 01-20 20 20 20 0 01-20-20 20 20 0 0120-20 20 20 0 0120 20z","m35-.28c-8.5 3.2-21 5.7-2.8 14-7.1.89-22-3-7.6 11-8.2-3.6-19-11-11 7.6-6.1-6.4-14-18-14 2.8-3.5-6.2-4.8-21-14-2.8-.036-7.2 4.2-20-11-7.6 10-15 3.3-15-7.6-11-1.8-4.2 9.6-8.5 9.6-13 0-4.9-9.4-14-9.4-14s23 13 6.2-9.8c8.9 5.3 18 6 13-9.8 5.9 9.4 12 16 14-2.8 2.2 10 4.7 19 14 2.8-1.9 11-1.5 19 11 7.6-5.4 9.4-8.3 17 7.6 11-6 6.4-19 15 2.8 14z"]}});
