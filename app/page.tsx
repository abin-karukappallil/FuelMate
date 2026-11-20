"use client"

import { useEffect, useState, type FormEvent } from "react"
import { ChevronDown, Fuel, MapPin, Zap } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { defaultLocation, fuels, fuelStates, fuelTypes, type City, type FuelRate, type FuelType } from "@/lib/fuel"

type TripCost = { cost: number; quantity: number }
type ParkPlusResponse<T> = { query: string; attempt: number; data?: T; error?: string }

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
const updateDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
const labelStyle = "mb-2 block text-[10px] font-black uppercase tracking-wider text-[#555]"
const locationLabelStyle = "mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-300"
const selectStyle = "w-full rounded border-2 border-slate-300 bg-white px-2 py-2 text-sm font-bold text-slate-900 focus:border-[#d92d20] focus:outline-none"

function useParkPlus<T>(query: string, failureMessage: string) {
  const [response, setResponse] = useState<ParkPlusResponse<T> | null>(null)
  const [attempt, setAttempt] = useState(0)
  const current = response?.query === query && response.attempt === attempt ? response : null

  useEffect(() => {
    if (!query) return
    const request = new AbortController()

    async function load() {
      try {
        const reply = await fetch(`/api/fuel-prices?${query}`, { signal: request.signal })
        const data = await reply.json()
        if (!request.signal.aborted) {
          setResponse(reply.ok ? { query, attempt, data } : { query, attempt, error: data.error || failureMessage })
        }
      } catch {
        if (!request.signal.aborted) setResponse({ query, attempt, error: failureMessage })
      }
    }

    void load()
    return () => request.abort()
  }, [query, attempt, failureMessage])

  return {
    data: current?.data,
    error: current?.error,
    loading: Boolean(query && !current),
    reload: () => setAttempt((value) => value + 1),
  }
}

export default function PetrolPumpCalculator() {
  const [state, setState] = useState(defaultLocation.state)
  const [city, setCity] = useState(defaultLocation.city.code)
  const [fuel, setFuel] = useState<FuelType>("petrol")
  const [mileage, setMileage] = useState("")
  const [distance, setDistance] = useState("")
  const [result, setResult] = useState<TripCost | null>(null)
  const citiesRequest = useParkPlus<{ cities: City[] }>(
    new URLSearchParams({ state }).toString(),
    "Couldn’t load cities.",
  )
  const rateRequest = useParkPlus<FuelRate>(
    new URLSearchParams({ state, city, fuel }).toString(),
    "Couldn’t load the rate.",
  )

  const cities = citiesRequest.data?.cities ?? []
  const cityOptions = state === defaultLocation.state && !cities.some((option) => option.code === defaultLocation.city.code)
    ? [defaultLocation.city, ...cities]
    : cities
  const rate = rateRequest.data
  const { name: fuelName, unit } = fuels[fuel]
  const priceDate = rate?.updatedOn ? new Date(rate.updatedOn) : null
  const canCalculate = Boolean(rate) && [Number(mileage), Number(distance)].every((value) => Number.isFinite(value) && value > 0)

  function resetRate() {
    rateRequest.reload()
    setResult(null)
  }

  function selectState(nextState: string) {
    setState(nextState)
    setCity("")
    citiesRequest.reload()
    resetRate()
  }

  function calculatePrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!rate || !canCalculate) return

    const quantity = Number(distance) / Number(mileage)
    const cost = quantity * rate.price
    if (Number.isFinite(cost)) setResult({ quantity, cost: Math.round(cost) })
  }

  return (
    <main className="relative grid min-h-screen w-full grid-rows-[auto_1fr] gap-6 bg-[#1a1a1a] p-4 font-mono text-white sm:p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 border-x-4 border-dashed border-yellow-500" />
      </div>

      <section aria-label="Fuel location" className="relative grid w-full max-w-[360px] grid-cols-2 gap-x-3 gap-y-2 justify-self-end rounded-xl border border-white/10 bg-[#222] p-3 shadow-lg sm:p-4">
        <div className="min-w-0">
          <label htmlFor="state" className={locationLabelStyle}>State / UT</label>
          <select id="state" className={selectStyle} value={state} onChange={(event) => selectState(event.target.value)}>
            {fuelStates.map((name) => <option key={name}>{name}</option>)}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor="city" className={locationLabelStyle}>City</label>
          <select id="city" className={selectStyle} value={city} onChange={(event) => {
            setCity(event.target.value)
            resetRate()
          }}>
            <option value="">State average</option>
            {cityOptions.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}
          </select>
        </div>
        {citiesRequest.loading && <p role="status" className="col-span-2 text-xs text-slate-300">Loading cities…</p>}
        {citiesRequest.error && (
          <p role="status" className="col-span-2 text-xs text-red-300">
            {citiesRequest.error}{" "}
            <button type="button" className="font-bold underline" onClick={citiesRequest.reload}>Retry</button>
          </p>
        )}
      </section>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-[420px] place-self-center"
      >
        <div className="rounded-t-[40px] border-b-8 border-[#b91c1c] bg-[#d92d20] p-6 shadow-xl">
          <h1 className="flex items-center justify-center gap-2 text-center text-3xl font-black italic tracking-tighter">
            <Fuel className="fill-white" aria-hidden="true" /> FUEL MATE
          </h1>
        </div>

        <div className="space-y-6 border-x-[12px] border-[#d92d20] bg-[#eeeeee] p-4 shadow-2xl sm:p-8">
          <div className="rounded-lg border-4 border-[#333] bg-[#111] p-5 shadow-inner">
            <div className="text-center text-[10px] font-bold uppercase text-green-400/70">Trip cost</div>
            <div aria-live="polite" className="text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={result?.cost ?? "empty"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="break-words text-4xl font-black tracking-tighter text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)] sm:text-5xl"
                >
                  {result ? rupees.format(result.cost) : "—"}
                </motion.div>
              </AnimatePresence>
              <div className="my-3 h-px bg-green-900/50" />
              <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs font-bold text-green-400">
                <span>Fuel: {result ? `${result.quantity.toFixed(2)} ${unit}` : "—"}</span>
                <span>Rate: {rate ? `₹${rate.price.toFixed(2)}/${unit}` : rateRequest.loading ? "Loading…" : "—"}</span>
              </div>
              {priceDate && Number.isFinite(priceDate.getTime()) && (
                <div className="mt-2 text-right text-[10px] text-green-400/70">
                   <time dateTime={rate?.updatedOn ?? undefined}>{updateDate.format(priceDate)}</time>
                </div>
              )}
            </div>
            {rateRequest.error && (
              <p role="status" className="mt-3 text-xs text-yellow-300">
                {rateRequest.error}{" "}
                <button type="button" className="font-bold underline" onClick={rateRequest.reload}>Retry</button>
              </p>
            )}
          </div>

          <form className="space-y-6" onSubmit={calculatePrice}>
            <div>
              <label id="fuel-type-label" className={labelStyle}>Fuel type</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-labelledby="fuel-type-label fuel-type-value" className="flex w-full items-center justify-between rounded border-2 border-slate-300 bg-white px-4 py-3 font-bold text-slate-900 hover:bg-slate-100 focus-visible:outline-[#d92d20]">
                    <span id="fuel-type-value">{fuelName}</span>
                    <ChevronDown size={18} aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] border-2 border-black bg-white p-0 font-bold">
                  {fuelTypes.map((type) => (
                    <DropdownMenuItem key={type} onSelect={() => {
                      if (type === fuel) return
                      setFuel(type)
                      resetRate()
                    }} className="cursor-pointer p-4 uppercase text-black focus:bg-yellow-400">
                      {fuels[type].name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="mileage" className={labelStyle}>Mileage (km/{unit})</label>
                <input
                  id="mileage"
                  type="number"
                  min="0"
                  step="any"
                  required
                  onChange={(event) => {
                    setMileage(event.target.value)
                    setResult(null)
                  }}
                  className="w-full border-b-4 border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:border-[#d92d20]"
                />
              </div>
              <div>
                <label htmlFor="distance" className={labelStyle}>Distance (km)</label>
                <input
                  id="distance"
                  type="number"
                  min="0"
                  step="any"
                  required
                  onChange={(event) => {
                    setDistance(event.target.value)
                    setResult(null)
                  }}
                  className="w-full border-b-4 border-slate-300 bg-white p-3 font-bold text-slate-900 outline-none focus:border-[#d92d20]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canCalculate}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-b-8 border-slate-800 bg-[#111] py-5 font-black uppercase tracking-widest text-white transition-all enabled:hover:bg-black enabled:active:translate-y-1 enabled:active:border-b-0 disabled:opacity-50"
            >
              <Zap className="fill-yellow-400 text-yellow-400" aria-hidden="true" />
              Calculate trip cost
            </button>
          </form>
        </div>

        <div aria-hidden="true" className="flex h-12 items-center justify-around rounded-b-[20px] border-t-4 border-black/10 bg-[#d92d20] px-10 shadow-2xl">
          <div className="h-4 w-4 rounded-full bg-black/20" />
          <div className="h-4 w-4 rounded-full bg-black/20" />
          <div className="h-4 w-4 rounded-full bg-black/20" />
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          <MapPin size={10} aria-hidden="true" /> FuelMate - abinthomas.dev
        </p>
      </motion.div>
    </main>
  )
}
