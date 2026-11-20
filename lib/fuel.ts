export const fuels = {
  petrol: { name: "Petrol", unit: "L" },
  diesel: { name: "Diesel", unit: "L" },
  cng: { name: "CNG", unit: "kg" },
} as const

export type FuelType = keyof typeof fuels
export const fuelTypes = Object.keys(fuels) as FuelType[]

export const fuelStates = [
  "Andaman Nicobar",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
]

export type City = { code: string; name: string }
export type FuelRate = { price: number; updatedOn: string | null }

export const defaultLocation = {
  state: "Kerala",
  city: { code: "kottayam", name: "Kottayam" },
}
