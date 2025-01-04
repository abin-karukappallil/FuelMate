"use client"
import * as React from 'react';
import { Input } from '@mui/base/Input';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { useEffect } from 'react';
import ShimmerButton from '../components/ui/shimmer-button';
import {IndianRupee} from 'lucide-react';

export default function Page() {
const [result, setResult] = React.useState('');
const [fuelPrice, setFuelPrice] = React.useState('');
const [mileage, setMileage] = React.useState('');
const [distance, setDistance] = React.useState('');
const [visible, setVisible] = React.useState(false);
  useEffect(() => {
    async function getFuelPrice() {
      try {
        const url = 'https://parkplus.io/fuel-price/petrol-diesel-price-in-kottayam';
        const response = await axios.get(url);
        const load = cheerio.load(response.data);
        const priceSpan = load('td[itemprop="description"]').eq(1);
        if (priceSpan.length) {
          const fuelPrice = priceSpan.text().trim();
          setFuelPrice(fuelPrice);
        } else {
          throw new Error('not found');
        }
      } catch (error) {
        console.error(error);
        throw new Error(`Failed`);
        
      }
    }
    getFuelPrice();
  },[]);
 
  function calculatePrice(){
    console.log(fuelPrice, mileage, distance);
     const price = (parseInt(distance)/parseInt(mileage))*parseInt(fuelPrice);
     setResult(price.toString());
     console.log(result)
  }
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-emerald-500/10 opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,50,255,0.15),transparent_50%)]" />
      <div className="absolute top-45 left-[40vw] w-96 h-80 bg-[radial-gradient(circle,rgba(120,50,255,0.15),transparent_50%)]" />
<div className="absolute top-0 right-[50vw] w-96 h-80 bg-[radial-gradient(circle,rgba(120,50,255,0.15),transparent_50%)]" />
<div className="absolute bottom-0 left-0 w-96 h-80 bg-[radial-gradient(circle,rgba(120,50,255,0.15),transparent_50%)]" />
<div className="absolute bottom-0 right-0 w-96 h-80 bg-[radial-gradient(circle,rgba(120,50,255,0.15),transparent_50%)]" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <h1 className="text-center text-6xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-pink-400 text-transparent bg-clip-text">
          Fuel Mate
        </h1>
        
        <p className="text-gray-400 text-center mt-6 max-w-2xl mx-auto">
        Your pocket companion for efficient journeys! Unlock the power of smart mileage tracking with simplicity at its core. Say goodbye to fuel-related worries and hello to hassle-free travels. FuelMate, where every mile counts, and your savings soar. Let the journey begin!
        </p>
        <div className='flex flex-col justify-center text-slate-200 items-center mt-10 '>
         
         <label className='mb-3' htmlFor="fuel price">Current Fuel price</label>
        <Input
      className={'dark'}
      slotProps={{
        input: {
          className:
            'md:w-80 w-60 text-sm font-sans font-normal leading-5 px-3 py-2 rounded-lg shadow-md shadow-slate-100 dark:shadow-slate-900 focus:shadow-outline-purple dark:focus:shadow-outline-purple focus:shadow-lg border border-solid border-slate-300 hover:border-purple-500 dark:hover:border-purple-500 focus:border-purple-500 dark:focus:border-purple-500 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus-visible:outline-0 hover:transform hover:scale-125 transition-transform duration-300',
        },
      }}
      aria-label="Fuel price"
      value={fuelPrice}
      disabled
    />
      <label className='mb-3 mt-3' htmlFor="fuel price">Enter Milleage of your vehicle</label>
        <Input
      className={'dark'}
      slotProps={{
        input: {
          className:
            'hover:scale-125 transition-transform duration-300 md:w-80 w-60 text-sm font-sans font-normal leading-5 px-3 py-2 rounded-lg shadow-md shadow-slate-100 dark:shadow-slate-900 focus:shadow-outline-purple dark:focus:shadow-outline-purple focus:shadow-lg border border-solid border-slate-300 hover:border-purple-500 dark:hover:border-purple-500 focus:border-purple-500 dark:focus:border-purple-500 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus-visible:outline-0 hover:transform(scale-105)',
        },
      }}
      aria-label="Fuel price"
      placeholder='km/litre'
      onChange={(e)=>setMileage(e.target.value)}
    />
      <label className='mb-3 mt-3' htmlFor="fuel price">Enter the distance of travel</label>
        <Input
      className={'dark'}
      slotProps={{
        input: {
          className:
            'hover:scale-125 transition-transform duration-300 md:w-80 w-60 text-sm font-sans font-normal leading-5 px-3 py-2 rounded-lg shadow-md shadow-slate-100 dark:shadow-slate-900 focus:shadow-outline-purple dark:focus:shadow-outline-purple focus:shadow-lg border border-solid border-slate-300 hover:border-purple-500 dark:hover:border-purple-500 focus:border-purple-500 dark:focus:border-purple-500 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus-visible:outline-0 hover:transform(scale-105)',
        },
      }}
      aria-label="Fuel price"
      placeholder='km'
      onChange={(e)=>setDistance(e.target.value)}
    />
  <ShimmerButton className='hover:scale-75 transition-transform duration-300' onClick={()=>{calculatePrice();setVisible(true)}} >Calculate</ShimmerButton>

        </div>
        <div>
          {visible && 
          <div className='flex felx-col justify-center items-center text-center mt-5 text-white text-2xl'>
           {isNaN(parseInt(result)) ? <p className='text-red-700 text-sm'>ENTER A VALID INPUT</p> :<p className='flex flex-row justify-center items-center text-4xl'><IndianRupee />{parseInt(result)}</p>}
            </div>}
        </div>
      </div>
    </div>
  )
}

