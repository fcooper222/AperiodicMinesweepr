const r3 = 1.7320508075688772;
const hr3 = 0.8660254037844386;
const ident = [1, 0, 0, 0, 1, 0];

const local_hat_transforms = [[0.5,-hr3,3,hr3,1/2,2*hr3],[1/2,hr3,-3,-hr3,1/2,2*hr3],[-1/2,hr3,6,-hr3,-1/2,4*hr3],[-1/2,-hr3,3,hr3,-1/2,-6*hr3],[-1/2,hr3,6,-hr3,-1/2,0],[-1,0,0,0,-1,-4*hr3],[1,0,-3,0,-1,2*hr3],[-1/2,-hr3,-3,hr3,-1/2,-2*hr3],[1/2,hr3,-3,-hr3,-1/2,2*hr3],[-1/2,hr3,3,-hr3,-1/2,6*hr3],[-1,0,0,0,1,4*hr3],[-1/2,-hr3,0,-hr3,1/2,4*hr3],[1,0,3,0,-1,2*hr3],[1,0,0,0,1,-4*hr3]];
const transformation_edge_fills = [[[7,8,9],[0,1,12]],[[0,1,12],[7,8,9]],[[7,8],[5,6]],[[3,4],[5,6]],[[5,6],[3,4]],[[2],[2]],[[0,10,11,12],[6,7,8,9]],[[1],[]],[[0,1,12],[7,8,9]],[[9,10,11],[6,7,8]],[[10,11],[1]],[[0,10,11,12],[2,3,4,5]],[[6,7,8,9],[0,10,11,12]],[[2,3,4],[9,10,11]]]
//corresponding edges that a transformation coveres for both tiles



const hat_outline = [
  hexPt(0, 0),
  hexPt(-1, -1),
  hexPt(0, -2),
  hexPt(2, -2),
  hexPt(2, -1),
  hexPt(4, -2),
  hexPt(5, -1),
  hexPt(4, 0),
  hexPt(3, 0),
  hexPt(2, 2),
  hexPt(0, 3),
  hexPt(0, 2),
  hexPt(-1, 2),
];



function pt(x, y) {
  return { x: x, y: y };
}

function hexPt(x, y) {
  return pt(x + 0.5 * y, hr3 * y);
}

// Affine matrix inverse
function inv(T) {
  const det = T[0] * T[4] - T[1] * T[3];
  return [
    T[4] / det,
    -T[1] / det,
    (T[1] * T[5] - T[2] * T[4]) / det,
    -T[3] / det,
    T[0] / det,
    (T[2] * T[3] - T[0] * T[5]) / det,
  ];
}

// Affine matrix multiply
function mul(A, B) {
  return [
    A[0] * B[0] + A[1] * B[3],
    A[0] * B[1] + A[1] * B[4],
    A[0] * B[2] + A[1] * B[5] + A[2],

    A[3] * B[0] + A[4] * B[3],
    A[3] * B[1] + A[4] * B[4],
    A[3] * B[2] + A[4] * B[5] + A[5],
  ];
}

function matrixTo(A, B) {
  const A_inv = inv([A[0], A[1], 0, A[3], A[4], 0]);
  
  const X_transform = mul([B[0], B[1], 0, B[3], B[4], 0], A_inv);
  
  const translation = transPt(A_inv, {
      x: B[2] - A[2],
      y: B[5] - A[5]
  });
  
  return [
      X_transform[0], X_transform[1], translation.x,
      X_transform[3], X_transform[4], translation.y,
      0, 0, 1
  ].map(val => Math.round(val * 1e3) / 1e3);
}


function padd(p, q) {
  return { x: p.x + q.x, y: p.y + q.y };
}

function psub(p, q) {
  return { x: p.x - q.x, y: p.y - q.y };
}

// Rotation matrix
function trot(ang) {
  const c = cos(ang);
  const s = sin(ang);
  return [c, -s, 0, s, c, 0];
}

function getRotation(m) {
  const [a, b, , , ,] = m;
  return Math.atan2(b, a);
}

// Translation matrix
function ttrans(tx, ty) {
  return [1, 0, tx, 0, 1, ty];
}

function rotAbout(p, ang) {
  return mul(ttrans(p.x, p.y), mul(trot(ang), ttrans(-p.x, -p.y)));
}

// Matrix * point
function transPt(M, P) {
  return pt(M[0] * P.x + M[1] * P.y + M[2], M[3] * P.x + M[4] * P.y + M[5]);
}

// Match unit interval to line segment p->q
function matchSeg(p, q) {
  return [q.x - p.x, p.y - q.y, p.x, q.y - p.y, q.x - p.x, p.y];
}

// Match line segment p1->q1 to line segment p2->q2
function matchTwo(p1, q1, p2, q2) {
  return mul(matchSeg(p2, q2), inv(matchSeg(p1, q1)));
}

// Intersect two lines defined by segments p1->q1 and p2->q2
function intersect(p1, q1, p2, q2) {
  const d = (q2.y - p2.y) * (q1.x - p1.x) - (q2.x - p2.x) * (q1.y - p1.y);
  const uA =
    ((q2.x - p2.x) * (p1.y - p2.y) - (q2.y - p2.y) * (p1.x - p2.x)) / d;
  // const uB = ((q1.x - p1.x) * (p1.y - p2.y) - (q1.y - p1.y) * (p1.x - p2.x)) / d;

  return pt(p1.x + uA * (q1.x - p1.x), p1.y + uA * (q1.y - p1.y));
}
