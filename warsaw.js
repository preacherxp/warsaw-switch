/* warsaw-switch — first snow under the Palace of Culture. Golden lindens by day, old PRL neon by night, and snow that really settles. */
(() => {
  const NOON = 0,
    GOLD = 1,
    DUSK = 2,
    NIGHT = 3,
    DAWN = 4;
  const PAD_X = 40;
  const PAD_Y = 40;
  const BW = 400;
  const BH = 190;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => {
    const t = clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const bayer = (x, y) => BAYER[((y & 3) << 2) | (x & 3)];
  const at = (x, y) => (y + PAD_Y) * BW + x + PAD_X;
  let M;
  let N;
  let C;

  // Snow settles from just before the first flakes until the morning melts it
  const coverAt = (h) => smooth(18.9, 21.5, h) * (1 - smooth(29.3, 31.2, h));

  const GRADES = [
    ([r, g, b]) => [r, g, b],
    ([r, g, b]) => [r * 1.03 + 0.03, g * 0.86 + 0.01, b * 0.72],
    ([r, g, b]) => [r * 0.5 + 0.05, g * 0.42 + 0.03, b * 0.5 + 0.07],
    ([r, g, b]) => [r * 0.1 + 0.015, g * 0.17 + 0.035, b * 0.25 + 0.065],
    ([r, g, b]) => [r * 0.68 + 0.05, g * 0.6 + 0.03, b * 0.66 + 0.06],
  ];

  const palette = (ctx) => {
    C = ctx;
    M = ctx.M;
    N = ctx.N;
    const { mat, neon } = ctx;
    // Engine colours that would go violet at night
    mat('FAR1', '#c3d3de', { [GOLD]: '#dcb8a4', [DUSK]: '#6f6c84', [NIGHT]: '#14303f', [DAWN]: '#a6a6b6' });
    mat('FAR2', '#a6bccb', { [GOLD]: '#bd9a8c', [DUSK]: '#565a72', [NIGHT]: '#102633', [DAWN]: '#868a9f' });
    mat('FAR3', '#8aa3b5', { [GOLD]: '#9a7f7c', [DUSK]: '#45485f', [NIGHT]: '#0c1e2b', [DAWN]: '#6b7088' });
    mat('CLOUD', '#f4f7f9', { [GOLD]: '#ffe2c4', [DUSK]: '#c89aa4', [NIGHT]: '#17303f', [DAWN]: '#ffd3c4' });
    mat('CLOUD_SH', '#d5e1ea', { [GOLD]: '#efb89c', [DUSK]: '#8c7590', [NIGHT]: '#122736', [DAWN]: '#d9a3a8' });
    mat('WIRE', '#59626a', { [NIGHT]: '#16242f' });
    mat('ROAD', '#696d71', { [NIGHT]: '#0f1c29' });
    mat('ROAD_D', '#5f6367', { [NIGHT]: '#0c1722' });
    mat('ROAD_L', '#75797d', { [NIGHT]: '#132231' });
    mat('LINE', '#e8e8e0', { [NIGHT]: '#3b5266' });
    mat('CURB', '#a8a8a0', { [NIGHT]: '#2a3f50' });
    mat('WALK', '#b9b7ae', { [NIGHT]: '#1c2e3d' });
    mat('WALK_D', '#a9a79e', { [NIGHT]: '#162634' });
    mat('MANHOLE', '#4d5155', { [NIGHT]: '#0c1621' });
    mat('GLASS', '#6d8fa8', { [GOLD]: '#ffc07a', [DUSK]: '#6a6780', [NIGHT]: '#0f2130', [DAWN]: '#d08f8c' });
    mat('GLASS_HI', '#a9c9da', { [GOLD]: '#ffe3ae', [DUSK]: '#8f8598', [NIGHT]: '#16293a', [DAWN]: '#f2b6a6' });
    mat('GLASS_DK', '#4d6a80', { [GOLD]: '#cf8f58', [DUSK]: '#4f4f68', [NIGHT]: '#0b1a27', [DAWN]: '#9c7080' });
    mat('TUBE', '#c9cac0', { [NIGHT]: '#233545', [DUSK]: '#6e7080' });
    mat('BOARD_K', '#2a2d33', { [NIGHT]: '#07101a', [DUSK]: '#15202c' });
    mat('LAMP_OFF', '#3b3f44', { [NIGHT]: '#0f1a26' });
    mat('SMOKE', '#f4f1ea', { [NIGHT]: '#57707f', [DUSK]: '#a89aa8' });

    // Palace of Culture: warm sandstone
    mat('PK', '#d8c8a4');
    mat('PK_LT', '#eaddbb');
    mat('PK_DK', '#b7a581');
    mat('PK_SH', '#9c8b6c');
    mat('PK_WIN', '#6e6a5e');
    // Glass towers
    mat('VS', '#7ea8c4', { [GOLD]: '#efbb86', [DUSK]: '#5f6a82', [NIGHT]: '#0d2130', [DAWN]: '#b69aa0' });
    mat('VS_HI', '#b3d3e4', { [GOLD]: '#ffdca6', [DUSK]: '#857f92', [NIGHT]: '#143042', [DAWN]: '#dcb6b0' });
    mat('VS_DK', '#5f87a4', { [GOLD]: '#c88e62', [DUSK]: '#4b5570', [NIGHT]: '#0a1a27', [DAWN]: '#8f7d8c' });
    // Prefab concrete
    mat('BLOK', '#bcb8ad');
    mat('BLOK_LT', '#cfcbc0');
    mat('BLOK_DK', '#97948a');
    mat('BLOK_REC', '#6a6964');
    mat('PVC', '#e9e8e1');
    mat('FRAME_W', '#7c5a3a');
    mat('P_OCH', '#d2b36c');
    mat('P_MINT', '#9dbfa8');
    mat('P_TERRA', '#c28262');
    mat('P_BLUE', '#8fa9bf');
    mat('SHEET', '#6f9a84');
    mat('SHEET_DK', '#587d6a');
    mat('AWN_O', '#d9843f');
    mat('LUX', '#c8d8d9');
    mat('LUX_DK', '#9db0b3');
    mat('LEAF', '#4f8a4e');
    mat('POTRED', '#d8433c');
    mat('DUVET', '#f5f3ea');
    mat('DUVET_B', '#7da0c8');
    mat('RUG', '#a8423a');
    mat('RUG_B', '#d7b36a');
    mat('DUST', '#d9d2c0');
    mat('FLAG_R', '#d6263a');
    // Neon-row building, MDM stone, dark at night so the tubes read
    mat('MDM', '#cabfa8', { [NIGHT]: '#0f1d2a' });
    mat('MDM_DK', '#a99e88', { [NIGHT]: '#0b1722' });
    mat('MDM_LT', '#dcd3be', { [NIGHT]: '#15283a' });
    mat('FRAME', '#99a0a4', { [NIGHT]: '#12222f' });
    mat('FIG', '#5d666d', { [NIGHT]: '#1d2f3f', [DUSK]: '#4a4c5e' });
    mat('FIG_B', '#7d868c', { [NIGHT]: '#0c1a28', [DUSK]: '#4a4c5e' });
    // Street furniture
    mat('KIOSK', '#add4b8', { [NIGHT]: '#2c544e' });
    mat('KIOSK_DK', '#86b296', { [NIGHT]: '#21423f' });
    mat('KIOSK_RF', '#5f7f70', { [NIGHT]: '#15282e' });
    mat('STALL', '#e9dcc0');
    mat('BENCH', '#8a6a48');
    mat('RAIL', '#30343a', { [NIGHT]: '#04080e' });
    mat('RAIL_HI', '#a0a8ac', { [NIGHT]: '#32465a' });
    mat('SETT', '#777a7c', { [NIGHT]: '#101d2a' });
    // People
    mat('PIGEON', '#8d97a2');
    mat('PIGEON_DK', '#5f6a76');
    mat('PIGEON_NK', '#4f8078');
    mat('BERET', '#a4557a');
    mat('BABCIA', '#6d5c52');
    mat('TARTAN_R', '#b5322f');
    mat('TARTAN_G', '#2c5c4a');
    mat('DOG', '#7a4826');
    mat('DOG_DK', '#55301a');
    mat('PUFF_B', '#3c6a96');
    mat('PUFF_R', '#ad3b3a');
    mat('PUFF_G', '#3f6a58');
    mat('PUFF_K', '#2d3440');
    // Vehicles: real Warsaw tram red and yellow
    mat('TR_R', '#c9211f', { [NIGHT]: '#7c1f28' });
    mat('TR_RD', '#971a1c', { [NIGHT]: '#4a1520' });
    mat('TR_Y', '#f0c52e', { [NIGHT]: '#a08c3a' });
    mat('TR_YD', '#c9a124', { [NIGHT]: '#665a2c' });
    mat('TR_ROOF', '#b8b8b0', { [NIGHT]: '#3a4a58' });
    mat('TR_GL', '#58707e', { [NIGHT]: '#0d1b27' });
    mat('TR_DK', '#25282c', { [NIGHT]: '#0a1016' });
    mat('PL_O', '#ee7a1a');
    mat('PL_OD', '#b85a12');
    mat('PL_B', '#d8d8d0');
    mat('CAR_PALE', '#d9d2a8', { [NIGHT]: '#6e7a78' });
    mat('CAR_MINT', '#a8cdc4', { [NIGHT]: '#5a7c80' });
    mat('CAR_SILV', '#aeb4b8', { [NIGHT]: '#58697a' });
    mat('CAR_NAVY', '#34486a', { [NIGHT]: '#2c4260' });
    mat('CAR_CRIM', '#a22d2f', { [NIGHT]: '#6a2a36' });
    // Snow: blue-white, and always brighter than what it lies on
    mat('SNOW', '#f8fbfd', { [GOLD]: '#fff0de', [DUSK]: '#cfc8d2', [NIGHT]: '#9ab6d2', [DAWN]: '#f4dcda' });
    mat('SNOW_W', '#eef3f7', { [GOLD]: '#f8e6d6', [DUSK]: '#bdb8c6', [NIGHT]: '#7894b0', [DAWN]: '#e6cfd0' });
    mat('SNOW_RD', '#dfe6ec', { [GOLD]: '#e8d6c6', [DUSK]: '#a8a6b6', [NIGHT]: '#5d7893', [DAWN]: '#d2bcc0' });
    mat('SNOW_FAR', '#e4edf3', { [GOLD]: '#f0d8c4', [DUSK]: '#92909f', [NIGHT]: '#2e4c62', [DAWN]: '#c8b4bc' });

    // Bent glass: tinted core so colours survive, modest glow so letters stay sharp
    neon('ICE', '#ecf9ff', '#62b8ff', 0.72);
    neon('TRED', '#ff8d7e', '#ff2418', 0.8);
    neon('TBLUE', '#a9d8ff', '#2f88ff', 0.8);
    neon('TGREEN', '#9affb6', '#16e06e', 0.72);
    neon('TAMBER', '#ffdb9a', '#ff9428', 0.72);
    neon('TROSE', '#ffb3b8', '#ff3a58', 0.75);
    neon('TBALL', '#fff2a8', '#ffc61a', 0.9);
    neon('CLOCK', '#f4f6ea', '#d8e4ff', 0.34);
    neon('LAMPW', '#eef8ff', '#c8e4ff', 0.6);
    neon('TRAM_FL', '#d4ecf4', '#b4dcff', 0.16);
    neon('SHELTER', '#e6f2fa', '#cfe6ff', 0.26);
    neon('TV', '#8fc4ee', '#5aa8f0', 0.2);
    neon('SHOP_C', '#8fb6c2', '#a8d4ff', 0.1);
    neon('SHOP_W', '#c49a68', '#ff9a30', 0.1);
    neon('GRILL', '#ffb060', '#ff6a14', 0.7);
    // Colour thrown on the snow below a sign
    neon('T_RED', '#a8859c', '#ff3a3a', 0.05);
    neon('T_ICE', '#b6d8f0', '#9ad0ff', 0.05);
    neon('T_GREEN', '#7fb4a4', '#30e080', 0.05);
    neon('T_AMBER', '#d6b48e', '#ff9a30', 0.05);
    neon('T_BLUE', '#7fa8d8', '#3a88ff', 0.05);
    // The Palace is floodlit from below; each scheme has four strengths
    const scheme = (name, hexes, glow) => hexes.forEach((h, i) => neon(`${name}${i}`, h, glow, 0.05 + i * 0.03));
    scheme('FI', ['#23475f', '#336785', '#4f90b6', '#86c6ea'], '#4ea8ff');
    scheme('FW', ['#55697a', '#7d919f', '#afc1cc', '#e4eef2'], '#c8e0ff');
    scheme('FR', ['#551821', '#7c2029', '#a82a2f', '#dc3a38'], '#ff2a2a');
    scheme('FA', ['#5a4a30', '#826840', '#ad8c56', '#dcbb7c'], '#ffb45a');
  };

  const glyphs = {
    // Taller than the 5x7 caps. RAISE tells the painter how far the accent climbs above the cap line.
    Ę: ['#####', '#....', '#....', '####.', '#....', '#....', '#####', '...#.', '...##'],
    Ó: ['...#.', '..#..', '.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    Ż: ['..#..', '.....', '#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
    Ł: ['.#...', '.#...', '.#.#.', '.##..', '##...', '.#...', '.####'],
    // Small sign letters; the 3x5 K reads as an H, this one doesn't
    ĸ: ['#.#', '##.', '#..', '##.', '#.#'],
    ó: ['..#', '.#.', '###', '#.#', '#.#', '#.#', '###'],
    ż: ['.#.', '...', '###', '..#', '.#.', '#..', '###'],
    // Script for the café; the capital sits under a private key so 3x5 K stays untouched
    ƙ: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
    a: ['.##.', '...#', '.###', '#..#', '.###'],
    w: ['#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
    i: ['#', '.', '#', '#', '#', '#', '#'],
    r: ['#.##', '##..', '#...', '#...', '#...'],
    n: ['#.#.', '##.#', '#..#', '#..#', '#..#'],
  };
  const RAISE = { Ó: 2, Ż: 2, ó: 2, ż: 2, a: -2, w: -2, r: -2, n: -2 };

  const rowsOf = (c, font) => (font === 5 && C.FONT5[c]) || C.GLYPH[c] || C.FONT3[c] || C.FONT3[' '];
  const wordW = (text, font, gap = 1) => [...text].reduce((a, c) => a + rowsOf(c, font)[0].length + gap, -gap);
  // Neon word, letter by letter, so single letters can have their own bad transformer
  const word = (w, x, y, text, { n, g, off = M.TUBE, font = 5, gap = 1, bad = {} }) => {
    let cx = x;
    [...text].forEach((c, i) => {
      const adv = w.glyph(c, cx, y - (RAISE[c] || 0), (px, py) => w.tube(px, py, off, n, bad[i] ?? g), font);
      cx += adv + gap;
    });
    return cx - gap - x;
  };

  // Hand-bent tube: a smooth curve through points, one pixel wide
  const bend = (pts, closed = false) => {
    const out = [];
    const seen = new Set();
    const put = (x, y) => {
      const rx = Math.round(x);
      const ry = Math.round(y);
      const k = rx * 1000 + ry;
      if (seen.has(k)) return;
      seen.add(k);
      out.push([rx, ry]);
    };
    const P = closed ? pts : [pts[0], ...pts, pts[pts.length - 1]];
    const n = closed ? P.length : P.length - 3;
    for (let i = 0; i < n; i++) {
      const p0 = P[closed ? (i - 1 + P.length) % P.length : i];
      const p1 = P[closed ? i : i + 1];
      const p2 = P[closed ? (i + 1) % P.length : i + 2];
      const p3 = P[closed ? (i + 2) % P.length : i + 3];
      const steps = Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 2) + 1;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const t2 = t * t;
        const t3 = t2 * t;
        const q = (a, b, c, d) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3);
        put(q(p0[0], p1[0], p2[0], p3[0]), q(p0[1], p1[1], p2[1], p3[1]));
      }
    }
    return out;
  };
  const ring = (cx, cy, r) => {
    const pts = [];
    for (let i = 0; i < 12; i++) pts.push([cx + Math.cos((i / 12) * 6.283) * r, cy + Math.sin((i / 12) * 6.283) * r]);
    return bend(pts, true);
  };
  const tubeAll = (w, ax, ay, list, n, g) => {
    for (const [x, y] of list) w.tube(ax + x, ay + y, M.FIG, n, g);
  };

  // ---- Snow catchers: every horizontal surface gets cells that flip white as the cover rises
  const ledge = (w, x, y, wd, rows = 1) => {
    const r = w.snowR;
    for (let i = 0; i < wd; i++) {
      for (let j = 0; j < rows; j++) {
        const yy = y - j;
        const th = (bayer(x + i, yy) / 16) * 105 + r() * 35 + j * 78;
        w.snowCells.push(at(x + i, yy), Math.min(254, th), M.SNOW, w.depth);
      }
    }
  };

  // Roofs and setbacks are found by looking: anything with sky or something farther away above it
  const scanSurfaces = (w) => {
    const { smat, sdepth, sgroup } = w;
    const r = w.snowR;
    for (let by = 2; by < w.walkTop + PAD_Y; by++) {
      let run = 0;
      for (let bx = 0; bx <= BW; bx++) {
        const i = by * BW + bx;
        const up = i - BW;
        const open = bx < BW && smat[i] !== 0 && smat[i] !== M.FRAME && smat[i] !== M.FIG && smat[i] !== M.FIG_B && sgroup[i] === 0 && (smat[up] === 0 || sdepth[up] < sdepth[i]);
        if (open) {
          run++;
          continue;
        }
        if (run >= 3) {
          const s = bx - run;
          const far = sdepth[by * BW + s] === 0;
          for (let k = s; k < bx; k++) {
            const rows = run >= 10 ? 3 : 2;
            for (let j = 0; j < rows; j++) {
              const c = (by - j) * BW + k;
              if (sgroup[c] !== 0) continue;
              const th = (BAYER[(((by - j) & 3) << 2) | (k & 3)] / 16) * 105 + r() * 35 + j * 78;
              w.snowCells.push(c, Math.min(254, th), far ? M.SNOW_FAR : M.SNOW, sdepth[by * BW + k]);
            }
          }
        }
        run = 0;
      }
    }
  };

  // ---- Distance
  const buildFar = (w, r) => {
    w.depth = 0;
    for (let x = -PAD_X; x < 360; ) {
      const wd = 9 + Math.floor(r() * 16);
      const h = 6 + Math.floor(r() * 20);
      w.rect(x, 104 - h, wd, h + 16, M.FAR1);
      x += wd;
    }
    for (let x = -PAD_X; x < 360; ) {
      const wd = 7 + Math.floor(r() * 12);
      const h = 4 + Math.floor(r() * 12);
      w.rect(x, 108 - h, wd, h + 12, M.FAR2);
      for (let wy = 109 - h; wy < 110; wy += 2) {
        for (let wx = x + 1; wx < x + wd - 1; wx += 2) if (r() < 0.28) w.light(wx, wy, N.WARM_DIM, w.farWin[Math.floor(r() * 5)]);
      }
      x += wd;
    }
    // Other towers of the Śródmieście cluster, kept pale so the neon has clean air
    for (const [x, top, wd] of [
      [-22, 40, 12],
      [84, 28, 10],
      [212, 58, 11],
      [254, 40, 9],
      [322, 22, 13],
      [340, 46, 12],
    ]) {
      w.rect(x, top, wd, 112 - top, M.FAR2);
      w.rect(x + wd - 3, top, 3, 112 - top, M.FAR3);
      w.rect(x + 1, top - 2, wd - 2, 2, M.FAR2);
      for (let wy = top + 2; wy < 108; wy += 2) {
        for (let wx = x + 1; wx < x + wd - 1; wx += 2) if (r() < 0.22) w.light(wx, wy, N.FLUO, w.farWin[Math.floor(r() * 5)]);
      }
    }
    // The sail: a residential tower whose flank curves up to a blade
    for (let y = 16; y < 112; y++) {
      const t = clamp((y - 16) / 62);
      const left = Math.round(127 - 21 * Math.sin((t * Math.PI) / 2) ** 0.85);
      for (let x = left; x < 128; x++) {
        const fade = (x - left + Math.floor(y / 3)) % 5 === 0;
        w.px(x, y, x < left + 2 ? M.VS_HI : fade ? M.VS_DK : M.VS);
        if ((y + x) % 3 === 0 && (x * 11 + y * 17) % 7 < 2) w.light(x, y, N.WARM_DIM, w.winGroups[(x + y) % 28]);
      }
    }
    w.beacons.push([127, 16]);
    w.beacons.push([89, 26]);
    // The tall one, needle spire and chamfered crown
    const vx = 190;
    const vw = 14;
    for (let y = 18; y < 112; y++) {
      const inset = y < 26 ? Math.ceil((26 - y) / 2) : 0;
      for (let x = vx + inset; x < vx + vw; x++) {
        const col = x - vx;
        w.px(x, y, col < 3 ? M.VS_HI : col % 3 === 0 ? M.VS_DK : M.VS);
        if (y > 28 && y % 2 === 0 && col % 2 === 1 && (x * 7 + y * 5) % 9 < 3) w.light(x, y, N.FLUO, w.farWin[(x + y) % 5]);
      }
    }
    for (let x = vx + 4; x < vx + vw; x += 2) w.light(x, 26, N.FLUO, w.farWin[0]);
    w.rect(vx + 8, 2, 1, 16, M.VS_DK);
    w.rect(vx + 7, 12, 3, 6, M.VS_DK);
    w.beacons.push([vx + 8, 2]);
    w.beacons.push([vx + 2, 24]);
    w.beacons.push([vx + 13, 18]);
  };

  // ---- The Palace of Culture and Science
  const buildPalace = (w) => {
    w.depth = 1;
    const cx = 160;
    const cells = [];
    const r = rng(1955);
    const stone = (x, y, m, lvl, band) => {
      w.px(x, y, m);
      cells.push(at(x, y), lvl, band, bayer(x, y));
    };
    const tiers = [
      [29, 37, 4],
      [37, 45, 7],
      [45, 62, 12],
      [62, 75, 18],
      [75, 87, 24],
      [87, 100, 31],
      [100, 118, 44],
    ];
    const pinnacle = (x, y, h, lvl, band) => {
      stone(x - 1, y, M.PK_DK, lvl, band);
      stone(x, y, M.PK, lvl, band);
      stone(x + 1, y, M.PK_DK, lvl, band);
      for (let j = 1; j < h; j++) stone(x, y - j, j > h - 2 ? M.PK_LT : M.PK, 3, band);
    };
    tiers.forEach(([y0, y1, hw], t) => {
      const band = y0 < 62 ? 1 : 0;
      const pitch = hw > 6 ? 3 : 2;
      for (let y = y0; y < y1; y++) {
        const fr = (y - y0) / (y1 - y0);
        for (let i = -hw; i <= hw; i++) {
          const rib = (i + hw) % pitch === 0;
          const shade = i > hw * 0.42;
          let m = i < -hw * 0.55 ? M.PK_LT : M.PK;
          if (shade) m = M.PK_DK;
          if (rib) m = shade ? M.PK_SH : M.PK_DK;
          const lvl = t === 6 ? clamp(Math.floor(fr * 3) + (rib ? 0 : 1) - (shade ? 1 : 0), 0, 3) : clamp(Math.floor(fr * 3.4) - (rib ? 1 : 0) - (shade ? 1 : 0) + (t > 1 ? 1 : 0), 0, 3);
          const slit = !rib && t > 1 && t < 6 && (y - y0) % 4 > 0 && y < y1 - 1 && y > y0 + 1 && (i + hw) % pitch === 1;
          if (slit) {
            w.px(cx + i, y, M.PK_WIN);
            if (r() < 0.08) w.light(cx + i, y, N.WARM_DIM, w.farWin[Math.floor(r() * 5)]);
          } else stone(cx + i, y, m, lvl, band);
        }
      }
      // Attic and cornice with a crenellated Polish parapet, a pinnacle on every corner
      for (let i = -hw - 1; i <= hw + 1; i++) stone(cx + i, y0, i > hw * 0.42 ? M.PK_DK : M.PK_LT, 1, band);
      for (let i = -hw; i <= hw; i += 2) stone(cx + i, y0 - 1, M.PK_LT, 1, band);
      ledge(w, cx - hw - 1, y0 - 1, hw * 2 + 3, 2);
      const h = t > 3 ? 7 : t > 1 ? 6 : 4;
      pinnacle(cx - hw, y0 - 2, h, 2, band);
      pinnacle(cx + hw, y0 - 2, h, 1, band);
      if (hw > 8) {
        pinnacle(cx - hw + 4, y0 - 2, h - 2, 2, band);
        pinnacle(cx + hw - 4, y0 - 2, h - 2, 1, band);
      }
      if (hw > 18) {
        for (const d of [-Math.floor(hw / 2), Math.floor(hw / 2)]) pinnacle(cx + d, y0 - 2, h - 1, 2, band);
      }
    });
    // Colonnade under the lantern
    for (let y = 39; y < 44; y++) {
      for (let i = -6; i <= 6; i += 2) {
        w.px(cx + i, y, M.PK_WIN);
        if (y < 43) w.light(cx + i, y, N.TAMBER, w.floodG);
      }
    }
    // Spire
    for (let y = 8; y < 29; y++) stone(cx, y, y < 16 ? M.PK_LT : M.PK, y < 16 ? 3 : 2, 1);
    for (let y = 20; y < 29; y++) {
      stone(cx - 1, y, M.PK_LT, 2, 1);
      stone(cx + 1, y, M.PK_DK, 1, 1);
    }
    for (let y = 24; y < 29; y++) {
      stone(cx - 2, y, M.PK, 1, 1);
      stone(cx + 2, y, M.PK_SH, 1, 1);
    }
    stone(cx - 1, 16, M.PK, 2, 1);
    stone(cx + 1, 16, M.PK_DK, 2, 1);
    w.beacons.push([cx, 8]);
    // Clock face; the hands are drawn live and tell the real hour
    w.clock = [cx, 53, 7];
    for (let j = -8; j <= 8; j++) {
      for (let i = -8; i <= 8; i++) {
        const d = i * i + j * j;
        if (d > 56) continue;
        w.px(cx + i, 53 + j, d > 42 ? M.PK_WIN : M.BOARD_W);
        if (d <= 42) w.light(cx + i, 53 + j, N.CLOCK, w.clockG);
      }
    }
    for (const [i, j] of [
      [0, -6],
      [6, 0],
      [0, 6],
      [-6, 0],
    ])
      w.px(cx + i, 53 + j, M.INK);
    // Grand portico and the arched halls of the wings
    for (let i = -11; i <= 11; i++) {
      for (let y = 104; y < 118; y++) {
        w.px(cx + i, y, (i + 11) % 3 === 0 ? M.PK_LT : M.PK_WIN);
        if ((i + 11) % 3 !== 0 && y < 114) w.light(cx + i, y, N.WARM, w.floodG);
      }
    }
    w.rect(cx - 13, 101, 27, 3, M.PK_LT);
    ledge(w, cx - 13, 100, 27, 2);
    for (const side of [-1, 1]) {
      for (let k = 0; k < 4; k++) {
        const ax = cx + side * (18 + k * 6);
        for (let y = 104; y < 114; y++) {
          for (let i = 0; i < 3; i++) {
            if (y === 104 && i !== 1) continue;
            w.px(ax + i - 1, y, M.PK_WIN);
            if (k % 2 === 0) w.light(ax + i - 1, y, N.WARM_DIM, w.farWin[k]);
          }
        }
      }
    }
    w.floodCells = cells;
  };

  // ---- The blok: prefab panels, every balcony done up by whoever lives there
  const unit = (w, x, y, f, u, r) => {
    w.rect(x, y + 10, 20, 1, M.BLOK_DK);
    w.rect(x, y, 1, 10, M.BLOK_LT);
    // Window
    w.rect(x + 1, y + 1, 7, 8, M.BLOK_DK);
    w.rect(x + 2, y + 2, 5, 6, M.GLASS);
    w.rect(x + 2, y + 2, 2, 2, M.GLASS_HI);
    const lit = r() < 0.6;
    const warm = r() < 0.7;
    if (lit) w.lightRect(x + 2, y + 2, 5, 6, warm ? N.WARM : N.FLUO, w.winGroups[Math.floor(r() * 28)]);
    w.rect(x + 4, y + 2, 1, 6, M.PVC);
    w.rect(x + 1, y + 8, 7, 1, M.BLOK_LT);
    ledge(w, x + 1, y + 7, 7, 1);
    // Balcony
    const bx = x + 8;
    const panel = [M.P_OCH, M.P_MINT, M.P_TERRA, M.P_BLUE, M.BLOK_LT][Math.floor(r() * 5)];
    w.rect(bx, y, 12, 7, M.BLOK_REC);
    w.rect(bx + 2, y + 1, 4, 6, M.GLASS_DK);
    if (lit && r() < 0.7) w.lightRect(bx + 2, y + 1, 4, 6, warm ? N.WARM_DIM : N.FLUO, w.winGroups[Math.floor(r() * 28)]);
    w.rect(bx, y + 7, 12, 3, panel);
    w.rect(bx, y + 6, 12, 1, M.STEEL_DK);
    w.rect(bx - 1, y + 10, 14, 1, M.BLOK_DK);
    ledge(w, bx, y + 5, 12, 1);
    const kind = w.blokKinds[`${f},${u}`] ?? Math.floor(r() * 7);
    if (kind === 1) {
      // Glazed in by a neighbour in white plastic
      w.rect(bx, y, 12, 7, M.GLASS_HI);
      if (lit) w.lightRect(bx, y, 12, 7, N.WARM_DIM, w.winGroups[Math.floor(r() * 28)]);
      for (let i = 0; i <= 12; i += 3) w.rect(bx + i, y, 1, 7, M.PVC);
      w.rect(bx, y, 12, 1, M.PVC);
    } else if (kind === 2) {
      // And by another in sixties timber
      w.rect(bx, y, 12, 7, M.GLASS_DK);
      for (let i = 0; i <= 12; i += 4) w.rect(bx + i, y, 1, 7, M.FRAME_W);
      w.rect(bx, y + 3, 12, 1, M.FRAME_W);
      w.rect(bx, y, 12, 1, M.FRAME_W);
    } else if (kind === 3) {
      // Corrugated sheet for privacy
      for (let i = 0; i < 12; i++) w.rect(bx + i, y + 5, 1, 5, i % 2 ? M.SHEET : M.SHEET_DK);
    } else if (kind === 4) {
      // Faded striped awning
      for (let i = 0; i < 12; i++) w.rect(bx + i, y, 1, 3, i % 4 < 2 ? M.AWN_O : M.DUVET);
    } else if (kind === 5) {
      // Geraniums in a box on the rail
      w.rect(bx + 1, y + 5, 10, 2, M.FRAME_W);
      for (let i = 1; i < 11; i++) {
        w.px(bx + i, y + 4, M.LEAF);
        if (i % 2) w.px(bx + i, y + 3, i % 4 === 1 ? M.POTRED : M.LEAF);
      }
    } else if (kind === 6) {
      // Satellite dish bolted to the rail
      w.sprite(['.##.', '#PP#', '#PP.', '.##.', '..S.'], { '#': M.PVC, P: M.BLOK_LT, S: M.STEEL_DK }, bx + 7, y + 1);
    }
  };

  const buildBlok = (w, r) => {
    w.depth = 2;
    const x0 = -40;
    const x1 = 104;
    const roof = 34;
    w.rect(x0, roof, x1 - x0, 118 - roof, M.BLOK);
    w.rect(x0, roof, x1 - x0, 1, M.BLOK_LT);
    w.rect(x0, roof + 1, x1 - x0, 2, M.BLOK_DK);
    w.rect(x1 - 2, roof, 2, 84, M.BLOK_DK);
    w.blokKinds = {
      '0,3': 3,
      '1,3': 1,
      '1,4': 5,
      '2,3': 0,
      '2,4': 6,
      '2,5': 2,
      '3,2': 4,
      '3,3': 0,
      '3,4': 5,
      '3,5': 1,
      '4,3': 2,
      '4,4': 3,
      '4,5': 0,
      '5,3': 6,
      '5,4': 1,
      '5,5': 5,
    };
    [38, 49, 60, 71, 82, 93].forEach((y, f) => {
      [-36, -16, 4, 32, 52, 72].forEach((x, u) => unit(w, x, y, f, u, r));
    });
    // Glass-brick stairwells, the PRL giveaway
    for (const sx of [24, 92]) {
      w.rect(sx, 38, 8, 66, M.BLOK_DK);
      for (let y = 39; y < 103; y++) {
        for (let i = 1; i < 7; i++) {
          const joint = i % 2 === 0 || y % 2 === 0;
          w.px(sx + i, y, joint ? M.LUX_DK : M.LUX);
          if (!joint) w.light(sx + i, y, N.FLUO, y < 70 ? w.farWin[2] : w.farWin[3]);
        }
      }
      // Entrance with a slab canopy, intercom and a stair number
      w.rect(sx - 2, 104, 12, 1, M.BLOK_LT);
      w.rect(sx - 2, 105, 12, 1, M.BLOK_DK);
      ledge(w, sx - 2, 103, 12, 2);
      w.rect(sx + 1, 106, 6, 12, M.FRAME_W);
      w.rect(sx + 2, 107, 4, 5, M.GLASS_DK);
      w.lightRect(sx + 2, 107, 4, 5, N.WARM_DIM, w.softGroup);
      w.px(sx + 7, 109, M.STEEL_DK);
      w.px(sx + 7, 110, M.STEEL_LT);
      w.px(sx + 3, 105, M.BOARD_B);
      w.px(sx + 4, 105, M.BOARD_W);
    }
    // Ground floor: small barred windows above a plinth
    w.rect(x0, 113, x1 - x0, 5, M.BLOK_DK);
    w.rect(x0, 104, x1 - x0, 1, M.BLOK_DK);
    for (let x = -36; x < 96; x += 12) {
      if (x + 5 > 22 && x < 34) continue;
      if (x + 5 > 90) continue;
      w.rect(x, 106, 6, 5, M.GLASS_DK);
      if (r() < 0.45) w.lightRect(x, 106, 6, 5, N.WARM_DIM, w.winGroups[Math.floor(r() * 28)]);
      for (let i = 1; i < 6; i += 2) w.rect(x + i, 106, 1, 5, M.STEEL_DK);
      w.rect(x - 1, 111, 8, 1, M.BLOK_LT);
    }
    // Roof: a forest of old aerials, a lift house, and the city's name in steel letters
    w.rect(10, 28, 11, 6, M.BLOK_DK);
    w.rect(10, 27, 11, 1, M.BLOK_LT);
    w.rect(73, 28, 9, 6, M.BLOK_DK);
    w.rect(73, 27, 9, 1, M.BLOK_LT);
    for (const [ax, top] of [
      [-6, 22],
      [4, 24],
      [14, 16],
      [24, 12],
      [80, 20],
      [86, 24],
      [96, 22],
    ]) {
      w.rect(ax, top, 1, 34 - top, M.STEEL_DK);
      for (let j = 0; j < 4; j++) w.rect(ax - 2 + (j % 2), top + j * 2, 5 - (j % 2) * 2, 1, M.STEEL_DK);
    }
    const g = w.addGroup(18.1, 28.5);
    w.rect(29, 33, 41, 1, M.STEEL_DK);
    // Posts hold the letters from below, so none runs through a glyph
    for (const fx of [32, 50, 66]) w.rect(fx, 30, 1, 3, M.STEEL_DK);
    w.sign(w, 29, 24, 'WARSZAWA', { n: N.ICE, g, wall: false });
  };

  // ---- Street level, left to right
  const buildKiosk = (w) => {
    w.depth = 2;
    const x = 58;
    const top = 93;
    // Hipped tin roof
    for (let j = 0; j < 4; j++) w.rect(x + 3 - j, top + j, 24 + j * 2, 1, j % 2 ? M.KIOSK_RF : M.KIOSK_DK);
    ledge(w, x + 2, top - 1, 26, 2);
    ledge(w, x, top + 3, 2, 1);
    ledge(w, x + 28, top + 3, 2, 1);
    w.rect(x, top + 4, 30, 21, M.KIOSK);
    const g = w.addGroup(17.5, 28.9, 'room');
    w.rect(x, top + 4, 30, 9, M.BOARD_W);
    w.lightRect(x, top + 4, 30, 9, N.B_WHITE, g);
    word(w, x + 2, top + 5, 'KIOSK', { n: N.NONE, g: 0, off: M.SHEET_DK });
    // Window: papers pegged along the top, the owner in the gap
    w.rect(x + 2, top + 13, 19, 7, M.ROOM);
    w.lightRect(x + 2, top + 13, 19, 7, N.WARM, g);
    const cols = [M.POSTER_A, M.BOARD_W, M.POSTER_B, M.POSTER_C, M.BOARD_W, M.BOARD_R, M.P_MINT, M.BOARD_W];
    cols.forEach((m, i) => {
      w.rect(x + 2 + i * 2 + (i > 3 ? 3 : 0), top + 13 + (i % 2), 2, 3, m);
    });
    w.rect(x + 1, top + 20, 21, 1, M.KIOSK_RF);
    ledge(w, x + 1, top + 19, 21, 1);
    // Side door with a glass pane
    w.rect(x + 23, top + 13, 6, 12, M.KIOSK_DK);
    w.rect(x + 24, top + 14, 4, 4, M.GLASS);
    w.px(x + 24, top + 19, M.STEEL_DK);
    word(w, x + 1, top + 21 - 1 + 1, 'BILETY', { n: N.NONE, g: 0, off: M.SHEET_DK, font: 3 });
    w.kioskAt = [x + 10, top + 13];
    w.tintAt(x - 4, x + 34, N.T_AMBER, g, 8);
  };

  const buildBench = (w) => {
    w.depth = 2;
    const x = 90;
    w.rect(x, 112, 13, 1, M.BENCH);
    w.rect(x, 115, 13, 1, M.BENCH);
    w.rect(x, 113, 13, 1, M.WOOD_LT);
    w.rect(x + 1, 116, 1, 2, M.STEEL_DK);
    w.rect(x + 11, 116, 1, 2, M.STEEL_DK);
    w.rect(x + 1, 112, 1, 4, M.STEEL_DK);
    w.rect(x + 11, 112, 1, 4, M.STEEL_DK);
    ledge(w, x, 111, 13, 1);
    ledge(w, x, 114, 13, 1);
    // Bin
    w.rect(106, 113, 4, 5, M.STEEL_DK);
    w.rect(106, 112, 4, 1, M.STEEL);
    ledge(w, 106, 111, 4, 1);
  };

  const buildTrzepak = (w) => {
    // The carpet-beating frame every Polish courtyard has, and every Polish kid has hung off
    w.depth = 2;
    w.rect(36, 103, 2, 15, M.P_BLUE);
    w.rect(53, 103, 2, 15, M.P_BLUE);
    w.rect(36, 103, 19, 1, M.P_BLUE);
    w.rect(36, 110, 19, 1, M.P_BLUE);
    ledge(w, 36, 102, 19, 1);
    ledge(w, 36, 109, 19, 1);
  };

  const buildShelter = (w) => {
    w.depth = 2;
    const x = 118;
    // Back wall, lit timetable panel, bench
    w.rect(x, 104, 22, 12, M.GLASS_HI);
    for (let i = 0; i < 22; i += 7) w.rect(x + i, 104, 1, 12, M.STEEL);
    w.rect(x + 22, 103, 1, 15, M.STEEL_DK);
    w.rect(x, 103, 1, 15, M.STEEL_DK);
    w.rect(x - 2, 102, 27, 1, M.STEEL_DK);
    w.rect(x - 2, 101, 27, 1, M.STEEL);
    ledge(w, x - 2, 100, 27, 2);
    w.rect(x + 2, 105, 9, 9, M.BOARD_W);
    w.lightRect(x + 2, 105, 9, 9, N.SHELTER, w.store2);
    w.rect(x + 3, 106, 7, 1, M.BOARD_B);
    for (let j = 108; j < 113; j += 2) w.rect(x + 3, j, 7, 1, M.CONC_DK);
    w.rect(x + 12, 113, 8, 1, M.WOOD_LT);
    w.rect(x + 13, 114, 1, 4, M.STEEL_DK);
    w.rect(x + 18, 114, 1, 4, M.STEEL_DK);
    // Stop post: name plate and a tram on a little yellow flag
    w.rect(x - 4, 92, 1, 26, M.STEEL_DK);
    w.rect(x - 7, 92, 7, 6, M.BOARD_Y);
    word(w, x - 5, 93, 'T', { n: N.NONE, g: 0, off: M.PAINT_K, font: 3 });
  };

  const buildMetro = (w) => {
    w.depth = 2;
    const x = 143;
    // Stairs dropping out of the pavement, railed either side
    w.rect(x, 118, 18, 7, M.CONC);
    w.rect(x + 1, 119, 16, 6, M.INK_DK);
    for (let j = 0; j < 5; j++) w.rect(x + 2 + j, 120 + j, 14 - j * 2, 1, j % 2 ? M.CONC_DK : M.CONC);
    w.rect(x, 113, 1, 6, M.STEEL_LT);
    w.rect(x + 17, 113, 1, 6, M.STEEL_LT);
    w.rect(x, 113, 18, 1, M.STEEL_LT);
    w.rect(x, 116, 18, 1, M.STEEL);
    ledge(w, x, 112, 18, 1);
    // M on a post, lit from inside
    w.rect(x + 4, 96, 1, 18, M.STEEL_DK);
    const g = w.addGroup(17.2, 29.6, 'room');
    w.rect(x, 86, 9, 10, M.BOARD_W);
    w.rect(x, 86, 9, 1, M.BOARD_R);
    w.rect(x, 95, 9, 1, M.BOARD_R);
    w.lightRect(x, 87, 9, 8, N.B_WHITE, g);
    w.glyph(
      'M',
      x + 2,
      87,
      (px, py) => {
        w.px(px, py, M.FLAG_R);
        w.light(px, py, N.TRED, g);
      },
      5,
    );
    ledge(w, x, 85, 9, 1);
  };

  const buildStall = (w) => {
    w.depth = 2;
    const x = 160;
    w.rect(x, 100, 26, 18, M.STALL);
    w.rect(x, 100, 26, 2, M.BOARD_R);
    ledge(w, x, 99, 26, 2);
    const g = w.addGroup(16.8, 27.2, 'room');
    w.rect(x, 102, 26, 7, M.BOARD_Y);
    w.lightRect(x, 102, 26, 7, N.B_YELLOW, g);
    // The word is long, so the board wraps the stall corner; letters sit on the awning itself
    w.rect(x - 6, 92, 42, 8, M.BOARD_K);
    w.rect(x - 6, 91, 42, 1, M.STEEL_DK);
    ledge(w, x - 6, 90, 42, 1);
    const n = w.addGroup(17.9, 27.2);
    word(w, x - 5, 93, 'ZAPIEĸANĸI', { n: N.TAMBER, g: n, font: 3 });
    w.rect(x + 2, 103, 22, 6, M.ROOM);
    w.lightRect(x + 2, 103, 22, 6, N.WARM, g);
    w.rect(x, 109, 26, 2, M.STEEL_LT);
    ledge(w, x, 108, 26, 1);
    w.rect(x + 2, 112, 22, 6, M.BOARD_R);
    for (let i = 3; i < 24; i += 4) w.rect(x + i, 112, 2, 6, M.BOARD_W);
    w.rect(x + 2, 111, 23, 7, M.BOARD_W);
    word(w, x + 3, 111, '9 ZŁ', { n: N.NONE, g: 0, off: M.PAINT_K });
    // Baguette halves under the lamp
    for (let i = 0; i < 3; i++) {
      w.rect(x + 14 + i * 3, 108, 2, 1, M.WOOD_LT);
      w.px(x + 14 + i * 3, 107, M.POTRED);
    }
    w.stallAt = [x, 103];
  };

  const buildNeonRow = (w, r) => {
    w.depth = 2;
    const x0 = 194;
    const x1 = 360;
    const roof = 62;
    w.rect(x0, roof, x1 - x0, 118 - roof, M.MDM);
    w.rect(x0, roof, x1 - x0, 1, M.MDM_LT);
    w.rect(x0, roof + 1, x1 - x0, 1, M.MDM_DK);
    for (let x = x0; x < x1; x += 12) w.rect(x, roof + 2, 1, 41, M.MDM_DK);
    for (let y = roof + 13; y < 104; y += 13) w.rect(x0, y, x1 - x0, 1, M.MDM_DK);
    // Rusticated arcade at ground level
    w.rect(x0, 103, x1 - x0, 15, M.MDM_LT);
    w.rect(x0, 103, x1 - x0, 1, M.MDM_DK);

    const stutter = (i) => 18 + i * 0.045;
    const on = (i, broken) => {
      const g = w.addGroup(stutter(i), 28.4 + (i % 4) * 0.05);
      if (broken) w.flicker.push([g, i * 2.7]);
      return g;
    };
    let k = 0;
    const plate = (x, y, wd, h = 11) => {
      w.rect(x, y, wd, h, M.BOARD_K);
      w.rect(x, y + h, wd, 1, M.STEEL_DK);
      ledge(w, x, y - 1, wd, 2);
    };

    // HOTEL hung off the corner
    const gH = on(k++);
    const gHb = on(k++, true);
    w.rect(194, 62, 10, 44, M.BOARD_K);
    let hy = 64;
    [...'HOTEL'].forEach((c, i) => {
      w.glyph(c, 196, hy, (px, py) => w.tube(px, py, M.TUBE, N.TBLUE, i === 2 ? gHb : gH), 5);
      hy += 8;
    });
    ledge(w, 194, 61, 10, 1);
    w.rect(194, 106, 10, 12, M.MDM_DK);
    w.rect(196, 107, 6, 11, M.FRAME_W);
    w.rect(197, 108, 4, 6, M.GLASS_DK);
    w.lightRect(197, 108, 4, 6, N.WARM, w.softGroup);

    // Row 1
    const g1 = on(k++);
    plate(206, 64, 62);
    word(w, 206 + Math.floor((62 - wordW('DELIKATESY', 5)) / 2), 66, 'DELIKATESY', { n: N.TGREEN, g: g1 });
    const g2 = on(k++);
    plate(270, 64, 42);
    word(w, 271, 66, 'ƙawiarnia', { n: N.ICE, g: g2, gap: 1, font: 0 });
    for (let i = 0; i < 40; i++) w.tube(271 + i, 74, M.TUBE, N.TAMBER, g2);

    // Row 2
    const g3 = on(k++);
    const g3b = on(k++, true);
    plate(206, 77, 62);
    word(w, 206 + Math.floor((62 - wordW('KSIĘGARNIA', 5)) / 2), 79, 'KSIĘGARNIA', { n: N.TBLUE, g: g3, bad: { 3: g3b } });
    const g4 = on(k++);
    plate(270, 77, 42);
    word(w, 270 + Math.floor((42 - wordW('KWIATY', 5)) / 2), 79, 'KWIATY', { n: N.TROSE, g: g4 });
    w.tintAt(270, 312, N.T_RED, g4);

    // Row 3: the fascia right over the shops
    const g5 = on(k++);
    const g5b = on(k++, true);
    plate(206, 91, 65);
    word(w, 206 + Math.floor((65 - wordW('BAR MLECZNY', 5)) / 2), 93, 'BAR MLECZNY', { n: N.TRED, g: g5, bad: { 10: g5b } });
    w.tintAt(206, 270, N.T_RED, g5);
    const g6 = on(k++);
    plate(273, 91, 40);
    word(w, 273 + Math.floor((40 - wordW('APTEKA', 5)) / 2), 93, 'APTEKA', { n: N.TGREEN, g: g6 });
    w.tintAt(274, 312, N.T_GREEN, g6);

    // SAM down the side, the old word for help-yourself grocery
    const gSam = on(k++);
    w.rect(314, 64, 11, 30, M.BOARD_K);
    ledge(w, 314, 63, 11, 1);
    let sy2 = 67;
    for (const c of 'SAM') {
      w.glyph(c, 317, sy2, (px, py) => w.tube(px, py, M.TUBE, N.TBLUE, gSam), 5);
      sy2 += 8;
    }

    // Shop fronts under the fascia
    const shop = (x, wd, n, g) => {
      w.rect(x, 105, wd, 11, M.GLASS);
      w.rect(x, 105, Math.floor(wd / 3), 2, M.GLASS_HI);
      w.lightRect(x, 105, wd, 11, n, g);
      w.rect(x, 116, wd, 2, M.MDM_DK);
    };
    // Milk bar: tables in a white room, the day's menu in the window
    const gMB = w.addGroup(16.4, 27.6, 'room');
    shop(206, 66, N.SHOP_C, gMB);
    for (const tx of [212, 228, 252]) {
      w.rect(tx, 112, 8, 1, M.PVC);
      w.rect(tx + 3, 113, 2, 3, M.STEEL_DK);
    }
    word(w, 212, 106, 'PIEROGI', { n: N.NONE, g: 0, off: M.BOARD_R, font: 3 });
    word(w, 242, 106, 'BARSZCZ', { n: N.NONE, g: 0, off: M.BOARD_R, font: 3 });
    w.rect(240, 105, 1, 11, M.MDM_DK);
    w.rect(271, 105, 3, 13, M.MDM_LT);
    // Pharmacy, open round the clock, cold light and rows of little bottles; the green cross blinks as they all do
    const gA = w.addGroup(12, 40, 'room');
    shop(274, 22, N.SHOP_C, gA);
    for (let i = 0; i < 18; i += 2) {
      w.rect(276 + i, 108, 1, 2, [M.BOARD_W, M.BOARD_G, M.P_BLUE][i % 3]);
      w.rect(276 + i, 112, 1, 2, [M.BOARD_R, M.BOARD_W, M.BOARD_G][i % 3]);
    }
    w.rect(275, 110, 20, 1, M.STEEL);
    w.rect(275, 114, 20, 1, M.STEEL);
    // Flower shop, buckets spilling out on the pavement
    const gF = w.addGroup(13, 26.5, 'room');
    shop(298, 16, N.SHOP_W, gF);
    w.rect(296, 105, 2, 13, M.MDM_LT);
    const fl = [M.POTRED, M.BOARD_Y, M.BOARD_P, M.PVC, M.BOARD_O];
    for (let i = 0; i < 14; i++) {
      const fx = 298 + i;
      w.px(fx, 115, M.LEAF);
      w.px(fx, 114, i % 2 ? M.LEAF : fl[i % 5]);
      if (i % 3 === 0) w.px(fx, 113, fl[(i + 2) % 5]);
    }
    for (let i = 0; i < 3; i++) {
      const bx = 299 + i * 5;
      w.rect(bx, 121, 4, 3, M.STEEL_LT);
      for (let j = 0; j < 4; j++) w.px(bx + j, 120, j % 2 ? M.LEAF : fl[(i * 2 + j) % 5]);
      w.px(bx + 1, 119, fl[(i + 1) % 5]);
    }
    word(w, 299, 107, 'RóżE', { n: N.NONE, g: 0, off: M.BOARD_R, font: 3 });
    // Cinema side: framed posters
    for (let px = 327; px < 358; px += 9) {
      w.rect(px, 105, 7, 11, M.PAINT_K);
      w.rect(px + 1, 106, 5, 9, [M.POSTER_A, M.POSTER_C, M.POSTER_B, M.POSTER_A][(px / 9) % 4 | 0]);
      w.lightRect(px + 1, 106, 5, 2, N.B_WHITE, gMB);
    }
    // Lit flats in the gaps
    for (const [wx, wy] of [
      [326, 66],
      [326, 79],
      [338, 66],
      [338, 79],
      [350, 66],
      [350, 92],
    ]) {
      w.rect(wx, wy - 8, 5, 7, M.GLASS_DK);
      if (r() < 0.65) w.lightRect(wx, wy - 8, 5, 7, N.WARM, w.winGroups[Math.floor(r() * 28)]);
    }

    // ---- Rooftop figures on their steel frames
    w.depth = 2;
    const frame = (x, y0, x1b, y1b) => {
      for (let i = x; i <= x1b; i += 16) w.rect(i, y0, 1, y1b - y0, M.FRAME);
      w.rect(x, y0, x1b - x + 1, 1, M.FRAME);
      w.rect(x, y1b - 8, x1b - x + 1, 1, M.FRAME);
    };

    // Syrenka, sword high and shield up, the city's own arms
    const sx = 203;
    const sy = 22;
    frame(sx + 2, sy + 10, sx + 34, 62);
    const gS = on(k++);
    const gTail = on(k++);
    const gArm = on(k++);
    // Head and hair
    tubeAll(w, sx, sy, ring(18, 10.5, 3), N.ICE, gS);
    tubeAll(w, sx, sy, bend([[16, 7], [13, 9], [12, 14], [13, 19]]), N.TAMBER, gS);
    tubeAll(w, sx, sy, bend([[20, 7], [23, 10], [23, 14]]), N.TAMBER, gS);
    // Torso, narrowing into the tail
    tubeAll(w, sx, sy, bend([[16, 15], [15, 19], [16, 24], [17, 28]]), N.ICE, gS);
    tubeAll(w, sx, sy, bend([[20, 15], [21, 19], [20, 24], [21, 28]]), N.ICE, gS);
    tubeAll(w, sx, sy, bend([[16, 15], [18, 14], [20, 15]]), N.ICE, gS);
    // Tail coils down and away with a forked fin
    const tailA = [[17, 28], [16, 33], [18, 37], [23, 39], [28, 37], [31, 33]];
    const tailB = [[21, 28], [21, 32], [23, 35], [26, 35], [28, 33], [31, 33]];
    tubeAll(w, sx, sy, bend(tailA), N.TGREEN, gTail);
    tubeAll(w, sx, sy, bend(tailB), N.TGREEN, gTail);
    tubeAll(w, sx, sy, bend([[31, 33], [33, 30], [36, 29]]), N.TGREEN, gTail);
    tubeAll(w, sx, sy, bend([[31, 33], [34, 34], [37, 33]]), N.TGREEN, gTail);
    tubeAll(w, sx, sy, [[18, 31], [19, 34], [21, 36], [24, 37]], N.TGREEN, gTail);
    // Sword arm raised, blade straight up
    tubeAll(w, sx, sy, bend([[20, 16], [24, 14], [26, 9]]), N.ICE, gS);
    tubeAll(w, sx, sy, bend([[26, 9], [26, 4], [26, -2]]), N.TAMBER, gArm);
    tubeAll(w, sx, sy, [[24, 7], [25, 7], [27, 7], [28, 7]], N.TAMBER, gArm);
    // Shield arm and round shield with a cross
    tubeAll(w, sx, sy, bend([[16, 16], [12, 19], [9, 21]]), N.ICE, gS);
    tubeAll(w, sx, sy, ring(6, 23, 4.6), N.TRED, gArm);
    tubeAll(w, sx, sy, [[6, 20], [6, 21], [6, 22], [6, 23], [6, 24], [6, 25], [6, 26], [4, 23], [5, 23], [7, 23], [8, 23]], N.TRED, gArm);

    // KINO on the roof between them, bulbs chasing round the box
    const g7 = on(k++);
    const g7b = on(k++, true);
    w.rect(242, 24, 11, 38, M.BOARD_K);
    ledge(w, 242, 23, 11, 1);
    let ky = 27;
    [...'KINO'].forEach((c, i) => {
      w.glyph(c, 245, ky, (px, py) => w.tube(px, py, M.TUBE, N.TRED, i === 1 ? g7b : g7), 5);
      ky += 8;
    });
    w.bulbs = [];
    for (let y = 25; y < 61; y += 2) {
      w.bulbs.push([243, y]);
      w.px(243, y, M.TUBE);
    }
    for (let y = 59; y > 24; y -= 2) {
      w.bulbs.push([252, y]);
      w.px(252, y, M.TUBE);
    }
    w.kinoG = g7;

    // The volleyball player, mid-spike. Ball frames are lit live.
    const vx = 254;
    const vy = 18;
    frame(vx + 2, vy + 6, vx + 34, 62);
    const gV = on(k++);
    const gVr = on(k++);
    tubeAll(w, vx, vy, ring(16, 12, 2.6), N.ICE, gV);
    tubeAll(w, vx, vy, bend([[14, 10], [11, 10], [9, 13]]), N.TAMBER, gV);
    // Arched back and chest
    tubeAll(w, vx, vy, bend([[15, 15], [12, 20], [11, 26], [13, 30]]), N.ICE, gV);
    tubeAll(w, vx, vy, bend([[18, 16], [18, 21], [17, 26], [18, 30]]), N.ICE, gV);
    // Hitting arm up to the ball, other arm thrown back
    tubeAll(w, vx, vy, bend([[18, 16], [22, 11], [25, 5]]), N.ICE, gV);
    tubeAll(w, vx, vy, bend([[15, 16], [9, 18], [4, 14]]), N.ICE, gV);
    // Shorts
    tubeAll(w, vx, vy, bend([[13, 30], [15, 31], [18, 30]]), N.TRED, gVr);
    tubeAll(w, vx, vy, bend([[12, 30], [11, 34], [15, 34], [18, 33], [18, 30]]), N.TRED, gVr);
    // Legs, front knee driven up, back leg trailing
    tubeAll(w, vx, vy, bend([[17, 34], [22, 36], [20, 42]]), N.ICE, gV);
    tubeAll(w, vx, vy, bend([[20, 42], [23, 43]]), N.TAMBER, gV);
    tubeAll(w, vx, vy, bend([[13, 34], [8, 38], [2, 39]]), N.ICE, gV);
    tubeAll(w, vx, vy, bend([[2, 39], [0, 42]]), N.TAMBER, gV);
    // Ball path: off the hand, over, down to a bounce and back
    w.ballFrames = [
      [26, 1],
      [30, 3],
      [33, 9],
      [35, 18],
      [36, 28],
      [36, 41],
      [34, 30],
      [31, 21],
      [28, 11],
    ].map(([x, y]) => ring(vx + x, vy + y, 1.7));
    for (const f of w.ballFrames) for (const [x, y] of f) w.px(x, y, M.FIG_B);
    w.ballG = gV;

    // The flower for KWIATY, opening in three stages
    const fx = 300;
    const fy = 40;
    w.rect(fx, fy + 2, 1, 20, M.FRAME);
    const gStem = on(k++);
    tubeAll(w, 0, 0, bend([[fx + 1, fy + 8], [fx, fy + 14], [fx + 1, 61]]), N.TGREEN, gStem);
    tubeAll(w, 0, 0, bend([[fx, fy + 15], [fx - 5, fy + 13], [fx - 7, fy + 9], [fx - 3, fy + 11], [fx, fy + 15]]), N.TGREEN, gStem);
    tubeAll(w, 0, 0, bend([[fx + 1, fy + 18], [fx + 6, fy + 15], [fx + 8, fy + 11], [fx + 4, fy + 14], [fx + 1, fy + 18]]), N.TGREEN, gStem);
    const petals = (rad, wide, count, rot) => {
      const out = [];
      for (let i = 0; i < count; i++) {
        const a = rot + (i / count) * 6.283;
        const c = Math.cos(a);
        const s = Math.sin(a);
        const pt = (u, v) => [fx + 0.5 + c * u - s * v, fy + s * u + c * v];
        out.push(...bend([pt(1.5, 0), pt(rad * 0.55, wide), pt(rad, 0), pt(rad * 0.55, -wide)], true));
      }
      return out;
    };
    w.flowerFrames = [ring(fx + 0.5, fy, 2), petals(6, 2, 5, -1.57), petals(10, 3.2, 6, -1.57)];
    for (const f of w.flowerFrames) for (const [x, y] of f) w.px(x, y, M.FIG_B);
    w.flowerG = gStem;
    w.flowerCore = [[fx, fy - 1], [fx + 1, fy - 1], [fx - 1, fy], [fx, fy], [fx + 1, fy], [fx + 2, fy], [fx, fy + 1], [fx + 1, fy + 1]];

    // Green pharmacy cross
    w.rect(291, 104, 7, 7, M.BOARD_K);
    w.crossAt = [294, 107];
    w.crossG = g6;
      };

  // A neon word standing on its own, frame and all
  const sign = (w, x, y, text, { n, g }) => {
    word(w, x, y, text, { n, g, off: M.FIG });
    return wordW(text, 5);
  };

  // Bare branches; the gold on them is drawn live so it can thin out as the snow arrives
  const buildTree = (w, x, base, seed, size) => {
    const r = rng(seed);
    w.depth = 3;
    w.rect(x, base - Math.floor(size * 0.4), 2, Math.floor(size * 0.4) + 1, M.BARK);
    w.rect(x, base - Math.floor(size * 0.3), 1, Math.floor(size * 0.3), M.BARK_LT);
    const twig = (px, py, ang, len, d) => {
      let cx = px;
      let cy = py;
      for (let i = 0; i < len; i++) {
        cx += Math.cos(ang);
        cy += Math.sin(ang);
        ang += (r() - 0.5) * 0.22;
        const rx = Math.round(cx);
        const ry = Math.round(cy);
        w.px(rx, ry, d > 2 ? M.BARK : M.BARK_LT);
        if (d > 2) w.px(rx + 1, ry, M.BARK);
        const th = (bayer(rx, ry - 1) / 16) * 120 + r() * 60;
        w.snowCells.push(at(rx, ry - 1), Math.min(254, th), M.SNOW, 3);
      }
      if (d <= 0) {
        for (let n = 0; n < 16; n++) {
          const lx = Math.round(cx + (r() - 0.5) * 12);
          const ly = Math.round(cy + (r() - 0.5) * 9);
          w.leaves.push(at(lx, ly), Math.floor(r() * 240), r() < 0.2 ? 1 : r() < 0.5 ? 2 : 0);
        }
        return;
      }
      const n = d > 2 ? 3 : 2;
      for (let i = 0; i < n; i++) twig(cx, cy, ang + (i - (n - 1) / 2) * (0.55 + r() * 0.35), len * (0.62 + r() * 0.2), d - 1);
    };
    twig(x + 0.5, base - size * 0.4, -1.57, size * 0.26, 3);
    w.depth = 2;
  };

  const buildStreet = (w, r) => {
    w.depth = 2;
    w.rect(-PAD_X, 118, BW, 8, M.WALK);
    for (let x = -PAD_X; x < 360; x += 8) {
      w.rect(x, 118, 1, 4, M.WALK_D);
      w.rect(x + 4, 122, 1, 4, M.WALK_D);
    }
    w.rect(-PAD_X, 122, BW, 1, M.WALK_D);
    w.rect(-PAD_X, 126, BW, 1, M.CURB);
    w.rect(-PAD_X, 127, BW, 23, M.ROAD);
    for (let i = 0; i < 900; i++) {
      const x = Math.floor(r() * BW) - PAD_X;
      const y = 127 + Math.floor(r() * 23);
      w.px(x, y, r() < 0.5 ? M.ROAD_D : M.ROAD_L);
    }
    // Stop lines
    w.rect(143, 141, 1, 9, M.LINE);
    w.rect(182, 128, 1, 12, M.LINE);
    // Lane dashes
    for (let x = -PAD_X; x < 360; x += 14) if (x < 138 || x > 182) w.rect(x, 145, 7, 1, M.LINE);
    w.px(116, 147, M.MANHOLE);
    w.rect(112, 146, 6, 1, M.MANHOLE);
    w.rect(290, 146, 6, 1, M.MANHOLE);
    // Tracks set in the road: granite-paved bed between steel rails
    const rails = [130, 134, 136, 140];
    for (const y0 of [131, 137]) {
      for (let x = -PAD_X; x < 360; x++) {
        for (let j = 0; j < 3; j++) if ((x + j * 2) % 4 !== 0) w.px(x, y0 + j, M.SETT);
      }
    }
    for (const y of rails) {
      w.rect(-PAD_X, y, BW, 1, M.RAIL);
    }
    w.rect(-PAD_X, 133, BW, 1, M.SETT);
    // Zebra crossing, broken by the track bed as the real ones are
    for (let x = 146; x < 180; x += 8) {
      w.rect(x, 127, 4, 3, M.LINE);
      w.rect(x, 141, 4, 9, M.LINE);
    }
    // Snow thresholds for every street pixel, baked once
    const rows = 150 - 118;
    w.streetRows = rows;
    w.sth = new Uint8Array(BW * rows);
    w.wear = new Uint8Array(BW * rows);
    const rs = rng(77);
    const rutRows = new Set([143, 139, 149, 145]);
    for (let j = 0; j < rows; j++) {
      const y = 118 + j;
      for (let bx = 0; bx < BW; bx++) {
        const b = BAYER[((y + PAD_Y) & 3) * 4 + (bx & 3)] / 16;
        let th;
        if (y < 126) th = 8 + b * 118 + rs() * 22;
        else if (y === 126) th = 200 + b * 50;
        else {
          th = 70 + b * 110 + rs() * 40;
          if (rutRows.has(y)) th += 20;
        }
        if (rails.includes(y)) th = 255;
        if (rails.includes(y - 1) || rails.includes(y + 1)) th = Math.min(250, th + 26);
        w.sth[j * BW + bx] = Math.min(255, th);
      }
    }
    w.tintN = new Uint8Array(BW);
    w.tintG = new Uint8Array(BW);
    w.tintLim = new Uint8Array(rows);
    w.tintW = new Uint8Array(BW);
    for (let j = 0; j < rows; j++) w.tintLim[j] = Math.min(17, 5 + j * 0.9);
    w.tintAt = (x0, x1, n, g, feather = 5) => {
      for (let x = x0; x < x1; x++) {
        const e = Math.min(x - x0, x1 - 1 - x);
        const fade = Math.round(clamp(1 - e / feather) * 12);
        if (w.tintG[x + PAD_X] && fade > w.tintW[x + PAD_X]) continue;
        w.tintN[x + PAD_X] = n;
        w.tintG[x + PAD_X] = g;
        w.tintW[x + PAD_X] = fade;
      }
    };
  };

  // Tram masts and the wire. Kept below the signage on the neon side.
  const buildWires = (w) => {
    w.depth = 2;
    w.lampG = w.addGroup(17.6, 29, 'neon', { soft: true });
    const mast = (x, top, lamp) => {
      w.rect(x, top, 1, 118 - top, M.POLE_DK);
      w.rect(x, top, 7, 1, M.POLE_DK);
      if (lamp) {
        w.rect(x + 4, top + 1, 4, 1, M.LAMP_OFF);
        w.lightRect(x + 4, top + 1, 4, 1, N.LAMPW, w.lampG);
        w.lampHeads.push([x + 6, top + 2]);
        w.tintAt(x - 4, x + 14, N.T_ICE, w.lampG, 8);
        ledge(w, x + 2, top - 1, 6, 1);
      }
    };
    w.lampHeads = [];
    for (const [x, top] of [
      [-22, 96],
      [28, 92],
      [84, 92],
      [205, 104],
      [272, 104],
      [340, 104],
    ])
      mast(x, top, true);
    for (let x = -PAD_X; x < 360; x++) {
      w.px(x, 112, M.WIRE);
      w.px(x, 116, M.WIRE);
    }
    // Signals: vertical heads on posts, and the white-bar signal only trams obey
    w.rect(140, 96, 1, 22, M.POLE_DK);
    w.rect(137, 94, 4, 12, M.BOARD_K);
    w.rect(190, 102, 1, 16, M.POLE_DK);
    w.rect(191, 102, 4, 11, M.BOARD_K);
    w.signalHeads = [
      [138, 95],
      [192, 102],
    ];
    w.rect(137, 107, 4, 4, M.BOARD_K);
    w.tramSignalAt = [138, 108];
  };

  const SPRITES = {
    // Boxy little rear-engined two-door, the car half of Poland learnt on
    maluch: {
      rows: ['....BBBBBBB....', '...BGGGBGGGB...', '..BBGGGBGGGBB..', '.BBBBBBBBBBBBBB', 'BBBBBBBBBBBBBBB', 'DDDWWDDDDDWWDDD', '...WW.....WW...'],
      top: 2,
    },
    hatch: {
      rows: ['.....BBBBBBBBB.......', '....BGGGGBGGGGB......', '...BGGGGGBGGGGGBB....', '.BBBBBBBBBBBBBBBBBBBB', 'BBBBBBBBBBBBBBBBBBBBB', 'DDDWWWDDDDDDDDDWWWDDD', '...WWW.........WWW...'],
    },
    sedan: {
      rows: ['.......BBBBBBBBB........', '......BGGGGBGGGGB.......', '....BBGGGGGBGGGGGBB.....', '.BBBBBBBBBBBBBBBBBBBBBB.', 'BBBBBBBBBBBBBBBBBBBBBBBB', 'DDDDWWWDDDDDDDDDDWWWDDDD', '....WWW..........WWW....'],
    },
    van: {
      rows: ['.BBBBBBBBBBBBBBBBBB......', 'BBBBBBBBBBBBBBBBBBBB.....', 'BBGGGBGGGBGGGBGGGBGGB....', 'BBGGGBGGGBGGGBGGGBGGGB...', 'BBBBBBBBBBBBBBBBBBBBBBBBB', 'BBBBBBBBBBBBBBBBBBBBBBBBB', 'DDDWWWDDDDDDDDDDDWWWDDDDD', '...WWW...........WWW.....'],
    },
  };

  const drawCar = function (car, x, y) {
    const w = this;
    const sp = SPRITES[car.kind] || SPRITES.hatch;
    const rows = sp.rows;
    const flip = car.dir < 0;
    const body = car.color || M.CAR_SILV;
    const H = rows.length;
    const L = rows[0].length;
    const snowy = car.snowy && w.cover > 0.5;
    for (let i = 1; i < L - 1; i++) w.px(x + i, y + 1, M.ROAD_D);
    for (let j = 0; j < H; j++) {
      const row = rows[j];
      for (let i = 0; i < L; i++) {
        const c = row[i];
        if (c === '.') continue;
        const px = flip ? x + L - 1 - i : x + i;
        const py = y - H + 1 + j;
        let m = body;
        if (c === 'G') m = M.CAR_GLASS;
        else if (c === 'D') m = M.CAR_DK;
        else if (c === 'W') m = M.TIRE;
        else if (snowy && j === 0) m = M.SNOW;
        w.px(px, py, m);
      }
    }
    const nose = flip ? x : x + L - 1;
    const tail = flip ? x + L - 1 : x;
    const hy = y - H + 4;
    w.px(nose, hy, M.CAR_W);
    w.px(tail, hy, M.CAR_R);
    if (w.dark > 0.3) {
      w.pxLight(nose, hy, N.HEAD);
      w.pxLight(tail, hy, N.TAIL);
    }
    if (car.taxi) {
      const mid = Math.floor(L / 2);
      for (let i = -1; i <= 1; i++) {
        w.px(x + mid + i, y - H, M.BOARD_Y);
        if (w.dark > 0.2) w.pxLight(x + mid + i, y - H, N.B_YELLOW);
      }
    }
  };

  const build = (w) => {
    const r = rng(1944);
    w.snowR = rng(2031);
    w.snowCells = [];
    w.leaves = [];
    w.flicker = [];
    w.walkTop = 118;
    w.roadTop = 127;
    w.floodG = w.addGroup(17.9, 28.8, 'neon', { soft: true });
    w.clockG = w.addGroup(17.4, 29.4, 'room');
    w.store2 = w.addGroup(17, 29.2, 'room');
    w.sign = sign;
    w.drawCar = drawCar;

    buildFar(w, r);
    buildPalace(w);
    buildStreet(w, r);
    buildBlok(w, r);
    buildNeonRow(w, r);
    buildWires(w);
    buildTrzepak(w);
    buildKiosk(w);
    buildBench(w);
    buildShelter(w);
    buildMetro(w);
    buildStall(w);
    buildTree(w, 6, 118, 11, 62);
    buildTree(w, 110, 118, 23, 54);
    buildTree(w, -28, 118, 31, 60);
    buildTree(w, 342, 118, 47, 60);
    w.depth = 2;
    const fc = [];
    for (let k = 0; k < w.floodCells.length; k += 4) if (w.sdepth[w.floodCells[k]] <= 1) fc.push(k);
    w.flood = new Int32Array(fc.map((k) => w.floodCells[k]));
    w.floodL = new Uint8Array(fc.map((k) => w.floodCells[k + 1]));
    w.floodB = new Uint8Array(fc.map((k) => w.floodCells[k + 2]));
    w.floodD = new Uint8Array(fc.map((k) => w.floodCells[k + 3]));
    w.floodCells = null;
    scanSurfaces(w);
    const cells = w.snowCells;
    const keep = [];
    for (let k = 0; k < cells.length; k += 4) {
      const i = cells[k];
      if (i >= 0 && i < w.sdepth.length && w.sdepth[i] <= cells[k + 3]) keep.push(k);
    }
    w.snowI = new Int32Array(keep.length);
    w.snowT = new Uint8Array(keep.length);
    w.snowM = new Uint8Array(keep.length);
    keep.forEach((k, n) => {
      w.snowI[n] = cells[k];
      w.snowT[n] = cells[k + 1];
      w.snowM[n] = cells[k + 2];
    });
    w.snowCells = null;
    const lv = w.leaves;
    w.leafI = new Int32Array(lv.filter((_, k) => k % 3 === 0));
    w.leafT = new Uint8Array(lv.filter((_, k) => k % 3 === 1));
    w.leafK = new Uint8Array(lv.filter((_, k) => k % 3 === 2));
    w.leafM = [M.BOARD_Y, M.BOARD_O, M.CAR_Y];
    w.falling = Array.from({ length: 10 }, () => ({ x: r() * 130 - 20, y: 60 + r() * 50, v: 4 + r() * 5, p: r() * 6 }));

    w.cover = 0;
    w.wearAcc = 0;
    w.plough = { active: false, done: false, x: -80, level: 0 };

    w.clouds = [
      { x: 30, y: 14, w: 34, v: 0.9 },
      { x: 220, y: 9, w: 26, v: 0.7 },
      { x: 300, y: 22, w: 40, v: 1.1 },
      { x: -40, y: 22, w: 22, v: 0.8 },
    ];

    // Road and pedestrians
    w.stopLines = [142, 183];
    w.lanes = [143, 149];
    const cars = [
      ['maluch', M.CAR_PALE, 0, 62, 15],
      ['hatch', M.CAR_SILV, 0, 300, 21],
      ['sedan', M.CAR_NAVY, 0, 170, 24, true],
      ['maluch', M.CAR_MINT, 1, 30, 15],
      ['van', M.BOARD_W, 1, 150, 25],
      ['hatch', M.CAR_CRIM, 1, 260, 21],
      ['sedan', M.BOARD_W, 1, 340, 24, false, true],
    ];
    for (const [kind, color, lane, x, len, snowy, taxi] of cars) {
      w.cars.push({ kind, color, lane, x, len, dir: lane ? 1 : -1, speed: kind === 'maluch' ? 26 + r() * 6 : 34 + r() * 12, snowy: snowy ?? r() < 0.5, taxi });
    }
    w.personStyles = {
      puffB: [M.PUFF_B, M.PUFF_K, M.HAIR],
      puffR: [M.PUFF_R, M.PUFF_K, M.BERET],
      puffG: [M.PUFF_G, M.SUIT, M.HAIR],
      coat: [M.COAT, M.SUIT, M.HAIR],
      dark: [M.PUFF_K, M.SUIT, M.BOARD_W],
    };
    for (const [x, y, dir, speed, style, nightOnly] of [
      [214, 124, 1, 8, 'puffB'],
      [270, 122, -1, 7, 'coat'],
      [20, 124, 1, 7, 'puffR'],
      [150, 123, -1, 8, 'dark'],
      [300, 124, -1, 9, 'puffG', true],
      [240, 122, 1, 6, 'puffR', true],
    ])
      w.peds.push({ x, y, dir, speed, style, phase: r() * 3, nightOnly });
    w.babcia = { x: 120, y: 124, dir: -1, speed: 4.2 };
    w.doggy = { x: 40, y: 125, dir: 1, speed: 6 };

    w.pigeons = [];
    for (let i = 0; i < 8; i++) {
      const hx = 66 + i * 6 + r() * 3;
      w.pigeons.push({ hx, hy: 120 + Math.floor(r() * 5), x: hx, y: 0, fly: 0, vx: 0, vy: 0, p: r() * 6, wait: r() * 3, face: r() < 0.5 });
    }
    w.tram = { x: 380, base: 134, dir: -1, v: 62, wait: 1.5, state: 'run', door: 0, t: 0, stopX: 112, line: '25', seed: 3 };
    w.tram2 = { x: -110, base: 140, dir: 1, v: 62, wait: 14, state: 'pass', door: 0, t: 0, line: '4', seed: 9 };
    w.waiters = [
      { x: 124, y: 122, m: 'puffG', on: true },
      { x: 131, y: 123, m: 'coat', on: true },
    ];
    w.alight = [];
    w.steam = Array.from({ length: 9 }, (_, i) => ({ p: i / 9, s: r() * 6, x: r() }));
    w.dust = [];
    w.rugT = 0;
    w.mug = 0;
  };

  // ---- Per frame
  const skyObjects = (w, h, dt) => {
    let sx = -999;
    let sy = 0;
    let low = 0;
    if (h <= 18.3) {
      const t = clamp((h - 12) / 7);
      sx = mix(136, 44, t);
      sy = mix(11, 46, Math.pow(t, 2.4));
      low = smooth(14.8, 16.6, h);
    } else if (h >= 29.2) {
      const t = clamp((h - 29.2) / 6.8);
      sx = mix(318, 136, Math.pow(t, 0.7));
      sy = mix(70, 11, Math.sqrt(t));
      low = 1 - smooth(30.2, 31.6, h);
    }
    if (sx > -999) w.sun(sx, sy, low > 0.3 ? 6 : 5, low);
    for (const c of w.clouds) {
      c.x += c.v * dt;
      if (c.x > 370) c.x = -80;
      const cx = Math.round(c.x);
      for (let j = 0; j < 4; j++) {
        const inset = [10, 3, 0, 7][j] + ((c.w + j * 5) % 4);
        for (let i = inset; i < c.w - inset / 2; i++) {
          if ((i < inset + 3 || i > c.w - inset / 2 - 4) && bayer(cx + i, c.y + j) > 7) continue;
          w.pxSky(cx + i, c.y + j, j > 2 ? M.CLOUD_SH : M.CLOUD);
        }
      }
    }
    w.drawBeacons();
  };

  const floodPalace = (w, hour) => {
    if (w.levels[w.floodG] <= 0.01) return;
    const { flood, floodL, floodB, floodD, fneon, fgroup } = w;
    const cyc = w.t / 16;
    const a = Math.floor(cyc) % 3;
    const b = (a + 1) % 3;
    const f = clamp(((cyc % 1) - 0.78) / 0.22);
    const S = [
      ['FI', 'FI'],
      ['FR', 'FW'],
      ['FA', 'FA'],
    ];
    const lookup = (s, band, l) => N[`${S[s][band]}${l}`];
    if (!w.floodLUT) {
      w.floodLUT = new Uint8Array(3 * 2 * 4);
      for (let s = 0; s < 3; s++) for (let bd = 0; bd < 2; bd++) for (let l = 0; l < 4; l++) w.floodLUT[s * 8 + bd * 4 + l] = lookup(s, bd, l);
    }
    const lut = w.floodLUT;
    const g = w.floodG;
    const th = f * 16;
    for (let k = 0; k < flood.length; k++) {
      const i = flood[k];
      const s = floodD[k] < th ? b : a;
      fneon[i] = lut[s * 8 + floodB[k] * 4 + floodL[k]];
      fgroup[i] = g;
    }
  };

  const drawClock = (w, hour) => {
    const [cx, cy] = w.clock;
    const h = hour % 12;
    const m = hour % 1;
    const hand = (ang, len, mat) => {
      for (let d = 0; d <= len; d += 0.5) {
        w.px(Math.round(cx + Math.sin(ang) * d), Math.round(cy - Math.cos(ang) * d), mat);
      }
    };
    hand(m * Math.PI * 2, 6, M.PAINT_K);
    hand((h / 12) * Math.PI * 2, 4, M.BOARD_R);
  };

  // The signature: cover drifts toward the hour's target so it visibly builds after the lens lands
  const drawSnowCover = (w, dt, hour) => {
    const want = coverAt(hour);
    if (dt === 0) w.cover = want;
    else if (want > w.cover) w.cover = Math.min(want, w.cover + dt * 0.42);
    else w.cover = Math.max(want, w.cover - dt * 0.8);

    const pl = w.plough;
    if (hour >= 18 && hour < 28) pl.done = false;
    if (dt === 0) {
      pl.active = false;
      if (hour >= 29.4 || hour < 18) pl.done = true;
    } else if (!pl.active && !pl.done && hour >= 29.4 && hour < 36.1) {
      pl.active = true;
      pl.x = -70;
      pl.level = Math.max(w.cover, 0.8);
    }

    const cov = w.cover;
    const ploughing = pl.active;
    if (cov <= 0.002 && !ploughing) return;
    const v = cov * 255;
    const { snowI, snowT, snowM, fmat, fneon, fgroup, sth, wear, tintN, tintG, tintLim, tintW } = w;
    for (let k = 0; k < snowI.length; k++) {
      if (v > snowT[k]) {
        const i = snowI[k];
        fmat[i] = snowM[k];
        fneon[i] = 0;
        fgroup[i] = 0;
      }
    }
    w.wearAcc += dt * 30;
    const fade = Math.floor(w.wearAcc);
    w.wearAcc -= fade;
    const rows = w.streetRows;
    const y0 = (118 + PAD_Y) * BW;
    const roadRow = 127 - 118;
    const edge = pl.x + PAD_X + 30;
    const roadLevel = ploughing ? pl.level * 255 : hour >= 29.4 ? 0 : v;
    for (let j = 0; j < rows; j++) {
      const road = j >= roadRow;
      const base = j * BW;
      const lim = tintLim[j];
      const by = j + 118 + PAD_Y;
      const mat = road ? M.SNOW_RD : M.SNOW_W;
      for (let bx = 0; bx < BW; bx++) {
        const k = base + bx;
        let we = wear[k];
        if (we) {
          we = we > fade ? we - fade : 0;
          wear[k] = we;
        }
        const th = sth[k];
        if (th === 255) continue;
        let lvl = v;
        if (road) lvl = ploughing && bx < edge ? 0 : roadLevel;
        if (lvl - we * 0.9 <= th) continue;
        const i = y0 + k;
        fmat[i] = mat;
        fneon[i] = 0;
        fgroup[i] = 0;
        const tg = tintG[bx];
        if (tg && BAYER[((by & 3) << 2) | (bx & 3)] >= lim + tintW[bx]) {
          fneon[i] = tintN[bx];
          fgroup[i] = tg;
        }
      }
    }
  };

  const scuff = (w, x, y, v = 255) => {
    const j = y - 118;
    if (j < 0 || j >= w.streetRows) return;
    const bx = x + PAD_X;
    if (bx < 0 || bx >= BW) return;
    w.wear[j * BW + bx] = v;
  };

  const drawLeaves = (w, dt, hurry) => {
    const lim = (1 - clamp(w.cover * 1.3)) * 255;
    if (lim <= 0) return;
    const { leafI, leafT, leafK, leafM, fmat } = w;
    for (let k = 0; k < leafI.length; k++) {
      if (leafT[k] < lim) {
        const i = leafI[k];
        fmat[i] = leafM[leafK[k]];
        w.fneon[i] = 0;
        w.fgroup[i] = 0;
      }
    }
    if (w.cover > 0.2) return;
    for (const f of w.falling) {
      f.y += f.v * dt;
      f.x += (Math.sin(f.p + w.t * 1.4) * 5 - 1 - hurry * 30) * dt;
      if (f.y > 125) {
        f.y = 50 + Math.random() * 40;
        f.x = -20 + (Math.random() < 0.5 ? 26 : 130 * Math.random());
      }
      w.px(Math.round(f.x), Math.round(f.y), f.p > 3 ? M.BOARD_O : M.BOARD_Y);
    }
  };

  // Residents of the blok
  const drawBlokLife = (w, dt, hour) => {
    const t = w.t;
    const day = hour < 17 || hour > 31;
    const dusk = w.dark > 0.5;
    // Duvet over the third-floor rail, patted and shaken
    const bx = 40;
    const by = 71;
    if (day) {
      const sway = Math.sin(t * 1.4) > 0.3 ? 1 : 0;
      for (let j = 0; j < 7; j++) {
        for (let i = 0; i < 10; i++) {
          const check = (i + j) % 4 === 0;
          w.px(bx + 1 + i + (j > 3 ? sway : 0), by + 6 + j, check ? M.DUVET_B : M.DUVET);
        }
      }
      const pat = Math.sin(t * 3.4) > 0.5;
      w.rect(bx + 4, by + 1, 3, 2, M.HAIR);
      w.rect(bx + 4, by + 3, 3, 1, M.SKIN);
      w.rect(bx + 3, by + 4, 5, 2, M.SKIRT);
      w.px(bx + 2, pat ? by + 4 : by + 5, M.SKIN);
      w.px(bx + 8, pat ? by + 5 : by + 4, M.SKIN);
    } else if (dusk && hour < 27) {
      // Same flat at night: a lit kitchen and somebody at the sink
      w.rect(bx + 2, by + 1, 4, 6, M.GLASS_DK);
      w.lightRect(bx + 2, by + 1, 4, 6, N.WARM, 2);
    }
    // Kitchen, two doors over, with someone shuffling between stove and table
    const kx = 54;
    const ky = 62;
    if (dusk && hour < 27.5) {
      for (let j = 0; j < 6; j++) for (let i = 0; i < 5; i++) w.pxLight(kx + i, ky + j, N.WARM, 2);
      w.rect(kx + 2, ky, 1, 6, M.PVC);
      const p = Math.round(1.5 + Math.sin(t * 0.55) * 1.5);
      w.rect(kx + p, ky + 2, 2, 1, M.HAIR);
      w.rect(kx + p, ky + 3, 2, 3, M.HAIR);
    }
    // Television, flickering blue behind the net curtain
    const tx = 74;
    const ty = 84;
    if (dusk && hour < 26) {
      const f = Math.floor(t * 5) % 7;
      for (let j = 0; j < 6; j++) {
        for (let i = 0; i < 5; i++) {
          if (i === 2) continue;
          if ((i + j + f) % 5 < 4 - (f === 3 ? 2 : 0)) w.pxLight(tx + i, ty + j, N.TV, 2);
        }
      }
    }
    // Flag on a bracket, as on any block around the eleventh
    const fx = 86;
    const fy = 76;
    w.rect(fx, fy, 1, 8, M.STEEL_DK);
    const wv = Math.floor(t * 3) % 3;
    for (let i = 1; i <= 7; i++) {
      const d = i > 4 && (i + wv) % 3 === 0 ? 1 : 0;
      w.px(fx + i, fy + d, M.PVC);
      w.px(fx + i, fy + 1 + d, M.PVC);
      w.px(fx + i, fy + 2 + d, M.FLAG_R);
      w.px(fx + i, fy + 3 + d, M.FLAG_R);
    }
    // Cat on a sill by day
    if (!dusk) {
      w.sprite(['K..K.', 'KKKK.', 'KKKK.', 'KKKK#'], { K: M.CAT_K, '#': M.CAT_K }, 62, 86);
      if (Math.sin(t * 1.8) > 0) w.px(67, 88, M.CAT_K);
    }

    // Carpet beating on the trzepak, the sound of every Saturday morning
    const rugOut = hour < 16.5 || hour > 31.2;
    if (rugOut) {
      for (let j = 0; j < 12; j++) {
        for (let i = 0; i < 12; i++) {
          let m = M.RUG;
          if (i === 0 || i === 11 || j === 11) m = M.RUG_B;
          else if ((i + j) % 4 === 0) m = M.RUG_B;
          w.px(40 + i, 104 + j, m);
        }
      }
      w.rect(40, 103, 12, 1, M.RUG_B);
      w.rugT += dt;
      const swing = Math.sin(w.rugT * 5.2);
      const hit = swing > 0.92;
      const px = 31;
      const py = 120;
      w.rect(px, py - 1, 1, 2, M.SUIT);
      w.rect(px + 2, py - 1, 1, 2, M.SUIT);
      w.rect(px, py - 7, 3, 6, M.PUFF_B);
      w.rect(px, py - 10, 3, 3, M.SKIN);
      w.rect(px, py - 10, 3, 1, M.HAIR);
      const armY = py - 7 - Math.round(swing * 2);
      w.px(px + 3, py - 5, M.PUFF_B);
      w.px(px + 4, armY + 1, M.SKIN);
      w.px(px + 5, armY, M.BENCH);
      w.px(px + 6, armY - 1, M.BENCH);
      w.rect(px + 7, armY - 2, 2, 2, M.BENCH);
      if (hit && (!w.dust.length || w.dust[w.dust.length - 1].a < 0.6)) {
        for (let i = 0; i < 6; i++) w.dust.push({ x: 41 + Math.random() * 6, y: 106 + Math.random() * 7, vx: 4 + Math.random() * 8, vy: -2 - Math.random() * 5, a: 1 });
      }
    }
    for (let i = w.dust.length - 1; i >= 0; i--) {
      const d = w.dust[i];
      d.a -= dt * 1.1;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.a <= 0) {
        w.dust.splice(i, 1);
        continue;
      }
      if (d.a * 16 > bayer(Math.round(d.x), Math.round(d.y))) w.px(Math.round(d.x), Math.round(d.y), M.DUST);
    }
  };

  // Grey pigeons instead of crows, working the pavement around the bench
  const drawPigeons = (w, dt, hour) => {
    const out = hour < 17.4 || hour > 30.2;
    for (const p of w.pigeons) {
      if (p.fly > 0) {
        p.fly -= dt;
        p.x += p.vx * dt;
        p.yy += p.vy * dt;
        p.vy += 7 * dt;
        const flap = Math.sin(w.t * 26 + p.p) > 0;
        const x = Math.round(p.x);
        const y = Math.round(p.yy);
        w.px(x, y, M.PIGEON);
        w.px(x + 1, y, M.PIGEON);
        w.px(x - 1, y + (flap ? -1 : 1), M.PIGEON_DK);
        w.px(x + 2, y + (flap ? -1 : 1), M.PIGEON_DK);
        w.px(x + (p.vx > 0 ? 2 : -1), y, M.PIGEON_NK);
        if (p.fly <= 0) {
          p.x = p.hx;
          p.wait = 0.5 + Math.random() * 3;
        }
        continue;
      }
      if (!out) continue;
      p.wait -= dt;
      if (p.wait < 0) {
        p.wait = 0.5 + Math.random() * 2.5;
        p.face = Math.random() < 0.5;
        p.x = clamp(p.x + (Math.random() - 0.5) * 5, p.hx - 3, p.hx + 3);
      }
      const x = Math.round(p.x);
      const y = p.hy;
      const peck = Math.sin(w.t * 5 + p.p) > 0.55 ? 1 : 0;
      w.sprite(peck ? ['.....', 'TBBB.', '.BBNH', '..F..'] : ['...H.', '.BBN.', 'TBBB.', '..F..'], { H: M.PIGEON_DK, B: M.PIGEON, N: M.PIGEON_NK, T: M.PIGEON_DK, F: M.BOARD_O }, x - 2, y - 2, !p.face);
    }
  };

  const figure = (w, x, y, flip, step, top, leg, hair) => {
    w.px(x, y + 1, M.WALK_D);
    w.px(x + 2, y + 1, M.WALK_D);
    if (step) {
      w.rect(x, y - 1, 1, 2, leg);
      w.rect(x + 2, y - 1, 1, 2, leg);
    } else w.rect(x + 1, y - 1, 1, 2, leg);
    w.rect(x, y - 2, 3, 1, leg);
    w.rect(x, y - 6, 3, 4, top);
    w.rect(x, y - 9, 3, 3, M.SKIN);
    w.rect(x, y - 9, 3, 1, hair);
    w.px(flip ? x + 2 : x, y - 8, hair);
  };

  const drawLocals = (w, dt, hour) => {
    // Babcia and her tartan trolley, in daylight, in no hurry
    const b = w.babcia;
    b.x += b.dir * b.speed * dt;
    if (b.x < -30) b.x = 360;
    if (hour < 17.6 || hour > 30.6) {
      const x = Math.round(b.x);
      const y = b.y;
      const step = Math.floor(b.x * 0.4) % 2 !== 0;
      w.px(x, y + 1, M.WALK_D);
      w.px(x + 2, y + 1, M.WALK_D);
      if (step) {
        w.px(x, y, M.PAINT_K);
        w.px(x + 2, y, M.PAINT_K);
      } else w.px(x + 1, y, M.PAINT_K);
      w.rect(x, y - 5, 3, 5, M.BABCIA);
      w.px(x - 1, y - 1, M.BABCIA);
      w.px(x + 3, y - 1, M.BABCIA);
      w.rect(x, y - 8, 3, 3, M.SKIN);
      w.rect(x - 1, y - 9, 5, 2, M.BERET);
      w.px(x + 1, y - 7, M.SKIN);
      // Trolley trails behind her
      const tx = b.dir > 0 ? x - 7 : x + 4;
      for (let j = 0; j < 6; j++) {
        for (let i = 0; i < 4; i++) {
          let m = (i + j) % 2 ? M.TARTAN_R : M.TARTAN_G;
          if (i === 1 && j % 2 === 0) m = M.CREAM;
          w.px(tx + i, y - 6 + j, m);
        }
      }
      w.rect(tx + 1, y, 2, 1, M.TIRE);
      w.px(b.dir > 0 ? tx + 4 : tx - 1, y - 5, M.STEEL_DK);
      w.px(b.dir > 0 ? tx + 5 : tx - 2, y - 4, M.STEEL_DK);
      if (w.cover > 0.1) scuff(w, x + 1, y + 1, 200);
    }
    // A long dog and their long-suffering human, at any hour
    const d = w.doggy;
    d.x += d.dir * d.speed * dt;
    if (d.x > 370) d.x = -30;
    {
      const x = Math.round(d.x);
      const y = d.y;
      const step = Math.floor(d.x * 0.5) % 2 !== 0;
      figure(w, x, y, false, step, M.PUFF_G, M.SUIT, M.HAIR);
      const nx = x + 9;
      const coat = w.cover > 0.2;
      w.rect(nx - 1, y - 1, 8, 2, coat ? M.PUFF_R : M.DOG);
      w.rect(nx + 6, y - 2, 2, 2, M.DOG);
      w.px(nx + 8, y - 1, M.DOG_DK);
      w.px(nx + 6, y - 3, M.DOG_DK);
      w.px(nx - 2, y - 2, M.DOG);
      const lg = Math.floor(w.t * 8) % 2;
      w.px(nx + lg, y + 1, M.DOG_DK);
      w.px(nx + 5 + lg, y + 1, M.DOG_DK);
      for (let i = 3; i < 8; i++) w.px(x + i, y - 5 + Math.round((i - 3) * 0.7), M.INK);
      if (d.yap > 0) {
        d.yap -= dt;
        w.rect(nx + 7, y - 7, 1, 2, M.BOARD_R);
        w.px(nx + 7, y - 4, M.BOARD_R);
      }
      if (w.cover > 0.1) {
        scuff(w, x + (step ? 0 : 2), y + 1);
        scuff(w, nx + 3, y + 1, 160);
      }
    }
    for (const p of w.peds) {
      if (w.cover > 0.1 && Math.floor(p.x) % 3 === 0) scuff(w, Math.round(p.x) + 1, p.y + 1);
    }
    // Waiting at the stop
    for (const q of w.waiters) {
      if (!q.on) continue;
      const st = w.personStyles[q.m];
      figure(w, q.x, q.y, false, false, st[0], st[1], st[2]);
    }
    // Just off the tram and walking away
    for (let i = w.alight.length - 1; i >= 0; i--) {
      const a = w.alight[i];
      a.x += a.dir * 8 * dt;
      if (Math.abs(a.x - a.from) > 170) {
        w.alight.splice(i, 1);
        continue;
      }
      const st = w.personStyles[a.m];
      figure(w, Math.round(a.x), a.y, a.dir < 0, Math.floor(a.x * 0.5) % 2 !== 0, st[0], st[1], st[2]);
      if (w.cover > 0.1 && Math.floor(a.x) % 3 === 0) scuff(w, Math.round(a.x) + 1, a.y + 1);
    }
  };

  const drawStreetLife = (w, dt, hour) => {
    const t = w.t;
    // Kiosk owner behind the papers
    const [kx, ky] = w.kioskAt;
    if (hour < 28.9 && hour >= 6) {
      const lean = Math.sin(t * 0.45) > 0.65 ? 1 : 0;
      w.rect(kx + lean, ky + 1, 3, 1, M.HAIR);
      w.rect(kx + lean, ky + 2, 3, 2, M.SKIN);
      w.rect(kx - 1 + lean, ky + 4, 5, 3, M.PUFF_B);
    }
    // Old fellow on the bench with the paper, by day
    if (hour < 16.6 || hour > 31) {
      const x = 95;
      w.rect(x, 104, 3, 3, M.SKIN);
      w.rect(x - 1, 104, 5, 1, M.BABCIA);
      w.rect(x, 107, 3, 5, M.COAT);
      w.rect(x + 3, 111, 3, 1, M.SUIT);
      w.rect(x + 5, 112, 1, 5, M.SUIT);
      const flip = Math.floor(t / 7) % 2 ? 1 : 0;
      w.rect(x + 2, 106 + flip, 6, 4, M.BOARD_W);
      w.rect(x + 3, 107 + flip, 4, 1, M.CONC_DK);
      w.rect(x + 3, 108 + flip, 3, 1, M.CONC_DK);
    }
    // Zapiekanki man, grill glow and steam
    const [sx, sy] = w.stallAt;
    const open = hour < 27.2;
    if (open) {
      const mx = sx + 6 + Math.round(Math.sin(t * 0.8) * 2);
      w.rect(mx, sy, 3, 2, M.BOARD_W);
      w.rect(mx, sy + 2, 3, 2, M.SKIN);
      w.rect(mx - 1, sy + 4, 5, 2, M.BOARD_W);
      if (w.dark > 0.35) for (let i = 0; i < 8; i++) if ((i + Math.floor(t * 6)) % 3) w.pxLight(sx + 14 + i, sy + 5, N.GRILL, 2);
      for (const s of w.steam) {
        s.p += dt * 0.33;
        if (s.p > 1) {
          s.p -= 1;
          s.x = Math.random();
        }
        const yy = Math.round(sy - 1 - s.p * 22);
        const xx = Math.round(sx + 16 + s.x * 8 + Math.sin(s.p * 5 + s.s) * 2.5 + s.p * 4);
        if (s.p * 16 < 16 - bayer(xx, yy)) w.px(xx, yy, M.SMOKE);
      }
    }
    // Neon that moves: ball, flower, pharmacy cross, cinema bulbs
    if (w.levels[w.ballG] > 0.3) {
      const f = w.ballFrames[Math.floor(t * 4.6) % w.ballFrames.length];
      for (const [x, y] of f) w.pxLight(x, y, N.TBALL);
    }
    if (w.levels[w.flowerG] > 0.3) {
      const cyc = t % 4.2;
      const n = N.TROSE;
      const stage = cyc < 0.6 ? 0 : cyc < 1.2 ? 1 : 2;
      for (const [x, y] of w.flowerFrames[stage]) w.pxLight(x, y, n);
      if (stage < 2) for (const [x, y] of w.flowerFrames[0]) w.pxLight(x, y, n);
      for (const [x, y] of w.flowerCore) w.pxLight(x, y, N.TBALL);
    }
    if (w.levels[w.crossG] > 0.3 || w.dark < 0.1) {
      const [cx, cy] = w.crossAt;
      const on = Math.floor(t * 1.5) % 4 !== 3 && w.levels[w.crossG] > 0.3;
      for (let i = -2; i <= 2; i++) {
        for (const [a, b] of [
          [i, 0],
          [0, i],
          [i, 1],
          [1, i],
        ]) {
          w.px(cx + a, cy + b, M.BOARD_G);
          if (on) w.pxLight(cx + a, cy + b, N.TGREEN);
        }
      }
    }
    if (w.levels[w.kinoG] > 0.3) {
      const chase = Math.floor(t * 8);
      w.bulbs.forEach(([x, y], i) => {
        if ((i + chase) % 4 < 2) w.pxLight(x, y, N.TAMBER);
      });
    }
    // Signals: vertical, red over amber over green
    const s = w.signalState();
    for (const [x, y] of w.signalHeads) {
      const state = [
        [N.SIG_RED, s === 'stop', M.LAMP_OFF],
        [N.SIG_YELLOW, s === 'slow', M.LAMP_OFF],
        [N.TGREEN, s === 'go', M.LAMP_OFF],
      ];
      state.forEach(([n, on], i) => {
        w.rect(x, y + i * 3 + 1, 2, 2, M.LAMP_OFF);
        if (on) w.lightRect(x, y + i * 3 + 1, 2, 2, n, 1);
      });
    }
    // Tram-only signal: a white bar, upright to go, flat to stop
    const [ax, ay] = w.tramSignalAt;
    if (s === 'go') w.lightRect(ax + 1, ay, 1, 3, N.ICE, 1);
    else w.lightRect(ax, ay + 1, 3, 1, N.ICE, 1);
  };

  // ---- The tram: Warsaw red below, yellow band above and at both ends
  const paintTramCar = (w, cx, base, carW, c, tr, front, rear) => {
    const lit = w.dark > 0.3;
    const top = base - 16;
    const doorAt = [9, carW - 15];
    for (let i = 0; i < carW; i++) {
      const x = cx + i;
      const end = i < 4 || i >= carW - 4;
      const inDoor = doorAt.some((d) => i >= d && i < d + 6);
      for (let r = 0; r < 16; r++) {
        const y = top + r;
        if (end && r === 0 && (i === 0 || i === carW - 1)) continue;
        let m = M.TR_R;
        let n = 0;
        let g = 0;
        if (r === 0) m = M.TR_ROOF;
        else if (r < 3) m = M.TR_Y;
        else if (r < 9) {
          m = M.TR_Y;
          const bay = (i - 4) % 7;
          if (!end && bay > 0 && bay < 6 && i > 3 && i < carW - 4) {
            m = M.TR_GL;
            if (lit) {
              n = N.TRAM_FL;
              g = 2;
              const slot = i % 5;
              const seat = ((Math.floor(i / 5) + c * 5 + tr.seed) * 2654435761) >>> 28;
              if (seat < 8 && ((r > 4 && r < 7 && (slot === 1 || slot === 2)) || (r >= 7 && slot < 4))) {
                m = M.INK;
                n = 0;
                g = 0;
              }
            }
          }
        } else if (r === 9) m = M.TR_Y;
        else if (r < 14) m = M.TR_R;
        else if (r === 14) m = M.TR_RD;
        else m = M.TR_DK;
        if (end && r < 14) m = r === 0 ? M.TR_ROOF : M.TR_Y;
        if (i === 0 || i === carW - 1) if (r < 14 && r > 0) m = M.TR_YD;
        w.px(x, y, m);
        if (g) w.light(x, y, n, g);
      }
    }
    // Doors
    for (const d of doorAt) {
      const slide = Math.round(tr.door * 2);
      for (let r = 3; r < 15; r++) {
        const y = top + r;
        for (let i = 0; i < 6; i++) {
          const x = cx + d + i;
          const leaf = i < 3 ? i >= slide : i < 6 - slide;
          const hole = !leaf;
          if (hole) {
            w.px(x, y, M.TR_GL);
            if (lit) w.light(x, y, N.TRAM_FL, 2);
            else w.px(x, y, M.ROOM);
          } else {
            w.px(x, y, r < 9 && i !== 0 && i !== 5 && i !== 2 && i !== 3 ? M.TR_GL : M.TR_YD);
            if (lit && r < 9 && i !== 0 && i !== 5 && i !== 2 && i !== 3) w.light(x, y, N.TRAM_FL, 2);
          }
        }
      }
    }
    // Bogies and wheels
    for (const b of [7, carW - 14]) {
      w.rect(cx + b, base - 2, 7, 1, M.TR_DK);
      w.rect(cx + b + 1, base - 1, 2, 2, M.TIRE);
      w.rect(cx + b + 4, base - 1, 2, 2, M.TIRE);
    }
    // Roof gets a thin white crust
    if (w.cover > 0.35) {
      for (let i = 2; i < carW - 2; i++) if ((i * 7 + c * 3) % 5 < 4) w.px(cx + i, top - 1, M.SNOW);
    }
    // Cab ends
    if (front) {
      const fx = tr.dir < 0 ? cx : cx + carW - 3;
      w.rect(fx, top + 3, 3, 5, M.TR_GL);
      if (lit) {
        w.pxLight(tr.dir < 0 ? cx : cx + carW - 1, base - 6, N.HEAD);
        w.pxLight(tr.dir < 0 ? cx : cx + carW - 1, base - 5, N.HEAD);
      }
      // Line number
      const nx = tr.dir < 0 ? cx + 5 : cx + carW - 9;
      w.rect(nx - 1, top + 2, tr.line.length * 4 + 1, 7, M.PAINT_K);
      let lx = nx;
      for (const ch of tr.line) {
        w.glyph(ch, lx, top + 3, (px, py) => {
          w.px(px, py, M.BOARD_Y);
          if (lit) w.pxLight(px, py, N.LED);
        });
        lx += 4;
      }
    }
    if (rear && lit) {
      const rx = tr.dir < 0 ? cx + carW - 1 : cx;
      w.pxLight(rx, base - 6, N.TAIL);
      w.pxLight(rx, base - 5, N.TAIL);
    }
  };

  const drawTram = (w, tr, dt, hour, wireY) => {
    const carW = 42;
    const len = carW * 2 + 2;
    if (tr.wait > 0) {
      tr.wait -= dt;
      return;
    }
    const cruise = 66;
    if (tr.state === 'run') {
      const dist = tr.x - tr.stopX;
      tr.v = dist > 0 ? clamp(dist * 1.1, 7, cruise) : cruise;
      tr.x -= tr.v * dt;
      if (tr.x <= tr.stopX) {
        tr.x = tr.stopX;
        tr.state = 'open';
        tr.t = 0;
      }
    } else if (tr.state === 'open') {
      tr.t += dt;
      tr.door = clamp(tr.t * 2.2);
      // Behind the tram the stop swaps people, seen only once it pulls away
      if (tr.t > 1 && !tr.swapped) {
        tr.swapped = true;
        for (const q of w.waiters) q.on = false;
        w.alight.push({ x: 128, from: 128, y: 124, dir: -1, m: 'puffB' });
        w.alight.push({ x: 134, from: 134, y: 122, dir: 1, m: 'puffR' });
      }
      if (tr.t > 4.4) {
        tr.state = 'close';
        tr.t = 0;
      }
    } else if (tr.state === 'close') {
      tr.t += dt;
      tr.door = clamp(1 - tr.t * 2.2);
      if (tr.t > 0.8) {
        tr.state = 'leave';
        tr.v = 0;
      }
    } else if (tr.state === 'leave') {
      tr.v = Math.min(cruise, tr.v + dt * 26);
      tr.x -= tr.v * dt;
      if (tr.x + len < -50) {
        tr.state = 'run';
        tr.x = 372;
        tr.wait = 7 + w.rand() * 9;
        tr.swapped = false;
        tr.seed = Math.floor(w.rand() * 50);
        w.waitersBack = 2 + w.rand() * 4;
      }
    } else {
      // Passing the other way without stopping
      tr.x += tr.v * dt;
      if (tr.x > 372) {
        tr.x = -len - 40;
        tr.wait = 16 + w.rand() * 14;
        tr.seed = Math.floor(w.rand() * 50);
      }
    }
    if (w.waitersBack > 0) {
      w.waitersBack -= dt;
      if (w.waitersBack <= 0) for (const q of w.waiters) q.on = true;
    }
    const x = Math.round(tr.x);
    const base = tr.base;
    const b = base;
    const [first, second] = tr.dir < 0 ? [x, x + carW + 2] : [x + carW + 2, x];
    paintTramCar(w, first, b, carW, 0, tr, true, false);
    paintTramCar(w, second, b, carW, 1, tr, false, true);
    // Bellows
    const midX = x + carW;
    for (let r = 1; r < 14; r++) w.rect(midX, b - 16 + r, 2, 1, r % 2 ? M.INK : M.TR_DK);
    // Pantograph on the wire
    const px = first + 20;
    const roof = b - 17;
    for (let y = wireY + 1; y <= roof; y++) {
      const d = Math.min(y - wireY, roof - y + 1);
      w.px(px - d, y, M.STEEL_DK);
      w.px(px + d, y, M.STEEL_DK);
    }
    w.rect(px - 3, wireY + 1, 7, 1, M.STEEL_DK);
    if (w.dark > 0.3 && w.rand() < 0.03) {
      w.pxLight(px - 1, wireY, N.SPARK);
      w.pxLight(px + 1, wireY - 1, N.SPARK);
    }
    // Light from open doors falling on the snow; rails stay dark
    if (tr.door > 0.4 && w.dark > 0.3) {
      for (const dx of [9, 42 - 15, 44 + 9, 44 + 42 - 15]) {
        for (let j = 1; j < 5; j++) {
          for (let i = 0; i < 6; i++) if (bayer(x + dx + i, b + j) < 9 - j * 2) w.pxLight(x + dx + i, b + j, N.T_ICE, 1);
        }
      }
    }
    tr.beam = w.dark > 0.3 ? [tr.dir < 0 ? first - 1 : first + carW, b - 2, tr.dir] : null;
  };

  // Orange plough for one pass after dawn, blade down, beacon going, grit behind
  const drawPlough = (w, dt) => {
    const pl = w.plough;
    if (!pl.active) return;
    pl.x += 104 * dt;
    if (pl.x > 380) {
      pl.active = false;
      pl.done = true;
      return;
    }
    const x = Math.round(pl.x);
    const y = 149;
    w.rect(x, y - 11, 11, 1, M.PL_OD);
    w.rect(x, y - 10, 12, 7, M.PL_O);
    w.rect(x, y - 3, 12, 2, M.PL_OD);
    w.rect(x + 12, y - 12, 10, 1, M.PL_OD);
    w.rect(x + 12, y - 11, 10, 8, M.PL_O);
    w.rect(x + 15, y - 10, 6, 4, M.CAR_GLASS);
    w.rect(x + 12, y - 3, 11, 2, M.PL_OD);
    w.rect(x + 2, y - 8, 8, 1, M.PL_B);
    for (const wx of [3, 15]) {
      w.rect(x + wx, y - 2, 4, 3, M.TIRE);
      w.px(x + wx + 1, y - 1, M.CAR_SILV);
    }
    // Blade
    w.rect(x + 23, y - 5, 2, 6, M.PL_B);
    w.px(x + 25, y - 5, M.PL_B);
    w.px(x + 25, y, M.PL_B);
    w.rect(x + 22, y - 4, 1, 3, M.STEEL_DK);
    const flash = Math.sin(w.t * 11) > 0;
    w.px(x + 16, y - 13, M.BOARD_O);
    w.px(x + 17, y - 13, M.BOARD_O);
    if (flash) {
      w.pxLight(x + 16, y - 13, N.ORANGE);
      w.pxLight(x + 17, y - 13, N.ORANGE);
    }
    // Thrown snow off the blade and grit behind
    for (let i = 0; i < 12; i++) {
      const a = (w.t * 40 + i * 13) % 16;
      const sx = x + 26 + Math.round(a);
      const sy = y - 1 - Math.round(Math.sin((a / 16) * Math.PI) * 7) + (i % 3);
      w.px(sx, sy, M.SNOW);
    }
    for (let i = 0; i < 8; i++) {
      const gx = x - 2 - ((i * 5 + Math.floor(w.t * 30)) % 18);
      w.px(gx, y - 1 + (i % 3), M.PL_OD);
    }
  };

  // Each bad letter dies on its own schedule, then buzzes back
  const flickerLetters = (w) => {
    for (const [g, seed] of w.flicker) {
      const lv = w.levels[g];
      if (lv <= 0) continue;
      const slow = Math.sin(w.t * 0.61 + seed) + Math.sin(w.t * 0.23 + seed * 1.7);
      if (slow > 1.45) w.levels[g] = Math.sin(w.t * 43 + seed) > 0.1 ? lv * 0.12 : lv;
      else if (Math.sin(w.t * 29 + seed) * Math.sin(w.t * 3.1 + seed) > 0.8) w.levels[g] = lv * 0.3;
    }
  };

  const draw = (w, dt, hour, hurry) => {
    flickerLetters(w);
    skyObjects(w, hour, dt);
    floodPalace(w, hour);
    drawClock(w, hour);
    drawSnowCover(w, dt, hour);
    drawLeaves(w, dt, hurry);
    drawBlokLife(w, dt, hour);
    drawStreetLife(w, dt, hour);
    drawPigeons(w, dt, hour);
    w.drawPeople(dt, hour);
    drawLocals(w, dt, hour);
    drawTram(w, w.tram, dt, hour, 112);
    drawTram(w, w.tram2, dt, hour, 116);
    w.drawTraffic(dt);
    if (w.tram.beam && w.beams) w.beams.push(w.tram.beam);
    if (w.tram2.beam && w.beams) w.beams.push(w.tram2.beam);
    // Wheels bite through to the dark road, then it slowly fills back in
    if (w.cover > 0.05) {
      for (const car of w.cars) {
        const y = w.lanes[car.lane];
        const a = Math.round(car.x) + 2;
        const b = Math.round(car.x) + car.len - 2;
        for (let x = a; x < b; x++) {
          if (bayer(x, y) < 11) scuff(w, x, y, 210);
          if (bayer(x, y - 4) < 7) scuff(w, x, y - 4, 170);
        }
      }
    }
    drawPlough(w, dt);
  };

  const post = (w, dt) => {
    w.drawBeams();
    w.drawSnow(dt);
  };

  const startle = (w) => {
    for (const p of w.pigeons) {
      if (p.fly > 0) continue;
      p.fly = 5 + Math.random() * 3;
      p.yy = p.hy - 2;
      p.vx = (Math.random() < 0.7 ? 1 : -1) * (24 + Math.random() * 30);
      p.vy = -26 - Math.random() * 18;
    }
    w.doggy.yap = 1.2;
  };

  CitySwitch.define('warsaw-switch', {
    city: 'Warsaw',
    label: 'Warsaw day and night',
    tube: ['#ff2a2a', '#dff2ff'],
    body: ['#e8e9e6', '#0c121a'],
    glass: 'frost',
    grade: GRADES,
    keys: [
      [12, NOON],
      [14.8, NOON],
      [16.6, GOLD],
      [17.9, DUSK],
      [18.8, NIGHT],
      [28.8, NIGHT],
      [29.8, DAWN],
      [31.2, NOON],
      [36, NOON],
    ],
    dark: (h) => smooth(17.3, 18.9, h) * (1 - smooth(28.7, 30.2, h)),
    sky: [
      ['#8fbcdc', '#a4cbe3', '#bcd9ea', '#d3e6ef', '#e9f1f2'],
      ['#8ca4c4', '#b2b1c0', '#dcb9a8', '#f2c48f', '#fbd8a0'],
      ['#33486b', '#56607f', '#8d7a8e', '#c08f96', '#e0a89a'],
      ['#060f1e', '#08172a', '#0b2235', '#113244', '#1e4858'],
      ['#27405f', '#5a7594', '#a7a7b3', '#e3b6a5', '#f7d3ae'],
    ],
    weather: (h) => {
      const fall = smooth(19.3, 20.1, h) * (1 - smooth(28.6, 29.2, h));
      const pane = smooth(19, 21, h) * (1 - smooth(29, 30.5, h));
      return { rain: 0, snow: fall * 0.92, wet: 0, glass: pane * 0.42 };
    },
    glyphs,
    palette,
    street: (m) => [m.SNOW_RD, m.SNOW_W, m.SETT, m.RAIL],
    build,
    draw,
    post,
    startle,
  });
})();
