(function () {
  "use strict";

  var SCENARIOS = {
    welcome: {
      id: "welcome",
      label: "Arrival Street",
      buddyStart: "Welcome to Roadsville. Tap what you notice.",
      hint: "Tap glowing spots · 3 notices",
      mode: "explore",
      needNotices: 3,
      buddyDone: "The road is a shared puzzle. Ready for the junction?",
      bridgeChapter: "welcome",
      bridgeScene: "welcome_explore",
    },
    junction: {
      id: "junction",
      label: "Busy Junction",
      buddyStart: "Someone is still crossing.",
      hint: "What should we do?",
      mode: "choose",
      choices: [
        { label: "Go now", safe: false },
        { label: "Wait until clear", safe: true },
        { label: "Honk repeatedly", safe: false },
      ],
      feedbackSafe: "Good. Give people time and space.",
      feedbackUnsafe: "Look again — the road is shared.",
      bridgeChapter: "busy_junction",
      bridgeScene: "junction_pedestrian",
    },
    signstop: {
      id: "signstop",
      label: "Stop Ahead",
      buddyStart: "This one is very clear.",
      hint: "You reach the Stop.",
      mode: "choose",
      choices: [
        { label: "Roll through if clear", safe: false },
        { label: "Full stop, then look", safe: true },
        { label: "Honk and continue", safe: false },
      ],
      feedbackSafe: "Stop means stop. Then continue when safe.",
      feedbackUnsafe: "Rolling through skips the point of the sign.",
      bridgeChapter: "sign_forest",
      bridgeScene: "signs_stop",
    },
  };

  var canvas = document.getElementById("c");
  var menu = document.getElementById("menu");
  var hud = document.getElementById("hud");
  var buddyEl = document.getElementById("buddy");
  var buddyText = document.getElementById("buddyText");
  var choicesEl = document.getElementById("choices");
  var hintEl = document.getElementById("hint");
  var sceneLabel = document.getElementById("sceneLabel");
  var btnMap = document.getElementById("btnMap");

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x87b7e8, 1);
  renderer.shadowMap.enabled = true;

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x87b7e8, 18, 55);

  var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
  camera.position.set(0, 7.2, 12.5);
  camera.lookAt(0, 0.5, 0);

  var clock = new THREE.Clock();
  var raycaster = new THREE.Raycaster();
  var pointer = new THREE.Vector2();
  var interactives = [];
  var glowMarkers = [];
  var worldRoot = new THREE.Group();
  scene.add(worldRoot);

  var state = {
    scenario: null,
    notices: 0,
    noticed: {},
    decided: false,
    animCars: [],
  };

  function bridge(fn, a, b, c) {
    try {
      if (window.AndroidQuest && typeof window.AndroidQuest[fn] === "function") {
        window.AndroidQuest[fn](a, b, c);
      }
    } catch (e) { /* ignore */ }
  }

  function say(text) {
    buddyText.textContent = text || "";
    buddyEl.classList.toggle("show", !!text);
  }

  function resize() {
    var w = window.innerWidth || canvas.clientWidth || 360;
    var h = window.innerHeight || canvas.clientHeight || 640;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  function box(w, h, d, color, x, y, z) {
    var m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.85, metalness: 0.05 })
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  function cyl(r, h, color, x, y, z) {
    var m = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, h, 12),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 })
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    return m;
  }

  function makeTapTarget(id, mesh, label) {
    mesh.userData.questId = id;
    mesh.userData.label = label || id;
    interactives.push(mesh);
  }

  function clearWorld() {
    while (worldRoot.children.length) worldRoot.remove(worldRoot.children[0]);
    interactives = [];
    glowMarkers.forEach(function (g) { if (g.el.parentNode) g.el.parentNode.removeChild(g.el); });
    glowMarkers = [];
    state.animCars = [];
    state.notices = 0;
    state.noticed = {};
    state.decided = false;
    choicesEl.innerHTML = "";
    hintEl.textContent = "";
  }

  function addLights() {
    worldRoot.add(new THREE.HemisphereLight(0xdce9ff, 0x3d4a3a, 0.85));
    var sun = new THREE.DirectionalLight(0xfff2d6, 0.95);
    sun.position.set(8, 14, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    worldRoot.add(sun);
  }

  function addGroundRoad() {
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x3f7a45, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    worldRoot.add(ground);

    var road = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 40),
      new THREE.MeshStandardMaterial({ color: 0x3a3f48, roughness: 0.95 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.02;
    road.receiveShadow = true;
    worldRoot.add(road);

    for (var i = -8; i <= 8; i++) {
      worldRoot.add(box(0.18, 0.04, 1.1, 0xf2e9a8, 0, 0.05, i * 2.2));
    }
  }

  function addBuildings() {
    var colors = [0xc9896a, 0xd6b48c, 0x8aa6c1, 0xb7c4a5];
    for (var i = 0; i < 6; i++) {
      var side = i < 3 ? -1 : 1;
      var z = (i % 3) * 6 - 6;
      var h = 2.2 + (i % 3) * 0.7;
      worldRoot.add(box(2.4, h, 2.2, colors[i % colors.length], side * 7.2, h / 2, z));
    }
    worldRoot.add(box(2.6, 0.12, 1.2, 0xd94f3d, -7.2, 2.1, -1));
  }

  function addTrees() {
    for (var i = 0; i < 5; i++) {
      var x = (i % 2 === 0 ? -1 : 1) * (9.5 + (i % 3) * 0.3);
      var z = -10 + i * 4.5;
      worldRoot.add(cyl(0.12, 0.9, 0x6b4a2e, x, 0.45, z));
      var crown = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x2f8f4e })
      );
      crown.position.set(x, 1.3, z);
      crown.castShadow = true;
      worldRoot.add(crown);
    }
  }

  function makeCar(color, x, z) {
    var g = new THREE.Group();
    g.add(box(1.6, 0.55, 3.0, color, 0, 0.45, 0));
    g.add(box(1.4, 0.45, 1.5, 0x9ec9ff, 0, 0.95, -0.15));
    g.position.set(x, 0, z);
    worldRoot.add(g);
    return g;
  }

  function makeBus(x, z) {
    var g = new THREE.Group();
    var body = box(2.1, 1.6, 5.2, 0xd9a441, 0, 0.95, 0);
    g.add(body);
    g.add(box(1.9, 0.7, 4.4, 0x7ec8ff, 0, 1.55, 0));
    g.position.set(x, 0, z);
    worldRoot.add(g);
    makeTapTarget("bus", body, "Bus stop");
    return g;
  }

  function makeScooter(x, z) {
    var g = new THREE.Group();
    var body = box(0.55, 0.35, 1.4, 0x4cc9c0, 0, 0.45, 0);
    g.add(body);
    g.add(cyl(0.18, 0.08, 0x222222, 0, 0.18, 0.5));
    g.add(cyl(0.18, 0.08, 0x222222, 0, 0.18, -0.5));
    g.position.set(x, 0, z);
    g.rotation.y = 0.55;
    worldRoot.add(g);
    makeTapTarget("scooter", body, "Parked scooter");
    return g;
  }

  function makePedestrian(x, z, id) {
    var g = new THREE.Group();
    g.add(cyl(0.22, 0.7, 0xf0c7a0, 0, 0.7, 0));
    var head = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xf0c7a0 })
    );
    head.position.y = 1.2;
    var shirt = box(0.5, 0.55, 0.35, 0x3d6bb3, 0, 0.85, 0);
    g.add(head);
    g.add(shirt);
    g.position.set(x, 0, z);
    worldRoot.add(g);
    makeTapTarget(id || "ped", shirt, "Pedestrian");
    return g;
  }

  function makeSignal(x, z) {
    worldRoot.add(cyl(0.08, 3.2, 0x555555, x, 1.6, z));
    var head = box(0.35, 1.0, 0.25, 0x222222, x, 3.2, z);
    worldRoot.add(head);
    var red = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xaa0000 })
    );
    red.position.set(x, 3.45, z + 0.12);
    worldRoot.add(red);
    makeTapTarget("signal", head, "Signal");
  }

  function makeStopSign(x, z) {
    worldRoot.add(cyl(0.06, 2.2, 0x666666, x, 1.1, z));
    var oct = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.08, 8),
      new THREE.MeshStandardMaterial({ color: 0xc62828, emissive: 0x400000 })
    );
    oct.rotation.x = Math.PI / 2;
    oct.position.set(x, 2.35, z);
    worldRoot.add(oct);
  }

  function projectGlow(mesh) {
    var el = document.createElement("div");
    el.className = "tap-glow";
    hud.appendChild(el);
    glowMarkers.push({ el: el, obj: mesh, id: mesh.userData.questId });
  }

  function updateGlows() {
    var w = renderer.domElement.clientWidth;
    var h = renderer.domElement.clientHeight;
    glowMarkers.forEach(function (g) {
      if (state.noticed[g.id]) {
        g.el.style.display = "none";
        return;
      }
      var v = new THREE.Vector3();
      g.obj.getWorldPosition(v);
      v.project(camera);
      var x = (v.x * 0.5 + 0.5) * w;
      var y = (-v.y * 0.5 + 0.5) * h;
      if (v.z > 1) {
        g.el.style.display = "none";
      } else {
        g.el.style.display = "block";
        g.el.style.left = x + "px";
        g.el.style.top = y + "px";
      }
    });
  }

  function buildWelcome() {
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    makeBus(-2.6, -4.5);
    makeScooter(3.2, 1.5);
    makePedestrian(2.4, 4.2, "crossing");
    makeSignal(3.6, -2);
    state.animCars.push({ mesh: makeCar(0x4f7cac, -1.5, 8), speed: -2.4 });
    state.animCars.push({ mesh: makeCar(0xb85c38, 1.6, -12), speed: 3.1 });
    worldRoot.add(box(0.55, 0.35, 0.9, 0x8d6e4c, -3.5, 0.25, 2.5));
    interactives.forEach(projectGlow);
  }

  function buildJunction() {
    addLights();
    addGroundRoad();
    var cross = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 7),
      new THREE.MeshStandardMaterial({ color: 0x3a3f48 })
    );
    cross.rotation.x = -Math.PI / 2;
    cross.position.set(0, 0.021, 0);
    worldRoot.add(cross);
    addBuildings();
    makeSignal(3.4, 3.4);
    makePedestrian(0.2, 1.6, "crossing");
    for (var i = -3; i <= 3; i++) {
      worldRoot.add(box(0.55, 0.03, 2.4, 0xf5f5f5, i * 0.7, 0.04, 1.4));
    }
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.4, 9), speed: -1.2, stopZ: 3.2 });
    var side = makeCar(0xd9843b, 8, 1.4);
    side.rotation.y = Math.PI / 2;
  }

  function buildSignStop() {
    addLights();
    addGroundRoad();
    addTrees();
    addBuildings();
    makeStopSign(-2.8, 2.5);
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.4, 8), speed: -1.6, stopZ: 3.0 });
    makeCar(0x888888, 1.5, -6);
  }

  function showChoices(sc) {
    choicesEl.innerHTML = "";
    sc.choices.forEach(function (ch, idx) {
      var btn = document.createElement("button");
      btn.className = "choice";
      btn.textContent = ch.label;
      btn.onclick = function () { onChoose(sc, idx, ch, btn); };
      choicesEl.appendChild(btn);
    });
  }

  function onChoose(sc, idx, ch, btn) {
    if (state.decided) return;
    Array.prototype.forEach.call(choicesEl.children, function (el) { el.disabled = true; });
    if (ch.safe) {
      btn.classList.add("good");
      state.decided = true;
      say(sc.feedbackSafe);
      hintEl.textContent = "Nice. Returning…";
      bridge("onSceneResult", sc.bridgeChapter || sc.id, sc.bridgeScene || sc.id, "1");
      setTimeout(function () {
        showMenu();
        bridge("onScenarioComplete", sc.id, "1");
      }, 1400);
    } else {
      btn.classList.add("bad");
      say(sc.feedbackUnsafe);
      hintEl.textContent = "Try again";
      bridge("onSceneResult", sc.bridgeChapter || sc.id, sc.bridgeScene || sc.id, "0");
      setTimeout(function () {
        Array.prototype.forEach.call(choicesEl.children, function (el) {
          el.disabled = false;
          el.classList.remove("bad");
        });
      }, 900);
    }
  }

  function onNotice(id, label) {
    if (state.noticed[id]) return;
    state.noticed[id] = true;
    state.notices += 1;
    var lines = {
      bus: "Bus stop — people need space.",
      scooter: "Awkward park — blocks sightlines.",
      crossing: "Someone waiting to cross.",
      signal: "Signals share timing for everyone.",
    };
    say(lines[id] || ("Noticed: " + (label || id)));
    var sc = state.scenario;
    hintEl.textContent = "Noticed " + state.notices + " / " + sc.needNotices;
    if (state.notices >= sc.needNotices) {
      say(sc.buddyDone);
      hintEl.textContent = "District noticed";
      bridge("onSceneResult", sc.bridgeChapter || sc.id, sc.bridgeScene || sc.id, "1");
      setTimeout(function () {
        showMenu();
        bridge("onScenarioComplete", sc.id, "1");
      }, 1600);
    }
  }

  function pickObject(clientX, clientY) {
    var rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    var hits = raycaster.intersectObjects(interactives, true);
    if (!hits.length) return;
    var obj = hits[0].object;
    while (obj && !obj.userData.questId && obj.parent) obj = obj.parent;
    if (obj && obj.userData.questId) onNotice(obj.userData.questId, obj.userData.label);
  }

  canvas.addEventListener("pointerdown", function (e) {
    if (!state.scenario || state.scenario.mode !== "explore") return;
    var t = e.changedTouches ? e.changedTouches[0] : e;
    pickObject(t.clientX, t.clientY);
  });

  function loadScenario(id) {
    var sc = SCENARIOS[id];
    if (!sc) return;
    clearWorld();
    state.scenario = sc;
    menu.style.display = "none";
    hud.style.display = "flex";
    sceneLabel.textContent = sc.label;
    say(sc.buddyStart);
    hintEl.textContent = sc.hint || "";
    if (id === "welcome") buildWelcome();
    else if (id === "junction") buildJunction();
    else if (id === "signstop") buildSignStop();
    if (sc.mode === "choose") showChoices(sc);
    bridge("onScenarioStart", id);
    resize();
  }

  function showMenu() {
    clearWorld();
    state.scenario = null;
    hud.style.display = "none";
    menu.style.display = "flex";
    say("");
  }

  Array.prototype.forEach.call(document.querySelectorAll(".scenario-btn"), function (btn) {
    btn.addEventListener("click", function () {
      loadScenario(btn.getAttribute("data-id"));
    });
  });
  btnMap.addEventListener("click", function () {
    showMenu();
    bridge("onExitToMap");
  });

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();
    var dt = Math.min(clock.getDelta(), 0.05);
    state.animCars.forEach(function (c) {
      if (!c.speed) return;
      c.mesh.position.z += c.speed * dt;
      if (c.stopZ !== undefined && c.speed < 0 && c.mesh.position.z <= c.stopZ) {
        c.mesh.position.z = c.stopZ;
        c.speed = 0;
      }
      if (c.mesh.position.z < -18) c.mesh.position.z = 16;
      if (c.mesh.position.z > 18) c.mesh.position.z = -16;
    });
    if (state.scenario) {
      camera.position.x = Math.sin(t * 0.25) * 0.35;
      camera.lookAt(0, 0.6, 0);
    }
    updateGlows();
    renderer.render(scene, camera);
  }

  window.QuestWorld = {
    loadScenario: loadScenario,
    showMenu: showMenu,
    scenarios: Object.keys(SCENARIOS),
  };

  resize();
  animate();
  bridge("onReady");
})();
