export interface Vehicle {
  id: string
  name: string
  icon: string
  capacity: string
  perKm: number
}

export const RIDE_VEHICLES: Vehicle[] = [
  { id: 'auto', name: 'Auto', icon: '🛺', capacity: '1–3 people', perKm: 10 },
  { id: 'cab', name: 'Cab', icon: '🚗', capacity: '1–4 people', perKm: 14 },
  { id: 'suv', name: 'SUV', icon: '🚙', capacity: '1–6 people', perKm: 18 },
]

export const DELIVERY_VEHICLES: Vehicle[] = [
  { id: 'bike', name: 'Bike', icon: '🏍️', capacity: 'Up to 15 kg', perKm: 8 },
  { id: 'car', name: 'Car', icon: '🚗', capacity: 'Up to 100 kg', perKm: 12 },
  { id: 'tempo', name: 'Tempo', icon: '🚐', capacity: 'Up to 1,200 kg', perKm: 22 },
  { id: 'tractor', name: 'Tractor', icon: '🚜', capacity: 'Farm / bulk', perKm: 35 },
  { id: 'truck', name: 'Truck', icon: '🚛', capacity: 'Up to 10,000 kg', perKm: 45 },
]
