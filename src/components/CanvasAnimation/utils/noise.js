/**
 * SimplexNoise - 2D/3D/4D Simplex Noise 实现
 * 替代 p5.js 的 noise() 函数，支持 CSP 兼容
 * 基于 Ken Perlin 的 Simplex Noise 算法
 */

class SimplexNoise {
  constructor(seed = Math.random()) {
    this.seed = seed;
    this.p = new Array(512);
    this.perm = new Array(512);
    this.permMod12 = new Array(512);
    
    // Gradients for 2D, 3D and 4D noise
    this.grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];

    this.grad4 = [
      [0, 1, 1, 1], [0, 1, 1, -1], [0, 1, -1, 1], [0, 1, -1, -1],
      [0, -1, 1, 1], [0, -1, 1, -1], [0, -1, -1, 1], [0, -1, -1, -1],
      [1, 0, 1, 1], [1, 0, 1, -1], [1, 0, -1, 1], [1, 0, -1, -1],
      [-1, 0, 1, 1], [-1, 0, 1, -1], [-1, 0, -1, 1], [-1, 0, -1, -1],
      [1, 1, 0, 1], [1, 1, 0, -1], [1, -1, 0, 1], [1, -1, 0, -1],
      [-1, 1, 0, 1], [-1, 1, 0, -1], [-1, -1, 0, 1], [-1, -1, 0, -1],
      [1, 1, 1, 0], [1, 1, -1, 0], [1, -1, 1, 0], [1, -1, -1, 0],
      [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0]
    ];

    this.initializePermutationTable();
  }

  /**
   * 初始化排列表
   */
  initializePermutationTable() {
    // 使用种子生成可重复的随机序列
    const random = this.seededRandom(this.seed);
    
    // 初始化基础排列
    const p = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // 使用 Fisher-Yates 洗牌算法
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }

    // 复制到排列表
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  /**
   * 基于种子的随机数生成器
   */
  seededRandom(seed) {
    let s = seed;
    return function() {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  /**
   * 快速取整函数
   */
  fastFloor(x) {
    const xi = Math.floor(x);
    return x < xi ? xi - 1 : xi;
  }

  /**
   * 点积函数
   */
  dot2(g, x, y) {
    return g[0] * x + g[1] * y;
  }

  dot3(g, x, y, z) {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  dot4(g, x, y, z, w) {
    return g[0] * x + g[1] * y + g[2] * z + g[3] * w;
  }

  /**
   * 2D Simplex Noise
   */
  noise2D(xin, yin) {
    let n0, n1, n2; // Noise contributions from the three corners

    // Skew the input space to determine which simplex cell we're in
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const s = (xin + yin) * F2;
    const i = this.fastFloor(xin + s);
    const j = this.fastFloor(yin + s);

    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    // For the 2D case, the simplex shape is an equilateral triangle.
    let i1, j1;
    if (x0 > y0) {
      i1 = 1; j1 = 0;
    } else {
      i1 = 0; j1 = 1;
    }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    // Work out the hashed gradient indices of the three simplex corners
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.permMod12[ii + this.perm[jj]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];

    // Calculate the contribution from the three corners
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
      n0 = 0.0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot2(this.grad3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
      n1 = 0.0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot2(this.grad3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
      n2 = 0.0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot2(this.grad3[gi2], x2, y2);
    }

    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70.0 * (n0 + n1 + n2);
  }

  /**
   * 3D Simplex Noise
   */
  noise3D(xin, yin, zin) {
    let n0, n1, n2, n3;

    const F3 = 1.0 / 3.0;
    const s = (xin + yin + zin) * F3;
    const i = this.fastFloor(xin + s);
    const j = this.fastFloor(yin + s);
    const k = this.fastFloor(zin + s);

    const G3 = 1.0 / 6.0;
    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;

    let i1, j1, k1;
    let i2, j2, k2;

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
      } else {
        i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
      } else if (x0 < z0) {
        i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
      } else {
        i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
    const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
    const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot3(this.grad3[gi0], x0, y0, z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot3(this.grad3[gi1], x1, y1, z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot3(this.grad3[gi2], x2, y2, z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0.0;
    else {
      t3 *= t3;
      n3 = t3 * t3 * this.dot3(this.grad3[gi3], x3, y3, z3);
    }

    return 32.0 * (n0 + n1 + n2 + n3);
  }
}

/**
 * NoiseGenerator - 高级噪声生成器
 * 提供多种噪声类型和配置选项
 */
export class NoiseGenerator {
  constructor(seed = Math.random()) {
    this.simplex = new SimplexNoise(seed);
    this.octaves = 1;
    this.falloff = 0.5;
    this.scale = 1;
  }

  /**
   * 设置噪声细节
   * @param {number} octaves - 倍频数
   * @param {number} falloff - 衰减系数
   */
  noiseDetail(octaves = 1, falloff = 0.5) {
    this.octaves = octaves;
    this.falloff = falloff;
  }

  /**
   * 2D 噪声（兼容p5.js noise函数）
   */
  noise(x, y = 0, z = 0) {
    if (arguments.length === 1) {
      return this.noise1D(x);
    } else if (arguments.length === 2) {
      return this.noise2D(x, y);
    } else {
      return this.noise3D(x, y, z);
    }
  }

  /**
   * 1D 噪声
   */
  noise1D(x) {
    return this.noise2D(x, 0);
  }

  /**
   * 2D 噪声，支持多倍频
   */
  noise2D(x, y) {
    let total = 0;
    let frequency = this.scale;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < this.octaves; i++) {
      total += this.simplex.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= this.falloff;
      frequency *= 2;
    }

    // 归一化到 [0, 1] 范围
    return (total / maxValue + 1) / 2;
  }

  /**
   * 3D 噪声，支持多倍频
   */
  noise3D(x, y, z) {
    let total = 0;
    let frequency = this.scale;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < this.octaves; i++) {
      total += this.simplex.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= this.falloff;
      frequency *= 2;
    }

    // 归一化到 [0, 1] 范围
    return (total / maxValue + 1) / 2;
  }

  /**
   * 分形布朗运动 (Fractal Brownian Motion)
   */
  fbm(x, y, octaves = 4) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.simplex.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return total / maxValue;
  }

  /**
   * 湍流噪声
   */
  turbulence(x, y, size = 64) {
    let value = 0;
    let initialSize = size;

    while (size >= 1) {
      value += Math.abs(this.simplex.noise2D(x / size, y / size)) * size;
      size /= 2;
    }

    return value / initialSize;
  }

  /**
   * 山脊噪声
   */
  ridgedNoise(x, y, ridgeOffset = 1.0) {
    const n = Math.abs(this.simplex.noise2D(x, y));
    return ridgeOffset - n;
  }

  /**
   * 更新种子
   */
  setSeed(seed) {
    this.simplex = new SimplexNoise(seed);
  }
}

// 创建全局实例以兼容 p5.js API
const globalNoise = new NoiseGenerator();

// 导出兼容 p5.js 的函数
export const noise = globalNoise.noise.bind(globalNoise);
export const noiseDetail = globalNoise.noiseDetail.bind(globalNoise);
export const noiseSeed = (seed) => globalNoise.setSeed(seed);

export { SimplexNoise };
export default NoiseGenerator;