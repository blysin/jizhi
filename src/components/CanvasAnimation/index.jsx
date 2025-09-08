import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import WavesRenderer from './renderers/WavesRenderer';
import BlobsRenderer from './renderers/BlobsRenderer';

/**
 * CanvasAnimation - 主动画组件
 * 替代 ReactP5Wrapper，提供 CSP 兼容的动画功能
 */
const CanvasAnimation = forwardRef(({
  animationType = 'waves',
  isPlaying = true,
  isDarkMode = false,
  waveColor = '#000000',
  onMousePressed = null,
  style = {},
  className = '',
}, ref) => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 暴露渲染器实例给父组件（用于测试和调试）
  useImperativeHandle(ref, () => ({
    renderer: rendererRef.current,
    canvas: canvasRef.current,
    isInitialized,
  }), [isInitialized]);

  // 初始化渲染器
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const options = {
      isPlaying,
      isDarkMode,
      waveColor,
      targetFPS: 30,
    };

    // 根据动画类型创建对应的渲染器
    switch (animationType) {
      case 'waves':
        rendererRef.current = new WavesRenderer(canvas, options);
        break;
      case 'blobs':
        rendererRef.current = new BlobsRenderer(canvas, options);
        break;
      default:
        console.warn(`Unknown animation type: ${animationType}`);
        rendererRef.current = new WavesRenderer(canvas, options);
    }

    // 初始化渲染器
    try {
      rendererRef.current.init();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize renderer:', error);
    }

    // 清理函数
    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
      setIsInitialized(false);
    };
  }, [animationType]); // 只在动画类型改变时重新初始化

  // 更新渲染器属性
  useEffect(() => {
    if (rendererRef.current && isInitialized) {
      rendererRef.current.updateProps({
        isPlaying,
        isDarkMode,
        waveColor,
      });
    }
  }, [isPlaying, isDarkMode, waveColor, isInitialized]);

  // 处理鼠标点击事件
  const handleMouseClick = (event) => {
    if (!rendererRef.current || !isInitialized) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 调用渲染器的鼠标点击处理
    if (rendererRef.current.handleMouseClick) {
      rendererRef.current.handleMouseClick(x, y);
    }

    // 调用外部回调
    if (onMousePressed) {
      onMousePressed(x, y, event);
    }
  };

  // 设置画布样式
  const canvasStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: -1,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'auto',
    ...style,
  };

  return (
    <canvas
      ref={canvasRef}
      style={canvasStyle}
      className={className}
      onClick={handleMouseClick}
      aria-label={`${animationType} animation canvas`}
    />
  );
});

CanvasAnimation.displayName = 'CanvasAnimation';

CanvasAnimation.propTypes = {
  /** 动画类型：'waves' 或 'blobs' */
  animationType: PropTypes.oneOf(['waves', 'blobs']),
  /** 是否播放动画 */
  isPlaying: PropTypes.bool,
  /** 是否暗黑模式 */
  isDarkMode: PropTypes.bool,
  /** 波浪颜色（十六进制字符串） */
  waveColor: PropTypes.string,
  /** 鼠标点击回调函数 */
  onMousePressed: PropTypes.func,
  /** 自定义样式 */
  style: PropTypes.object,
  /** CSS 类名 */
  className: PropTypes.string,
};

export default CanvasAnimation;