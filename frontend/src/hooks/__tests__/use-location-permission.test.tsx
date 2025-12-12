import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { useLocationPermission } from '../use-location-permission'
import { useLocation } from '@/contexts/location-context'
import { useAlert } from '@/components/ui/alert'

// Mock dependencies
vi.mock('@/contexts/location-context', () => ({
  useLocation: vi.fn(),
}))

vi.mock('@/components/ui/alert', () => ({
  useAlert: vi.fn(),
}))

describe('useLocationPermission', () => {
  const mockFetchLocation = vi.fn()
  const mockShowConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Default alert mock
    vi.mocked(useAlert).mockReturnValue({
      showConfirm: mockShowConfirm,
      showAlert: vi.fn(),
    } as ReturnType<typeof useAlert>)
  })

  it('위치 정보가 있으면 프롬프트 표시하지 않음', () => {
    vi.mocked(useLocation).mockReturnValue({
      latitude: 37.5665,
      longitude: 126.9780,
      isLoading: false,
      error: null,
      permissionState: 'granted' as PermissionState,
      fetchLocation: mockFetchLocation,
      clearLocation: vi.fn(),
    })

    const { result } = renderHook(() => useLocationPermission())

    expect(mockShowConfirm).not.toHaveBeenCalled()
    expect(result.current.latitude).toBe(37.5665)
  })

  it('위치 로딩 중에는 프롬프트 표시하지 않음', () => {
    vi.mocked(useLocation).mockReturnValue({
      latitude: null,
      longitude: null,
      isLoading: true,
      error: null,
      permissionState: 'prompt' as PermissionState,
      fetchLocation: mockFetchLocation,
      clearLocation: vi.fn(),
    })

    renderHook(() => useLocationPermission())

    expect(mockShowConfirm).not.toHaveBeenCalled()
  })

  it('위치 정보 없을 때 자동으로 권한 프롬프트 표시', () => {
    vi.mocked(useLocation).mockReturnValue({
      latitude: null,
      longitude: null,
      isLoading: false,
      error: null,
      permissionState: 'prompt' as PermissionState,
      fetchLocation: mockFetchLocation,
      clearLocation: vi.fn(),
    })

    renderHook(() => useLocationPermission())

    expect(mockShowConfirm).toHaveBeenCalledWith({
      title: '📍 위치 권한 필요',
      message: '이 기능을 사용하려면 위치 권한이 필요합니다.\n\n권한을 허용하시겠습니까?',
      type: 'info',
      confirmText: '허용하기',
      cancelText: '나중에',
      onConfirm: expect.any(Function),
    })
  })

  it('커스텀 프롬프트 메시지 사용', () => {
    vi.mocked(useLocation).mockReturnValue({
      latitude: null,
      longitude: null,
      isLoading: false,
      error: null,
      permissionState: 'prompt' as PermissionState,
      fetchLocation: mockFetchLocation,
      clearLocation: vi.fn(),
    })

    renderHook(() =>
      useLocationPermission({
        promptTitle: '커스텀 타이틀',
        promptMessage: '커스텀 메시지',
      })
    )

    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '커스텀 타이틀',
        message: '커스텀 메시지',
      })
    )
  })

  it('autoPrompt=false 시 프롬프트 표시하지 않음', () => {
    vi.mocked(useLocation).mockReturnValue({
      latitude: null,
      longitude: null,
      isLoading: false,
      error: null,
      permissionState: 'prompt' as PermissionState,
      fetchLocation: mockFetchLocation,
      clearLocation: vi.fn(),
    })

    renderHook(() => useLocationPermission({ autoPrompt: false }))

    expect(mockShowConfirm).not.toHaveBeenCalled()
  })

  it('권한 거부 상태에서는 프롬프트 표시하지 않음', () => {
    vi.mocked(useLocation).mockReturnValue({
      latitude: null,
      longitude: null,
      isLoading: false,
      error: new Error('Permission denied'),
      permissionState: 'denied' as PermissionState,
      fetchLocation: mockFetchLocation,
      clearLocation: vi.fn(),
    })

    renderHook(() => useLocationPermission())

    expect(mockShowConfirm).not.toHaveBeenCalled()
  })

  it('프롬프트 확인 시 위치 정보 요청', () => {
    vi.mocked(useLocation).mockReturnValue({
      latitude: null,
      longitude: null,
      isLoading: false,
      error: null,
      permissionState: 'prompt' as PermissionState,
      fetchLocation: mockFetchLocation,
      clearLocation: vi.fn(),
    })

    renderHook(() => useLocationPermission())

    const confirmCall = mockShowConfirm.mock.calls[0][0]
    confirmCall.onConfirm()

    expect(mockFetchLocation).toHaveBeenCalled()
  })
})
