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
    school: {
      id: "school",
      label: "School Zone",
      buddyStart: "School zone — children near the road.",
      hint: "Speed or slow?",
      mode: "choose",
      choices: [
        { label: "Keep normal speed — road looks clear", safe: false },
        { label: "Slow down and watch the kerb", safe: true },
        { label: "Honk so children move away", safe: false },
      ],
      feedbackSafe: "Near schools, expect sudden steps into the road.",
      feedbackUnsafe: "Children can appear in a second. Slow is the story.",
      bridgeChapter: "busy_junction",
      bridgeScene: "junction_spot",
      build: "school",
    },
    phone: {
      id: "phone",
      label: "Phone Distraction",
      buddyStart: "A phone glow lights the cabin.",
      hint: "Put it away or keep going?",
      mode: "choose",
      choices: [
        { label: "Keep glancing at the phone", safe: false },
        { label: "Put the phone away — eyes on road", safe: true },
        { label: "Hold it up while steering", safe: false },
      ],
      feedbackSafe: "The road needs your full attention.",
      feedbackUnsafe: "A glowing screen steals the glance you need most.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_final",
      build: "phone",
    },
    railway: {
      id: "railway",
      label: "Railway Crossing",
      buddyStart: "Barriers and lights at the tracks.",
      hint: "Wait or cross?",
      mode: "choose",
      choices: [
        { label: "Slip through before the barrier drops", safe: false },
        { label: "Wait until clear and barriers rise", safe: true },
        { label: "Drive around the barrier", safe: false },
      ],
      feedbackSafe: "Trains win every race. Waiting is the only win.",
      feedbackUnsafe: "Crossing against lights or barriers is never worth it.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_final",
      build: "railway",
    },
    uturn: {
      id: "uturn",
      label: "Busy U-Turn",
      buddyStart: "A U-turn on a busy road.",
      hint: "Wait for a gap or force it?",
      mode: "choose",
      choices: [
        { label: "Force the turn — others will brake", safe: false },
        { label: "Wait for a clear gap, then turn", safe: true },
        { label: "Cut across both lanes fast", safe: false },
      ],
      feedbackSafe: "A patient gap keeps everyone predictable.",
      feedbackUnsafe: "Forced U-turns create sudden oncoming conflict.",
      bridgeChapter: "busy_junction",
      bridgeScene: "junction_blocked",
      build: "uturn",
    },
    accident: {
      id: "accident",
      label: "Crash Ahead",
      buddyStart: "Two vehicles have collided. People are shaken.",
      hint: "What should you do?",
      mode: "choose",
      choices: [
        { label: "Stop safely, warn others, help / call aid", safe: true },
        { label: "Crowd in close to film the crash", safe: false },
        { label: "Squeeze between the wrecks and go", safe: false },
      ],
      feedbackSafe: "Protect the scene, then help. Don’t become the next crash.",
      feedbackUnsafe: "Crowding or cutting through worsens danger for everyone.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_final",
      build: "accident",
    },
    twowheel: {
      id: "twowheel",
      label: "Two-Wheelers",
      buddyStart: "Scooters and bikes share this lane — they’re people too.",
      hint: "How do you share the road?",
      mode: "choose",
      choices: [
        { label: "Squeeze past — they can squeeze back", safe: false },
        { label: "Leave space, expect weave, pass wide", safe: true },
        { label: "Honk until they leave the lane", safe: false },
      ],
      feedbackSafe: "Two-wheelers need room. Treat them as vulnerable road users.",
      feedbackUnsafe: "Close passes and pressure create falls and panic.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_overtake",
      build: "twowheel",
    },
    pothole: {
      id: "pothole",
      label: "Pothole Path",
      buddyStart: "A deep pothole sits in your lane.",
      hint: "Best reaction?",
      mode: "choose",
      choices: [
        { label: "Hit it at full speed", safe: false },
        { label: "Slow early; avoid safely if clear", safe: true },
        { label: "Swerve hard into oncoming traffic", safe: false },
      ],
      feedbackSafe: "Slow first. Only move aside when the path is truly clear.",
      feedbackUnsafe: "A bad hole is safer than a sudden head-on conflict.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_final",
      build: "pothole",
    },
    speedbump: {
      id: "speedbump",
      label: "Speed Breaker",
      buddyStart: "Yellow speed breakers ahead.",
      hint: "How do you cross?",
      mode: "choose",
      choices: [
        { label: "Fly over to save time", safe: false },
        { label: "Slow down and cross gently", safe: true },
        { label: "Brake hard only at the last metre", safe: false },
      ],
      feedbackSafe: "Speed breakers work when you slow early and smoothly.",
      feedbackUnsafe: "Jumping or last-second braking shocks following traffic.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_final",
      build: "speedbump",
    },
    seatbelt: {
      id: "seatbelt",
      label: "Seatbelt First",
      buddyStart: "The car is ready to roll — belt is still off.",
      hint: "When do you buckle?",
      mode: "choose",
      choices: [
        { label: "Drive first, buckle later", safe: false },
        { label: "Buckle before moving", safe: true },
        { label: "Hold the belt while turning", safe: false },
      ],
      feedbackSafe: "Belts only protect if they’re on before the surprise.",
      feedbackUnsafe: "Crashes don’t wait for you to finish buckling.",
      bridgeChapter: "welcome",
      bridgeScene: "welcome_decide",
      build: "seatbelt",
    },
    helmetown: {
      id: "helmetown",
      label: "Helmet On",
      buddyStart: "You’re about to ride. Helmet is still in your hand.",
      hint: "Start now or gear up?",
      mode: "choose",
      choices: [
        { label: "Ride without it — short trip", safe: false },
        { label: "Wear the helmet, then start", safe: true },
        { label: "Hang it on the arm while riding", safe: false },
      ],
      feedbackSafe: "Helmet before kickstand up. Every ride.",
      feedbackUnsafe: "A helmet in your hand protects nothing.",
      bridgeChapter: "welcome",
      bridgeScene: "welcome_decide",
      build: "helmetown",
    },
    lightsfault: {
      id: "lightsfault",
      label: "Faulty Lights",
      buddyStart: "One headlamp is dead. Tail lamp looks dark too.",
      hint: "Drive like this?",
      mode: "choose",
      choices: [
        { label: "Drive anyway — others will see me", safe: false },
        { label: "Don’t drive until lights work", safe: true },
        { label: "Use only high beam to compensate", safe: false },
      ],
      feedbackSafe: "If they can’t see you, you don’t belong on the road yet.",
      feedbackUnsafe: "Broken lights hide you from both sides of traffic.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_final",
      build: "lightsfault",
    },
    hospital: {
      id: "hospital",
      label: "Hospital Zone",
      buddyStart: "Hospital zone — silence matters here.",
      hint: "Horn or patience?",
      mode: "choose",
      choices: [
        { label: "Long blasts to clear the road", safe: false },
        { label: "No unnecessary honking — move calmly", safe: true },
        { label: "Continuous horn until traffic parts", safe: false },
      ],
      feedbackSafe: "Near hospitals, quiet and calm keep the road humane.",
      feedbackUnsafe: "Noise here doesn’t heal anyone — it only adds stress.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_final",
      build: "hospital",
    },
    priority: {
      id: "priority",
      label: "Who Goes First?",
      buddyStart: "Uncontrolled junction. Vehicles from left and right.",
      hint: "Who has priority?",
      mode: "choose",
      choices: [
        { label: "Force through — I arrived first", safe: false },
        { label: "Yield to the vehicle from the right", safe: true },
        { label: "Race both sides at once", safe: false },
      ],
      feedbackSafe: "At many uncontrolled junctions, give way to traffic from the right.",
      feedbackUnsafe: "Assuming priority is how side-impacts happen.",
      bridgeChapter: "busy_junction",
      bridgeScene: "junction_blocked",
      build: "priority",
    },
    hillright: {
      id: "hillright",
      label: "Hill Right of Way",
      buddyStart: "Narrow hill road. One vehicle climbing, one descending.",
      hint: "Who should wait?",
      mode: "choose",
      choices: [
        { label: "Downhill forces past — gravity helps", safe: false },
        { label: "Uphill has priority — downhill waits", safe: true },
        { label: "Both squeeze and hope", safe: false },
      ],
      feedbackSafe: "On narrow hills, the climbing vehicle usually keeps way.",
      feedbackUnsafe: "Forcing past on a slope turns a squeeze into a slide.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_final",
      build: "hillright",
    },
    beams: {
      id: "beams",
      label: "Beam Sense",
      buddyStart: "Night road. Oncoming headlights approach.",
      hint: "High beam or low beam?",
      mode: "choose",
      choices: [
        { label: "Keep high beam on — I need to see", safe: false },
        { label: "Dip to low beam for oncoming traffic", safe: true },
        { label: "Flash high beam continuously", safe: false },
      ],
      feedbackSafe: "Dip beams so the other driver can still see the road.",
      feedbackUnsafe: "Blinding others steals the vision you both need.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_final",
      build: "beams",
    },
    fog: {
      id: "fog",
      label: "Foggy Stretch",
      buddyStart: "Fog eats distance. High beam only makes a white wall.",
      hint: "Best lighting and pace?",
      mode: "choose",
      choices: [
        { label: "High beam + normal speed", safe: false },
        { label: "Low beam, slow down, bigger gaps", safe: true },
        { label: "Follow the car ahead bumper-close", safe: false },
      ],
      feedbackSafe: "Fog needs low beam, lower speed, and honest following distance.",
      feedbackUnsafe: "High beam and tight gaps fail first in fog.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_final",
      build: "fog",
    },
    zebra: {
      id: "zebra",
      label: "Zebra Crossing",
      buddyStart: "People are on the zebra. No signal here.",
      hint: "Stop or roll?",
      mode: "choose",
      choices: [
        { label: "Roll through — they can wait", safe: false },
        { label: "Stop and let them finish crossing", safe: true },
        { label: "Honk so they hurry across", safe: false },
      ],
      feedbackSafe: "Zebra means their turn. Your turn comes after.",
      feedbackUnsafe: "Pressure at a crossing turns walking into a gamble.",
      bridgeChapter: "busy_junction",
      bridgeScene: "junction_pedestrian",
      build: "zebra",
    },
    wrongway: {
      id: "wrongway",
      label: "Wrong-Way Rider",
      buddyStart: "A scooter is coming against the flow.",
      hint: "Safe response?",
      mode: "choose",
      choices: [
        { label: "Mirror their wrong way to pass faster", safe: false },
        { label: "Slow, give space, don’t copy the mistake", safe: true },
        { label: "Close the gap to teach them", safe: false },
      ],
      feedbackSafe: "Don’t inherit a wrong-way risk. Create space and stay legal.",
      feedbackUnsafe: "Two wrong ways don’t make a safe road.",
      bridgeChapter: "scenario_challenge",
      bridgeScene: "challenge_overtake",
      build: "wrongway",
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
      showBootError("3D engine failed to load. Reinstall the APK.");
      return false;
    }
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x87b7e8, 1);
      renderer.shadowMap.enabled = true;
      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x87b7e8, 18, 55);
      camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
      camera.position.set(0, 6.2, 10.5);
      camera.lookAt(0, 0.5, 1);
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
      showBootError("WebGL not available on this device.");
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
    sceneT: 0,
    clips: [],
    fx: [],
  };

  function pushClip(clip) {
    state.clips.push(clip);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp01(t) {
    return t < 0 ? 0 : t > 1 ? 1 : t;
  }

  function easeInOut(t) {
    return t * t * (3 - 2 * t);
  }

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
    state.clips = [];
    state.fx = [];
    state.sceneT = 0;
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
      state.animActors.push({ type: "bob", mesh: crown, amp: 0.12, speed: 1.4, baseY: 1.3, phase: i * 0.7 });
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
    return wheels;
  }

  function spinWheels(mesh, amount) {
    var wheels = mesh && mesh.userData && mesh.userData.wheels;
    if (!wheels) return;
    for (var i = 0; i < wheels.length; i++) wheels[i].rotation.x += amount;
  }

  function makeCar(color, x, z, opts) {
    opts = opts || {};
    var g = new THREE.Group();
    var body = box(1.6, 0.55, 3.0, color, 0, 0.45, 0);
    var cabin = box(1.35, 0.48, 1.45, 0x9ec9ff, 0, 0.95, -0.1);
    g.add(body);
    g.add(cabin);
    var hlL = box(0.22, 0.12, 0.08, 0xfff2c2, -0.5, 0.5, 1.52);
    var hlR = box(0.22, 0.12, 0.08, 0xfff2c2, 0.5, 0.5, 1.52);
    var tlL = box(0.18, 0.1, 0.06, 0xff3333, -0.55, 0.5, -1.52);
    var tlR = box(0.18, 0.1, 0.06, 0xff3333, 0.55, 0.5, -1.52);
    if (opts.headlights || opts.highBeam) {
      hlL.material.emissive = new THREE.Color(0xfff0c0);
      hlR.material.emissive = new THREE.Color(0xfff0c0);
      hlL.material.emissiveIntensity = opts.highBeam ? 2.4 : 1.6;
      hlR.material.emissiveIntensity = opts.highBeam ? 2.4 : 1.6;
    }
    if (opts.brokenHead) {
      hlL.material.color = new THREE.Color(0x333333);
      hlL.material.emissiveIntensity = 0.05;
      hlR.material.emissive = new THREE.Color(0xfff0c0);
      hlR.material.emissiveIntensity = 0.35;
    }
    if (opts.brokenTail) {
      tlL.material.color = new THREE.Color(0x331111);
      tlR.material.color = new THREE.Color(0x331111);
      tlL.material.emissiveIntensity = 0.05;
      tlR.material.emissiveIntensity = 0.05;
    } else if (opts.tailLights) {
      tlL.material.emissive = new THREE.Color(0xff2200);
      tlR.material.emissive = new THREE.Color(0xff2200);
      tlL.material.emissiveIntensity = 1.2;
      tlR.material.emissiveIntensity = 1.2;
    }
    g.add(hlL);
    g.add(hlR);
    g.add(tlL);
    g.add(tlR);
    g.userData.headlights = [hlL, hlR];
    g.userData.taillights = [tlL, tlR];
    if (opts.seatbeltOff) {
      var warn = box(0.35, 0.12, 0.04, 0xff4444, 0.25, 1.05, 0.35);
      warn.material.emissive = new THREE.Color(0xff2200);
      warn.material.emissiveIntensity = 1.4;
      g.add(warn);
      state.animActors.push({ type: "phonePulse", mesh: warn });
    }
    if (opts.crumpled) {
      body.scale.set(1, 0.85, 0.75);
      cabin.rotation.z = 0.18;
      cabin.position.x = 0.2;
    }
    attachWheels(g, [
      [-0.72, 0.28, 0.95],
      [0.72, 0.28, 0.95],
      [-0.72, 0.28, -0.95],
      [0.72, 0.28, -0.95],
    ]);
    g.position.set(x, 0, z);
    if (opts.yaw != null) g.rotation.y = opts.yaw;
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
    var hl = box(0.16, 0.12, 0.08, 0xfff2c2, 0, 0.62, 0.9);
    if (opts.headlights) {
      hl.material.emissive = new THREE.Color(0xfff0c0);
      hl.material.emissiveIntensity = 1.5;
    }
    g.add(hl);
    var w1 = makeWheel(0, 0.28, 0.7);
    var w2 = makeWheel(0, 0.28, -0.7);
    g.add(w1);
    g.add(w2);
    g.userData.wheels = [w1, w2];
    var rider = makePerson(0, 0, {
      shirtColor: opts.shirtColor || 0xb85c38,
      addToWorld: false,
      tap: false,
      scale: 0.9,
    });
    rider.position.set(0, 0.2, -0.1);
    g.add(rider);
    if (!opts.noHelmet) {
      var helm = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 10, 10),
        new THREE.MeshStandardMaterial({ color: opts.helmetColor || 0x1f6feb, roughness: 0.4 })
      );
      helm.position.set(0, 1.35, -0.05);
      rider.add(helm);
    } else if (opts.helmetInHand) {
      var held = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x1f6feb })
      );
      held.position.set(0.45, 0.9, 0.1);
      g.add(held);
    }
    makeTapTarget(opts.tapId || "bike", body, opts.tapLabel || (opts.noHelmet ? "Rider without helmet" : "Motorcycle"));
    g.position.set(x, 0, z);
    g.rotation.y = opts.yaw != null ? opts.yaw : -0.3;
    worldRoot.add(g);
    return g;
  }

  function makePothole(x, z) {
    var hole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.75, 0.14, 12),
      new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 1 })
    );
    hole.position.set(x, 0.05, z);
    worldRoot.add(hole);
    worldRoot.add(box(0.35, 0.08, 0.35, 0x5a4a3a, x + 0.55, 0.06, z + 0.2));
    return hole;
  }

  function makeSpeedBreaker(z) {
    for (var i = -2; i <= 2; i++) {
      worldRoot.add(box(0.72, 0.2, 0.5, i % 2 ? 0xf2e9a8 : 0x1f2933, i * 0.78, 0.12, z));
    }
  }

  function makeHospital(x, z) {
    worldRoot.add(box(3.4, 2.9, 2.5, 0xe8eef5, x, 1.45, z));
    worldRoot.add(box(0.9, 0.22, 0.12, 0xe74c3c, x, 2.35, z + 1.28));
    worldRoot.add(box(0.22, 0.9, 0.12, 0xe74c3c, x, 2.35, z + 1.28));
    worldRoot.add(box(1.4, 0.55, 0.08, 0x2c3e50, x, 1.7, z + 1.3));
  }

  function makeSilentZoneSign(x, z) {
    worldRoot.add(cyl(0.06, 1.5, 0x777777, x, 0.75, z));
    var disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.06, 20),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f5 })
    );
    disc.rotation.x = Math.PI / 2;
    disc.position.set(x, 1.55, z);
    worldRoot.add(disc);
    worldRoot.add(box(0.35, 0.08, 0.05, 0xe74c3c, x, 1.55, z + 0.04));
  }

  function makeHillGround() {
    var slope = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.2, 18),
      new THREE.MeshStandardMaterial({ color: 0x3a3f48, roughness: 0.95 })
    );
    slope.rotation.x = -0.18;
    slope.position.set(0, 0.8, 0);
    worldRoot.add(slope);
    worldRoot.add(box(12, 0.2, 12, 0x3f7a45, 0, 0.05, 0));
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
    state.animActors.push({ type: "bob", mesh: body, amp: 0.14, speed: 3.2, baseY: 0.35, phase: 1 });
    return g;
  }

  function makeAmbulance(x, z) {
    var g = new THREE.Group();
    var body = box(1.85, 1.25, 4.0, 0xf5f5f5, 0, 0.9, 0);
    g.add(body);
    g.add(box(1.9, 0.35, 3.6, 0xc62828, 0, 1.45, -0.1));
    g.add(box(1.5, 0.45, 1.2, 0x9ec9ff, 0, 1.35, 1.1));
    var lightA = box(0.35, 0.12, 0.25, 0xff3333, 0, 1.85, 0.2);
    lightA.material.emissive = new THREE.Color(0xff0000);
    lightA.material.emissiveIntensity = 0.4;
    var lightB = box(0.28, 0.1, 0.2, 0x3366ff, 0.45, 1.85, -0.15);
    lightB.material.emissive = new THREE.Color(0x2244ff);
    lightB.material.emissiveIntensity = 0.4;
    g.add(lightA);
    g.add(lightB);
    g.userData.flashLights = [lightA, lightB];
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

  function makeSchoolSign(x, z) {
    worldRoot.add(cyl(0.06, 2.0, 0x666666, x, 1.0, z));
    var board = box(1.4, 0.9, 0.08, 0xf2c94c, x, 2.2, z);
    worldRoot.add(board);
  }

  function makeRailCrossing(z) {
    z = z != null ? z : 1.0;
    // track sleepers
    for (var i = -4; i <= 4; i++) {
      worldRoot.add(box(8, 0.08, 0.25, 0x5a4632, 0, 0.06, z + i * 0.55));
    }
    worldRoot.add(box(0.12, 0.08, 5, 0x888888, -1.2, 0.1, z));
    worldRoot.add(box(0.12, 0.08, 5, 0x888888, 1.2, 0.1, z));
    // barriers
    var barL = box(3.2, 0.12, 0.18, 0xd94f3d, -3.6, 1.1, z);
    var barR = box(3.2, 0.12, 0.18, 0xd94f3d, 3.6, 1.1, z);
    worldRoot.add(barL);
    worldRoot.add(barR);
    worldRoot.add(cyl(0.1, 2.4, 0x444444, -2.2, 1.2, z + 0.8));
    worldRoot.add(cyl(0.1, 2.4, 0x444444, 2.2, 1.2, z + 0.8));
    var flashA = box(0.25, 0.25, 0.15, 0xff2222, -2.2, 2.35, z + 0.9);
    var flashB = box(0.25, 0.25, 0.15, 0xff2222, 2.2, 2.35, z + 0.9);
    flashA.material.emissive = new THREE.Color(0xff0000);
    flashB.material.emissive = new THREE.Color(0xff0000);
    worldRoot.add(flashA);
    worldRoot.add(flashB);
    state.animActors.push({
      type: "railFlash",
      lights: [flashA, flashB],
      bars: [barL, barR],
    });
    return { bars: [barL, barR], lights: [flashA, flashB] };
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
    renderer.setClearColor(0x5a6a7a, 1);
    scene.fog = new THREE.Fog(0x6a7a8a, 10, 32);
  }

  function rainFX() {
    var g = new THREE.Group();
    var drops = [];
    for (var i = 0; i < 80; i++) {
      var d = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.4, 0.03),
        new THREE.MeshStandardMaterial({
          color: 0xa8c4d8,
          transparent: true,
          opacity: 0.7,
          roughness: 0.4,
        })
      );
      d.position.set((Math.random() - 0.5) * 22, 2 + Math.random() * 10, (Math.random() - 0.5) * 32);
      d.castShadow = false;
      g.add(d);
      drops.push({ mesh: d, speed: 6 + Math.random() * 5 });
    }
    worldRoot.add(g);
    state.fx.push({ type: "rain", drops: drops });
    if (renderer && scene) {
      renderer.setClearColor(0x5a6a7a, 1);
      scene.fog = new THREE.Fog(0x6a7a8a, 10, 32);
    }
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

  // Elevated on-screen beacon so flat road markings stay findable on phones.
  function makePoiBeacon(id, x, z, label, tapMesh) {
    var g = new THREE.Group();
    var stem = box(0.1, 0.85, 0.1, 0xffe08a, 0, 0.5, 0);
    stem.material.emissive = new THREE.Color(0xffb300);
    stem.material.emissiveIntensity = 0.85;
    var ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0xfff6c2,
        emissive: new THREE.Color(0xffcc33),
        emissiveIntensity: 1.35,
        roughness: 0.35,
      })
    );
    ball.position.y = 1.05;
    g.add(stem);
    g.add(ball);
    g.position.set(x, 0, z);
    g.userData.questId = id;
    g.userData.label = label;
    worldRoot.add(g);
    if (tapMesh) {
      makeTapTarget(id, tapMesh, label);
    }
    // Beacon itself is also tappable and carries the glow.
    if (interactives.indexOf(g) < 0) interactives.push(g);
    projectGlow(g);
    state.animActors.push({ type: "bob", mesh: ball, amp: 0.1, speed: 2.2, baseY: 1.05, phase: Math.random() * 4 });
    return g;
  }

  function updateGlows() {
    if (!renderer || !camera) return;
    // Explore-mode highlights only — keep inside a safe on-screen band.
    if (!state.scenario || state.scenario.mode !== "explore") {
      glowMarkers.forEach(function (g) { g.el.style.display = "none"; });
      return;
    }
    var w = renderer.domElement.clientWidth;
    var h = renderer.domElement.clientHeight;
    var pad = 28;
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
      var off =
        v.z > 1 ||
        v.x < -1.05 ||
        v.x > 1.05 ||
        v.y < -1.05 ||
        v.y > 1.05;
      if (off) {
        g.el.style.display = "none";
      } else {
        g.el.style.display = "block";
        g.el.style.left = Math.max(pad, Math.min(w - pad, x)) + "px";
        g.el.style.top = Math.max(pad + 48, Math.min(h - pad - 100, y)) + "px";
      }
    });
  }

  function walkLimbCycle(mesh, dt, speed) {
    mesh.userData.walkPhase = (mesh.userData.walkPhase || 0) + dt * (speed || 6);
    var ph = mesh.userData.walkPhase;
    mesh.position.y = 0.04 * Math.sin(ph * 2);
    if (mesh.userData.legL) {
      mesh.userData.legL.rotation.x = Math.sin(ph) * 0.55;
      mesh.userData.legR.rotation.x = Math.sin(ph + Math.PI) * 0.55;
      mesh.userData.armL.rotation.x = Math.sin(ph + Math.PI) * 0.45;
      mesh.userData.armR.rotation.x = Math.sin(ph) * 0.45;
    }
  }

  function processClips(dt) {
    var st = state.sceneT;
    for (var i = 0; i < state.clips.length; i++) {
      var c = state.clips[i];
      if (!c || !c.mesh) continue;
      var t0 = c.t0 || 0;
      var local = st - t0;

      if (c.type === "approachStop") {
        var dur = c.dur || 4;
        var hold = c.hold != null ? c.hold : 1.2;
        var cycle = dur + hold;
        var uLocal = c.loop ? ((local % cycle) + cycle) % cycle : local;
        if (!c.loop && local > dur + hold) {
          /* finished — leave mesh for a follow-up clip */
        } else if (uLocal < 0) {
          c.mesh.position.z = c.zStart;
        } else if (uLocal < dur) {
          var u = easeInOut(clamp01(uLocal / dur));
          var prevZ = c.mesh.position.z;
          c.mesh.position.z = lerp(c.zStart, c.zStop, u);
          spinWheels(c.mesh, Math.abs(c.mesh.position.z - prevZ) * 2.5);
        } else {
          c.mesh.position.z = c.zStop;
        }
      } else if (c.type === "crossWalk") {
        var durW = c.dur || 5;
        var pause = c.pause != null ? c.pause : 1.4;
        var cycleW = durW * 2 + pause * 2;
        var lw = c.loop !== false ? ((local % cycleW) + cycleW) % cycleW : local;
        var x0 = c.x0;
        var x1 = c.x1;
        if (lw < 0) {
          c.mesh.position.x = x0;
        } else if (lw < durW) {
          c.mesh.position.x = lerp(x0, x1, easeInOut(clamp01(lw / durW)));
          c.mesh.rotation.y = x1 > x0 ? Math.PI / 2 : -Math.PI / 2;
          walkLimbCycle(c.mesh, dt, 7);
        } else if (lw < durW + pause) {
          c.mesh.position.x = x1;
        } else if (lw < durW * 2 + pause) {
          var back = lw - durW - pause;
          c.mesh.position.x = lerp(x1, x0, easeInOut(clamp01(back / durW)));
          c.mesh.rotation.y = x1 > x0 ? -Math.PI / 2 : Math.PI / 2;
          walkLimbCycle(c.mesh, dt, 7);
        } else {
          c.mesh.position.x = x0;
        }
        if (c.z != null) c.mesh.position.z = c.z;
      } else if (c.type === "pullOutAbort") {
        var durP = c.dur || 3.5;
        var cycleP = c.loop !== false ? durP + 1.2 : durP;
        var lp = c.loop !== false ? ((local % cycleP) + cycleP) % cycleP : local;
        var half = durP * 0.45;
        if (lp < 0) {
          c.mesh.position.x = c.x0;
        } else if (lp < half) {
          c.mesh.position.x = lerp(c.x0, c.xPeek, easeInOut(clamp01(lp / half)));
          spinWheels(c.mesh, 4 * dt);
        } else if (lp < durP) {
          c.mesh.position.x = lerp(c.xPeek, c.x0, easeInOut(clamp01((lp - half) / (durP - half))));
          spinWheels(c.mesh, 4 * dt);
        } else {
          c.mesh.position.x = c.x0;
        }
      } else if (c.type === "oncomingPass") {
        var zFar = c.zFar != null ? c.zFar : -16;
        var zNear = c.zNear != null ? c.zNear : 14;
        var spd = c.speed != null ? c.speed : 9;
        if (local < 0) {
          c.mesh.position.z = zFar;
        } else {
          var span = Math.abs(zNear - zFar);
          var travel = ((local * spd) % (span + 4));
          c.mesh.position.z = zFar + (zNear > zFar ? travel : -travel);
          if (c.x != null) c.mesh.position.x = c.x;
          spinWheels(c.mesh, Math.abs(spd) * 2.8 * dt);
        }
      } else if (c.type === "ambulanceRun") {
        var zA0 = c.zStart != null ? c.zStart : -18;
        var zA1 = c.zEnd != null ? c.zEnd : 16;
        var aSpd = c.speed != null ? c.speed : 7;
        var aSpan = Math.abs(zA1 - zA0);
        var aTravel = ((Math.max(0, local) * aSpd) % (aSpan + 6));
        c.mesh.position.z = zA0 + (zA1 > zA0 ? aTravel : -aTravel);
        if (c.x != null) c.mesh.position.x = c.x;
        spinWheels(c.mesh, Math.abs(aSpd) * 2.8 * dt);
        var flashOn = Math.floor(st / 0.25) % 2 === 0;
        var lights = c.mesh.userData.flashLights || [];
        for (var li = 0; li < lights.length; li++) {
          lights[li].material.emissiveIntensity = flashOn ? (li % 2 === 0 ? 2.2 : 0.15) : (li % 2 === 0 ? 0.15 : 2.2);
        }
      } else if (c.type === "childStep") {
        var period = c.period || 3.2;
        var phC = ((local % period) + period) % period;
        var halfC = period * 0.5;
        if (phC < halfC) {
          c.mesh.position.z = lerp(c.zSafe, c.zRisk, easeInOut(clamp01(phC / halfC)));
        } else {
          c.mesh.position.z = lerp(c.zRisk, c.zSafe, easeInOut(clamp01((phC - halfC) / halfC)));
        }
        if (c.x != null) c.mesh.position.x = c.x;
        walkLimbCycle(c.mesh, dt, 5);
      } else if (c.type === "laneWeave") {
        var amp = c.amp != null ? c.amp : 0.8;
        var xMid = c.xMid != null ? c.xMid : 0;
        var wSpd = c.speed != null ? c.speed : 1.1;
        c.mesh.position.x = xMid + Math.sin(st * wSpd + (c.phase || 0)) * amp;
        c.mesh.rotation.y = Math.sin(st * wSpd + (c.phase || 0)) * 0.28;
        if (c.zDrift) {
          c.mesh.position.z += c.zDrift * dt;
          if (c.mesh.position.z < -18) c.mesh.position.z = 16;
          if (c.mesh.position.z > 18) c.mesh.position.z = -16;
        }
        spinWheels(c.mesh, 5 * dt);
      } else if (c.type === "signalHold") {
        var lightsH = c.lights;
        if (!lightsH) continue;
        var force = c.phase || "green";
        if (lightsH.red) lightsH.red.material.emissiveIntensity = force === "red" ? 1.5 : 0.1;
        if (lightsH.amber) lightsH.amber.material.emissiveIntensity = force === "amber" ? 1.5 : 0.1;
        if (lightsH.green) lightsH.green.material.emissiveIntensity = force === "green" ? 1.5 : 0.1;
      } else if (c.type === "sideShift") {
        var durS = c.dur || 2.5;
        var uS = easeInOut(clamp01(local / durS));
        if (local < 0) c.mesh.position.x = c.x0;
        else if (local < durS) c.mesh.position.x = lerp(c.x0, c.x1, uS);
        else c.mesh.position.x = c.x1;
      } else if (c.type === "rollForward") {
        var rSpd = c.speed != null ? c.speed : 0.55;
        if (local >= 0) {
          c.mesh.position.z += rSpd * dt;
          spinWheels(c.mesh, Math.abs(rSpd) * 3 * dt);
          if (c.zMax != null && c.mesh.position.z > c.zMax) c.mesh.position.z = c.zStart != null ? c.zStart : c.zMax - 6;
          if (c.zMin != null && c.mesh.position.z < c.zMin) c.mesh.position.z = c.zStart != null ? c.zStart : c.zMin + 6;
        }
      }
    }
  }

  function processFx(dt) {
    for (var i = 0; i < state.fx.length; i++) {
      var fx = state.fx[i];
      if (fx.type === "rain" && fx.drops) {
        for (var d = 0; d < fx.drops.length; d++) {
          var drop = fx.drops[d];
          drop.mesh.position.y -= drop.speed * dt;
          if (drop.mesh.position.y < 0.2) {
            drop.mesh.position.y = 8 + Math.random() * 6;
            drop.mesh.position.x = (Math.random() - 0.5) * 22;
            drop.mesh.position.z = (Math.random() - 0.5) * 32;
          }
        }
      }
    }
  }

  // —— Scenario builders (story motion visible from camera ~7,12) ——

  function buildWelcome() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    // Safe phone frame: |x| <= 2.0, z roughly 0..3.5
    makeBus(-1.8, -1.6);
    makeScooter(1.8, 1.0, { rider: false });
    var ped = makePerson(-1.8, 2.0, {
      id: "crossing",
      shirtColor: 0x3d6bb3,
      label: "Someone waiting to cross",
    });
    pushClip({ type: "crossWalk", mesh: ped, x0: -1.8, x1: 1.8, z: 2.0, t0: 0, dur: 2.6, loop: true });
    makeSignal(1.9, -0.8);
    makeDog(-1.5, 0.5);
    state.animCars.push({ mesh: makeCar(0x4f7cac, -1.3, 9), speed: -7.5 });
    state.animCars.push({ mesh: makeCar(0xb85c38, 1.3, -10), speed: 8.0 });
    interactives.forEach(projectGlow);
  }

  function buildBasics() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    // Compact markings kept inside the camera frustum (portrait phones).
    var edge = box(0.5, 0.14, 3.0, 0xf8fafc, -1.95, 0.1, 1.1);
    var lane = box(1.35, 0.06, 3.2, 0x5b8def, -0.9, 0.05, 1.7);
    var centre = box(0.3, 0.08, 3.2, 0xf2e9a8, 0.2, 0.06, 1.4);
    var cross = box(3.4, 0.06, 1.35, 0xffffff, 0, 0.05, 3.35);
    worldRoot.add(edge);
    worldRoot.add(lane);
    worldRoot.add(centre);
    worldRoot.add(cross);
    // Beacons sit above each marking so highlights never slide off-screen.
    makePoiBeacon("edge", -1.95, 1.1, "Road edge", edge);
    makePoiBeacon("lane", -0.9, 1.7, "Lane", lane);
    makePoiBeacon("centre", 0.2, 1.4, "Centre line", centre);
    makePoiBeacon("crossing", 0, 3.35, "Pedestrian area", cross);
    var demo = makeCar(0x4f7cac, -1.2, 9);
    pushClip({ type: "approachStop", mesh: demo, zStart: 9, zStop: 2.2, t0: 0, dur: 3.0, hold: 1.0, loop: true });
  }

  function buildLanes() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    var drift = makeCar(0xd9843b, 0, 3);
    pushClip({ type: "laneWeave", mesh: drift, xMid: 0, amp: 0.85, speed: 1.35, phase: 0, zDrift: -0.4 });
    var approaching = makeCar(0x5b8def, -1.5, 12);
    pushClip({ type: "approachStop", mesh: approaching, zStart: 12, zStop: 6.5, t0: 0.5, dur: 3.5, hold: 2, loop: true });
  }

  function buildJunction() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addCrossRoad();
    addBuildings();
    makeSignal(3.4, 3.4);
    addZebra(1.4);
    var ped = makePerson(-3.5, 1.4, { id: "crossing", shirtColor: 0x3d6bb3, label: "Pedestrian crossing" });
    pushClip({ type: "crossWalk", mesh: ped, x0: -2.6, x1: 2.6, z: 1.4, t0: 0, dur: 2.8, loop: true });
    var car = makeCar(0x5b8def, -1.4, 11);
    pushClip({ type: "approachStop", mesh: car, zStart: 11, zStop: 3.4, t0: 0.3, dur: 3.0, hold: 1.6, loop: true });
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
    worldRoot.add(box(2.2, 0.04, 0.12, 0xffffff, -1.4, 0.05, 2.9));
    var car = makeCar(0x5b8def, -1.4, 11);
    pushClip({ type: "approachStop", mesh: car, zStart: 11, zStop: 3.0, t0: 0, dur: 3.8, hold: 2.8, loop: true });
    makeCar(0x888888, 1.5, -6);
  }

  function buildWarning() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addTrees();
    addBuildings();
    makeWarningSign(-2.6, 3.2);
    var fast = makeCar(0x5b8def, -1.4, 14);
    // two-phase: rush in, then crawl near warning, then loop crawl
    pushClip({ type: "approachStop", mesh: fast, zStart: 14, zStop: 7, t0: 0, dur: 1.5, hold: 0.2, loop: false });
    pushClip({ type: "approachStop", mesh: fast, zStart: 7, zStop: 3.5, t0: 1.7, dur: 3.5, hold: 2.2, loop: true });
    var hazard = makeCar(0xb85c38, 2.2, -2);
    hazard.rotation.y = 0.4;
  }

  function buildBlocked() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addCrossRoad();
    addBuildings();
    var sig = makeSignal(3.4, 3.4);
    pushClip({ type: "signalHold", mesh: sig.green, lights: sig, phase: "green", t0: 0 });
    makeCar(0x666666, -1.2, 0.5);
    makeCar(0x777777, 1.3, -0.2);
    makeTruck(0x555555, 0.1, -1.4);
    var side = makeCar(0xd9843b, 4.5, 1.2);
    side.rotation.y = Math.PI / 2;
    var ego = makeCar(0x5b8def, -1.4, 11);
    pushClip({ type: "approachStop", mesh: ego, zStart: 11, zStop: 4.6, t0: 0, dur: 4, hold: 3, loop: true });
  }

  function buildSpotRisk() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addCrossRoad();
    addBuildings();
    makeSignal(2.0, 2.8);
    var child = makeChild(1.8, 3.2);
    pushClip({ type: "childStep", mesh: child, x: 1.8, zSafe: 3.2, zRisk: 1.6, period: 2.6, t0: 0 });
    makePerson(-1.8, 1.6, { id: "crossing", shirtColor: 0x5b8def });
    var car = makeCar(0x4f7cac, -1.2, 10);
    pushClip({ type: "approachStop", mesh: car, zStart: 10, zStop: 3.2, t0: 0.4, dur: 3.5, hold: 1.6, loop: true });
    addZebra(1.4);
  }

  function buildPeople() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addCrossRoad();
    addBuildings();
    addTrees();
    makeSignal(2.0, 2.6);
    var p1 = makePerson(1.8, 2.8, { id: "crossing", shirtColor: 0x3d6bb3 });
    pushClip({ type: "crossWalk", mesh: p1, x0: 1.8, x1: -1.8, z: 2.8, t0: 0, dur: 3.0, loop: true });
    var p2 = makePerson(-1.8, 1.5, { id: "walker", shirtColor: 0xc97b63 });
    pushClip({ type: "crossWalk", mesh: p2, x0: -1.8, x1: 1.8, z: 1.5, t0: 1.0, dur: 2.7, loop: true });
    var child = makeChild(1.8, 1.0);
    pushClip({ type: "childStep", mesh: child, x: 1.8, zSafe: 1.0, zRisk: 0.05, period: 2.4, t0: 0.5 });
    var scooter = makeScooter(1.9, 4.2, { rider: true, yaw: 0, tapId: "scooter", tapLabel: "Moving scooter" });
    scooter.rotation.y = 0;
    pushClip({ type: "rollForward", mesh: scooter, speed: -1.6, zMax: 4.2, zMin: -2.5, zStart: 4.2, t0: 0 });
    makeDog(-1.7, 0.4);
    var truck = makeTruck(0x6b7a5a, 1.3, -14);
    pushClip({ type: "oncomingPass", mesh: truck, x: 1.3, zFar: -16, zNear: 16, speed: 7.5, t0: 0 });
    state.animCars.push({ mesh: makeCar(0x5b8def, -1.2, 10), speed: -6.5 });
    interactives.forEach(projectGlow);
  }

  function buildHelmet() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    var bike = makeMotorcycle(1.8, 2.0, {
      noHelmet: true,
      tapId: "bike",
      tapLabel: "Rider without helmet",
      color: 0x222222,
      yaw: 0,
    });
    bike.rotation.y = 0;
    pushClip({ type: "rollForward", mesh: bike, speed: 0.7, zStart: 2.0, zMax: 7, zMin: 1.5, t0: 0.5 });
    makeScooter(-2.4, 1.5, { noHelmet: true, tapId: "scooter", tapLabel: "Scooter rider bareheaded", color: 0x4cc9c0, yaw: -0.4 });
    var car = makeCar(0x5b8def, -1.4, 11);
    pushClip({ type: "approachStop", mesh: car, zStart: 11, zStop: 5.5, t0: 0, dur: 4, hold: 2, loop: true });
  }

  function buildParking() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    for (var i = 0; i < 3; i++) {
      var bay = box(2.2, 0.03, 4.2, 0x4a5560, -5.2, 0.04, -6 + i * 5);
      worldRoot.add(bay);
    }
    makeCar(0x4f7cac, -5.2, -6);
    makeCar(0x888888, -5.2, -1);
    worldRoot.add(box(2.0, 0.02, 3.8, 0x5a8f6a, -5.2, 0.05, 4));
    makeBus(-2.8, -8);
    addZebra(5.5);
    makePerson(0.2, 5.2, { id: "crossing", shirtColor: 0x3d6bb3 });
    // wrong park: ease toward crossing then pause
    var wrong = makeCar(0xd9843b, 0.2, 10);
    pushClip({ type: "approachStop", mesh: wrong, zStart: 10, zStop: 5.8, t0: 0, dur: 4.5, hold: 3.5, loop: true });
    makeTruck(0x6b7a5a, 5.5, -4);
  }

  function buildOvertake() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addTrees();
    makeTruck(0x888888, -1.4, 2);
    var oncoming = makeCar(0xb85c38, 1.5, -16);
    pushClip({ type: "oncomingPass", mesh: oncoming, x: 1.5, zFar: -16, zNear: 16, speed: 8.5, t0: 0 });
    var ego = makeCar(0x5b8def, -1.4, 7);
    pushClip({ type: "pullOutAbort", mesh: ego, x0: -1.4, xPeek: 0.6, t0: 0.8, dur: 3.2, loop: true });
    worldRoot.add(box(4, 2.2, 3, 0x6b7a5a, 4.5, 1.1, -1));
  }

  function buildRain() {
    setRainTheme();
    addLights();
    addGroundRoad({ wet: true });
    addBuildings();
    addTrees();
    rainFX();
    var c1 = makeCar(0x5b8def, -1.4, 12);
    pushClip({ type: "approachStop", mesh: c1, zStart: 12, zStop: 5.5, t0: 0, dur: 6.5, hold: 2.5, loop: true });
    state.animCars.push({ mesh: makeCar(0xb85c38, 1.5, -14), speed: 2.2 });
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
    var cyclist = makeCyclist(-3.0, 2.5);
    pushClip({ type: "crossWalk", mesh: cyclist, x0: -3.0, x1: 3.0, z: 2.5, t0: 0, dur: 6, loop: true });
    var nightCar = makeCar(0x5b8def, -1.4, 12, { headlights: true });
    pushClip({ type: "approachStop", mesh: nightCar, zStart: 12, zStop: 4.5, t0: 0, dur: 4.5, hold: 2, loop: true });
  }

  function buildEmergency() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    var carL = makeCar(0x5b8def, -1.4, 4);
    var carR = makeCar(0x888888, 1.5, 2);
    pushClip({ type: "sideShift", mesh: carL, x0: -1.4, x1: -2.6, t0: 1.2, dur: 2.2 });
    pushClip({ type: "sideShift", mesh: carR, x0: 1.5, x1: 2.7, t0: 1.4, dur: 2.2 });
    var amb = makeAmbulance(0.1, -18);
    pushClip({ type: "ambulanceRun", mesh: amb, x: 0.1, zStart: -18, zEnd: 16, speed: 7.5, t0: 0 });
  }

  function buildSchool() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    makeSchoolSign(-3.0, 2.5);
    worldRoot.add(box(3.5, 2.4, 2.2, 0xc9b48a, -7.0, 1.2, 1));
    var c1 = makeChild(2.8, 4.5, { shirtColor: 0xff7a59 });
    var c2 = makeChild(3.2, 3.6, { shirtColor: 0x5b8def, id: "child2", label: "Child near school" });
    pushClip({ type: "childStep", mesh: c1, x: 2.8, zSafe: 4.5, zRisk: 2.2, period: 2.8, t0: 0 });
    pushClip({ type: "childStep", mesh: c2, x: 3.2, zSafe: 3.6, zRisk: 1.8, period: 3.4, t0: 0.8 });
    makePerson(-2.6, 3.0, { id: "crossing", shirtColor: 0x3d6bb3, label: "Parent waiting" });
    var car = makeCar(0xd9843b, -1.4, 12);
    pushClip({ type: "approachStop", mesh: car, zStart: 12, zStop: 4.2, t0: 0, dur: 5, hold: 2, loop: true });
  }

  function buildPhone() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    var ego = makeCar(0x4f7cac, -1.4, 5);
    // phone glow in cabin
    var phone = box(0.18, 0.32, 0.04, 0x88ddff, 0.15, 0.95, 0.35);
    phone.material.emissive = new THREE.Color(0x44aaff);
    phone.material.emissiveIntensity = 1.8;
    ego.add(phone);
    state.animActors.push({ type: "phonePulse", mesh: phone });
    pushClip({ type: "approachStop", mesh: ego, zStart: 8, zStop: 3.5, t0: 0, dur: 5.5, hold: 2, loop: true });
    state.animCars.push({ mesh: makeCar(0xb85c38, 1.5, -12), speed: 4.5 });
    makePerson(2.5, 2.0, { shirtColor: 0x3d6bb3 });
  }

  function buildRailway() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    makeRailCrossing(0.5);
    var car = makeCar(0x5b8def, -1.4, 11);
    pushClip({ type: "approachStop", mesh: car, zStart: 11, zStop: 4.0, t0: 0, dur: 3.5, hold: 4, loop: true });
    // distant “train” bar sweeping across
    var train = box(2.2, 1.6, 8, 0x445566, 0, 1.0, -20);
    worldRoot.add(train);
    pushClip({
      type: "oncomingPass",
      mesh: train,
      x: 0,
      zFar: -22,
      zNear: 18,
      speed: 11,
      t0: 2,
    });
  }

  function buildUturn() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addCrossRoad();
    addBuildings();
    makeSignal(3.4, 3.4);
    var ego = makeCar(0xd9843b, -1.4, 5);
    pushClip({ type: "pullOutAbort", mesh: ego, x0: -1.4, xPeek: 1.2, t0: 0.5, dur: 3.8, loop: true });
    var stream1 = makeCar(0x5b8def, 1.5, -14);
    var stream2 = makeCar(0x888888, 1.5, -8);
    pushClip({ type: "oncomingPass", mesh: stream1, x: 1.5, zFar: -16, zNear: 16, speed: 7, t0: 0 });
    pushClip({ type: "oncomingPass", mesh: stream2, x: 1.5, zFar: -16, zNear: 16, speed: 6.2, t0: 1.4 });
    state.animCars.push({ mesh: makeCar(0x4f7cac, -1.4, 12), speed: -4.8 });
  }

  function buildAccident() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    var a = makeCar(0x5b8def, -0.6, 2.2, { crumpled: true, yaw: 0.55 });
    var b = makeCar(0xd9843b, 0.8, 3.4, { crumpled: true, yaw: -0.9 });
    makePerson(-1.8, 1.4, { shirtColor: 0x3d6bb3, label: "Bystander" });
    makePerson(1.9, 1.0, { shirtColor: 0xc97b63, label: "Caller" });
    var bike = makeMotorcycle(-1.5, 4.2, { noHelmet: false, color: 0x222222, yaw: 1.1 });
    pushClip({ type: "rollForward", mesh: bike, speed: 0.35, zStart: 4.2, zMax: 5.5, zMin: 3.5, t0: 0 });
    var ego = makeCar(0x4f7cac, -1.3, 10);
    pushClip({ type: "approachStop", mesh: ego, zStart: 10, zStop: 5.5, t0: 0, dur: 3.2, hold: 3, loop: true });
    worldRoot.add(box(0.2, 0.7, 0.2, 0xffaa00, -2.2, 0.4, 4.8));
  }

  function buildTwowheel() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    var scooter = makeScooter(-0.2, 6, { rider: true, yaw: 0, color: 0x4cc9c0, tapId: "scooter", tapLabel: "Scooter in lane" });
    scooter.rotation.y = 0;
    pushClip({ type: "rollForward", mesh: scooter, speed: -2.2, zMax: 6, zMin: -4, zStart: 6, t0: 0 });
    var bike = makeMotorcycle(0.5, -8, { color: 0x222222, yaw: 0, headlights: true });
    bike.rotation.y = 0;
    pushClip({ type: "oncomingPass", mesh: bike, x: 0.5, zFar: -12, zNear: 14, speed: 6.5, t0: 0.4 });
    var ego = makeCar(0x5b8def, -1.4, 9);
    pushClip({ type: "approachStop", mesh: ego, zStart: 9, zStop: 3.8, t0: 0.2, dur: 3.5, hold: 1.8, loop: true });
    makeMotorcycle(1.7, 1.5, { noHelmet: true, color: 0x444444, yaw: 0.4, tapLabel: "Bike without helmet" });
  }

  function buildPothole() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    makePothole(-1.1, 2.4);
    makePothole(-0.4, 3.6);
    var ego = makeCar(0x4f7cac, -1.2, 10);
    pushClip({ type: "approachStop", mesh: ego, zStart: 10, zStop: 5.2, t0: 0, dur: 3.4, hold: 2.2, loop: true });
    state.animCars.push({ mesh: makeCar(0xb85c38, 1.3, -10), speed: 6.5 });
    var scooter = makeScooter(1.6, 1.2, { rider: true, yaw: -0.4 });
    pushClip({ type: "crossWalk", mesh: scooter, x0: 1.6, x1: -0.2, z: 1.2, t0: 0.5, dur: 4, loop: true });
  }

  function buildSpeedbump() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    makeSpeedBreaker(2.8);
    makeSpeedBreaker(3.5);
    var ego = makeCar(0xd9843b, -1.2, 10);
    pushClip({ type: "approachStop", mesh: ego, zStart: 10, zStop: 4.6, t0: 0, dur: 3.6, hold: 1.5, loop: true });
    var bike = makeMotorcycle(-1.0, 12, { color: 0x1a1a1a, yaw: 0 });
    bike.rotation.y = 0;
    pushClip({ type: "approachStop", mesh: bike, zStart: 12, zStop: 5.8, t0: 0.8, dur: 3.2, hold: 2, loop: true });
  }

  function buildSeatbelt() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    var ego = makeCar(0x5b8def, -1.2, 3.5, { seatbeltOff: true });
    pushClip({ type: "approachStop", mesh: ego, zStart: 6, zStop: 3.5, t0: 0, dur: 2.8, hold: 3.5, loop: true });
    makePerson(1.8, 1.5, { shirtColor: 0x3d6bb3, label: "Passenger waiting" });
    state.animCars.push({ mesh: makeCar(0x888888, 1.3, -12), speed: 5.5 });
  }

  function buildHelmetown() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    var bike = makeMotorcycle(-1.0, 2.5, {
      noHelmet: true,
      helmetInHand: true,
      color: 0x222222,
      yaw: 0.2,
      tapId: "bike",
      tapLabel: "Helmet still in hand",
    });
    pushClip({ type: "rollForward", mesh: bike, speed: 0.15, zStart: 2.5, zMax: 3.2, zMin: 2.2, t0: 0 });
    makeCar(0x4f7cac, 1.3, -2);
    makePerson(1.7, 2.0, { shirtColor: 0xc97b63 });
  }

  function buildLightsfault() {
    setNightTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    var bad = makeCar(0x4f7cac, -1.2, 3.2, { brokenHead: true, brokenTail: true });
    pushClip({ type: "approachStop", mesh: bad, zStart: 7, zStop: 3.2, t0: 0, dur: 3, hold: 3, loop: true });
    var good = makeCar(0xd9843b, 1.3, -10, { headlights: true, tailLights: true });
    pushClip({ type: "oncomingPass", mesh: good, x: 1.3, zFar: -14, zNear: 14, speed: 6, t0: 0 });
    makeMotorcycle(1.6, 1.5, { headlights: true, color: 0x333333, yaw: 0.5 });
  }

  function buildHospital() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    makeHospital(-6.5, 1.5);
    makeSilentZoneSign(-2.4, 2.8);
    var ego = makeCar(0x5b8def, -1.2, 9);
    pushClip({ type: "approachStop", mesh: ego, zStart: 9, zStop: 4.0, t0: 0, dur: 3.5, hold: 2.5, loop: true });
    makeAmbulance(1.2, -6);
    makeScooter(1.7, 1.2, { rider: true, yaw: -0.5 });
    makePerson(-2.0, 1.0, { shirtColor: 0xe8eef5, label: "Visitor" });
  }

  function buildPriority() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addCrossRoad();
    addBuildings();
    makeSignal(2.2, 2.2);
    var fromRight = makeCar(0xd9843b, 8, 1.2, { yaw: Math.PI / 2 });
    fromRight.rotation.y = Math.PI / 2;
    pushClip({ type: "pullOutAbort", mesh: fromRight, x0: 5.5, xPeek: 1.8, t0: 0, dur: 3.2, loop: true });
    var fromLeft = makeCar(0x888888, -8, -1.0, { yaw: -Math.PI / 2 });
    fromLeft.rotation.y = -Math.PI / 2;
    pushClip({ type: "pullOutAbort", mesh: fromLeft, x0: -5.5, xPeek: -1.6, t0: 1.0, dur: 3.4, loop: true });
    var ego = makeCar(0x5b8def, -1.2, 10);
    pushClip({ type: "approachStop", mesh: ego, zStart: 10, zStop: 4.2, t0: 0.3, dur: 3.2, hold: 2.5, loop: true });
    var bike = makeMotorcycle(1.4, -10, { color: 0x222222, yaw: 0 });
    bike.rotation.y = 0;
    pushClip({ type: "oncomingPass", mesh: bike, x: 1.4, zFar: -12, zNear: 12, speed: 5.5, t0: 0.6 });
  }

  function buildHillright() {
    setDayTheme();
    if (renderer && scene) {
      renderer.setClearColor(0x8fb7d8, 1);
      scene.fog = new THREE.Fog(0x8fb7d8, 14, 42);
    }
    addLights();
    makeHillGround();
    addTrees();
    var uphill = makeCar(0x5b8def, -0.9, 4.5);
    uphill.position.y = 0.55;
    pushClip({ type: "approachStop", mesh: uphill, zStart: 7, zStop: 3.2, t0: 0, dur: 3.5, hold: 2.5, loop: true });
    var down = makeCar(0xd9843b, 0.9, -5);
    down.position.y = 1.3;
    pushClip({ type: "approachStop", mesh: down, zStart: -7, zStop: -2.2, t0: 0.4, dur: 3.2, hold: 2.8, loop: true });
    var bike = makeMotorcycle(-1.5, 1.5, { color: 0x333333, yaw: 0.2 });
    bike.position.y = 0.7;
  }

  function buildBeams() {
    setNightTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    var ego = makeCar(0x4f7cac, -1.2, 4, { highBeam: true });
    pushClip({ type: "approachStop", mesh: ego, zStart: 8, zStop: 4, t0: 0, dur: 3, hold: 3, loop: true });
    var oncoming = makeCar(0xd9843b, 1.3, -12, { headlights: true });
    pushClip({ type: "oncomingPass", mesh: oncoming, x: 1.3, zFar: -14, zNear: 12, speed: 5.8, t0: 0 });
    makeMotorcycle(1.6, 2.0, { headlights: true, color: 0x222222, yaw: 0.4 });
    makePerson(-2.0, 1.5, { shirtColor: 0x3d6bb3 });
  }

  function buildFog() {
    setRainTheme();
    if (scene) scene.fog = new THREE.Fog(0x9aa8b4, 4, 16);
    if (renderer) renderer.setClearColor(0x8a96a2, 1);
    addLights();
    addGroundRoad({ wet: true });
    addBuildings();
    var ego = makeCar(0x5b8def, -1.2, 4, { headlights: true });
    pushClip({ type: "approachStop", mesh: ego, zStart: 8, zStop: 4, t0: 0, dur: 4, hold: 2.5, loop: true });
    state.animCars.push({ mesh: makeCar(0x888888, 1.2, -10, { headlights: true }), speed: 3.2 });
    makeScooter(1.6, 1.0, { rider: true, yaw: -0.3 });
  }

  function buildZebra() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addZebra(2.4);
    var p1 = makePerson(-1.8, 2.4, { id: "crossing", shirtColor: 0x3d6bb3 });
    pushClip({ type: "crossWalk", mesh: p1, x0: -1.8, x1: 1.8, z: 2.4, t0: 0, dur: 3.0, loop: true });
    var child = makeChild(1.6, 2.4);
    pushClip({ type: "childStep", mesh: child, x: 1.6, zSafe: 3.2, zRisk: 2.2, period: 2.8, t0: 0.5 });
    var ego = makeCar(0xd9843b, -1.2, 10);
    pushClip({ type: "approachStop", mesh: ego, zStart: 10, zStop: 4.5, t0: 0.2, dur: 3.2, hold: 2.5, loop: true });
    makeMotorcycle(1.5, -6, { color: 0x333333, yaw: 0 });
  }

  function buildWrongway() {
    setDayTheme();
    addLights();
    addGroundRoad();
    addBuildings();
    addTrees();
    var wrong = makeScooter(-1.2, -8, { rider: true, yaw: Math.PI, color: 0xff7a59, tapId: "scooter", tapLabel: "Wrong-way scooter" });
    wrong.rotation.y = Math.PI;
    pushClip({ type: "oncomingPass", mesh: wrong, x: -1.2, zFar: -12, zNear: 12, speed: 5.5, t0: 0 });
    var ego = makeCar(0x5b8def, -1.2, 9);
    pushClip({ type: "approachStop", mesh: ego, zStart: 9, zStop: 3.5, t0: 0.3, dur: 3.2, hold: 2.2, loop: true });
    var bike = makeMotorcycle(1.3, 8, { color: 0x222222, yaw: 0 });
    bike.rotation.y = 0;
    pushClip({ type: "rollForward", mesh: bike, speed: -2.0, zMax: 8, zMin: -4, zStart: 8, t0: 0.5 });
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
    else if (buildId === "school") buildSchool();
    else if (buildId === "phone") buildPhone();
    else if (buildId === "railway") buildRailway();
    else if (buildId === "uturn") buildUturn();
    else if (buildId === "accident") buildAccident();
    else if (buildId === "twowheel") buildTwowheel();
    else if (buildId === "pothole") buildPothole();
    else if (buildId === "speedbump") buildSpeedbump();
    else if (buildId === "seatbelt") buildSeatbelt();
    else if (buildId === "helmetown") buildHelmetown();
    else if (buildId === "lightsfault") buildLightsfault();
    else if (buildId === "hospital") buildHospital();
    else if (buildId === "priority") buildPriority();
    else if (buildId === "hillright") buildHillright();
    else if (buildId === "beams") buildBeams();
    else if (buildId === "fog") buildFog();
    else if (buildId === "zebra") buildZebra();
    else if (buildId === "wrongway") buildWrongway();
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
        markScenarioDone(sc.id);
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
      child2: "School kids need slow, careful drivers.",
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
        markScenarioDone(sc.id);
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
    if (!isScenarioUnlocked(id)) {
      say("Finish the previous district first.");
      return;
    }
    if (!initGl()) return;
    clearWorld();
    state.scenario = sc;
    menu.style.display = "none";
    hud.style.display = "flex";
    sceneLabel.textContent = sc.label;
    say(sc.buddyStart);
    hintEl.textContent = sc.hint || "";
    buildById(sc.build || id);
    state.sceneT = 0;
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
    refreshMenuLocks();
  }

  var SCENARIO_ORDER = [
    "welcome", "basics", "lanes", "signstop", "warning",
    "junction", "blocked", "spotrisk", "people", "helmet",
    "parking", "overtake", "rain", "night", "emergency",
    "school", "phone", "railway", "uturn",
    "accident", "twowheel", "pothole", "speedbump", "seatbelt",
    "helmetown", "lightsfault", "hospital", "priority", "hillright",
    "beams", "fog", "zebra", "wrongway",
  ];

  function completedIds() {
    try {
      return JSON.parse(localStorage.getItem("rtobuddy_quest_done") || "[]");
    } catch (e) {
      return [];
    }
  }

  function markScenarioDone(id) {
    var done = completedIds();
    if (done.indexOf(id) < 0) {
      done.push(id);
      try {
        localStorage.setItem("rtobuddy_quest_done", JSON.stringify(done));
      } catch (e) { /* ignore */ }
    }
    refreshMenuLocks();
  }

  function isScenarioUnlocked(id) {
    var idx = SCENARIO_ORDER.indexOf(id);
    if (idx <= 0) return true;
    var done = completedIds();
    return done.indexOf(SCENARIO_ORDER[idx - 1]) >= 0;
  }

  function refreshMenuLocks() {
    var done = completedIds();
    Array.prototype.forEach.call(document.querySelectorAll(".scenario-btn"), function (btn) {
      var id = btn.getAttribute("data-id");
      var unlocked = isScenarioUnlocked(id);
      var finished = done.indexOf(id) >= 0;
      btn.classList.toggle("locked", !unlocked);
      btn.classList.toggle("done", finished);
      btn.disabled = !unlocked;
    });
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

  var _lastFrameMs = 0;
  function animate() {
    requestAnimationFrame(animate);
    if (!glReady || !renderer) return;
    // Android WebView often returns 0 from THREE.Clock.getDelta — drive time ourselves.
    var nowMs = (typeof performance !== "undefined" ? performance.now() : Date.now());
    var dt = _lastFrameMs ? Math.min((nowMs - _lastFrameMs) / 1000, 0.05) : 1 / 30;
    if (dt <= 0) dt = 1 / 30;
    _lastFrameMs = nowMs;
    var t = nowMs / 1000;

    if (state.scenario) {
      camera.position.x = Math.sin(t * 0.2) * 0.12;
      camera.position.y = 6.2 + Math.sin(t * 0.35) * 0.05;
      camera.position.z = 10.5;
      camera.lookAt(0, 0.5, 1);
      state.sceneT += dt;
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
      spinWheels(c.mesh, Math.abs(c.speed) * 2.8 * dt);
    });

    processClips(dt);
    processFx(dt);

    state.animActors.forEach(function (a) {
      if (a.type === "walk") {
        var mesh = a.mesh;
        walkLimbCycle(mesh, dt, 6);
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
        // skip if a signalHold clip is active for these lights
        var held = false;
        for (var ci = 0; ci < state.clips.length; ci++) {
          if (state.clips[ci].type === "signalHold" && state.clips[ci].lights === a.lights) {
            held = true;
            break;
          }
        }
        if (!held) {
          var phase = Math.floor(t / 1.2) % 3;
          if (a.lights.red) a.lights.red.material.emissiveIntensity = phase === 0 ? 1.3 : 0.12;
          if (a.lights.amber) a.lights.amber.material.emissiveIntensity = phase === 1 ? 1.3 : 0.12;
          if (a.lights.green) a.lights.green.material.emissiveIntensity = phase === 2 ? 1.3 : 0.12;
        }
      } else if (a.type === "bob") {
        var base = a.baseY != null ? a.baseY : a.mesh.position.y;
        a.mesh.position.y = base + Math.sin(t * (a.speed || 1.2) + (a.phase || 0)) * (a.amp || 0.08);
      } else if (a.type === "drift") {
        a.mesh.rotation.y = (a.baseYaw != null ? a.baseYaw : 0) + Math.sin(t * (a.speed || 0.9)) * (a.amp || 0.06);
      } else if (a.type === "phonePulse" && a.mesh) {
        a.mesh.material.emissiveIntensity = 1.2 + Math.sin(t * 6) * 0.8;
      } else if (a.type === "railFlash" && a.lights) {
        var on = Math.floor(t / 0.35) % 2 === 0;
        for (var ri = 0; ri < a.lights.length; ri++) {
          a.lights[ri].material.emissiveIntensity = (on ? ri === 0 : ri === 1) ? 2.0 : 0.2;
        }
        if (a.bars) {
          for (var bi = 0; bi < a.bars.length; bi++) {
            a.bars[bi].rotation.z = Math.sin(t * 0.4) * 0.05;
          }
        }
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
  refreshMenuLocks();
  if (typeof THREE === "undefined") {
    showBootError("3D engine script missing.");
  }
  bridge("onReady");
})();
