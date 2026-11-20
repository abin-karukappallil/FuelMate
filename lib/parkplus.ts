import type { City, FuelRate, FuelType } from "@/lib/fuel"

const parkPlus = "https://parkplus.io"
const cityDirectory = "https://vehicle-verticals.parkplus.io/api/v1/city/fuels-prices/"
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

type FuelPage = {
  unavailable?: boolean
  fuelType?: string
  locationType?: string
  locationSlug?: string
  stateName?: string
  fuelGraph?: { currentPrice?: number; updatedOn?: string } | null
}

type NextData = { buildId?: string; props?: { pageProps?: FuelPage } }

export function isCityCode(code: string) {
  return code.length <= 100 && slugPattern.test(code)
}

function stateSlug(state: string) {
  return state.toLowerCase().replace(/ (?:&|and) /g, " ").replaceAll(" ", "-")
}

function isMissing(status: number) {
  return status === 404 || status === 410
}

async function getPageData(path: string): Promise<NextData | undefined> {
  const response = await fetch(`${parkPlus}${path}`, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(5000),
  })
  if (isMissing(response.status)) return
  if (!response.ok && response.status !== 503) throw new Error(`Park+ page returned ${response.status}`)

  const html = await response.text()
  const embeddedData = html.match(/<script\b[^>]*\bid=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i)?.[1]
  if (!embeddedData) throw new Error("Park+ page is missing its Next.js data")

  const data = JSON.parse(embeddedData) as NextData
  if (data.props?.pageProps?.unavailable) return
  if (!response.ok) throw new Error(`Park+ page returned ${response.status}`)
  return data
}

async function getFuelPage(slug: string): Promise<FuelPage | undefined> {
  const path = `/fuel-price/${slug}`
  const buildId = (await getPageData("/fuel-price").catch(() => undefined))?.buildId

  if (buildId && /^[\w-]+$/.test(buildId)) {
    const response = await fetch(`${parkPlus}/_next/data/${buildId}${path}.json?slug=${slug}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    })
    // Park+ can mark a fuel as unavailable in its data while returning HTTP 503.
    if (response.ok || response.status === 503) {
      const { pageProps } = await response.json() as { pageProps?: FuelPage }
      if (pageProps?.unavailable) return
      if (response.ok && pageProps) return pageProps
    }
    if (!response.ok && !isMissing(response.status)) {
      throw new Error(`Park+ fuel data returned ${response.status}`)
    }
  }

  // A Park+ deployment can change the build ID before the cached index refreshes.
  return (await getPageData(path))?.props?.pageProps
}

export async function getFuelRate(fuel: FuelType, state: string, city: string): Promise<FuelRate | null> {
  const stateCode = stateSlug(state)
  const location = city || stateCode
  const page = await getFuelPage(`${fuel}-price-in-${location}`)
  const price = page?.fuelGraph?.currentPrice

  if (
    page?.fuelType !== fuel ||
    page.locationType !== (city ? "city" : "state") ||
    page.locationSlug?.toLowerCase() !== location ||
    !page.stateName || stateSlug(page.stateName) !== stateCode ||
    typeof price !== "number" || !Number.isFinite(price) || price <= 0
  ) {
    return null
  }

  return { price, updatedOn: page.fuelGraph?.updatedOn ?? null }
}

export async function getCities(state: string): Promise<City[]> {
  const url = new URL(cityDirectory)
  url.search = new URLSearchParams({ filter_keeplist: "true", state_code: state }).toString()
  const response = await fetch(url, {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok) throw new Error(`Park+ city directory returned ${response.status}`)

  type CityEntry = { city_code?: string; city_name?: string }
  const { data } = await response.json() as { data?: { fuel_data?: Record<string, CityEntry>[] } }
  if (!Array.isArray(data?.fuel_data)) throw new Error("Park+ city directory is missing its city list")

  const cities = new Map<string, City>()
  for (const row of data.fuel_data) {
    const city = Object.values(row).find((entry) => entry?.city_code && entry.city_name)
    if (city?.city_code && city.city_name && isCityCode(city.city_code)) {
      cities.set(city.city_code, { code: city.city_code, name: city.city_name })
    }
  }
  return [...cities.values()].sort((a, b) => a.name.localeCompare(b.name))
}
