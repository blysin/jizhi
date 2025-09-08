/**
 * ColorUtils - 颜色工具模块
 * 提供颜色处理、转换和操作功能
 * 兼容p5.js的颜色API
 */

/**
 * Color 类 - 兼容p5.js color对象
 */
export class Color {
  constructor(r, g, b, a = 255) {
    if (typeof r === 'string') {
      // 处理十六进制颜色
      const parsed = parseHexColor(r);
      this.r = parsed.r;
      this.g = parsed.g;
      this.b = parsed.b;
      this.a = a;
    } else if (Array.isArray(r)) {
      // 处理数组形式
      this.r = r[0] || 0;
      this.g = r[1] || 0;
      this.b = r[2] || 0;
      this.a = r[3] !== undefined ? r[3] : 255;
    } else {
      // 处理分别传入的参数
      this.r = r || 0;
      this.g = g !== undefined ? g : r || 0;
      this.b = b !== undefined ? b : r || 0;
      this.a = a;
    }
  }

  /**
   * 设置透明度
   */
  setAlpha(alpha) {
    this.a = alpha;
  }

  /**
   * 获取颜色字符串
   */
  toString() {
    if (this.a === 255) {
      return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
    } else {
      return `rgba(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)}, ${this.a / 255})`;
    }
  }

  /**
   * 获取十六进制字符串
   */
  toHex() {
    const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
  }

  /**
   * 克隆颜色对象
   */
  clone() {
    return new Color(this.r, this.g, this.b, this.a);
  }
}

/**
 * 解析十六进制颜色
 */
export function parseHexColor(hex) {
  // 移除 # 符号
  hex = hex.replace('#', '');
  
  // 处理简写形式 (#RGB -> #RRGGBB)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return { r, g, b };
}

/**
 * RGB转HSB
 */
export function rgbToHsb(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h, s, brightness = max;

  if (max === 0) {
    s = 0;
  } else {
    s = diff / max;
  }

  if (diff === 0) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    b: brightness * 100
  };
}

/**
 * HSB转RGB
 */
export function hsbToRgb(h, s, b) {
  h = h / 360;
  s = s / 100;
  b = b / 100;

  const c = b * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = b - c;

  let r, g, blue;

  if (h < 1/6) {
    r = c; g = x; blue = 0;
  } else if (h < 2/6) {
    r = x; g = c; blue = 0;
  } else if (h < 3/6) {
    r = 0; g = c; blue = x;
  } else if (h < 4/6) {
    r = 0; g = x; blue = c;
  } else if (h < 5/6) {
    r = x; g = 0; blue = c;
  } else {
    r = c; g = 0; blue = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((blue + m) * 255)
  };
}

/**
 * 颜色插值
 */
export function lerpColor(c1, c2, amt) {
  const color1 = typeof c1 === 'string' ? new Color(c1) : c1;
  const color2 = typeof c2 === 'string' ? new Color(c2) : c2;
  
  amt = Math.max(0, Math.min(1, amt));
  
  const r = color1.r + (color2.r - color1.r) * amt;
  const g = color1.g + (color2.g - color1.g) * amt;
  const b = color1.b + (color2.b - color1.b) * amt;
  const a = color1.a + (color2.a - color1.a) * amt;
  
  return new Color(r, g, b, a);
}

/**
 * 数值映射函数（兼容p5.js map函数）
 */
export function mapValue(value, start1, stop1, start2, stop2, withinBounds = false) {
  const newval = (value - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  
  if (!withinBounds) {
    return newval;
  }
  
  if (start2 < stop2) {
    return Math.max(Math.min(newval, stop2), start2);
  } else {
    return Math.max(Math.min(newval, start2), stop2);
  }
}

/**
 * 约束值在指定范围内
 */
export function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low);
}

/**
 * 线性插值
 */
export function lerp(start, stop, amt) {
  return start + (stop - start) * amt;
}

/**
 * 创建颜色（兼容p5.js color函数）
 */
export function color(r, g, b, a) {
  return new Color(r, g, b, a);
}

/**
 * 获取红色分量
 */
export function red(c) {
  return c instanceof Color ? c.r : parseHexColor(c).r;
}

/**
 * 获取绿色分量
 */
export function green(c) {
  return c instanceof Color ? c.g : parseHexColor(c).g;
}

/**
 * 获取蓝色分量
 */
export function blue(c) {
  return c instanceof Color ? c.b : parseHexColor(c).b;
}

/**
 * 获取透明度
 */
export function alpha(c) {
  return c instanceof Color ? c.a : 255;
}

/**
 * 颜色混合模式
 */
export const BlendModes = {
  NORMAL: 'source-over',
  MULTIPLY: 'multiply',
  SCREEN: 'screen',
  OVERLAY: 'overlay',
  DARKEN: 'darken',
  LIGHTEN: 'lighten',
  COLOR_DODGE: 'color-dodge',
  COLOR_BURN: 'color-burn',
  HARD_LIGHT: 'hard-light',
  SOFT_LIGHT: 'soft-light',
  DIFFERENCE: 'difference',
  EXCLUSION: 'exclusion',
  HUE: 'hue',
  SATURATION: 'saturation',
  COLOR: 'color',
  LUMINOSITY: 'luminosity'
};

/**
 * 颜色调色板生成器
 */
export class ColorPalette {
  constructor() {
    this.colors = [];
  }

  /**
   * 添加颜色
   */
  add(color) {
    this.colors.push(color instanceof Color ? color : new Color(color));
    return this;
  }

  /**
   * 生成互补色调色板
   */
  static complementary(baseColor) {
    const palette = new ColorPalette();
    const base = baseColor instanceof Color ? baseColor : new Color(baseColor);
    const hsb = rgbToHsb(base.r, base.g, base.b);
    
    palette.add(base);
    
    // 互补色（色相+180度）
    const compHue = (hsb.h + 180) % 360;
    const comp = hsbToRgb(compHue, hsb.s, hsb.b);
    palette.add(new Color(comp.r, comp.g, comp.b));
    
    return palette;
  }

  /**
   * 生成三色调色板
   */
  static triadic(baseColor) {
    const palette = new ColorPalette();
    const base = baseColor instanceof Color ? baseColor : new Color(baseColor);
    const hsb = rgbToHsb(base.r, base.g, base.b);
    
    palette.add(base);
    
    // 三色调（色相+120度和+240度）
    for (let i = 1; i < 3; i++) {
      const newHue = (hsb.h + i * 120) % 360;
      const rgb = hsbToRgb(newHue, hsb.s, hsb.b);
      palette.add(new Color(rgb.r, rgb.g, rgb.b));
    }
    
    return palette;
  }

  /**
   * 生成单色调色板
   */
  static monochromatic(baseColor, steps = 5) {
    const palette = new ColorPalette();
    const base = baseColor instanceof Color ? baseColor : new Color(baseColor);
    const hsb = rgbToHsb(base.r, base.g, base.b);
    
    for (let i = 0; i < steps; i++) {
      const brightness = Math.max(10, Math.min(90, hsb.b + (i - 2) * 20));
      const rgb = hsbToRgb(hsb.h, hsb.s, brightness);
      palette.add(new Color(rgb.r, rgb.g, rgb.b));
    }
    
    return palette;
  }

  /**
   * 获取随机颜色
   */
  random() {
    if (this.colors.length === 0) return new Color(0, 0, 0);
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  /**
   * 获取所有颜色
   */
  getColors() {
    return this.colors;
  }
}

/**
 * 随机颜色生成器
 */
export function randomColor(options = {}) {
  const {
    hue = [0, 360],
    saturation = [50, 100],
    brightness = [50, 100],
    alpha = 255
  } = options;

  const h = Array.isArray(hue) 
    ? Math.random() * (hue[1] - hue[0]) + hue[0]
    : hue;
  
  const s = Array.isArray(saturation) 
    ? Math.random() * (saturation[1] - saturation[0]) + saturation[0]
    : saturation;
  
  const b = Array.isArray(brightness) 
    ? Math.random() * (brightness[1] - brightness[0]) + brightness[0]
    : brightness;

  const rgb = hsbToRgb(h, s, b);
  return new Color(rgb.r, rgb.g, rgb.b, alpha);
}

export default {
  Color,
  parseHexColor,
  rgbToHsb,
  hsbToRgb,
  lerpColor,
  mapValue,
  constrain,
  lerp,
  color,
  red,
  green,
  blue,
  alpha,
  BlendModes,
  ColorPalette,
  randomColor
};