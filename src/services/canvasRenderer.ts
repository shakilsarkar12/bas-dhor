import type { Player, Obstacle, Collectible, Particle, SpeechBubble, BusOption, StageConfig } from '../types/game';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private roadOffset: number = 0;
  private animTimer: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public getLaneX(lane: number): number {
    const laneWidth = this.width / 3;
    return laneWidth * lane + laneWidth / 2;
  }

  public render(
    player: Player,
    obstacles: Obstacle[],
    collectibles: Collectible[],
    particles: Particle[],
    speechBubbles: SpeechBubble[],
    busOptions: BusOption[] | null,
    currentStage: StageConfig,
    distance: number,
    gameSpeed: number,
    isRainStage: boolean
  ) {
    this.animTimer += 0.04;
    this.roadOffset = (this.roadOffset + gameSpeed * 0.05) % 60;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Parallax Background (Dhaka cityscape)
    this.drawBackground(currentStage, distance, isRainStage);

    // 2. Draw Road and Lane markings
    this.drawRoad(currentStage);

    // 3. Draw Bus Stop Option Event if active
    if (busOptions && busOptions.length > 0) {
      this.drawBusStopArrival(busOptions);
    }

    // 4. Draw Collectibles
    this.drawCollectibles(collectibles);

    // 5. Draw Obstacles
    this.drawObstacles(obstacles);

    // 6. Draw Player
    this.drawPlayer(player);

    // 7. Draw Particles (Rain, mud, smoke, sparkles)
    this.drawParticles(particles);

    // 8. Draw Weather overlay if rain
    if (isRainStage) {
      this.drawRainOverlay();
    }

    // 9. Draw Bengali Comic Speech Bubbles
    this.drawSpeechBubbles(speechBubbles);
  }

  private drawBackground(stage: StageConfig, distance: number, isRain: boolean) {
    const ctx = this.ctx;
    const w = this.width;
    const skyHeight = this.height * 0.32;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, skyHeight);
    if (isRain) {
      skyGrad.addColorStop(0, '#2c3e50');
      skyGrad.addColorStop(0.6, '#435b66');
      skyGrad.addColorStop(1, '#5c717e');
    } else if (stage.id === 1) {
      // Warm Dhaka morning
      skyGrad.addColorStop(0, '#ff9a76');
      skyGrad.addColorStop(0.5, '#fddb3a');
      skyGrad.addColorStop(1, '#e8e8e8');
    } else {
      // Vibrant Dhaka daytime
      skyGrad.addColorStop(0, '#2980b9');
      skyGrad.addColorStop(0.6, '#6dd5fa');
      skyGrad.addColorStop(1, '#f1f2f6');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, skyHeight);

    // Sun or overcast glow
    if (!isRain) {
      ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
      ctx.beginPath();
      ctx.arc(w * 0.82, skyHeight * 0.4, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff59d';
      ctx.beginPath();
      ctx.arc(w * 0.82, skyHeight * 0.4, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant Dhaka Skyline (Parliament / Flyover / Highrises)
    ctx.fillStyle = isRain ? '#34495e' : '#b2bec3';
    const skylineOffset = (distance * 0.15) % 180;
    for (let x = -skylineOffset; x < w + 80; x += 60) {
      const h = 35 + Math.sin(x * 0.05) * 20;
      ctx.fillRect(x, skyHeight - h, 48, h);
      // Windows
      ctx.fillStyle = isRain ? '#4a6572' : '#dfe6e9';
      ctx.fillRect(x + 6, skyHeight - h + 8, 10, 8);
      ctx.fillRect(x + 24, skyHeight - h + 8, 10, 8);
      ctx.fillRect(x + 6, skyHeight - h + 22, 10, 8);
      ctx.fillStyle = isRain ? '#34495e' : '#b2bec3';
    }

    // Midground Flyover / Buildings
    ctx.fillStyle = isRain ? '#2d3436' : '#636e72';
    const midOffset = (distance * 0.35) % 240;
    for (let x = -midOffset; x < w + 120; x += 110) {
      const bh = 55 + (x % 30);
      ctx.fillRect(x, skyHeight - bh, 85, bh);
      // Billboard / Bengali Shop Signs on rooftops
      if (x % 220 < 110) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 10, skyHeight - bh - 16, 65, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('বসের বকা নিষেধ!', x + 42, skyHeight - bh - 6);
        ctx.fillStyle = isRain ? '#2d3436' : '#636e72';
      }
    }

    // Electric wires & Crows (Authentic Dhaka element!)
    ctx.strokeStyle = '#222f3e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, skyHeight * 0.45);
    ctx.bezierCurveTo(w * 0.3, skyHeight * 0.55, w * 0.7, skyHeight * 0.58, w, skyHeight * 0.48);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, skyHeight * 0.52);
    ctx.bezierCurveTo(w * 0.4, skyHeight * 0.65, w * 0.6, skyHeight * 0.62, w, skyHeight * 0.55);
    ctx.stroke();

    // Cute animated crow on wire
    const crowX = (w * 0.4 + Math.sin(this.animTimer * 0.5) * 15) % w;
    const crowY = skyHeight * 0.58;
    ctx.fillStyle = '#1e272e';
    ctx.beginPath();
    ctx.arc(crowX, crowY - 4, 3.5, 0, Math.PI * 2);
    ctx.arc(crowX + 3, crowY - 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Beak
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.moveTo(crowX - 4, crowY - 4);
    ctx.lineTo(crowX - 8, crowY - 3);
    ctx.lineTo(crowX - 4, crowY - 2);
    ctx.fill();
  }

  private drawRoad(stage: StageConfig) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const roadY = h * 0.28;
    const roadH = h - roadY;

    // Asphalt / Road color
    ctx.fillStyle = stage.id === 1 ? '#3a322c' : '#2d3436'; // Muddy road in Stage 1
    ctx.fillRect(0, roadY, w, roadH);

    // Sidewalk Curbs (Left & Right alternating Dhaka black & yellow/white curbs)
    const curbW = 14;
    const curbSegmentH = 35;
    const curbOffset = this.roadOffset % (curbSegmentH * 2);

    for (let y = roadY - curbOffset; y < h + curbSegmentH; y += curbSegmentH) {
      const isYellow = Math.floor(y / curbSegmentH) % 2 === 0;
      ctx.fillStyle = isYellow ? '#f1c40f' : '#2c3e50';
      ctx.fillRect(0, y, curbW, curbSegmentH);
      ctx.fillRect(w - curbW, y, curbW, curbSegmentH);
    }

    // Lane Dividers (Dashed White Lines)
    const laneW = w / 3;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.setLineDash([28, 22]);
    ctx.lineDashOffset = -this.roadOffset * 2.2;

    // Divider 1 (between lane 0 and 1)
    ctx.beginPath();
    ctx.moveTo(laneW, roadY);
    ctx.lineTo(laneW, h);
    ctx.stroke();

    // Divider 2 (between lane 1 and 2)
    ctx.beginPath();
    ctx.moveTo(laneW * 2, roadY);
    ctx.lineTo(laneW * 2, h);
    ctx.stroke();

    ctx.setLineDash([]); // Reset line dash
  }

  // Draw Bus Stop selection event when arriving at bus stop
  private drawBusStopArrival(busOptions: BusOption[]) {
    const ctx = this.ctx;
    const laneW = this.width / 3;
    const busY = this.height * 0.36;

    busOptions.forEach((bus) => {
      const bx = bus.lane * laneW + 6;
      const bw = laneW - 12;
      const bh = 110;

      // Glow effect for target bus
      if (bus.isCorrect) {
        ctx.fillStyle = 'rgba(46, 204, 113, 0.25)';
        ctx.fillRect(bx - 4, busY - 4, bw + 8, bh + 8);
      }

      // Bus Body (back view)
      ctx.fillStyle = bus.color;
      ctx.beginPath();
      ctx.roundRect(bx, busY, bw, bh, 10);
      ctx.fill();

      // Bus Roof & Accent Strip
      ctx.fillStyle = bus.accentColor;
      ctx.fillRect(bx, busY + 22, bw, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx, busY + 44, bw, 6);

      // Rear Windshield
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.roundRect(bx + 10, busY + 12, bw - 20, 28, 4);
      ctx.fill();

      // Destination Board (Giant Bengali readable signboard!)
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(bx + 4, busY + bh - 48, bw - 8, 28);
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + 4, busY + bh - 48, bw - 8, 28);

      ctx.fillStyle = '#1e272e';
      ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bus.destination, bx + bw / 2, busY + bh - 29);

      // Bus Name header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Hind Siliguri", sans-serif';
      ctx.fillText(bus.busName, bx + bw / 2, busY + bh - 5);

      // Tail Lights
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(bx + 12, busY + bh - 10, 6, 0, Math.PI * 2);
      ctx.arc(bx + bw - 12, busY + bh - 10, 6, 0, Math.PI * 2);
      ctx.fill();

      // Helper hanging from the side door!
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(bx + bw - 10, busY + 45, 12, 22);
      // Helper Head
      ctx.fillStyle = '#f5cd79';
      ctx.beginPath();
      ctx.arc(bx + bw - 4, busY + 40, 7, 0, Math.PI * 2);
      ctx.fill();
      // Shouting Gamcha / Hand waving
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(bx + bw + 4, busY + 36 + Math.sin(this.animTimer * 6) * 4, 10, 6);
    });
  }

  private drawCollectibles(collectibles: Collectible[]) {
    const ctx = this.ctx;
    collectibles.forEach((item) => {
      if (item.collected) return;
      const cx = this.getLaneX(item.lane);
      const cy = item.y;
      const bob = Math.sin(this.animTimer * 5 + item.id) * 5;

      if (item.type === 'COIN') {
        // Bangladeshi Taka Coin (Golden ৳ Coin)
        ctx.save();
        ctx.translate(cx, cy + bob);

        // Gold coin body
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4ac0d';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner circle
        ctx.fillStyle = '#f9e79f';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // ৳ Sign
        ctx.fillStyle = '#7d6608';
        ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('৳', 0, 1);

        ctx.restore();
      } else if (item.type === 'TEA') {
        // Hot Tea Glass ("গরম চা" powerup)
        ctx.save();
        ctx.translate(cx, cy + bob);

        // Glass Cup
        ctx.fillStyle = 'rgba(230, 126, 34, 0.9)';
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(10, -10);
        ctx.lineTo(8, 14);
        ctx.lineTo(-8, 14);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Steam swirls
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.moveTo(-4, -12);
        ctx.quadraticCurveTo(-7, -18, -4, -22);
        ctx.moveTo(3, -12);
        ctx.quadraticCurveTo(6, -18, 3, -22);
        ctx.stroke();

        ctx.restore();
      } else if (item.type === 'UMBRELLA') {
        // Umbrella Shield ("ছাতা" powerup)
        ctx.save();
        ctx.translate(cx, cy + bob);

        // Umbrella canopy
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(0, 0, 18, Math.PI, 0);
        ctx.fill();

        // Colored stripes
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.moveTo(-6, -16);
        ctx.lineTo(6, -16);
        ctx.lineTo(3, 0);
        ctx.lineTo(-3, 0);
        ctx.fill();

        // Handle
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 14);
        ctx.arc(3, 14, 3, Math.PI, 0, true);
        ctx.stroke();

        ctx.restore();
      }
    });
  }

  private drawObstacles(obstacles: Obstacle[]) {
    obstacles.forEach((obs) => {
      const ox = this.getLaneX(obs.lane);
      const oy = obs.y;

      switch (obs.type) {
        case 'POTHOLE':
          this.drawPothole(ox, oy, obs.width, obs.height);
          break;
        case 'MUD':
          this.drawMudPuddle(ox, oy, obs.width, obs.height);
          break;
        case 'RICKSHAW':
          this.drawRickshaw(ox, oy, obs.width, obs.height);
          break;
        case 'CNG':
          this.drawCNG(ox, oy, obs.width, obs.height);
          break;
        case 'SLOW_BUS':
          this.drawLocalBus(ox, oy, obs.width, obs.height);
          break;
        case 'TEA_STALL':
          this.drawTeaStall(ox, oy, obs.width, obs.height);
          break;
        case 'BAMBOO':
          this.drawBambooBarrier(ox, oy, obs.width, obs.height);
          break;
        case 'BRICKS':
          this.drawBrokenBricks(ox, oy, obs.width, obs.height);
          break;
      }
    });
  }

  // Pothole / Manhole
  private drawPothole(x: number, y: number, _w: number, _h: number) {
    const ctx = this.ctx;
    ctx.save();
    const w = 72;
    const h = 32;
    // Shadow rim
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cracked asphalt rim
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Warning brick stuck in hole (Classic Dhaka warning system!)
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(x - 6, y - 12, 12, 16);
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 6, y - 12, 12, 16);

    ctx.restore();
  }

  // Muddy Puddle with splashes
  private drawMudPuddle(x: number, y: number, _w: number, _h: number) {
    const ctx = this.ctx;
    ctx.save();
    const w = 82;
    const h = 38;
    ctx.fillStyle = '#4e342e'; // Rich Dhaka mud
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mud gloss highlight
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.ellipse(x - w * 0.15, y - h * 0.15, w * 0.25, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mud droplets on edge
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(x - w * 0.35, y + h * 0.25, 4, 0, Math.PI * 2);
    ctx.arc(x + w * 0.4, y - h * 0.1, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Authentic Dhaka Cycle Rickshaw
  private drawRickshaw(x: number, y: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Rickshaw Hood (Painted Rickshaw Art)
    const hoodW = w * 0.85;
    const hoodH = h * 0.55;

    // Outer Hood Arch
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.roundRect(-hoodW / 2, -h / 2, hoodW, hoodH, [12, 12, 0, 0]);
    ctx.fill();

    // Painted Rickshaw Art Pattern (Floral bands)
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-hoodW / 2 + 4, -h / 2 + 10, hoodW - 8, 8);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(-hoodW / 2 + 4, -h / 2 + 22, hoodW - 8, 8);

    // Decorative tin tassels on hood edge
    ctx.fillStyle = '#3498db';
    for (let tx = -hoodW / 2 + 5; tx <= hoodW / 2 - 5; tx += 9) {
      ctx.beginPath();
      ctx.arc(tx, -h / 2 + hoodH, 3.5, 0, Math.PI);
      ctx.fill();
    }

    // Rickshaw Frame (Yellow/Black)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-hoodW / 2 + 2, -h / 2 + hoodH, hoodW - 4, 18);

    // Passenger seat
    ctx.fillStyle = '#9b59b6';
    ctx.fillRect(-hoodW / 2 + 6, -h / 2 + hoodH + 3, hoodW - 12, 12);

    // Two big spoked rear wheels
    const wheelY = -h / 2 + hoodH + 16;
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 3;

    // Left Wheel
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.ellipse(-hoodW / 2 - 4, wheelY, 4, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Wheel
    ctx.beginPath();
    ctx.ellipse(hoodW / 2 + 4, wheelY, 4, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rickshaw Puller back view (Gamsa around neck)
    ctx.fillStyle = '#d35400';
    ctx.fillRect(-10, -h / 2 + hoodH + 18, 20, 22);
    // Head
    ctx.fillStyle = '#f5cd79';
    ctx.beginPath();
    ctx.arc(0, -h / 2 + hoodH + 14, 8, 0, Math.PI * 2);
    ctx.fill();
    // Red gamcha
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-8, -h / 2 + hoodH + 16, 16, 5);

    ctx.restore();
  }

  // Authentic Dhaka Green CNG Auto-Rickshaw
  private drawCNG(x: number, y: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const cw = w * 0.9;
    const ch = h * 0.85;

    // Black metal roof
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch * 0.35, [8, 8, 2, 2]);
    ctx.fill();

    // Green Body (Iconic Dhaka CNG Green)
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2 + ch * 0.32, cw, ch * 0.68, [2, 2, 8, 8]);
    ctx.fill();

    // Wire Mesh Grill / Window (Rear)
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(-cw / 2 + 6, -ch / 2 + 10, cw - 12, ch * 0.32);

    // Silver wire mesh lines
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 1;
    for (let lx = -cw / 2 + 10; lx <= cw / 2 - 10; lx += 6) {
      ctx.beginPath();
      ctx.moveTo(lx, -ch / 2 + 10);
      ctx.lineTo(lx, -ch / 2 + 10 + ch * 0.32);
      ctx.stroke();
    }

    // Dhaka Metro License Plate
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-18, ch / 2 - 16, 36, 11);
    ctx.fillStyle = '#1e272e';
    ctx.font = 'bold 7px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ঢাকা-থ', 0, ch / 2 - 8);

    // Tail lights
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(-cw / 2 + 6, ch / 2 - 10, 4, 0, Math.PI * 2);
    ctx.arc(cw / 2 - 6, ch / 2 - 10, 4, 0, Math.PI * 2);
    ctx.fill();

    // Rear Wheels
    ctx.fillStyle = '#111111';
    ctx.fillRect(-cw / 2 - 4, ch / 2 - 18, 5, 16);
    ctx.fillRect(cw / 2 - 1, ch / 2 - 18, 5, 16);

    ctx.restore();
  }

  // Local Dhaka Bus (Balaka / Bihanga / Bikolpo)
  private drawLocalBus(x: number, y: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const bw = w * 1.1;
    const bh = h * 1.1;

    // Bus Body (Dynamic Dhaka transport artwork)
    ctx.fillStyle = '#e67e22'; // Bold Orange
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 8);
    ctx.fill();

    // Vibrant stripes
    ctx.fillStyle = '#3498db';
    ctx.fillRect(-bw / 2, -bh / 2 + bh * 0.35, bw, 14);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-bw / 2, -bh / 2 + bh * 0.52, bw, 10);

    // Rear Window
    ctx.fillStyle = '#1e272e';
    ctx.beginPath();
    ctx.roundRect(-bw / 2 + 8, -bh / 2 + 12, bw - 16, bh * 0.28, 4);
    ctx.fill();

    // Window Bengali sticker: "আল্লাহ ভরসা"
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 9px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('আল্লাহ ভরসা', 0, -bh / 2 + 30);

    // Destination Board
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-bw / 2 + 6, bh / 2 - 38, bw - 12, 18);
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 11px "Hind Siliguri", sans-serif';
    ctx.fillText('বলাকা পরিবহন', 0, bh / 2 - 25);

    // Bus Helper hanging off the gate!
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(bw / 2 - 8, -bh / 2 + 42, 12, 24);
    // Head
    ctx.fillStyle = '#f5cd79';
    ctx.beginPath();
    ctx.arc(bw / 2 - 2, -bh / 2 + 36, 7, 0, Math.PI * 2);
    ctx.fill();

    // Huge Bus Wheels
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(-bw / 2 - 4, bh / 2 - 24, 7, 24);
    ctx.fillRect(bw / 2 - 3, bh / 2 - 24, 7, 24);

    // Exhaust Pipe & Smoke
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(-bw / 2 + 8, bh / 2 - 4, 10, 6);

    ctx.restore();
  }

  // Tea Stall (চায়ের টং ও টুল)
  private drawTeaStall(x: number, y: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Wooden table
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(-w / 2, -h / 2, w, h * 0.6);

    // Red plastic stool
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 6, -h / 2 + h * 0.6, 20, 16, 3);
    ctx.fill();

    // Giant Aluminium Kettle (কেতলি)
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    ctx.arc(4, -h / 2 - 2, 10, 0, Math.PI * 2);
    ctx.fill();
    // Kettle spout
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#95a5a6';
    ctx.beginPath();
    ctx.moveTo(12, -h / 2 - 4);
    ctx.lineTo(18, -h / 2 - 10);
    ctx.stroke();

    // Signboard
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 9px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('চায়ের টং', 0, -h / 2 + 18);

    ctx.restore();
  }

  // Construction Bamboo Hurdle (requires slide!)
  private drawBambooBarrier(x: number, y: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Horizontal Bamboo Pole
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-w / 2, -h / 2 + 6, w, 12);
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-w / 2, -h / 2 + 6, w, 12);

    // Bamboo rings
    for (let bx = -w / 2 + 10; bx < w / 2; bx += 18) {
      ctx.fillStyle = '#b9770e';
      ctx.fillRect(bx, -h / 2 + 6, 3, 12);
    }

    // Warning Red Cloth Tied
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-6, -h / 2 + 18, 12, 16);

    ctx.restore();
  }

  // Broken Bricks (ভাঙা ইট)
  private drawBrokenBricks(x: number, y: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Scatter of red Dhaka bricks
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-w * 0.35, -h * 0.25, 18, 12);
    ctx.fillRect(0, -h * 0.35, 16, 10);
    ctx.fillRect(-w * 0.15, 0, 20, 12);

    ctx.fillStyle = '#962d22';
    ctx.strokeRect(-w * 0.35, -h * 0.25, 18, 12);
    ctx.strokeRect(0, -h * 0.35, 16, 10);
    ctx.strokeRect(-w * 0.15, 0, 20, 12);

    ctx.restore();
  }

  // 6. Draw Player (Bengali Office Worker)
  private drawPlayer(player: Player) {
    const ctx = this.ctx;
    const px = player.x;
    // Adjust Y with jump
    const py = player.y - player.jumpY;

    ctx.save();
    ctx.translate(px, py);
    ctx.scale(1.4, 1.4);

    // Invincibility flashing / aura
    if (player.isInvincible && Math.floor(this.animTimer * 15) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Tea Speed Boost Golden Aura
    if (player.hasTeaBoost) {
      ctx.fillStyle = 'rgba(241, 196, 15, 0.35)';
      ctx.beginPath();
      ctx.arc(0, -10, 38, 0, Math.PI * 2);
      ctx.fill();
    }

    const legPhase = Math.sin(this.animTimer * 14);

    if (player.isSliding) {
      // SLIDE ANIMATION (Low crouch / slide on tarmac)
      // Slide dust
      ctx.fillStyle = 'rgba(189, 195, 199, 0.6)';
      ctx.beginPath();
      ctx.arc(-22, 14, 8, 0, Math.PI * 2);
      ctx.arc(-32, 16, 12, 0, Math.PI * 2);
      ctx.fill();

      // Body angled low
      ctx.save();
      ctx.rotate(0.3);

      // Torso
      ctx.fillStyle = '#ffffff'; // White shirt
      ctx.fillRect(-16, 0, 32, 16);

      // Pants & sliding legs
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(10, 6, 24, 12);

      // Head
      ctx.fillStyle = '#f5cd79';
      ctx.beginPath();
      ctx.arc(-14, -2, 12, 0, Math.PI * 2);
      ctx.fill();

      // Glasses
      ctx.strokeStyle = '#1e272e';
      ctx.lineWidth = 2;
      ctx.strokeRect(-20, -5, 8, 7);

      ctx.restore();
    } else {
      // RUNNING & JUMPING ANIMATION

      // Shadow on road (stays on tarmac when jumping)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      const shadowScale = Math.max(0.4, 1 - player.jumpY / 140);
      ctx.ellipse(0, player.jumpY + 22, 18 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Backpack on back
      ctx.fillStyle = '#2980b9'; // Blue backpack
      ctx.beginPath();
      ctx.roundRect(-22, -18, 14, 22, 4);
      ctx.fill();

      // Legs
      ctx.fillStyle = '#2c3e50'; // Dark formal pants
      if (player.isJumping) {
        // Tucked jump legs
        ctx.fillRect(-10, 8, 8, 14);
        ctx.fillRect(2, 6, 8, 14);
      } else {
        // Cycling run legs
        ctx.save();
        ctx.fillRect(-10, 10, 7, 16 + legPhase * 8);
        ctx.fillRect(3, 10, 7, 16 - legPhase * 8);
        // Shoes
        ctx.fillStyle = '#111111';
        ctx.fillRect(-12, 24 + legPhase * 8, 10, 5);
        ctx.fillRect(2, 24 - legPhase * 8, 10, 5);
        ctx.restore();
      }

      // Torso (White office shirt)
      ctx.fillStyle = player.mudStained ? '#8d6e63' : '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-12, -8, 24, 22, 3);
      ctx.fill();

      // Flapping Dark Red Necktie!
      ctx.fillStyle = '#c0392b';
      const tieWave = Math.sin(this.animTimer * 12) * 6;
      ctx.beginPath();
      ctx.moveTo(-1, -6);
      ctx.lineTo(2, -6);
      ctx.lineTo(6 + tieWave, 12);
      ctx.lineTo(2 + tieWave, 16);
      ctx.lineTo(-3, 8);
      ctx.closePath();
      ctx.fill();

      // Mud stains on shirt if hit
      if (player.mudStained) {
        ctx.fillStyle = '#4e342e';
        ctx.beginPath();
        ctx.arc(-5, 2, 4, 0, Math.PI * 2);
        ctx.arc(6, 6, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Arms (Pumping while running)
      ctx.fillStyle = '#ffffff';
      const armPhase = legPhase * 7;
      ctx.fillRect(-16, -4 - armPhase, 6, 15);
      ctx.fillRect(10, -4 + armPhase, 6, 15);
      // Hands
      ctx.fillStyle = '#f5cd79';
      ctx.beginPath();
      ctx.arc(-13, 12 - armPhase, 3.5, 0, Math.PI * 2);
      ctx.arc(13, 12 + armPhase, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#f5cd79';
      ctx.beginPath();
      ctx.arc(0, -18, 13, 0, Math.PI * 2);
      ctx.fill();

      // Black Hair
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(0, -22, 13, Math.PI, 0);
      ctx.fill();

      // Glasses (Thick black frame)
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-8, -21, 6, 6);
      ctx.strokeRect(2, -21, 6, 6);
      ctx.beginPath();
      ctx.moveTo(-2, -18);
      ctx.lineTo(2, -18);
      ctx.stroke();

      // Eyes behind glasses
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(-5, -18, 1.8, 0, Math.PI * 2);
      ctx.arc(5, -18, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Frantic open mouth shouting "বাস দাঁড়াও!"
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.arc(0, -12, 3.5, 0, Math.PI);
      ctx.fill();

      // Comic Sweat Droplets flying when running frantic
      ctx.fillStyle = '#3498db';
      ctx.beginPath();
      ctx.arc(14, -24 + Math.sin(this.animTimer * 10) * 4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Umbrella Shield Powerup held above head!
      if (player.hasUmbrella) {
        ctx.save();
        ctx.translate(6, -38);
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(0, 0, 24, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-6, -22, 12, 22);
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 20);
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // Draw Dynamic Particles
  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;
    particles.forEach((p) => {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'MUD' || p.type === 'RAIN') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'SPARKLE') {
        // Star sparkle
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.type === 'SMOKE') {
        // Exhaust smoke puff
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (2 - alpha), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  // Rain Weather Overlay (Stage 4)
  private drawRainOverlay() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(200, 230, 255, 0.45)';
    ctx.lineWidth = 1.6;

    // Streaks of falling monsoon rain
    const numDrops = 40;
    for (let i = 0; i < numDrops; i++) {
      const rx = (i * 37 + this.animTimer * 300) % this.width;
      const ry = (i * 53 + this.animTimer * 800) % this.height;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 6, ry + 22);
      ctx.stroke();
    }

    // Occasional lightning flicker
    if (Math.sin(this.animTimer * 1.5) > 0.98) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, 0, this.width, this.height);
    }
    ctx.restore();
  }

  // Bengali Comic Speech Bubbles
  private drawSpeechBubbles(bubbles: SpeechBubble[]) {
    const ctx = this.ctx;
    bubbles.forEach((b) => {
      const alpha = Math.min(1, b.life / 0.5);
      ctx.save();
      ctx.globalAlpha = alpha;

      ctx.font = 'bold 13px "Hind Siliguri", sans-serif';
      const textMetrics = ctx.measureText(b.text);
      const textW = textMetrics.width;
      const padX = 14;
      const padY = 8;
      const bw = textW + padX * 2;
      const bh = 28 + padY;

      // Constrain within screen
      let bx = Math.max(10, Math.min(this.width - bw - 10, b.x - bw / 2));
      let by = b.y - bh - 16;

      // Bubble background with shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.roundRect(bx + 2, by + 2, bw, bh, 8);
      ctx.fill();

      // Bubble Body
      ctx.fillStyle = b.sender === 'HELPER' ? '#f39c12' : '#ffffff';
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 8);
      ctx.fill();
      ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2 - 6, by + bh);
      ctx.lineTo(bx + bw / 2, by + bh + 8);
      ctx.lineTo(bx + bw / 2 + 6, by + bh);
      ctx.fillStyle = b.sender === 'HELPER' ? '#f39c12' : '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = b.sender === 'HELPER' ? '#ffffff' : '#2c3e50';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.text, bx + bw / 2, by + bh / 2);

      ctx.restore();
    });
  }
}
