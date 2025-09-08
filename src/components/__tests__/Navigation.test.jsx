import { render, screen } from '@testing-library/react'
import { expect, test, describe } from 'vitest'
import Navigation from '../Navigation'

describe('Navigation Component', () => {
  const mockProps = {
    isDarkMode: false,
    links: [
      { name: 'Google', url: 'https://google.com' },
      { name: 'GitHub', url: 'https://github.com' }
    ],
    onLinksChange: () => {}
  }

  test('应该正常渲染导航组件', () => {
    render(<Navigation {...mockProps} />)
    expect(screen.getByText('默认列')).toBeInTheDocument()
  })

  test('应该渲染传入的链接', () => {
    render(<Navigation {...mockProps} />)
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  test('应该显示添加按钮', () => {
    render(<Navigation {...mockProps} />)
    // 检查是否有添加按钮 (FaPlus 图标)
    const addButtons = document.querySelectorAll('.add-link-row-btn, .add-item')
    expect(addButtons.length).toBeGreaterThan(0)
  })

  test('链接应该具有正确的href属性', () => {
    render(<Navigation {...mockProps} />)
    const googleLink = screen.getByText('Google').closest('a')
    const githubLink = screen.getByText('GitHub').closest('a')
    
    expect(googleLink).toHaveAttribute('href', 'https://google.com')
    expect(githubLink).toHaveAttribute('href', 'https://github.com')
  })
})