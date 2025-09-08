import { expect, test, describe, beforeEach } from 'vitest'
import storager from '../storager'

describe('Storager Utils', () => {
  beforeEach(() => {
    // 在每个测试前清理localStorage
    localStorage.clear()
  })

  test('应该能够存储和读取数据', () => {
    const testData = { theme: 'dark' }
    
    storager.set(testData)
    
    storager.get(['theme'], (result) => {
      expect(result.theme).toEqual('dark')
    })
  })

  test('应该处理不存在的键', () => {
    storager.get(['nonexistent'], (result) => {
      expect(result).toEqual({})
    })
  })

  test('应该能够存储不同类型的数据', () => {
    // 测试字符串
    storager.set({ string: 'hello' })
    storager.get(['string'], (result) => {
      expect(result.string).toBe('hello')
    })
    
    // 测试数字
    storager.set({ number: 42 })
    storager.get(['number'], (result) => {
      expect(result.number).toBe(42)
    })
    
    // 测试布尔值
    storager.set({ boolean: true })
    storager.get(['boolean'], (result) => {
      expect(result.boolean).toBe(true)
    })
    
    // 测试数组
    storager.set({ array: [1, 2, 3] })
    storager.get(['array'], (result) => {
      expect(result.array).toEqual([1, 2, 3])
    })
  })
})