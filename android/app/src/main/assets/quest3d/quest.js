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
      buddyDone: "The road is a shared puzzle.",
      bridgeChapter: "welcome",
      bridgeScene: "welcome_explore",
      build: "welcome",
    },
    basics: {
      id: "basics",
      label: "Road Basics",
      buddyStart: "A road is not just a big empty strip. Tap each part.",
      hint: "Tap · edge · lane · centre · crossing",
      mode: "explore",
      needNotices: 4,
      buddyDone: "Much clearer. Predictable roads keep everyone safer.",
      bridgeChapter: "road_basics",
      bridgeScene: "basics_explore",
      build: "basics",
    },
    lanes: {
      id: "lanes",
      label: "Stay Predictable",
      buddyStart: "This vehicle is drifting.",
      hint: "What should the driver do?",
      mode: "choose",
      choices: [
        { label: "Keep drifting — others will adapt", safe: false },
        { label: "Check, indicate, settle in lane", safe: true },
        { label: "Cut across without looking", safe: false },
      ],
      feedbackSafe: "Other road users should not have to guess your next move.",
      feedbackUnsafe: "Wandering or sudden cuts create confusion.",
      bridgeChapter: "road_basics",
      bridgeScene: "basics_lane",
      build: "lanes",
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
      build: "signstop",
    },
    warning: {
      id: "warning",
      label: "Warning Ahead",
      buddyStart: "A warning says: pay attention.",
      hint: "Best response?",
      mode: "choose",
      choices: [
        { label: "Ignore until something happens", safe: false },
        { label: "Prepare — slow / heighten attention", safe: true },
        { label: "Speed up to pass the hazard", safe: false },
      ],
      feedbackSafe: "Warnings buy you time. Use that time.",
      feedbackUnsafe: "Warnings exist because the road ahead may surprise you.",
      bridgeChapter: "sign_forest",
      bridgeScene: "signs_warning",
      build: "warning",
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
      build: "junction",
    },
    blocked: {
      id: "blocked",
      label: "Clear the Junction",
      buddyStart: "The signal says go. Traffic ahead is packed.",
      hint: "Can you clear the junction?",
      mode: "choose",
      choices: [
        { label: "Enter anyway — light is green", safe: false },
        { label: "Wait until you can clear it", safe: true },
        { label: "Nose in and hope for space", safe: false },
      ],
      feedbackSafe: "Permission to move is not always permission to block.",
      feedbackUnsafe: "Blocking a junction traps everyone — including you.",
      bridgeChapter: "busy_junction",
      bridgeScene: "junction_blocked",
      build: "blocked",
    },
    spotrisk: {
      id: "spotrisk",
      label: "Spot the Risk",
      buddyStart: "Scan the junction. What matters most?",
      hint: "Spot the priority risk",
      mode: "choose",
      choices: [
        { label: "Child near the kerb", safe: true },
        { label: "Shop sign across the street", safe: false },
        { label: "Parked car two streets away", safe: false },
      ],
      feedbackSafe: "You spotted the risk early. Vulnerable users need care.",
      feedbackUnsafe: "Look for people who may step out with little warning.",
      bridgeChapter: "busy_junction",
      bridgeScene: "junction_spot",
      build: "spotrisk",
    },
    people: {
      id: "people",
      label: "People Sharing",
      buddyStart: "People share this street. Tap what you notice.",
      hint: "Tap · walkers · child · scooter · traffic",
      mode: "explore",
      needNotices: 3,
      buddyDone: "Good eye. Expect sudden movement near kerbs.",
      bridgeChapter: "busy_junction",
      bridgeScene: "junction_spot",
      build: "people",
    },
    helmet: {
      id: "helmet",
      label: "Helmet Habit",
      buddyStart: "That rider has no helmet.",
      hint: "What’s the safer move?",
      mode: "choose",
      choices: [
        { label: "Ignore — their choice", safe: false },
        { label: "Slow and give space — unprotected", safe: true },
        { label: "Pass tightly to teach a lesson", safe: false },
      ],
      feedbackSafe: "Unprotected riders need more room and patience.",
      feedbackUnsafe: "A missing helmet raises the stakes of any mistake.",
      bridgeChapter: "welcome",
      bridgeScene: "welcome_decide",
      build: "helmet",
    },
    parking: {
      id: "parking",
      label: "Park Smart",
      buddyStart: "Where you stop can hide people and signs.",
      hint: "Best place to stop?",
      mode: "choose",
      choices: [
        { label: "On the crossing — just for a minute", safe: false },
        { label: "In a marked bay, clear of sightlines", safe: true },
        { label: "Beside the bus stop entrance", safe: false },
      ],
      feedbackSafe: "Keep crossings and sightlines clear.",
      feedbackUnsafe: "Blocking views or access puts others at risk.",
      bridgeChapter: "welcome",
      bridgeScene: "welcome_decide",
      build: "parking",
    },
    overtake: {
      id: "overtake",
      label: "Overtaking Trail",
      buddyStart: "Before ‘Can I pass?’ ask ‘Can I pass safely?’",
      hint: "Curve ahead · oncoming traffic",
      mode: "choose",
      choices: [
        { label: "Overtake now", safe: false },
        { label: "Wait and observe", safe: true },
        { label: "Force a gap with lights", safe: false },
      ],
      feedbackSafe: "Patience can be the safest move.",
      feedbackUnsafe: "Overtaking is not a race. Visibility and space first.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_overtake",
      build: "overtake",
    },
    rain: {
      id: "rain",
      label: "Wet Road",
      buddyStart: "Rain shortens grip and sight.",
      hint: "How should you drive?",
      mode: "choose",
      choices: [
        { label: "Same speed as dry roads", safe: false },
        { label: "Slow down, leave bigger gaps", safe: true },
        { label: "Brake hard at the last moment", safe: false },
      ],
      feedbackSafe: "Wet roads need earlier, gentler control.",
      feedbackUnsafe: "Rain reduces grip — leave yourself room.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_final",
      build: "rain",
    },
    night: {
      id: "night",
      label: "Night Road",
      buddyStart: "At night you don’t just see less — you have less time.",
      hint: "Cyclist is hard to see",
      mode: "choose",
      choices: [
        { label: "Keep daytime speed", safe: false },
        { label: "Slow down, watch, give space", safe: true },
        { label: "Pass as close as possible", safe: false },
      ],
      feedbackSafe: "Well judged. Lower visibility needs more caution.",
      feedbackUnsafe: "Night is not the same pace as day.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_final",
      build: "night",
    },
    emergency: {
      id: "emergency",
      label: "Emergency Ahead",
      buddyStart: "An emergency vehicle is approaching.",
      hint: "What should you do?",
      mode: "choose",
      choices: [
        { label: "Speed up to stay ahead", safe: false },
        { label: "Give way — clear a path safely", safe: true },
        { label: "Block the lane so they wait", safe: false },
      ],
      feedbackSafe: "Clear a safe path without creating new hazards.",
      feedbackUnsafe: "Emergency vehicles need a clear, predictable path.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_overtake",
      build: "emergency",
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
  var bootError = document.getElementById("bootError");

  var renderer = null;
  var scene = null;
  var camera = null;
  var clock = null;
  var raycaster = null;
  var pointer = null;
  var worldRoot = null;
  var glReady = false;
  var animStarted = false;

  function showBootError(msg) {
    if (!bootError) return;
    bootError.style.display = "block";
    bootError.textContent = msg;
  }

  function initGl() {
    if (glReady) return true;
    if (typeof THREE === "undefined") {
      showBootError("3D engine failed to load. Reinstall the APK or try Text map.");
      return false;
    }
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x87b7e8, 1);
      renderer.shadowMap.enabled = true;
      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x87b7e8, 18, 55);
      camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
      camera.position.set(0, 7.2, 12.5);
      camera.lookAt(0, 0.5, 0);
      clock = new THREE.Clock();
      raycaster = new THREE.Raycaster();
      pointer = new THREE.Vector2();
      worldRoot = new THREE.Group();
      scene.add(worldRoot);
      glReady = true;
      if (!animStarted) {
        animStarted = true;
        animate();
      }
      resize();
      return true;
    } catch (err) {
      showBootError("WebGL not available on this device. Use Text map for now.");
      console.error(err);
      return false;
    }
  }

  var interactives = [];
  var glowMarkers = [];

  var state = {
    scenario: null,
    notices: 0,
    noticed: {},
    decided: false,
    animCars: [],
    animActors: [],
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
    if (!renderer || !camera) return;
    var w = Math.max(canvas.clientWidth || window.innerWidth || 360, 2);
    var h = Math.max(canvas.clientHeight || window.innerHeight || 640, 2);
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
    if (!worldRoot) return;
    while (worldRoot.children.length) worldRoot.remove(worldRoot.children[0]);
    interactives = [];
    glowMarkers.forEach(function (g) { if (g.el.parentNode) g.el.parentNode.removeChild(g.el); });
    glowMarkers = [];
    state.animCars = [];
    state.animActors = [];
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

  function addGroundRoad(opts) {
    opts = opts || {};
    var groundColor = opts.wet ? 0x2f5a38 : 0x3f7a45;
    var roadColor = opts.wet ? 0x2a3038 : 0x3a3f48;
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: groundColor, roughness: opts.wet ? 0.55 : 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    worldRoot.add(ground);

    var road = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 40),
      new THREE.MeshStandardMaterial({ color: roadColor, roughness: opts.wet ? 0.35 : 0.95, metalness: opts.wet ? 0.25 : 0 })
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
      crown.userData.treeBob = true;
      crown.userData.bobBaseY = 1.3;
      crown.userData.bobPhase = i * 0.7;
      worldRoot.add(crown);
      state.animActors.push({ type: "bob", mesh: crown, amp: 0.06, speed: 1.1, baseY: 1.3, phase: i * 0.7 });
    }
  }

  function makeWheel(rx, ry, rz) {
    var w = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.18, 12),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 })
    );
    w.rotation.z = Math.PI / 2;
    w.position.set(rx, ry, rz);
    w.castShadow = true;
    return w;
  }

  function attachWheels(g, positions) {
    var wheels = [];
    for (var i = 0; i < positions.length; i++) {
      var p = positions[i];
      var w = makeWheel(p[0], p[1], p[2]);
      g.add(w);
      wheels.push(w);
    }
    g.userData.wheels = wheels;
    state.animActors.push({ type: "spin", mesh: g, wheels: wheels, speed: 3.5 });
    return wheels;
  }

  function makeCar(color, x, z) {
    var g = new THREE.Group();
    var body = box(1.6, 0.55, 3.0, color, 0, 0.45, 0);
    var cabin = box(1.35, 0.48, 1.45, 0x9ec9ff, 0, 0.95, -0.1);
    g.add(body);
    g.add(cabin);
    g.add(box(0.22, 0.12, 0.08, 0xfff2c2, -0.5, 0.5, 1.52));
    g.add(box(0.22, 0.12, 0.08, 0xfff2c2, 0.5, 0.5, 1.52));
    attachWheels(g, [
      [-0.72, 0.28, 0.95],
      [0.72, 0.28, 0.95],
      [-0.72, 0.28, -0.95],
      [0.72, 0.28, -0.95],
    ]);
    g.position.set(x, 0, z);
    worldRoot.add(g);
    return g;
  }

  function makeTruck(color, x, z) {
    var g = new THREE.Group();
    var cab = box(1.7, 1.1, 1.6, color || 0x5b6b7a, 0, 0.85, 1.1);
    var cargo = box(1.85, 1.4, 2.8, 0xc9b48a, 0, 1.05, -1.0);
    g.add(cab);
    g.add(cargo);
    g.add(box(0.2, 0.1, 0.08, 0xfff2c2, -0.55, 0.7, 1.92));
    g.add(box(0.2, 0.1, 0.08, 0xfff2c2, 0.55, 0.7, 1.92));
    attachWheels(g, [
      [-0.8, 0.32, 1.35],
      [0.8, 0.32, 1.35],
      [-0.8, 0.32, -0.4],
      [0.8, 0.32, -0.4],
      [-0.8, 0.32, -1.85],
      [0.8, 0.32, -1.85],
    ]);
    g.position.set(x, 0, z);
    worldRoot.add(g);
    return g;
  }

  function makeBus(x, z) {
    var g = new THREE.Group();
    var body = box(2.1, 1.6, 5.2, 0xd9a441, 0, 0.95, 0);
    g.add(body);
    g.add(box(1.95, 0.55, 4.6, 0x7ec8ff, 0, 1.55, 0));
    g.add(box(0.18, 0.12, 0.08, 0xfff2c2, -0.7, 0.75, 2.62));
    g.add(box(0.18, 0.12, 0.08, 0xfff2c2, 0.7, 0.75, 2.62));
    attachWheels(g, [
      [-0.95, 0.32, 1.7],
      [0.95, 0.32, 1.7],
      [-0.95, 0.32, 0],
      [0.95, 0.32, 0],
      [-0.95, 0.32, -1.7],
      [0.95, 0.32, -1.7],
    ]);
    g.position.set(x, 0, z);
    worldRoot.add(g);
    makeTapTarget("bus", body, "Bus stop");
    return g;
  }

  function makeScooter(x, z, opts) {
    opts = opts || {};
    var g = new THREE.Group();
    var body = box(0.45, 0.22, 1.35, opts.color || 0x4cc9c0, 0, 0.42, 0);
    g.add(body);
    g.add(box(0.35, 0.12, 0.45, 0x333333, 0, 0.58, -0.15));
    var bar = box(0.55, 0.06, 0.06, 0x222222, 0, 0.85, 0.45);
    g.add(bar);
    var w1 = makeWheel(0, 0.22, 0.52);
    w1.scale.set(0.7, 0.7, 0.7);
    var w2 = makeWheel(0, 0.22, -0.52);
    w2.scale.set(0.7, 0.7, 0.7);
    g.add(w1);
    g.add(w2);
    g.userData.wheels = [w1, w2];
    state.animActors.push({ type: "spin", mesh: g, wheels: [w1, w2], speed: 4 });
    if (opts.rider !== false) {
      var rider = makePerson(0, 0, {
        id: opts.tapId || "scooter",
        shirtColor: opts.shirtColor || 0x2a6f97,
        addToWorld: false,
        tap: false,
        scale: 0.85,
      });
      rider.position.set(0, 0.15, -0.05);
      g.add(rider);
      if (opts.noHelmet) {
        makeTapTarget(opts.tapId || "scooter", body, opts.tapLabel || "Rider without helmet");
      } else {
        makeTapTarget(opts.tapId || "scooter", body, opts.tapLabel || "Parked scooter");
      }
    } else {
      makeTapTarget(opts.tapId || "scooter", body, opts.tapLabel || "Parked scooter");
    }
    g.position.set(x, 0, z);
    g.rotation.y = opts.yaw != null ? opts.yaw : 0.55;
    worldRoot.add(g);
    return g;
  }

  function makeMotorcycle(x, z, opts) {
    opts = opts || {};
    var g = new THREE.Group();
    var body = box(0.5, 0.28, 1.7, opts.color || 0x333333, 0, 0.48, 0);
    g.add(body);
    g.add(box(0.4, 0.14, 0.5, 0x222222, 0, 0.68, -0.2));
    g.add(box(0.7, 0.06, 0.06, 0x111111, 0, 0.95, 0.55));
    var w1 = makeWheel(0, 0.28, 0.7);
    var w2 = makeWheel(0, 0.28, -0.7);
    g.add(w1);
    g.add(w2);
    g.userData.wheels = [w1, w2];
    state.animActors.push({ type: "spin", mesh: g, wheels: [w1, w2], speed: 5 });
    var rider = makePerson(0, 0, {
      shirtColor: opts.shirtColor || 0xb85c38,
      addToWorld: false,
      tap: false,
      scale: 0.9,
    });
    rider.position.set(0, 0.2, -0.1);
    g.add(rider);
    makeTapTarget(opts.tapId || "bike", body, opts.tapLabel || (opts.noHelmet ? "Rider without helmet" : "Motorcycle"));
    g.position.set(x, 0, z);
    g.rotation.y = opts.yaw != null ? opts.yaw : -0.3;
    worldRoot.add(g);
    return g;
  }

  function makePerson(x, z, opts) {
    opts = opts || {};
    var scale = opts.scale != null ? opts.scale : (opts.child ? 0.65 : 1);
    var shirtColor = opts.shirtColor != null ? opts.shirtColor : 0x3d6bb3;
    var g = new THREE.Group();
    var torso = box(0.45 * scale, 0.55 * scale, 0.32 * scale, shirtColor, 0, 0.85 * scale, 0);
    var head = new THREE.Mesh(
      new THREE.SphereGeometry(0.18 * scale, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xf0c7a0 })
    );
    head.position.y = 1.25 * scale;
    var armL = box(0.12 * scale, 0.45 * scale, 0.12 * scale, shirtColor, -0.32 * scale, 0.85 * scale, 0);
    var armR = box(0.12 * scale, 0.45 * scale, 0.12 * scale, shirtColor, 0.32 * scale, 0.85 * scale, 0);
    var legL = box(0.14 * scale, 0.5 * scale, 0.14 * scale, 0x2c3e50, -0.12 * scale, 0.35 * scale, 0);
    var legR = box(0.14 * scale, 0.5 * scale, 0.14 * scale, 0x2c3e50, 0.12 * scale, 0.35 * scale, 0);
    g.add(torso);
    g.add(head);
    g.add(armL);
    g.add(armR);
    g.add(legL);
    g.add(legR);
    g.userData.armL = armL;
    g.userData.armR = armR;
    g.userData.legL = legL;
    g.userData.legR = legR;
    g.userData.walkPhase = Math.random() * Math.PI * 2;
    g.position.set(x, 0, z);
    if (opts.addToWorld !== false) {
      worldRoot.add(g);
    }
    if (opts.tap !== false) {
      makeTapTarget(opts.id || (opts.child ? "child" : "ped"), torso, opts.label || (opts.child ? "Child" : "Pedestrian"));
    }
    if (opts.walk) {
      state.animActors.push({
        type: "walk",
        mesh: g,
        axis: opts.walk.axis || "z",
        speed: opts.walk.speed != null ? opts.walk.speed : 0.55,
        min: opts.walk.min,
        max: opts.walk.max,
      });
    }
    return g;
  }

  function makeChild(x, z, opts) {
    opts = opts || {};
    opts.child = true;
    opts.id = opts.id || "child";
    opts.shirtColor = opts.shirtColor != null ? opts.shirtColor : 0xff7a59;
    opts.label = opts.label || "Child near kerb";
    return makePerson(x, z, opts);
  }

  function makePedestrian(x, z, id) {
    return makePerson(x, z, { id: id || "ped", shirtColor: 0x3d6bb3, label: "Pedestrian" });
  }

  function makeCyclist(x, z) {
    var g = new THREE.Group();
    var w1 = makeWheel(0, 0.28, 0.42);
    var w2 = makeWheel(0, 0.28, -0.42);
    w1.scale.set(0.75, 0.75, 0.75);
    w2.scale.set(0.75, 0.75, 0.75);
    g.add(w1);
    g.add(w2);
    g.add(box(0.12, 0.08, 0.85, 0x444444, 0, 0.45, 0));
    g.add(box(0.45, 0.06, 0.06, 0x222222, 0, 0.85, 0.35));
    var person = makePerson(0, 0, {
      shirtColor: 0x2a9d8f,
      addToWorld: false,
      tap: false,
      scale: 0.85,
    });
    person.position.set(0, 0.25, 0);
    g.add(person);
    g.userData.wheels = [w1, w2];
    state.animActors.push({ type: "spin", mesh: g, wheels: [w1, w2], speed: 4 });
    g.position.set(x, 0, z);
    worldRoot.add(g);
    return g;
  }

  function makeDog(x, z) {
    var g = new THREE.Group();
    var body = box(0.35, 0.28, 0.7, 0x8b6914, 0, 0.35, 0);
    g.add(body);
    g.add(box(0.28, 0.25, 0.28, 0x8b6914, 0, 0.45, 0.4));
    g.add(box(0.08, 0.2, 0.08, 0x6b4a1a, -0.12, 0.18, 0.22));
    g.add(box(0.08, 0.2, 0.08, 0x6b4a1a, 0.12, 0.18, 0.22));
    g.add(box(0.08, 0.2, 0.08, 0x6b4a1a, -0.12, 0.18, -0.22));
    g.add(box(0.08, 0.2, 0.08, 0x6b4a1a, 0.12, 0.18, -0.22));
    g.add(box(0.06, 0.06, 0.25, 0x6b4a1a, 0, 0.4, -0.45));
    g.position.set(x, 0, z);
    worldRoot.add(g);
    makeTapTarget("dog", body, "Dog near road");
    state.animActors.push({ type: "bob", mesh: body, amp: 0.03, speed: 2.2, baseY: 0.35, phase: 1 });
    return g;
  }

  function makeAmbulance(x, z) {
    var g = new THREE.Group();
    var body = box(1.85, 1.25, 4.0, 0xf5f5f5, 0, 0.9, 0);
    g.add(body);
    g.add(box(1.9, 0.35, 3.6, 0xc62828, 0, 1.45, -0.1));
    g.add(box(1.5, 0.45, 1.2, 0x9ec9ff, 0, 1.35, 1.1));
    g.add(box(0.35, 0.12, 0.25, 0xff3333, 0, 1.85, 0.2));
    g.add(box(0.22, 0.12, 0.08, 0xfff2c2, -0.55, 0.75, 2.02));
    g.add(box(0.22, 0.12, 0.08, 0xfff2c2, 0.55, 0.75, 2.02));
    attachWheels(g, [
      [-0.8, 0.3, 1.2],
      [0.8, 0.3, 1.2],
      [-0.8, 0.3, -1.2],
      [0.8, 0.3, -1.2],
    ]);
    g.position.set(x, 0, z);
    worldRoot.add(g);
    return g;
  }

  function makeSignal(x, z) {
    worldRoot.add(cyl(0.08, 3.2, 0x555555, x, 1.6, z));
    var head = box(0.35, 1.0, 0.25, 0x222222, x, 3.2, z);
    worldRoot.add(head);
    function mkLight(y, color, emissive) {
      var m = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 10),
        new THREE.MeshStandardMaterial({ color: color, emissive: emissive, emissiveIntensity: 0.2 })
      );
      m.position.set(x, y, z + 0.12);
      worldRoot.add(m);
      return m;
    }
    var red = mkLight(3.45, 0xff3333, 0xaa0000);
    var amber = mkLight(3.2, 0xffaa33, 0xaa5500);
    var green = mkLight(2.95, 0x33ff66, 0x008833);
    makeTapTarget("signal", head, "Signal");
    var lights = { red: red, amber: amber, green: green };
    state.animActors.push({ type: "signal", lights: lights });
    return lights;
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

  function makeWarningSign(x, z) {
    worldRoot.add(cyl(0.06, 2.0, 0x666666, x, 1.0, z));
    var tri = new THREE.Mesh(
      new THREE.ConeGeometry(0.65, 1.1, 3),
      new THREE.MeshStandardMaterial({ color: 0xf2c94c, emissive: 0x664400 })
    );
    tri.position.set(x, 2.35, z);
    tri.rotation.y = Math.PI / 6;
    worldRoot.add(tri);
  }

  function setDayTheme() {
    if (!renderer || !scene) return;
    renderer.setClearColor(0x87b7e8, 1);
    scene.fog = new THREE.Fog(0x87b7e8, 18, 55);
  }

  function setNightTheme() {
    if (!renderer || !scene) return;
    renderer.setClearColor(0x0a1020, 1);
    scene.fog = new THREE.Fog(0x0a1020, 8, 28);
  }

  function setRainTheme() {
    if (!renderer || !scene) return;
    renderer.setClearColor(0x6a7a8a, 1);
    scene.fog = new THREE.Fog(0x6a7a8a, 12, 38);
  }

  function addCrossRoad() {
    var cross = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 7),
      new THREE.MeshStandardMaterial({ color: 0x3a3f48 })
    );
    cross.rotation.x = -Math.PI / 2;
    cross.position.set(0, 0.021, 0);
    worldRoot.add(cross);
  }

  function addZebra(z) {
    for (var i = -3; i <= 3; i++) {
      worldRoot.add(box(0.55, 0.03, 2.4, 0xf5f5f5, i * 0.7, 0.04, z != null ? z : 1.4));
    }
  }

  function projectGlow(mesh) {
    var el = document.createElement("div");
    el.className = "tap-glow";
    hud.appendChild(el);
    glowMarkers.push({ el: el, obj: mesh, id: mesh.userData.questId });
  }

  function updateGlows() {
    if (!renderer || !camera) return;
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
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    makeBus(-2.6, -4.5);
    makeScooter(3.2, 1.5, { rider: false });
    makePerson(2.4, 4.2, { id: "crossing", shirtColor: 0x3d6bb3, label: "Someone waiting to cross" });
    makeSignal(3.6, -2);
    state.animCars.push({ mesh: makeCar(0x4f7cac, -1.5, 8), speed: -2.4 });
    state.animCars.push({ mesh: makeCar(0xb85c38, 1.6, -12), speed: 3.1 });
    worldRoot.add(box(0.55, 0.35, 0.9, 0x8d6e4c, -3.5, 0.25, 2.5));
    interactives.forEach(projectGlow);
  }

  function buildBasics() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    var edge = box(0.35, 0.08, 8, 0xf8fafc, -3.4, 0.06, 0);
    var lane = box(1.4, 0.05, 6, 0x5b8def, -1.4, 0.05, 2);
    var centre = box(0.25, 0.06, 8, 0xf2e9a8, 0, 0.06, 0);
    var cross = box(4.5, 0.05, 1.6, 0xffffff, 0, 0.05, 5.5);
    worldRoot.add(edge);
    worldRoot.add(lane);
    worldRoot.add(centre);
    worldRoot.add(cross);
    makeTapTarget("edge", edge, "Road edge");
    makeTapTarget("lane", lane, "Lane");
    makeTapTarget("centre", centre, "Centre line");
    makeTapTarget("crossing", cross, "Pedestrian area");
    makeCar(0x4f7cac, 1.5, -4);
    interactives.forEach(projectGlow);
  }

  function buildLanes() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    var drift = makeCar(0xd9843b, 0.35, 4);
    drift.rotation.y = 0.22;
    state.animActors.push({ type: "drift", mesh: drift, amp: 0.07, speed: 0.95, baseYaw: 0.22 });
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.5, 10), speed: -1.4, stopZ: 6 });
  }

  function buildJunction() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addCrossRoad();
    addBuildings();
    makeSignal(3.4, 3.4);
    makePerson(0.2, 1.6, { id: "crossing", shirtColor: 0x3d6bb3, label: "Pedestrian crossing" });
    addZebra(1.4);
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.4, 9), speed: -1.2, stopZ: 3.2 });
    var side = makeCar(0xd9843b, 8, 1.4);
    side.rotation.y = Math.PI / 2;
  }

  function buildSignStop() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addTrees();
    addBuildings();
    makeStopSign(-2.8, 2.5);
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.4, 8), speed: -1.6, stopZ: 3.0 });
    makeCar(0x888888, 1.5, -6);
  }

  function buildWarning() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addTrees();
    addBuildings();
    makeWarningSign(-2.6, 3.2);
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.4, 9), speed: -2.0 });
    var hazard = makeCar(0xb85c38, 2.2, -2);
    hazard.rotation.y = 0.4;
  }

  function buildBlocked() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addCrossRoad();
    addBuildings();
    makeSignal(3.4, 3.4);
    makeCar(0x666666, -1.2, 0.5);
    makeCar(0x777777, 1.3, -0.2);
    makeTruck(0x555555, 0.1, -1.4);
    var side = makeCar(0xd9843b, 4.5, 1.2);
    side.rotation.y = Math.PI / 2;
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.4, 10), speed: -1.0, stopZ: 4.5 });
  }

  function buildSpotRisk() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addCrossRoad();
    addBuildings();
    makeSignal(3.4, 3.4);
    makeChild(2.8, 3.6);
    makePerson(-2.5, 2.0, { id: "crossing", shirtColor: 0x5b8def });
    makeCar(0x444444, -8, -10);
    addZebra(1.4);
  }

  function buildPeople() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addCrossRoad();
    addBuildings();
    addTrees();
    makeSignal(3.4, 3.4);
    makePerson(2.2, 5.5, {
      id: "crossing",
      shirtColor: 0x3d6bb3,
      walk: { axis: "z", speed: -0.7, min: -2, max: 6 },
    });
    makePerson(-2.8, -1, {
      id: "walker",
      shirtColor: 0xc97b63,
      walk: { axis: "x", speed: 0.55, min: -3.5, max: 3.5 },
    });
    makeChild(2.6, 3.2, { walk: { axis: "z", speed: 0.35, min: 1.5, max: 4.5 } });
    makeScooter(3.4, 0.5, { rider: false, yaw: 0.4 });
    makeDog(-3.2, 2.8);
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.4, 10), speed: -1.5 });
    state.animCars.push({ mesh: makeCar(0xb85c38, 1.5, -12), speed: 1.8 });
    interactives.forEach(projectGlow);
  }

  function buildHelmet() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    makeMotorcycle(1.8, 3.2, { noHelmet: true, tapId: "bike", tapLabel: "Rider without helmet", color: 0x222222 });
    makeScooter(-2.4, 1.5, { noHelmet: true, tapId: "scooter", tapLabel: "Scooter rider bareheaded", color: 0x4cc9c0, yaw: -0.4 });
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.4, 10), speed: -1.2, stopZ: 5 });
  }

  function buildParking() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    // parking bays along side — clear of crossing sightlines
    for (var i = 0; i < 3; i++) {
      var bay = box(2.2, 0.03, 4.2, 0x4a5560, -5.2, 0.04, -6 + i * 5);
      worldRoot.add(bay);
    }
    makeCar(0x4f7cac, -5.2, -6);
    makeCar(0x888888, -5.2, -1);
    // empty bay for correct choice cue
    worldRoot.add(box(2.0, 0.02, 3.8, 0x5a8f6a, -5.2, 0.05, 4));
    makeBus(-2.8, -8);
    addZebra(5.5);
    makePerson(0.2, 5.2, { id: "crossing", shirtColor: 0x3d6bb3 });
    makeTruck(0x6b7a5a, 5.5, -4);
  }

  function buildOvertake() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addTrees();
    makeTruck(0x888888, -1.4, 2);
    state.animCars.push({ mesh: makeCar(0xb85c38, 1.5, -14), speed: 4.5 });
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.4, 9), speed: -1.1, stopZ: 5.5 });
    worldRoot.add(box(4, 2.2, 3, 0x6b7a5a, 4.5, 1.1, -1));
  }

  function buildRain() {
    setRainTheme();
    addLights();
    addGroundRoad({ wet: true });
    addBuildings();
    addTrees();
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.4, 10), speed: -0.7, stopZ: 5 });
    state.animCars.push({ mesh: makeCar(0xb85c38, 1.5, -12), speed: 0.9 });
    makeCyclist(2.2, 3.0);
    makePerson(-2.6, 2.5, { shirtColor: 0x445566 });
  }

  function buildNight() {
    setNightTheme();
    var hemi = new THREE.HemisphereLight(0x334466, 0x111111, 0.35);
    worldRoot.add(hemi);
    var moon = new THREE.DirectionalLight(0x99aacc, 0.35);
    moon.position.set(-4, 10, 2);
    worldRoot.add(moon);
    addGroundRoad();
    addBuildings();
    addTrees();
    var lamp = cyl(0.06, 3.4, 0x333333, 3.2, 1.7, 1);
    worldRoot.add(lamp);
    var glow = new THREE.PointLight(0xffe6a8, 1.1, 12);
    glow.position.set(3.2, 3.3, 1);
    worldRoot.add(glow);
    makeCyclist(2.0, 3.5);
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.4, 10), speed: -1.3, stopZ: 5 });
  }

  function buildEmergency() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    makeCar(0x5b8def, -1.4, 4);
    makeCar(0x888888, 1.5, 2);
    state.animCars.push({ mesh: makeAmbulance(1.5, -16), speed: 3.2 });
    state.animCars.push({ mesh: makeCar(0xd9843b, -1.4, 12), speed: -0.8, stopZ: 6 });
  }

  function buildById(buildId) {
    if (buildId === "welcome") buildWelcome();
    else if (buildId === "basics") buildBasics();
    else if (buildId === "lanes") buildLanes();
    else if (buildId === "junction") buildJunction();
    else if (buildId === "signstop") buildSignStop();
    else if (buildId === "warning") buildWarning();
    else if (buildId === "blocked") buildBlocked();
    else if (buildId === "spotrisk") buildSpotRisk();
    else if (buildId === "people") buildPeople();
    else if (buildId === "helmet") buildHelmet();
    else if (buildId === "parking") buildParking();
    else if (buildId === "overtake") buildOvertake();
    else if (buildId === "rain") buildRain();
    else if (buildId === "night") buildNight();
    else if (buildId === "emergency") buildEmergency();
    else buildWelcome();
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
      crossing: "Someone waiting to cross — shared space.",
      signal: "Signals share timing for everyone.",
      edge: "Edges mark where the usable road ends.",
      lane: "Lanes organise flow. Don’t wander.",
      centre: "Centre lines separate streams of traffic.",
      child: "Children can move suddenly — slow and watch.",
      walker: "People walking — expect unexpected steps.",
      ped: "Pedestrian — give space and time.",
      dog: "Animals near the road need extra care.",
      bike: "Unprotected rider — slow and give room.",
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
    if (!glReady || !raycaster || !camera || !renderer) return;
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
    if (!initGl()) return;
    clearWorld();
    state.scenario = sc;
    menu.style.display = "none";
    hud.style.display = "flex";
    sceneLabel.textContent = sc.label;
    say(sc.buddyStart);
    hintEl.textContent = sc.hint || "";
    buildById(sc.build || id);
    if (sc.mode === "choose") showChoices(sc);
    bridge("onScenarioStart", id);
    setTimeout(resize, 50);
    setTimeout(resize, 250);
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
    if (!glReady || !renderer) return;
    var t = clock.getElapsedTime();
    var dt = Math.min(clock.getDelta(), 0.05);

    if (state.scenario) {
      camera.position.x = Math.sin(t * 0.25) * 0.35;
      camera.position.y = 7.2 + Math.sin(t * 0.4) * 0.08;
      camera.lookAt(0, 0.6, 0);
    }

    state.animCars.forEach(function (c) {
      if (!c.speed) return;
      c.mesh.position.z += c.speed * dt;
      if (c.stopZ !== undefined && c.speed < 0 && c.mesh.position.z <= c.stopZ) {
        c.mesh.position.z = c.stopZ;
        c.speed = 0;
      }
      if (c.mesh.position.z < -18) c.mesh.position.z = 16;
      if (c.mesh.position.z > 18) c.mesh.position.z = -16;
      var wheels = c.mesh.userData && c.mesh.userData.wheels;
      if (wheels) {
        var spin = Math.abs(c.speed) * 2.8 * dt;
        for (var wi = 0; wi < wheels.length; wi++) wheels[wi].rotation.x += spin;
      }
    });

    state.animActors.forEach(function (a) {
      if (a.type === "walk") {
        var mesh = a.mesh;
        mesh.userData.walkPhase = (mesh.userData.walkPhase || 0) + dt * 4;
        var ph = mesh.userData.walkPhase;
        mesh.position.y = 0.03 * Math.sin(ph * 2);
        if (mesh.userData.legL) {
          mesh.userData.legL.rotation.x = Math.sin(ph) * 0.5;
          mesh.userData.legR.rotation.x = Math.sin(ph + Math.PI) * 0.5;
          mesh.userData.armL.rotation.x = Math.sin(ph + Math.PI) * 0.4;
          mesh.userData.armR.rotation.x = Math.sin(ph) * 0.4;
        }
        var spd = a.speed != null ? a.speed : 0.5;
        if (a.axis === "x") {
          mesh.position.x += spd * dt;
          if (a.max != null && a.min != null) {
            if (spd > 0 && mesh.position.x > a.max) mesh.position.x = a.min;
            if (spd < 0 && mesh.position.x < a.min) mesh.position.x = a.max;
          }
        } else {
          mesh.position.z += spd * dt;
          if (a.max != null && a.min != null) {
            if (spd > 0 && mesh.position.z > a.max) mesh.position.z = a.min;
            if (spd < 0 && mesh.position.z < a.min) mesh.position.z = a.max;
          }
        }
      } else if (a.type === "spin") {
        var ws = a.wheels || (a.mesh && a.mesh.userData && a.mesh.userData.wheels) || [];
        for (var si = 0; si < ws.length; si++) ws[si].rotation.x += (a.speed || 3.5) * dt;
      } else if (a.type === "signal" && a.lights) {
        var phase = Math.floor(t / 1.2) % 3;
        if (a.lights.red) a.lights.red.material.emissiveIntensity = phase === 0 ? 1.3 : 0.12;
        if (a.lights.amber) a.lights.amber.material.emissiveIntensity = phase === 1 ? 1.3 : 0.12;
        if (a.lights.green) a.lights.green.material.emissiveIntensity = phase === 2 ? 1.3 : 0.12;
      } else if (a.type === "bob") {
        var base = a.baseY != null ? a.baseY : a.mesh.position.y;
        a.mesh.position.y = base + Math.sin(t * (a.speed || 1.2) + (a.phase || 0)) * (a.amp || 0.08);
      } else if (a.type === "drift") {
        a.mesh.rotation.y = (a.baseYaw != null ? a.baseYaw : 0) + Math.sin(t * (a.speed || 0.9)) * (a.amp || 0.06);
      }
    });

    if (worldRoot) {
      worldRoot.traverse(function (obj) {
        if (obj.userData && obj.userData.treeBob) {
          var by = obj.userData.bobBaseY != null ? obj.userData.bobBaseY : 1.3;
          obj.position.y = by + Math.sin(t * 1.1 + (obj.userData.bobPhase || 0)) * 0.06;
        }
      });
    }

    updateGlows();
    renderer.render(scene, camera);
  }

  window.QuestWorld = {
    loadScenario: loadScenario,
    showMenu: showMenu,
    ensureSized: resize,
    scenarios: Object.keys(SCENARIOS),
  };

  // Keep menu visible; init GL lazily on first scenario.
  menu.style.display = "flex";
  hud.style.display = "none";
  if (typeof THREE === "undefined") {
    showBootError("3D engine script missing.");
  }
  bridge("onReady");
})();
