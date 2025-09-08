import BaseRenderer from './BaseRenderer.js';
import { NoiseGenerator } from '../utils/noise.js';
import { Color, mapValue } from '../utils/colorUtils.js';
import { getWavePreset } from '../utils/wavePresets.js';

/**
 * Mountain 类 - 单个波浪层
 */
class Mountain {
  constructor(color, y, options = {}) {
    this.color = color instanceof Color ? color : new Color(color);
    this.y = y;
    this.offset = Math.random() * 100 + 100; // 随机偏移量 100-200（与原版一致）
    this.t = 0; // 时间参数
    this.timeSpeed = options.timeSpeed || 0.005; // 与原版一致的时间速度
    this.noiseScale = options.noiseScale || 0.08; // 与原版一致的噪声缩放
    this.amplitude = options.amplitude || 200; // 与原版一致的振幅
    this.stepSize = options.stepSize || 25; // 与原版一致的步长
  }

  /**
   * 渲染波浪
   */
  display(ctx, width, height, noise) {
    let xoff = 0;

    // 设置填充样式
    ctx.fillStyle = this.color.toString();

    // 设置噪声细节（对应p5.js的noiseDetail(1.7, 1.3)）
    // 这个在我们的噪声实现中通过参数控制

    ctx.beginPath();
    
    // 生成波浪形状的顶部边界（精确匹配原版p5.js算法）
    for (let x = 0; x <= width + 25; x += this.stepSize) {
      // 使用噪声生成 Y 偏移（完全复制原版算法）
      // 注意：我们的噪声返回[0,1]，与p5.js一致
      const noiseValue = noise.noise2D(
        xoff + this.offset, 
        this.t + this.offset
      );
      
      // 映射噪声值到 0-amplitude 范围（与原版p5.js map函数一致）
      // 这里的噪声值已经是[0,1]范围，直接映射即可
      const yoff = noiseValue * this.amplitude;
      const y = this.y - yoff;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      xoff += this.noiseScale; // 与原版一致的噪声X偏移步长
    }

    // 完成形状 - 连接到画布底部
    ctx.lineTo(width + 25, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    // 填充形状
    ctx.fill();

    // 更新时间参数
    this.t += this.timeSpeed;
  }

  /**
   * 更新颜色
   */
  updateColor(newColor) {
    this.color = newColor instanceof Color ? newColor : new Color(newColor);
  }

  /**
   * 更新位置
   */
  updatePosition(y) {
    this.y = y;
  }
}

/**
 * WavesRenderer - 波浪动画渲染器
 */
export default class WavesRenderer extends BaseRenderer {
  constructor(canvas, options = {}) {
    super(canvas, options);
    
    // 波浪相关属性
    this.mountains = [];
    this.mountainCount = 5;
    this.layerSpacing = 50; // 层间距
    this.noise = new NoiseGenerator();
    
    // 初始化波浪配置（使用原版平缓配置）
    this.wavePreset = getWavePreset('original');
    
    // 设置噪声细节（使用预设配置）
    this.noise.noiseDetail(
      this.wavePreset.noiseDetail.octaves, 
      this.wavePreset.noiseDetail.falloff
    );
    this.noise.scale = this.wavePreset.noiseScale;
    
    // 背景颜色
    this.bgColor = this.options.isDarkMode ? '#323232' : '#e6e6e6';
    
    // 性能优化选项
    this.useOffscreenCanvas = false;
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
    
    // 绑定方法
    this.generateMountains = this.generateMountains.bind(this);
  }

  /**
   * 初始化渲染器
   */
  init() {
    super.init();
    this.generateMountains();
    
    // 初始化性能优化
    this.initPerformanceOptimizations();
  }

  /**
   * 初始化性能优化
   */
  initPerformanceOptimizations() {
    // 检查是否支持离屏画布
    if (typeof OffscreenCanvas !== 'undefined') {
      this.useOffscreenCanvas = true;
      const { width, height } = this.getCanvasSize();
      this.offscreenCanvas = new OffscreenCanvas(width, height);
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }
  }

  /**
   * 生成山形波浪（精确复制原版p5.js的growMountains函数）
   */
  generateMountains() {
    this.mountains = [];
    const { width, height } = this.getCanvasSize();
    
    // 处理颜色：支持字符串格式和 wavesColors.json 对象格式
    let colorValue = this.options.waveColor;
    if (typeof colorValue === 'object' && colorValue.hex) {
      // 如果是来自 wavesColors.json 的颜色对象，使用其 hex 值
      colorValue = colorValue.hex;
    }
    const baseColor = new Color(colorValue);

    // 创建5层波浪，完全复制原版逻辑
    for (let i = 0; i < this.mountainCount; i++) {
      const alpha = 255 - 50 * i; // 透明度递减（与原版一致）
      const color = baseColor.clone();
      color.setAlpha(alpha);
      
      const y = height - this.layerSpacing * i; // Y位置递增（与原版一致）
      
      // 使用预设配置的参数（保证平缓效果）
      const mountain = new Mountain(color, y, {
        timeSpeed: this.wavePreset.mountain.timeSpeed,
        noiseScale: this.wavePreset.mountain.noiseXStep,
        amplitude: this.wavePreset.mountain.amplitude,
        stepSize: this.wavePreset.mountain.stepSize,
      });
      
      this.mountains.push(mountain);
    }
  }

  /**
   * 渲染一帧
   */
  render(timestamp) {
    if (!this.ctx) return;

    const { width, height } = this.getCanvasSize();
    
    // 清空画布
    this.clearCanvas();
    
    // 设置背景色
    this.setBackground(this.bgColor);
    
    // 禁用描边
    this.ctx.strokeStyle = 'none';
    
    // 渲染所有山形波浪
    this.mountains.forEach(mountain => {
      mountain.display(this.ctx, width, height, this.noise);
    });
  }

  /**
   * 属性更新处理
   */
  onPropsUpdate(newProps) {
    let shouldRegenerateMountains = false;

    // 更新背景色
    if (newProps.isDarkMode !== undefined) {
      this.bgColor = newProps.isDarkMode ? '#323232' : '#e6e6e6';
    }

    // 更新波浪颜色（支持字符串和对象格式）
    if (newProps.waveColor !== undefined) {
      // 获取新颜色的字符串值
      let newColorValue = newProps.waveColor;
      if (typeof newColorValue === 'object' && newColorValue.hex) {
        newColorValue = newColorValue.hex;
      }
      
      // 获取当前颜色的字符串值
      let currentColorValue = this.options.waveColor;
      if (typeof currentColorValue === 'object' && currentColorValue.hex) {
        currentColorValue = currentColorValue.hex;
      }
      
      // 比较颜色值是否有变化
      if (newColorValue !== currentColorValue) {
        shouldRegenerateMountains = true;
      }
    }

    // 如果需要重新生成山形，则重新生成
    if (shouldRegenerateMountains) {
      this.generateMountains();
    }
  }

  /**
   * 窗口大小变化处理
   */
  onResize() {
    // 重新生成山形以适应新的尺寸
    this.generateMountains();
    
    // 更新离屏画布尺寸
    if (this.useOffscreenCanvas && this.offscreenCanvas) {
      const { width, height } = this.getCanvasSize();
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }
  }

  /**
   * 处理键盘事件（对应p5.js的keyPressed）
   */
  handleKeyPress(keyCode) {
    // 左箭头键 (37) 或右箭头键 (39) - 重新生成山形
    if (keyCode === 37 || keyCode === 39) {
      this.generateMountains();
    }
  }

  /**
   * 手动触发重新生成（对应p5.js中的手动重置）
   */
  regenerate() {
    this.generateMountains();
  }

  /**
   * 设置波浪预设（可用于实时调整效果）
   */
  setWavePreset(presetName) {
    this.wavePreset = getWavePreset(presetName);
    
    // 更新噪声配置
    this.noise.noiseDetail(
      this.wavePreset.noiseDetail.octaves, 
      this.wavePreset.noiseDetail.falloff
    );
    this.noise.scale = this.wavePreset.noiseScale;
    
    // 重新生成波浪
    this.generateMountains();
    
    return this.wavePreset;
  }

  /**
   * 获得当前波浪预设信息
   */
  getCurrentPresetInfo() {
    return {
      preset: this.wavePreset,
      availablePresets: ['original', 'gentle', 'veryGentle']
    };
  }

  /**
   * 获取当前动画状态信息
   */
  getAnimationInfo() {
    return {
      mountainCount: this.mountains.length,
      bgColor: this.bgColor,
      waveColor: this.options.waveColor,
      isPlaying: this.options.isPlaying,
      isDarkMode: this.options.isDarkMode,
    };
  }

  /**
   * 设置噪声种子（用于可重复的动画）
   */
  setNoiseSeed(seed) {
    this.noise.setSeed(seed);
  }

  /**
   * 更新山形配置
   */
  updateMountainConfig(config = {}) {
    const {
      count = this.mountainCount,
      spacing = this.layerSpacing,
      timeSpeed = 0.005,
      noiseScale = 0.08,
      amplitude = 200,
    } = config;

    this.mountainCount = count;
    this.layerSpacing = spacing;

    // 更新现有山形的配置
    this.mountains.forEach((mountain, index) => {
      mountain.timeSpeed = timeSpeed + index * 0.001;
      mountain.noiseScale = noiseScale;
      mountain.amplitude = amplitude - index * 10;
    });
  }

  /**
   * 销毁渲染器
   */
  destroy() {
    // 清理山形数组
    this.mountains = [];
    
    // 清理离屏画布
    if (this.offscreenCanvas) {
      this.offscreenCanvas = null;
      this.offscreenCtx = null;
    }
    
    // 清理噪声生成器
    this.noise = null;
    
    // 调用父类销毁方法
    super.destroy();
  }
}