title = "R DODGER";

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
let asteroids;
let nextAsteroidTicks;
let nextAsteroidAxis;
let multiplier;
let orbitDir;
let detonated;
let nextRocketTicks;
let nextRocketAngle;
let nextRocketIndex;
let rocketFatigue;
let orbitScale;
const orbitDist = 12.5;

function update() {
  
  if (!ticks) {
    orbitDir = 1;
    orbitScale = 1;
    player = {pos: vec(50, 50), vel: vec(0, 0) };
    rockets = [];
    for (i = 0; i < 4; i++) {
      rockets.push({
        angle: (i),
        pos: vec(player.pos).addWithAngle((Math.PI / 2 * i) + Math.PI / 4, orbitDist * orbitScale),
      });
    }
    nextAsteroidTicks = 0;
    nextRocketTicks = 0;
    nextRocketAngle = 0;
    nextRocketIndex = 0;
    rocketFatigue = false;
  }

  ++nextAsteroidTicks;
  ++nextRocketTicks;
  color("black"); // note that in dark theme, black and white are inverted
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
  player.vel.mul(0.945);
  detonated = false;

  // pull rockets inward
  if (input.isPressed) {
    orbitScale = Math.max(orbitScale * 0.975, 0.5);
  } else {
    orbitScale = Math.min(orbitScale / 0.95, 1);
  }

  if (input.isJustReleased && rockets.length > 0) {
    // detonate the active rocket
    play("powerUp");
    const r = rockets[0];
    explosion = {pos: r.pos, ticks: 0}
    color("light_yellow");
    particle(explosion.pos, 18, 2.2, rnd(4));

    // boost player away from explosion origin
    const d = r.pos.distanceTo(player.pos);
    const a = r.pos.angleTo(player.pos);
    player.vel.addWithAngle(a, 17 / d);

    // flip orbit
    orbitDir *= -1;
    detonated = true;
  }

  // draw explosion
  if (explosion != null) {
    ++(explosion.ticks);
    // math wizardry to give a nice curve to the arc's scaling
    let r = Math.sin(explosion.ticks * 0.2) * 4;
    if (r < 0) {
      explosion = undefined;
    } else {
      r = r*r;
      color("light_red");
      arc(explosion.pos, r);
    }
  }

  // manage rocket array
  let currRocket = 0;
  let angleStep = difficulty / (difficulty * 0.8) * 0.02 * orbitDir * Math.min(orbitScale * 1.4, 1);
  remove(rockets, (r) => {
    r.angle += angleStep;
    r.pos = vec(player.pos).addWithAngle((r.angle * Math.PI / 2) + Math.PI / 4, orbitDist * orbitScale);
    // draw rockets
    color(currRocket == 0 ? "cyan" : "black");
    box(r.pos, 3);

    // delete consumed rockets
    if (currRocket == 0 && detonated) {
      detonated = false;
      --currRocket;
      return true;
    }
    ++currRocket;
  });

  // punish player for spamming rockets
  if (rockets.length == 0) {
    if (!rocketFatigue) nextRocketTicks /= 2;
    rocketFatigue = true;
  }

  // respawn rockets
  nextRocketAngle += angleStep;
  if (nextRocketTicks > (rocketFatigue ? 100 : 60) && rockets.length < 4)
  {
    rocketFatigue = false;
    nextRocketTicks = 0;
    rockets.push({
      angle: (nextRocketIndex + nextRocketAngle),
      pos: vec(player.pos).addWithAngle((Math.PI / 2 * nextRocketIndex) + Math.PI / 4, orbitDist * orbitScale),
    });

    ++nextRocketIndex;
    nextRocketIndex %= 4;
  }
}

addEventListener("load", onLoad);