import BaseRenderer from './BaseRenderer.js';
import { NoiseGenerator } from '../utils/noise.js';
import { Color, mapValue, lerp } from '../utils/colorUtils.js';
import blobsColors from '../../../constants/colors.js';

/**
 * Blob 类 - 单个色斑
 */
class Blob {
  constructor(radius, offset, scale, x, y, tSpeed, color) {
    this.radius = radius;
    this.offset = offset;
    this.scale = scale;
    this.x = x;
    this.y = y;
    this.tSpeed = tSpeed;
    this.color = color instanceof Color ? color : new Color(color);
    this.t = 0; // 时间参数
    this.s = 0; // 缩放参数（用于动画出现效果）
    this.targetScale = 1;
    this.scaleSpeed = 0.07;
  }

  /**
   * 渲染色斑
   */
  display(ctx, noise) {
    ctx.save();
    
    // 设置颜色和透明度
    const color = this.color.clone();
    color.setAlpha(230);
    ctx.fillStyle = color.toString();
    
    // 移动到色斑中心
    ctx.translate(this.x, this.y);
    
    // 动画缩放效果
    this.s = lerp(this.s, this.targetScale, this.scaleSpeed);
    ctx.scale(this.s, this.s);
    
    // 设置噪声细节（对应p5.js的noiseDetail(2, 0.9)）
    // 在我们的实现中通过噪声生成器配置
    
    ctx.beginPath();
    
    // 使用极坐标和噪声生成有机形状
    const TWO_PI = Math.PI * 2;
    const angleStep = Math.PI / 180; // 1度步长
    
    for (let i = 0; i < TWO_PI; i += angleStep) {
      // 计算噪声输入参数
      const xOff = this.offset * Math.cos(i) + this.offset;
      const yOff = this.offset * Math.sin(i) + this.offset;
      
      // 获取噪声值并映射到半径变化
      const noiseValue = noise.noise3D(xOff, yOff, this.t);
      const r = this.radius + mapValue(noiseValue, 0, 1, -this.scale, this.scale);
      
      // 计算顶点位置
      const x = r * Math.cos(i);
      const y = r * Math.sin(i);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    
    // 更新时间参数
    this.t += this.tSpeed;
    
    ctx.restore();
  }

  /**
   * 更新颜色
   */
  updateColor(newColor) {
    this.color = newColor instanceof Color ? newColor : new Color(newColor);
  }

  /**
   * 设置目标缩放
   */
  setTargetScale(scale) {
    this.targetScale = scale;
  }

  /**
   * 重置色斑（用于动画出现效果）
   */
  reset() {
    this.s = 0;
    this.t = 0;
  }

  /**
   * 检查是否完全显示
   */
  isFullyVisible() {
    return Math.abs(this.s - this.targetScale) < 0.01;
  }
}

/**
 * BlobsRenderer - 色斑动画渲染器
 */
export default class BlobsRenderer extends BaseRenderer {
  constructor(canvas, options = {}) {
    super(canvas, options);
    
    // 色斑相关属性
    this.blobsArray = [];
    this.colors = this.getRandomColorSet();
    this.noise = new NoiseGenerator();
    
    // 设置噪声细节（对应p5.js的noiseDetail(2, 0.9)）
    this.noise.noiseDetail(2, 0.9);
    
    // 背景颜色
    this.bgColor = this.options.isDarkMode ? 50 : 230;
    
    // 初始化色斑配置
    this.initialBlobCount = 4;
    this.maxBlobs = 20; // 限制最大色斑数量以保持性能
    
    // 绑定方法
    this.generateBlobs = this.generateBlobs.bind(this);
    this.handleMouseClick = this.handleMouseClick.bind(this);
  }

  /**
   * 获取随机色彩组合
   */
  getRandomColorSet() {
    const randomIndex = Math.floor(Math.random() * blobsColors.length);
    return blobsColors[randomIndex];
  }

  /**
   * 初始化渲染器
   */
  init() {
    super.init();
    this.generateBlobs();
  }

  /**
   * 生成色斑
   */
  generateBlobs(positionX = null, positionY = null) {
    const { width, height } = this.getCanvasSize();
    const offset = Math.random() * 0.4 + 0.2; // 0.2-0.6

    if (positionX !== null && positionY !== null) {
      // 在指定位置生成单个色斑（鼠标点击）
      if (this.blobsArray.length >= this.maxBlobs) {
        // 移除最旧的色斑
        this.blobsArray.shift();
      }

      const scale = Math.random() * 20 + 20; // 20-40
      const tSpeed = Math.random() * 0.03 + 0.02; // 0.02-0.05
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];

      const blob = new Blob(70, offset, scale, positionX, positionY, tSpeed, color);
      this.blobsArray.push(blob);
    } else {
      // 生成初始色斑布局
      this.blobsArray = [];
      
      for (let i = 0; i < this.initialBlobCount; i++) {
        const scale = Math.random() * 40 + 20; // 20-60

        // 计算位置 - 四象限分布
        const x = i % 2 === 0 
          ? width / 4 + Math.random() * 200 - 100
          : (width / 4) * 3 + Math.random() * 200 - 100;
        
        const y = i < 2 
          ? height / 4 + Math.random() * 200 - 100
          : (height / 4) * 3 + Math.random() * 200 - 100;

        const tSpeed = Math.random() * 0.04 + 0.02; // 0.02-0.06
        const color = this.colors[i % this.colors.length];

        const blob = new Blob(250, offset, scale, x, y, tSpeed, color);
        this.blobsArray.push(blob);
      }
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
    this.ctx.fillStyle = `rgb(${this.bgColor}, ${this.bgColor}, ${this.bgColor})`;
    this.ctx.fillRect(0, 0, width, height);
    
    // 禁用描边
    this.ctx.strokeStyle = 'none';
    
    // 渲染所有色斑
    this.blobsArray.forEach(blob => {
      blob.display(this.ctx, this.noise);
    });
  }

  /**
   * 处理鼠标点击
   */
  handleMouseClick(x, y) {
    this.generateBlobs(x, y);
  }

  /**
   * 属性更新处理
   */
  onPropsUpdate(newProps) {
    // 更新背景色
    if (newProps.isDarkMode !== undefined) {
      this.bgColor = newProps.isDarkMode ? 50 : 230;
    }

    // 色斑动画通常不需要响应waveColor变化
    // 但可以在这里添加颜色主题切换逻辑
  }

  /**
   * 窗口大小变化处理
   */
  onResize() {
    // 重新计算色斑位置（可选）
    // 这里可以选择重新生成或保持现有位置
    const { width, height } = this.getCanvasSize();
    
    // 调整超出边界的色斑位置
    this.blobsArray.forEach(blob => {
      if (blob.x > width) blob.x = width - 100;
      if (blob.y > height) blob.y = height - 100;
      if (blob.x < 0) blob.x = 100;
      if (blob.y < 0) blob.y = 100;
    });
  }

  /**
   * 清除所有色斑
   */
  clearBlobs() {
    this.blobsArray = [];
  }

  /**
   * 重新生成色斑
   */
  regenerate() {
    this.colors = this.getRandomColorSet();
    this.generateBlobs();
  }

  /**
   * 获取当前动画状态信息
   */
  getAnimationInfo() {
    return {
      blobCount: this.blobsArray.length,
      maxBlobs: this.maxBlobs,
      bgColor: this.bgColor,
      colorSet: this.colors,
      isPlaying: this.options.isPlaying,
      isDarkMode: this.options.isDarkMode,
    };
  }

  /**
   * 设置色彩组合
   */
  setColorSet(colors) {
    this.colors = colors;
    // 更新现有色斑的颜色
    this.blobsArray.forEach((blob, index) => {
      if (colors[index % colors.length]) {
        blob.updateColor(colors[index % colors.length]);
      }
    });
  }

  /**
   * 设置噪声种子（用于可重复的动画）
   */
  setNoiseSeed(seed) {
    this.noise.setSeed(seed);
  }

  /**
   * 更新色斑配置
   */
  updateBlobConfig(config = {}) {
    const {
      maxBlobs = this.maxBlobs,
      initialCount = this.initialBlobCount,
    } = config;

    this.maxBlobs = maxBlobs;
    this.initialBlobCount = initialCount;

    // 如果当前色斑数量超过新的最大值，移除多余的
    while (this.blobsArray.length > this.maxBlobs) {
      this.blobsArray.shift();
    }
  }

  /**
   * 销毁渲染器
   */
  destroy() {
    // 清理色斑数组
    this.blobsArray = [];
    
    // 清理颜色数组
    this.colors = [];
    
    // 清理噪声生成器
    this.noise = null;
    
    // 调用父类销毁方法
    super.destroy();
  }
}