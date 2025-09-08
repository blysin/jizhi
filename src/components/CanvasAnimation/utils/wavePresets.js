/**
 * 波浪动画参数配置
 * 基于原版p5.js实现的精确参数复制
 */

export const WavePresets = {
  // 原版p5.js平缓大波浪配置
  original: {
    noiseDetail: {
      octaves: 1,
      falloff: 0.3  // 更低的falloff产生更大、更平缓的波浪
    },
    noiseScale: 0.8,  // 调整全局噪声缩放
    mountain: {
      timeSpeed: 0.005,     // 原版时间速度
      noiseXStep: 0.08,     // 原版噪声X偏移步长
      amplitude: 200,       // 原版振幅
      stepSize: 25,         // 原版步长
      layerCount: 5,        // 5层波浪
      layerSpacing: 50,     // 层间距
      alphaDecrement: 50,   // 透明度递减量
    }
  },

  // 更平缓的配置（如果原版还太激烈）
  gentle: {
    noiseDetail: {
      octaves: 1,
      falloff: 0.2  // 更低的falloff
    },
    noiseScale: 0.5,  // 更小的缩放
    mountain: {
      timeSpeed: 0.003,     // 更慢的动画
      noiseXStep: 0.06,     // 更大的噪声步长
      amplitude: 180,       // 稍小的振幅
      stepSize: 25,
      layerCount: 5,
      layerSpacing: 50,
      alphaDecrement: 50,
    }
  },

  // 极其平缓的配置
  veryGentle: {
    noiseDetail: {
      octaves: 1,
      falloff: 0.1  // 极低的falloff
    },
    noiseScale: 0.3,
    mountain: {
      timeSpeed: 0.002,     // 很慢的动画
      noiseXStep: 0.05,     // 很大的噪声步长
      amplitude: 150,       // 更小的振幅
      stepSize: 30,         // 更大的步长产生更平滑的曲线
      layerCount: 5,
      layerSpacing: 50,
      alphaDecrement: 50,
    }
  }
};

/**
 * 获取指定预设的配置
 */
export function getWavePreset(presetName = 'original') {
  return WavePresets[presetName] || WavePresets.original;
}

/**
 * 应用波浪预设到渲染器
 */
export function applyWavePreset(renderer, presetName = 'original') {
  const preset = getWavePreset(presetName);
  
  // 应用噪声配置
  renderer.noise.noiseDetail(preset.noiseDetail.octaves, preset.noiseDetail.falloff);
  renderer.noise.scale = preset.noiseScale;
  
  // 应用山形配置
  renderer.mountainCount = preset.mountain.layerCount;
  renderer.layerSpacing = preset.mountain.layerSpacing;
  
  // 重新生成波浪
  renderer.generateMountains();
  
  return preset;
}

export default WavePresets;