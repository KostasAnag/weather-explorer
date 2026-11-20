import { act, renderHook } from '@testing-library/react'
import { useGeolocation } from './useGeolocation'

type Success = (pos: GeolocationPosition) => void
type Failure = (err: { code: number }) => void

let getCurrentPosition: ReturnType<typeof vi.fn>

function stubGeolocation() {
  getCurrentPosition = vi.fn()
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
}

const position = (latitude: number, longitude: number) =>
  ({ coords: { latitude, longitude } }) as GeolocationPosition

describe('useGeolocation', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('starts idle and does not ask the browser until locate() is called', () => {
    stubGeolocation()
    const { result } = renderHook(() => useGeolocation())
    expect(result.current.state).toEqual({ status: 'idle' })
    expect(getCurrentPosition).not.toHaveBeenCalled()
  })

  it('goes loading, then success with rounded coordinates', () => {
    stubGeolocation()
    const { result } = renderHook(() => useGeolocation())

    act(() => result.current.locate())
    expect(result.current.state).toEqual({ status: 'loading' })

    act(() => (getCurrentPosition.mock.calls[0][0] as Success)(position(37.98381234, 23.72754321)))
    expect(result.current.state).toEqual({
      status: 'success',
      coordinates: { latitude: 37.9838, longitude: 23.7275 },
    })
  })

  it.each([
    [1, 'denied'],
    [2, 'unavailable'],
    [3, 'timeout'],
  ])('maps browser error code %i to reason "%s"', (code, reason) => {
    stubGeolocation()
    const { result } = renderHook(() => useGeolocation())
    act(() => result.current.locate())
    act(() => (getCurrentPosition.mock.calls[0][1] as Failure)({ code }))
    expect(result.current.state).toEqual({ status: 'error', reason })
  })

  it('reports "unsupported" when the browser has no Geolocation API', () => {
    vi.stubGlobal('navigator', {})
    const { result } = renderHook(() => useGeolocation())
    act(() => result.current.locate())
    expect(result.current.state).toEqual({ status: 'error', reason: 'unsupported' })
  })

  it('creates a new success object on every request so the map re-centers', () => {
    stubGeolocation()
    const { result } = renderHook(() => useGeolocation())

    act(() => result.current.locate())
    act(() => (getCurrentPosition.mock.calls[0][0] as Success)(position(1, 2)))
    const first = result.current.state

    act(() => result.current.locate())
    act(() => (getCurrentPosition.mock.calls[1][0] as Success)(position(1, 2)))
    expect(result.current.state).not.toBe(first)
  })

  it('notifies an onSuccess callback with the coordinates', () => {
    stubGeolocation()
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useGeolocation(onSuccess))
    act(() => result.current.locate())
    act(() => (getCurrentPosition.mock.calls[0][0] as Success)(position(1.23456, 2.34567)))
    expect(onSuccess).toHaveBeenCalledWith({ latitude: 1.2346, longitude: 2.3457 })
  })
})
