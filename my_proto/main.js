title = "DODGER";

description = `
[Hold]
Contract
[Release]
Detonate
`;

characters = [
  `
 llll
llllll
l ll l
l ll l
llllll
 llll
  `,
  `
  r
  rl
rrrl
 llll
   lll
    ll
`,
];

options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
};

/** @type {{pos: Vector, vel: Vector}} */
let player;
/** @type {{pos: Vector, ticks: Number}}*/
let explosion;
let rockets;
let activeRocket;
let asteroids;
let nextAsteroidTicks;
let nextAsteroidAxis;
let multiplier;
let orbitDir;
const orbitDist = 12.5;

function update() {
  
  if (!ticks) {
    orbitDir = 1;
    player = {pos: vec(50, 50), vel: vec(0, 0) };
    rockets = [];
    for (i = 0; i < 4; i++) {
      rockets.push({
        angle: (i),
        pos: vec(vec(player.pos).addWithAngle((Math.PI / 2 * i) + Math.PI / 4, orbitDist)).add(0.5, 0.5),
      });
    }
    activeRocket = 0;
  }
  color("black");
  char("a", player.pos);
  
  // update pos
  player.pos = player.pos.add(player.vel);

  // bounce off edge of screen
  if (
    (player.pos.x < 4 && player.vel.x < 0) ||
    (player.pos.x > 96 && player.vel.x > 0)
    ) {
      player.vel.x *= -0.8;
    }
  if (
    (player.pos.y < 4 && player.vel.y < 0) ||
    (player.pos.y > 97 && player.vel.y > 0)
    ) {
      player.vel.y *= -0.8;
    }
  // apply friction
  player.vel.mul(0.95);

  // TODO: pop rockets off; cycle ticks to push rockets back into the array; make rocket angles scale to current count of rockets and modulo activeRocket by the rocket count
  // TODO: make next rocket ticks extra long if player has 0 rockets (punish spam)
if (input.isJustReleased) {
  // detonate the active rocket
  play("powerUp");
  const r = rockets[activeRocket];
  explosion = {pos: r.pos, ticks: 0}
  color("light_yellow");
  particle(explosion.pos, 18, 2.2, rnd(4));
  const d = r.pos.distanceTo(player.pos);
  const a = r.pos.angleTo(player.pos);
  player.vel.addWithAngle(a, 15 / d);
  ++activeRocket;
  activeRocket %= rockets.length;
  orbitDir *= -1;
}

if (explosion != null) {
  ++(explosion.ticks);
  let r = Math.sin(explosion.ticks * 0.2) * 4;
  if (r < 0) {
    explosion = undefined;
  } else {
    r = r*r;
    color("light_red");
    arc(explosion.pos, r);
  }
}

  let currRocket = 0;
  remove(rockets, (r) => {
    r.angle += difficulty * 0.02 * orbitDir;
    r.pos = vec(vec(player.pos).addWithAngle((r.angle * Math.PI / 2) + Math.PI / 4, orbitDist)).add(0.5, 0.5);
    // draw rockets
    color(currRocket == activeRocket ? "cyan" : "black");
    box(r.pos, 3);
    ++currRocket;
  });
}

addEventListener("load", onLoad);