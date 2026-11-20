import { fuelStates, fuelTypes } from "@/lib/fuel"
import { getCities, getFuelRate, isCityCode } from "@/lib/parkplus"

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const state = params.get("state")
  const city = params.get("city") ?? ""
  const requestedFuel = params.get("fuel")
  const fuel = fuelTypes.find((type) => type === requestedFuel)

  if (!state || !fuelStates.includes(state)) {
    return Response.json({ error: "Choose a supported state or union territory." }, { status: 400 })
  }
  if ((requestedFuel !== null && !fuel) || (city && (!fuel || !isCityCode(city)))) {
    return Response.json({ error: "Choose a valid fuel and city." }, { status: 400 })
  }

  try {
    if (!fuel) return Response.json({ cities: await getCities(state) })

    const rate = await getFuelRate(fuel, state, city)
    if (!rate) return Response.json({ error: "Park+ has no rate for this fuel and location." }, { status: 404 })
    return Response.json(rate)
  } catch {
    return Response.json({ error: fuel ? "Couldn’t load the Park+ rate." : "Couldn’t load cities from Park+." }, { status: 502 })
  }
}
