import axios from 'axios'
import { searchPlaces } from './geocodingService'

vi.mock('axios')
const mockedGet = vi.mocked(axios.get)

describe('searchPlaces', () => {
  beforeEach(() => mockedGet.mockReset())

  it('calls the Open-Meteo geocoding search endpoint with the typed name', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: [] } })
    const controller = new AbortController()

    await searchPlaces('Athens', controller.signal)

    const [url, config] = mockedGet.mock.calls[0]
    expect(url).toBe('https://geocoding-api.open-meteo.com/v1/search')
    expect(config?.params).toMatchObject({ name: 'Athens', count: 5, language: 'en', format: 'json' })
    expect(config?.signal).toBe(controller.signal)
  })

  it('maps results to place suggestions', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 264371, name: 'Athens', latitude: 37.98376, longitude: 23.72784,
            admin1: 'Attica', country: 'Greece', elevation: 62, timezone: 'Europe/Athens',
          },
        ],
      },
    })

    expect(await searchPlaces('Ath')).toEqual([
      { id: 264371, name: 'Athens', latitude: 37.98376, longitude: 23.72784, admin1: 'Attica', country: 'Greece' },
    ])
  })

  it('returns [] when nothing matches (the API omits "results" entirely)', async () => {
    mockedGet.mockResolvedValueOnce({ data: { generationtime_ms: 0.1 } })
    expect(await searchPlaces('zzzzqqq')).toEqual([])
  })

  it('propagates network errors', async () => {
    mockedGet.mockRejectedValueOnce(new Error('Network Error'))
    await expect(searchPlaces('Athens')).rejects.toThrow('Network Error')
  })
})
