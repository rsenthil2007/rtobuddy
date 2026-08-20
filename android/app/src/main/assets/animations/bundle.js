/**
 * Scenario animations for exam questions.
 *
 * Each builder returns an SVG string (inline, no external deps).
 * CSS keyframes live in app.css under .anim-scene.
 *
 * To add a new animation type:
 *   1. Add a function here: `function myScene() { return '<svg>â€¦</svg>'; }`
 *   2. Register it in ANIMATIONS: `my_scene: myScene`
 *   3. Tag questions in mock_questions.json with `"animation": "my_scene"`
 */

const W = 320, H = 180;
const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="anim-svg" role="img"`;

function road(y = 130) {
  return `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="#374151"/>` +
    `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#9ca3af" stroke-width="2"/>` +
    `<line x1="0" y1="${y + 4}" x2="${W}" y2="${y + 4}" stroke="#fbbf24" stroke-width="2" stroke-dasharray="16 12"/>`;
}

function car(id, x, y, color = '#3b82f6', flip = false) {
  const d = flip ? -1 : 1;
  return `<g id="${id}" transform="translate(${x},${y})${flip ? ' scale(-1,1)' : ''}">
    <rect x="${flip ? -38 : 0}" y="-14" width="38" height="14" rx="4" fill="${color}"/>
    <rect x="${flip ? -28 : 6}" y="-22" width="18" height="10" rx="3" fill="${color}" opacity=".8"/>
    <circle cx="${flip ? -8 : 8}" cy="0" r="4" fill="#1f2937"/><circle cx="${flip ? -30 : 30}" cy="0" r="4" fill="#1f2937"/>
  </g>`;
}

function ambulance(id, x, y) {
  return `<g id="${id}" transform="translate(${x},${y})">
    <rect x="0" y="-18" width="46" height="18" rx="4" fill="#fff"/>
    <rect x="32" y="-26" width="14" height="10" rx="2" fill="#fff"/>
    <line x1="17" y1="-14" x2="17" y2="-5" stroke="#ef4444" stroke-width="3"/>
    <line x1="13" y1="-10" x2="21" y2="-10" stroke="#ef4444" stroke-width="3"/>
    <rect x="0" y="-18" width="46" height="18" rx="4" fill="none" stroke="#ef4444" stroke-width="1.5"/>
    <circle cx="10" cy="0" r="4" fill="#1f2937"/><circle cx="38" cy="0" r="4" fill="#1f2937"/>
  </g>`;
}

function pedestrian(id, x, y) {
  return `<g id="${id}" transform="translate(${x},${y})">
    <circle cx="0" cy="-20" r="4" fill="#f59e0b"/>
    <line x1="0" y1="-16" x2="0" y2="-4" stroke="#f59e0b" stroke-width="2.5"/>
    <line x1="0" y1="-12" x2="-5" y2="-7" stroke="#f59e0b" stroke-width="2"/>
    <line x1="0" y1="-12" x2="5" y2="-7" stroke="#f59e0b" stroke-width="2"/>
    <line x1="0" y1="-4" x2="-4" y2="4" stroke="#f59e0b" stroke-width="2"/>
    <line x1="0" y1="-4" x2="4" y2="4" stroke="#f59e0b" stroke-width="2"/>
  </g>`;
}

function trafficLight(x, y, active = 'red') {
  const r = active === 'red' ? '#ef4444' : '#4b5563';
  const a = active === 'amber' ? '#f59e0b' : '#4b5563';
  const g = active === 'green' ? '#22c55e' : '#4b5563';
  return `<g transform="translate(${x},${y})">
    <rect x="-8" y="-36" width="16" height="38" rx="3" fill="#1f2937"/>
    <circle cx="0" cy="-26" r="4" fill="${r}"/><circle cx="0" cy="-16" r="4" fill="${a}"/><circle cx="0" cy="-6" r="4" fill="${g}"/>
    <rect x="-2" y="2" width="4" height="12" fill="#374151"/>
  </g>`;
}

function zebraCrossing(x1, x2, y) {
  let s = '';
  for (let x = x1; x < x2; x += 10) {
    s += `<rect x="${x}" y="${y - 3}" width="6" height="6" fill="#fff" opacity=".7"/>`;
  }
  return s;
}

function speedSign(x, y, limit = '60') {
  return `<g transform="translate(${x},${y})">
    <circle cx="0" cy="0" r="14" fill="#fff" stroke="#ef4444" stroke-width="3"/>
    <text x="0" y="5" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#111">${limit}</text>
  </g>`;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SCENE BUILDERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function giveWay() {
  return `${head} aria-label="Give way at junction">
    <rect width="${W}" height="${H}" fill="#1e293b"/>
    ${road(110)}
    <rect x="140" y="40" width="40" height="70" fill="#374151"/>
    <line x1="160" y1="40" x2="160" y2="110" stroke="#fbbf24" stroke-width="2" stroke-dasharray="10 8"/>
    <polygon points="155,50 160,40 165,50" fill="#fff" stroke="#ef4444" stroke-width="1.5"/>
    <text x="160" y="48" text-anchor="middle" font-size="5" fill="#ef4444">YIELD</text>
    ${car('car-a', 40, 108, '#3b82f6')}
    ${car('car-b', 145, 70, '#10b981')}
    <animateTransform xlink:href="#car-a" attributeName="transform" type="translate" values="40,108;120,108;120,108;120,108" dur="3s" repeatCount="indefinite"/>
    <animateTransform xlink:href="#car-b" attributeName="transform" type="translate" values="145,70;145,90;145,108;145,108" dur="3s" repeatCount="indefinite"/>
  </svg>`;
}

function noOvertaking() {
  return `${head} aria-label="No overtaking zone">
    <rect width="${W}" height="${H}" fill="#1e293b"/>
    ${road(130)}
    <line x1="80" y1="128" x2="240" y2="128" stroke="#fff" stroke-width="2"/>
    <circle cx="50" cy="100" r="16" fill="#fff" stroke="#ef4444" stroke-width="3"/>
    <text x="50" y="105" text-anchor="middle" font-size="8" fill="#ef4444" font-weight="700">NO</text>
    ${car('slow-car', 180, 126, '#6b7280')}
    ${car('fast-car', 80, 126, '#3b82f6')}
    <animateTransform xlink:href="#fast-car" attributeName="transform" type="translate" values="80,126;160,126;160,126;160,126;80,126" dur="4s" repeatCount="indefinite"/>
    <line x1="160" y1="118" x2="160" y2="138" stroke="#ef4444" stroke-width="2" opacity=".7">
      <animate attributeName="opacity" values="0;.8;0" dur="1.5s" repeatCount="indefinite"/>
    </line>
  </svg>`;
}

function speedLimit() {
  return `${head} aria-label="Speed limit zone">
    <rect width="${W}" height="${H}" fill="#1e293b"/>
    ${road(130)}
    ${speedSign(60, 100, '60')}
    ${car('speed-car', 20, 126, '#3b82f6')}
    <animateTransform xlink:href="#speed-car" attributeName="transform" type="translate" values="20,126;280,126" dur="2.5s" repeatCount="indefinite"/>
    <text x="260" y="120" font-size="10" fill="#22c55e" font-weight="700" opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0" dur="2.5s" repeatCount="indefinite"/>
      55 km/h âœ“
    </text>
  </svg>`;
}

function pedestrianCrossing() {
  return `${head} aria-label="Pedestrian crossing">
    <rect width="${W}" height="${H}" fill="#1e293b"/>
    ${road(130)}
    ${zebraCrossing(140, 200, 134)}
    ${pedestrian('ped', 170, 125)}
    ${car('cross-car', 40, 126, '#3b82f6')}
    <animateTransform xlink:href="#cross-car" attributeName="transform" type="translate" values="40,126;110,126;110,126;110,126;110,126" dur="3.5s" repeatCount="indefinite"/>
    <animateTransform xlink:href="#ped" attributeName="transform" type="translate" values="170,125;170,125;170,140;170,155;170,155" dur="3.5s" repeatCount="indefinite"/>
    <rect x="108" y="118" width="6" height="20" rx="1" fill="#ef4444" opacity="0">
      <animate attributeName="opacity" values="0;0;.7;.7;0" dur="3.5s" repeatCount="indefinite"/>
    </rect>
  </svg>`;
}

function ambulancePriority() {
  return `${head} aria-label="Give way to ambulance">
    <rect width="${W}" height="${H}" fill="#1e293b"/>
    ${road(130)}
    ${car('civ1', 120, 126, '#6b7280')}
    ${car('civ2', 180, 126, '#6b7280')}
    ${ambulance('amb', 20, 126)}
    <rect x="22" y="96" width="12" height="6" rx="1" fill="#ef4444" opacity=".8">
      <animate attributeName="fill" values="#ef4444;#3b82f6;#ef4444" dur=".6s" repeatCount="indefinite"/>
    </rect>
    <animateTransform xlink:href="#amb" attributeName="transform" type="translate" values="20,126;260,126" dur="3s" repeatCount="indefinite"/>
    <animateTransform xlink:href="#civ1" attributeName="transform" type="translate" values="120,126;120,126;100,140;100,140" dur="3s" repeatCount="indefinite"/>
    <animateTransform xlink:href="#civ2" attributeName="transform" type="translate" values="180,126;180,126;160,140;160,140" dur="3s" repeatCount="indefinite"/>
  </svg>`;
}

function signalRed() {
  return `${head} aria-label="Red signal - stop">
    <rect width="${W}" height="${H}" fill="#1e293b"/>
    ${road(130)}
    ${trafficLight(160, 120, 'red')}
    ${car('sig-car', 40, 126, '#3b82f6')}
    <animateTransform xlink:href="#sig-car" attributeName="transform" type="translate" values="40,126;120,126;120,126;120,126" dur="3s" repeatCount="indefinite"/>
    <line x1="148" y1="120" x2="148" y2="140" stroke="#ef4444" stroke-width="2" opacity=".5" stroke-dasharray="4 3"/>
  </svg>`;
}

function signalGreen() {
  return `${head} aria-label="Green signal - go">
    <rect width="${W}" height="${H}" fill="#1e293b"/>
    ${road(130)}
    ${trafficLight(100, 120, 'green')}
    ${car('go-car', 40, 126, '#3b82f6')}
    <animateTransform xlink:href="#go-car" attributeName="transform" type="translate" values="40,126;40,126;280,126" dur="3s" repeatCount="indefinite"/>
  </svg>`;
}

function signalAmber() {
  return `${head} aria-label="Amber signal - prepare to stop">
    <rect width="${W}" height="${H}" fill="#1e293b"/>
    ${road(130)}
    ${trafficLight(140, 120, 'amber')}
    ${car('amb-car', 40, 126, '#3b82f6')}
    <animateTransform xlink:href="#amb-car" attributeName="transform" type="translate" values="40,126;90,126;100,126;100,126" dur="3s" repeatCount="indefinite"/>
    <text x="100" y="156" text-anchor="middle" font-size="9" fill="#f59e0b" font-weight="700" opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0" dur="3s" repeatCount="indefinite"/>
      SLOW
    </text>
  </svg>`;
}

function signalFlashingRed() {
  return `${head} aria-label="Flashing red - treat as stop sign">
    <rect width="${W}" height="${H}" fill="#1e293b"/>
    ${road(130)}
    <g transform="translate(140,120)">
      <rect x="-8" y="-36" width="16" height="38" rx="3" fill="#1f2937"/>
      <circle cx="0" cy="-26" r="4" fill="#ef4444">
        <animate attributeName="opacity" values="1;0;1" dur=".8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="0" cy="-16" r="4" fill="#4b5563"/><circle cx="0" cy="-6" r="4" fill="#4b5563"/>
      <rect x="-2" y="2" width="4" height="12" fill="#374151"/>
    </g>
    ${car('flash-car', 40, 126, '#3b82f6')}
    <animateTransform xlink:href="#flash-car" attributeName="transform" type="translate" values="40,126;100,126;100,126;100,126;100,126" dur="4s" repeatCount="indefinite"/>
  </svg>`;
}

function signalFlashingAmber() {
  return `${head} aria-label="Flashing amber - proceed with caution">
    <rect width="${W}" height="${H}" fill="#1e293b"/>
    ${road(130)}
    <g transform="translate(140,120)">
      <rect x="-8" y="-36" width="16" height="38" rx="3" fill="#1f2937"/>
      <circle cx="0" cy="-26" r="4" fill="#4b5563"/>
      <circle cx="0" cy="-16" r="4" fill="#f59e0b">
        <animate attributeName="opacity" values="1;0;1" dur=".8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="0" cy="-6" r="4" fill="#4b5563"/>
      <rect x="-2" y="2" width="4" height="12" fill="#374151"/>
    </g>
    ${car('fa-car', 40, 126, '#3b82f6')}
    <animateTransform xlink:href="#fa-car" attributeName="transform" type="translate" values="40,126;100,126;280,126" dur="3.5s" repeatCount="indefinite"/>
  </svg>`;
}

function laneArrow() {
  return `${head} aria-label="Lane direction arrow">
    <rect width="${W}" height="${H}" fill="#1e293b"/>
    ${road(130)}
    <line x1="120" y1="128" x2="120" y2="142" stroke="#fff" stroke-width="1.5"/>
    <line x1="200" y1="128" x2="200" y2="142" stroke="#fff" stroke-width="1.5"/>
    <path d="M100 138 L100 132 L95 132 L105 126 L115 132 L110 132 L110 138Z" fill="#fbbf24" opacity=".6"/>
    <path d="M160 138 L155 132 L160 126 L165 132Z" fill="#fbbf24" opacity=".6"/>
    ${car('lane-car', 90, 126, '#3b82f6')}
    <animateTransform xlink:href="#lane-car" attributeName="transform" type="translate" values="90,126;150,126;210,126;90,126" dur="4s" repeatCount="indefinite"/>
  </svg>`;
}

function zebraCrossingScene() {
  return `${head} aria-label="Zebra crossing marking">
    <rect width="${W}" height="${H}" fill="#1e293b"/>
    ${road(130)}
    ${zebraCrossing(120, 200, 134)}
    <text x="160" y="155" text-anchor="middle" font-size="8" fill="#fff" opacity=".5">ZEBRA CROSSING</text>
    ${pedestrian('zped', 160, 125)}
    ${car('z-car', 30, 126, '#3b82f6')}
    <animateTransform xlink:href="#z-car" attributeName="transform" type="translate" values="30,126;90,126;90,126;90,126;90,126" dur="4s" repeatCount="indefinite"/>
    <animateTransform xlink:href="#zped" attributeName="transform" type="translate" values="160,125;160,125;160,140;160,155;160,155" dur="4s" repeatCount="indefinite"/>
  </svg>`;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ REGISTRY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

var ANIMATIONS = {
  give_way: giveWay,
  no_overtaking: noOvertaking,
  speed_limit: speedLimit,
  pedestrian_crossing: pedestrianCrossing,
  ambulance_priority: ambulancePriority,
  signal_red: signalRed,
  signal_green: signalGreen,
  signal_amber: signalAmber,
  signal_flashing_red: signalFlashingRed,
  signal_flashing_amber: signalFlashingAmber,
  lane_arrow: laneArrow,
  zebra_crossing: zebraCrossingScene,
};


