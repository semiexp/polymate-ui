export class Vector3 {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  scale(s: number): Vector3 {
    return new Vector3(this.x * s, this.y * s, this.z * s);
  }

  add(v: Vector3): Vector3 {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  sub(v: Vector3): Vector3 {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  cross(v: Vector3): Vector3 {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x,
    );
  }

  norm(): number {
    return Math.sqrt(this.dot(this));
  }

  normalize(): Vector3 {
    return this.scale(1 / this.norm());
  }

  rotateAround(axis: Vector3, angle: number): Vector3 {
    return this.scale(Math.cos(angle))
      .add(axis.cross(this).scale(Math.sin(angle)))
      .add(axis.scale(axis.dot(this) * (1 - Math.cos(angle))));
  }
}

export type Surface<T> = {
  data: T;
  vertices: Vector3[];
};

export type ProjectedSurface<T> = {
  data: T;
  vertices: Point2[];
};

function centerOfSurface<T>(surface: Surface<T>): Vector3 {
  return surface.vertices
    .reduce((acc, v) => acc.add(v), new Vector3(0, 0, 0))
    .scale(1 / surface.vertices.length);
}

export class Camera {
  center: Vector3; // a point which will be projected to the center of the screen
  cameraDir: Vector3; // a unit vector pointing to the camera direction
  cameraUp: Vector3; // a unit vector corresponding to the up direction in the screen
  cameraRight: Vector3; // a unit vector corresponding to the right direction in the screen

  constructor(center: Vector3, cameraDir: Vector3, cameraUp: Vector3) {
    this.center = center;

    const u = cameraDir.normalize();
    let v = cameraUp.normalize();
    v = v.sub(u.scale(u.dot(v))).normalize();
    const w = u.cross(v);

    this.cameraDir = u;
    this.cameraUp = v;
    this.cameraRight = w;
  }

  project(v: Vector3): Point2 {
    const p = v.sub(this.center);
    return {
      x: p.dot(this.cameraRight),
      y: p.dot(this.cameraUp),
    };
  }

  // Project surfaces to the screen and sort them by depth (nearer surfaces come first)
  projectSurfaces<T>(surfaces: Surface<T>[]): ProjectedSurface<T>[] {
    const surfacesWithDepth = surfaces.map((surface) => {
      return {
        surface: {
          data: surface.data,
          vertices: surface.vertices.map((v) => this.project(v)),
        },
        // TODO: this works only for cubes
        depth: centerOfSurface(surface).dot(this.cameraDir),
      };
    });
    surfacesWithDepth.sort((a, b) => b.depth - a.depth);

    return surfacesWithDepth.map((s) => s.surface);
  }

  rotateView(dx: number, dy: number, scale: number): Camera {
    const mouseVec = this.cameraRight
      .scale(dx)
      .add(this.cameraUp.scale(dy))
      .normalize();
    const axis = mouseVec.cross(this.cameraDir);
    const angle = Math.sqrt(dx * dx + dy * dy) * scale;

    const newCameraDir = this.cameraDir.rotateAround(axis, angle);
    const newCameraUp = this.cameraUp.rotateAround(axis, angle);

    return new Camera(this.center, newCameraDir, newCameraUp);
  }
}

export type Point2 = { x: number; y: number };

export function isContainedInConvexPolygon(
  polygon: Point2[],
  point: Point2,
): boolean {
  const p = polygon[0];
  const q = polygon[1];
  const r = polygon[2];

  const cross = (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);

  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const crossProduct =
      (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
    if (cross > 0 != crossProduct > 0) {
      return false;
    }
  }

  return true;
}
