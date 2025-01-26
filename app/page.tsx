"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import * as cheerio from "cheerio"
import { IndianRupee, Droplets, GaugeCircle, Map, Fuel } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { fadeInUp, staggerChildren, pulseAnimation } from "@/lib/enhanced-animations"

export default function EnhancedFuelPriceCalculator() {
  const [fuelPrice, setFuelPrice] = useState("")
  const [mileage, setMileage] = useState("")
  const [distance, setDistance] = useState("")
  const [selectedFuelType, setSelectedFuelType] = useState("")
  const [result, setResult] = useState("")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    async function fetchFuelPrice() {
      if (!selectedFuelType) return

      try {
        const url = "https://parkplus.io/fuel-price/kerala"
        const response = await axios.get(url)
        const $ = cheerio.load(response.data)
        const priceText = $(".markdown_with_table.markdown_with_list.markdown_content p").first().text()
        const words = priceText.split(" ")

        const petrolPrice = Number.parseFloat(words[7])
        const dieselPrice = Number.parseFloat(words[words.length - 3])

        const price = selectedFuelType === "Petrol" ? petrolPrice : dieselPrice
        setFuelPrice(price.toString())
      } catch (error) {
        console.error("Failed to fetch fuel price:", error)
        setFuelPrice("")
      }
    }

    fetchFuelPrice()
  }, [selectedFuelType])

  const calculatePrice = () => {
    if (fuelPrice && mileage && distance) {
      const totalPrice = (Number.parseInt(distance) / Number.parseInt(mileage)) * Number.parseInt(fuelPrice)
      setResult(Math.round(totalPrice).toString())
      setVisible(true)
    } else {
      setResult("")
      setVisible(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cyan-900 via-teal-800 to-emerald-900 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('/abstract-fuel.jpg')] bg-cover bg-center opacity-10"></div>
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-200 border-opacity-30"
      >
        <motion.h1 variants={fadeInUp} className="text-center text-4xl font-bold mb-8 flex items-center justify-center">
          <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-green-300 text-transparent bg-clip-text mr-2">
            Fuel Mate
          </span>
          <Fuel className="w-6 h-6 text-teal-300" />
        </motion.h1>

        <motion.div variants={staggerChildren} className="space-y-6">
          <motion.div variants={fadeInUp}>
            <label className="block mb-2 text-sm font-medium text-teal-100" htmlFor="fuel-type">
              Fuel Type
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-inner hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200">
                  <span className="flex items-center">
                    <Droplets className="mr-2 h-4 w-4" />
                    {selectedFuelType || "Select fuel type"}
                  </span>
                  <span className="ml-2 h-5 w-5 text-teal-200">▼</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full bg-teal-700 text-white">
                <DropdownMenuItem onSelect={() => setSelectedFuelType("Petrol")} className="hover:bg-teal-600">
                  Petrol
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSelectedFuelType("Diesel")} className="hover:bg-teal-600">
                  Diesel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <label className="block mb-2 text-sm font-medium text-teal-100" htmlFor="fuel-price">
              Current Fuel Price
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-300" />
              <input
                type="text"
                value={fuelPrice ? `₹${fuelPrice}` : ""}
                disabled
                className="w-full pl-10 pr-3 py-2 text-white bg-teal-600 bg-opacity-50 border border-teal-400 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <label className="block mb-2 text-sm font-medium text-teal-100" htmlFor="mileage">
              Vehicle Mileage
            </label>
            <div className="relative">
              <GaugeCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-300" />
              <input
                type="text"
                placeholder="km/litre"
                onChange={(e) => setMileage(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-white bg-teal-600 bg-opacity-50 border border-teal-400 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-300"
              />
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <label className="block mb-2 text-sm font-medium text-teal-100" htmlFor="distance">
              Travel Distance
            </label>
            <div className="relative">
              <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-300" />
              <input
                type="text"
                placeholder="km"
                onChange={(e) => setDistance(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-white bg-teal-600 bg-opacity-50 border border-teal-400 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-300"
              />
            </div>
          </motion.div>

          <motion.button
            variants={pulseAnimation}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={calculatePrice}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-400 via-teal-500 to-green-400 text-white font-bold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Calculate
          </motion.button>

          <AnimatePresence>
            {visible && (
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeInUp}
                className="mt-6 text-center"
              >
                {isNaN(Number.parseInt(result)) ? (
                  <p className="text-red-400">Please enter valid inputs</p>
                ) : (
                  <motion.div
                    className="flex flex-col items-center justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <p className="text-teal-100 mb-2">Estimated Fuel Cost:</p>
                    <p className="flex items-center text-5xl font-bold bg-gradient-to-r from-green-300 via-teal-300 to-cyan-300 text-transparent bg-clip-text">
                      <IndianRupee className="mr-2 h-8 w-8" /> {result}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}