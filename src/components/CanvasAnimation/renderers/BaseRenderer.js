/**
 * BaseRenderer - 动画渲染器基类
 * 提供所有渲染器的通用接口和基础功能
 */
export default class BaseRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      isPlaying: true,
      isDarkMode: false,
      waveColor: '#000000',
      targetFPS: 30,
      ...options,
    };
    
    this.animationId = null;
    this.lastFrameTime = 0;
    this.frameInterval = 1000 / this.options.targetFPS;
    this.isDestroyed = false;
    
    // 绑定方法以确保正确的this上下文
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  /**
   * 初始化渲染器
   * 子类应重写此方法来执行特定的初始化逻辑
   */
  init() {
    this.setupCanvas();
    this.startAnimation();
    this.addEventListeners();
  }

  /**
   * 设置画布基本属性
   */
  setupCanvas() {
    const { canvas } = this;
    const rect = canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // 设置画布实际大小（考虑设备像素比）
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    
    // 设置画布显示大小
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // 缩放上下文以适应设备像素比
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  /**
   * 开始动画循环
   */
  startAnimation() {
    if (this.options.isPlaying && !this.isDestroyed) {
      this.animationId = requestAnimationFrame(this.animate);
    }
  }

  /**
   * 停止动画循环
   */
  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 主动画循环
   * 控制帧率并调用渲染方法
   */
  animate(timestamp) {
    if (this.isDestroyed) return;

    const elapsed = timestamp - this.lastFrameTime;
    
    if (elapsed >= this.frameInterval) {
      this.render(timestamp);
      this.lastFrameTime = timestamp;
    }
    
    if (this.options.isPlaying) {
      this.animationId = requestAnimationFrame(this.animate);
    }
  }

  /**
   * 渲染一帧
   * 子类必须实现此方法
   */
  render(timestamp) {
    throw new Error('render method must be implemented by subclass');
  }

  /**
   * 更新渲染器属性
   */
  updateProps(newProps) {
    const oldIsPlaying = this.options.isPlaying;
    
    // 合并新属性
    this.options = { ...this.options, ...newProps };
    
    // 更新帧率间隔
    this.frameInterval = 1000 / this.options.targetFPS;
    
    // 处理播放状态变化
    if (oldIsPlaying !== this.options.isPlaying) {
      if (this.options.isPlaying) {
        this.startAnimation();
      } else {
        this.stopAnimation();
      }
    }
    
    // 调用子类的属性更新处理
    this.onPropsUpdate(newProps);
  }

  /**
   * 属性更新回调，子类可重写
   */
  onPropsUpdate(newProps) {
    // 子类可重写此方法来处理特定的属性更新
  }

  /**
   * 处理窗口大小变化
   */
  handleResize() {
    if (this.isDestroyed) return;
    
    this.setupCanvas();
    this.onResize();
  }

  /**
   * 窗口大小变化回调，子类可重写
   */
  onResize() {
    // 子类可重写此方法来处理大小变化
  }

  /**
   * 添加事件监听器
   */
  addEventListeners() {
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * 移除事件监听器
   */
  removeEventListeners() {
    window.removeEventListener('resize', this.handleResize);
  }

  /**
   * 销毁渲染器，清理资源
   */
  destroy() {
    this.isDestroyed = true;
    this.stopAnimation();
    this.removeEventListeners();
    
    // 清理引用
    this.canvas = null;
    this.ctx = null;
    this.options = null;
  }

  /**
   * 获取画布尺寸
   */
  getCanvasSize() {
    if (!this.canvas) return { width: 0, height: 0 };
    
    const rect = this.canvas.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
    };
  }

  /**
   * 清空画布
   */
  clearCanvas() {
    if (!this.ctx || !this.canvas) return;
    
    const { width, height } = this.getCanvasSize();
    this.ctx.clearRect(0, 0, width, height);
  }

  /**
   * 设置画布背景色
   */
  setBackground(color) {
    if (!this.ctx) return;
    
    const { width, height } = this.getCanvasSize();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, width, height);
  }
}