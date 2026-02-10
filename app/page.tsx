"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import * as cheerio from "cheerio"
import { Fuel, ChevronDown, Zap, MapPin } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

export default function PetrolPumpCalculator() {
  const [fuelPrice, setFuelPrice] = useState("")
  const [mileage, setMileage] = useState("")
  const [distance, setDistance] = useState("")
  const [selectedFuelType, setSelectedFuelType] = useState("")
  const [result, setResult] = useState("")
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchFuelPrice() {
      if (!selectedFuelType) return
      setLoading(true)

      try {
        const url = "https://parkplus.io/fuel-price/petrol-diesel-price-in-kottayam"
        const response = await axios.get(url)
        const $ = cheerio.load(response.data)

        let petrolPrice: number | null = null
        let dieselPrice: number | null = null
        const todayTd = $('td').filter(function () {
          return $(this).text().trim().toLowerCase() === "today"
        }).first()

        if (todayTd.length) {
          const tr = todayTd.closest("tr")
          const tds = tr.find("td")
          const petrolText = $(tds.get(1)).text().trim()
          const dieselText = $(tds.get(2)).text().trim()
          
          petrolPrice = parseFloat(petrolText.replace(/[^\d.]/g, "")) || null
          dieselPrice = parseFloat(dieselText.replace(/[^\d.]/g, "")) || null
        }

        const finalPrice = selectedFuelType === "Petrol" ? petrolPrice : dieselPrice
        
        if (finalPrice) {
          setFuelPrice(finalPrice.toString())
        }
      } catch (error) {
        console.error("Failed to fetch fuel price:", error)
        setFuelPrice("Error")
      } finally {
        setLoading(false)
      }
    }

    fetchFuelPrice()
  }, [selectedFuelType])

  const calculatePrice = () => {
    if (fuelPrice && mileage && distance && fuelPrice !== "Error") {
      const totalPrice = (parseFloat(distance) / parseFloat(mileage)) * parseFloat(fuelPrice)
      setResult(Math.round(totalPrice).toString())
      setVisible(true)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#1a1a1a] text-white flex items-center justify-center p-4 font-mono">
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full border-x-4 border-dashed border-yellow-500" />
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-[420px]"
      >
        <div className="bg-[#d92d20] rounded-t-[40px] p-6 border-b-8 border-[#b91c1c] shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-1">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-white'}`} />
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>
            <div className="bg-black/20 px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase">
              {selectedFuelType ? `${selectedFuelType} Grade` : "Standby"}
            </div>
          </div>
          <h1 className="text-center text-3xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-white">
            <Fuel className="fill-white" />FUEL MATE
          </h1>
        </div>

        <div className="bg-[#eeeeee] p-8 space-y-8 shadow-2xl relative border-x-[12px] border-[#d92d20]">
          
          <div className="bg-[#111] rounded-lg p-6 shadow-inner border-4 border-[#333] relative">
            <div className="absolute top-2 right-4 text-[8px] text-green-500/50 font-bold uppercase tracking-tighter">TOTAL ₹</div>
            <div className="flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={result}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-5xl font-black text-green-400 tracking-tighter drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]"
                >
                  {visible ? `₹${result}` : "0000"}
                </motion.span>
              </AnimatePresence>
              <div className="w-full h-px bg-green-900/30 my-3" />
              <div className="flex justify-between w-full text-[10px] text-green-700 font-bold px-1 uppercase">
                <span>Ltrs: {visible ? (parseFloat(distance)/parseFloat(mileage)).toFixed(2) : "0.00"}</span>
                <span>Rate: ₹{fuelPrice || "0.00"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <label className="text-[10px] font-black text-[#555] uppercase tracking-wider mb-2 block">Fuel Type</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-slate-300 text-slate-900 rounded font-bold hover:bg-slate-100 transition-all outline-none">
                    {selectedFuelType || "SELECT NOZZLE"}
                    <ChevronDown size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[300px] bg-white border-2 border-black p-0 font-bold">
                  <DropdownMenuItem onSelect={() => setSelectedFuelType("Petrol")} className="p-4 hover:bg-yellow-400 text-black cursor-pointer">PETROL</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedFuelType("Diesel")} className="p-4 hover:bg-black hover:text-white text-black cursor-pointer">DIESEL</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-[#555] uppercase tracking-wider mb-2 block">Mileage</label>
                <input 
                  type="number"
                  onChange={(e) => setMileage(e.target.value)}
                  className="w-full p-3 bg-white border-b-4 border-slate-300 text-slate-900 focus:border-[#d92d20] outline-none font-bold placeholder:text-slate-300"
                  placeholder="km/L"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#555] uppercase tracking-wider mb-2 block">Distance</label>
                <input 
                  type="number" 
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full p-3 bg-white border-b-4 border-slate-300 text-slate-900 focus:border-[#d92d20] outline-none font-bold placeholder:text-slate-300"
                  placeholder="km"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={calculatePrice}
            disabled={loading}
            className="w-full bg-[#111] hover:bg-black text-white py-5 rounded-xl font-black uppercase tracking-widest border-b-8 border-slate-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Zap className={`text-yellow-400 fill-yellow-400 ${loading ? 'animate-bounce' : ''}`} />
            Pump {selectedFuelType}
          </button>
        </div>

        <div className="bg-[#d92d20] h-12 rounded-b-[20px] shadow-2xl border-t-4 border-black/10 flex items-center justify-around px-10">
          <div className="w-4 h-4 rounded-full bg-black/20" />
          <div className="w-4 h-4 rounded-full bg-black/20" />
          <div className="w-4 h-4 rounded-full bg-black/20" />
        </div>

        <div className="text-center mt-6">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
             <MapPin size={10} /> FuelMate - abinthomas.dev           </p>
        </div>
      </motion.div>
    </div>
  )
}