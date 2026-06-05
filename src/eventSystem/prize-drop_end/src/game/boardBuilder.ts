import Matter from 'matter-js';
import { LoadedGameData } from './loadGameData';

export const BOARD_CONSTANTS = {
  WIDTH: 360,
  HEIGHT: 396, // Final matched height for 396px viewport
  CENTER_X: 180,
  CENTER_Y: 198,
  PIN_RADIUS: 5,
  BALL_RADIUS: 9,
  SLOT_COUNT: 7,
};

export interface BoardBodies {
  pins: Matter.Body[];
  obstacles: Matter.Body[];
  slots: Matter.Body[];
  boundaries: Matter.Body[];
}

/**
 * Prize Drop Board Builder
 * Ensures perfect horizontal symmetry based on CENTER_X.
 */
export function buildBoard(data: LoadedGameData): BoardBodies {
  const { WIDTH, HEIGHT, SLOT_COUNT } = BOARD_CONSTANTS;
  const bodies: BoardBodies = {
    pins: [],
    obstacles: [],
    slots: [],
    boundaries: [],
  };

  // 1. Load Everything from CSV (The Single Source of Truth)
  data.obstacles.forEach((obs) => {
    let body: Matter.Body | null = null;
    
    if (obs.type === 'pin') {
      body = Matter.Bodies.circle(obs.cx, obs.cy, obs.radius, { 
        isStatic: true, 
        label: 'pin',
        restitution: 0.6 // Reduced by half
      });
      bodies.pins.push(body);
    } else if (obs.type === 'circle') {
      body = Matter.Bodies.circle(obs.cx, obs.cy, obs.radius, { 
        isStatic: true, 
        label: 'reward',
        restitution: 3.5 // Refined 2.5x hyper bounce
      });
      (body as any).circleRadius = obs.radius; // Three.js에서 반지름 참조용
      (body as any).id = obs.obstacle_id;
      bodies.obstacles.push(body);
    } else if (obs.type === 'triangle') {
      // Create a REALLY wide isosceles triangle pointing inward
      // Base along the wall is stretched (4x radius), height sticking out is 1x radius
      const isLeft = obs.cx < 180;
      const h = obs.radius;
      const b = obs.radius * 2.0; // wider base (total 4.0 * radius)
      
      const vertices = isLeft 
        ? [{ x: -h, y: -b }, { x: h, y: 0 }, { x: -h, y: b }] // Points right
        : [{ x: h, y: -b }, { x: -h, y: 0 }, { x: h, y: b }];  // Points left

      body = Matter.Bodies.fromVertices(obs.cx, obs.cy, [vertices], { 
        isStatic: true, label: 'obstacle' 
      });
      (body as any).originalRadius = obs.radius;
      (body as any).id = obs.obstacle_id;
      bodies.obstacles.push(body);
    } else if (obs.type === 'diamond') {
      body = Matter.Bodies.polygon(obs.cx, obs.cy, 4, obs.radius, {
        isStatic: true, label: 'obstacle'
      });
      (body as any).originalRadius = obs.radius;
      (body as any).id = obs.obstacle_id;
      bodies.obstacles.push(body);
    } else if (obs.type === 'rect') {
      const side = obs.radius * 2;
      body = Matter.Bodies.rectangle(obs.cx, obs.cy, side, side, {
        isStatic: true, label: 'bumper',
      });
      (body as any).originalRadius = obs.radius;
      (body as any).id = obs.obstacle_id;
      bodies.obstacles.push(body);
    }
  });

  // --- Pins are now managed 100% by CSV (SSoT) ---

  // 2. Slots & Separators
  const slotWidth = WIDTH / SLOT_COUNT;
  const slotHeight = 25;
  const sepWidth = 8;
  
  for (let i = 0; i < SLOT_COUNT; i++) {
    const x = slotWidth / 2 + i * slotWidth;
    const y = HEIGHT - slotHeight / 2;
    
    // The Sensor (Reward detection)
    const slotBody = Matter.Bodies.rectangle(x, y, slotWidth - sepWidth, slotHeight, {
      isStatic: true,
      isSensor: true,
      label: `slot_${i}`
    });
    bodies.slots.push(slotBody);

    // The Separator (Physical wall) - Only add between slots
    if (i < SLOT_COUNT - 1) {
      const sepX = (i + 1) * slotWidth;
      const separator = Matter.Bodies.rectangle(sepX, y, sepWidth, slotHeight, {
        isStatic: true,
        label: 'separator'
      });
      bodies.boundaries.push(separator);

      // PIN on top of each separator (physics only — not rendered)
      const separatorTopPin = Matter.Bodies.circle(sepX, HEIGHT - slotHeight, BOARD_CONSTANTS.PIN_RADIUS, {
        isStatic: true,
        label: 'separator_pin',
        restitution: 0.6
      });
      bodies.pins.push(separatorTopPin);
    }
  }

  // 3. Boundaries (Fixed Physics Walls)
  const wallThickness = 50;
  bodies.boundaries.push(
    Matter.Bodies.rectangle(-wallThickness / 2, HEIGHT / 2, wallThickness, HEIGHT, { isStatic: true }),
    Matter.Bodies.rectangle(WIDTH + wallThickness / 2, HEIGHT / 2, wallThickness, HEIGHT, { isStatic: true }),
    Matter.Bodies.rectangle(WIDTH / 2, HEIGHT + wallThickness / 2, WIDTH, wallThickness, { isStatic: true })
  );

  return bodies;
}
