# Evergreen UI v7 升级说明

## 升级概述

- **升级时间**: 2025年9月8日
- **从版本**: evergreen-ui@4.29.1
- **到版本**: evergreen-ui@7.1.9
- **升级分支**: feature/upgrade-evergreen-ui-v7

## 主要变更

### 1. SegmentedControl 组件移除

**问题**: `SegmentedControl` 组件在 v7 中被移除
**解决方案**: 使用 `Group + Button` 组合替代

**修改文件**: `src/components/ConfigMenu/MenuContent.jsx`

**修改内容**:
```javascript
// 升级前
import { SegmentedControl } from 'evergreen-ui';
<SegmentedControl 
  width={280}
  options={options}
  value={value}
  onChange={onChange}
/>

// 升级后  
import { Group, Button } from 'evergreen-ui';
const CustomSegmentedControl = ({ options, value, onChange, width }) => (
  <Group display="flex" width={width}>
    {options.map((option) => (
      <Button
        key={option.value}
        isActive={value === option.value}
        onClick={() => onChange(option.value)}
        flex={1}
        size="small"
        appearance={value === option.value ? "primary" : "default"}
        justifyContent="center"
      >
        {option.label}
      </Button>
    ))}
  </Group>
);
```

**影响的功能**:
- 搜索引擎选择
- 颜色模式切换  
- 字体选择

### 2. 组件兼容性验证

以下组件在 v7 中**保持兼容**，无需修改：

| 组件 | 文件 | 状态 |
|------|------|------|
| Link | CustomLink.jsx | ✅ 兼容 |
| InlineAlert | FontStatement.jsx, App.jsx | ✅ 兼容 |
| Paragraph, Avatar, Heading, Pane | Legal.jsx | ✅ 兼容 |
| Menu | SaveBgMenuItem.jsx | ✅ 兼容 |
| Dialog, TextInput | Navigation.jsx | ✅ 兼容 |
| Table, IconButton, TextInputField | GroupManager.jsx | ✅ 兼容 |
| 所有图标组件 | GroupManager.jsx | ✅ 兼容 |

## 测试验证

### 构建测试
- ✅ Chrome 构建成功
- ✅ Firefox 构建成功
- ✅ 无编译错误

### 功能测试  
- ✅ 所有单元测试通过 (5/5)
- ✅ 核心功能正常
- ✅ 配置菜单交互正常

### 性能对比
- 包体积: **1,773.69 kB** (与升级前基本一致)
- 构建时间: ~12秒
- 无明显性能下降

## 风险评估

### 低风险 ✅
- 大部分组件API保持兼容
- 项目已有自定义组件替代方案 (CustomPane, CustomTablist等)
- 现有测试全部通过

### 已解决问题 ✅  
- React 18 兼容性问题
- glamor 安全漏洞问题
- 组件现代化升级

## 回滚计划

如果发现问题，可按以下步骤回滚：

```bash
# 1. 切换到备份分支
git checkout main

# 2. 如需回滚包版本
yarn add evergreen-ui@4.29.1

# 3. 重新构建
yarn build
```

## 后续维护

1. **监控**: 关注用户反馈和运行时错误
2. **优化**: 利用 v7 新特性进一步优化组件
3. **清理**: 移除不再需要的自定义适配组件
4. **更新**: 定期更新到 v7 的最新补丁版本

## 总结

✅ **升级成功**: Evergreen UI 从 v4.29.1 成功升级到 v7.1.9
✅ **功能完整**: 所有核心功能正常工作
✅ **向前兼容**: 用户体验无变化
✅ **技术债务**: 解决了安全漏洞和兼容性问题

升级过程顺利，项目现在运行在更现代、更安全的组件库版本上。