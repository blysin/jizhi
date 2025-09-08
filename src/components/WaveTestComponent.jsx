import React, { useRef, useEffect, useState } from 'react';
import CanvasAnimation from '../CanvasAnimation';

/**
 * 波浪效果测试组件
 * 用于实时调整和测试不同的波浪预设
 */
const WaveTestComponent = () => {
  const animationRef = useRef(null);
  const [currentPreset, setCurrentPreset] = useState('original');
  
  const presets = [
    { key: 'original', name: '原版配置', description: '基于原版p5.js的参数' },
    { key: 'gentle', name: '平缓配置', description: '更平缓的波浪效果' },
    { key: 'veryGentle', name: '极平缓配置', description: '非常平缓的大波浪' }
  ];

  // 切换波浪预设
  const handlePresetChange = (presetKey) => {
    setCurrentPreset(presetKey);
    
    // 如果动画组件已经初始化，直接更新预设
    if (animationRef.current && animationRef.current.renderer) {
      const renderer = animationRef.current.renderer;
      if (renderer.setWavePreset) {
        const newPreset = renderer.setWavePreset(presetKey);
        console.log('应用波浪预设:', presetKey, newPreset);
      }
    }
  };

  // 获取当前预设信息
  const getCurrentInfo = () => {
    if (animationRef.current && animationRef.current.renderer) {
      const renderer = animationRef.current.renderer;
      if (renderer.getCurrentPresetInfo) {
        return renderer.getCurrentPresetInfo();
      }
    }
    return null;
  };

  const containerStyle = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden'
  };

  const controlPanelStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    minWidth: '250px'
  };

  const buttonStyle = {
    display: 'block',
    width: '100%',
    margin: '8px 0',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white'
  };

  const inactiveButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f8f9fa',
    color: '#333',
    border: '1px solid #dee2e6'
  };

  return (
    <div style={containerStyle}>
      {/* 波浪动画背景 */}
      <CanvasAnimation
        ref={animationRef}
        animationType="waves"
        isPlaying={true}
        isDarkMode={false}
        waveColor="#84A6C9"
        style={{ zIndex: -1 }}
      />
      
      {/* 控制面板 */}
      <div style={controlPanelStyle}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
          波浪效果测试
        </h3>
        
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 15px 0' }}>
          选择不同的预设来测试波浪效果：
        </p>
        
        {presets.map(preset => (
          <button
            key={preset.key}
            onClick={() => handlePresetChange(preset.key)}
            style={currentPreset === preset.key ? activeButtonStyle : inactiveButtonStyle}
            title={preset.description}
          >
            <div style={{ fontWeight: 'bold' }}>{preset.name}</div>
            <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>
              {preset.description}
            </div>
          </button>
        ))}
        
        <div style={{ marginTop: '15px', fontSize: '11px', color: '#999' }}>
          当前预设: <strong>{currentPreset}</strong>
        </div>
      </div>
    </div>
  );
};

export default WaveTestComponent;