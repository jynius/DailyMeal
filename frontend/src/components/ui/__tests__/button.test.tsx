import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button Component', () => {
  it('기본 버튼 렌더링', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('variant prop에 따라 스타일 적용', () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    let button = screen.getByText('Default')
    expect(button.className).toContain('bg-primary')

    rerender(<Button variant="destructive">Destructive</Button>)
    button = screen.getByText('Destructive')
    expect(button.className).toContain('bg-destructive')

    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByText('Outline')
    expect(button.className).toContain('border')
  })

  it('size prop에 따라 크기 조정', () => {
    const { rerender } = render(<Button size="default">Default</Button>)
    let button = screen.getByText('Default')
    expect(button.className).toContain('h-10')

    rerender(<Button size="sm">Small</Button>)
    button = screen.getByText('Small')
    expect(button.className).toContain('h-8')

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByText('Large')
    expect(button.className).toContain('h-12')
  })

  it('disabled 상태 처리', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByText('Disabled')
    expect(button).toBeDisabled()
    expect(button.className).toContain('disabled:opacity-50')
  })

  it('클릭 이벤트 처리', async () => {
    const user = userEvent.setup()
    let clicked = false
    const handleClick = () => { clicked = true }

    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByText('Click me')
    
    await user.click(button)
    expect(clicked).toBe(true)
  })

  it('커스텀 className 병합', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByText('Custom')
    expect(button.className).toContain('custom-class')
    expect(button.className).toContain('inline-flex') // 기본 클래스도 유지
  })

  it('type 속성 전달', () => {
    render(<Button type="submit">Submit</Button>)
    const button = screen.getByText('Submit')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('icon 사이즈 variant', () => {
    render(<Button size="icon">🔍</Button>)
    const button = screen.getByText('🔍')
    expect(button.className).toContain('h-10')
    expect(button.className).toContain('w-10')
  })
})
