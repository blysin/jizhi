/**
 * AnimationLoop - 高级动画循环控制器
 * 提供更精细的动画控制，包括自适应帧率、性能监控等
 */

export class AnimationLoop {
  constructor(options = {}) {
    this.options = {
      targetFPS: 30,
      maxFPS: 60,
      minFPS: 15,
      adaptiveFrameRate: true,
      performanceMonitoring: true,
      ...options,
    };

    this.isRunning = false;
    this.animationId = null;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.actualFPS = 0;
    this.frameTimes = [];
    this.maxFrameTimeHistory = 60; // 保存最近60帧的时间

    // 性能监控
    this.performanceMetrics = {
      avgFrameTime: 0,
      minFrameTime: Infinity,
      maxFrameTime: 0,
      droppedFrames: 0,
    };

    // 绑定方法
    this.loop = this.loop.bind(this);
  }

  /**
   * 开始动画循环
   * @param {Function} callback - 每帧调用的回调函数
   */
  start(callback) {
    if (this.isRunning) return;
    
    this.callback = callback;
    this.isRunning = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.frameTimes = [];
    
    this.animationId = requestAnimationFrame(this.loop);
  }

  /**
   * 停止动画循环
   */
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 主动画循环
   */
  loop(currentTime) {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastFrameTime;
    const targetFrameTime = 1000 / this.options.targetFPS;

    // 检查是否应该渲染这一帧
    if (deltaTime >= targetFrameTime) {
      // 更新性能指标
      this.updatePerformanceMetrics(deltaTime);

      // 调用用户回调
      if (this.callback) {
        try {
          this.callback(currentTime, deltaTime);
        } catch (error) {
          console.error('Animation callback error:', error);
        }
      }

      this.lastFrameTime = currentTime;
      this.frameCount++;

      // 自适应帧率调整
      if (this.options.adaptiveFrameRate) {
        this.adjustFrameRate();
      }
    }

    this.animationId = requestAnimationFrame(this.loop);
  }

  /**
   * 更新性能指标
   */
  updatePerformanceMetrics(deltaTime) {
    this.frameTimes.push(deltaTime);
    
    // 限制历史记录长度
    if (this.frameTimes.length > this.maxFrameTimeHistory) {
      this.frameTimes.shift();
    }

    // 计算实际FPS
    this.actualFPS = 1000 / deltaTime;

    // 更新性能指标
    const metrics = this.performanceMetrics;
    metrics.avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    metrics.minFrameTime = Math.min(metrics.minFrameTime, deltaTime);
    metrics.maxFrameTime = Math.max(metrics.maxFrameTime, deltaTime);

    // 检测掉帧
    if (deltaTime > (1000 / this.options.targetFPS) * 2) {
      metrics.droppedFrames++;
    }
  }

  /**
   * 自适应帧率调整
   */
  adjustFrameRate() {
    const avgFrameTime = this.performanceMetrics.avgFrameTime;
    const targetFrameTime = 1000 / this.options.targetFPS;

    // 如果平均帧时间超过目标时间的120%，降低帧率
    if (avgFrameTime > targetFrameTime * 1.2) {
      const newFPS = Math.max(
        this.options.minFPS,
        Math.floor(1000 / avgFrameTime) - 5
      );
      this.options.targetFPS = newFPS;
    }
    // 如果性能良好，可以尝试提高帧率
    else if (avgFrameTime < targetFrameTime * 0.8 && this.options.targetFPS < this.options.maxFPS) {
      const newFPS = Math.min(
        this.options.maxFPS,
        this.options.targetFPS + 5
      );
      this.options.targetFPS = newFPS;
    }
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    return {
      ...this.performanceMetrics,
      actualFPS: this.actualFPS,
      targetFPS: this.options.targetFPS,
      frameCount: this.frameCount,
      isRunning: this.isRunning,
    };
  }

  /**
   * 重置性能指标
   */
  resetPerformanceMetrics() {
    this.performanceMetrics = {
      avgFrameTime: 0,
      minFrameTime: Infinity,
      maxFrameTime: 0,
      droppedFrames: 0,
    };
    this.frameCount = 0;
    this.frameTimes = [];
  }

  /**
   * 更新选项
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }
}

/**
 * FPSCounter - 简单的FPS计数器
 */
export class FPSCounter {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
  }

  update() {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    return this.fps;
  }
}

/**
 * RAF工具函数
 */
export const rafUtils = {
  /**
   * 节流的requestAnimationFrame
   */
  throttledRAF: (callback, fps = 30) => {
    let lastTime = 0;
    const interval = 1000 / fps;

    return function throttledCallback(currentTime) {
      if (currentTime - lastTime >= interval) {
        callback(currentTime);
        lastTime = currentTime;
      }
    };
  },

  /**
   * 带超时的requestAnimationFrame
   */
  rafWithTimeout: (callback, timeout = 5000) => {
    let timeoutId;
    let rafId;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };

    timeoutId = setTimeout(() => {
      cleanup();
      console.warn('Animation frame timeout');
    }, timeout);

    rafId = requestAnimationFrame((time) => {
      cleanup();
      callback(time);
    });

    return cleanup;
  },
};

export default AnimationLoop;