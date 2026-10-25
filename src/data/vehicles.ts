import React from 'react'

export interface Vehicle {
  id: string
  name: string
  icon: React.ReactNode
  capacity: string
  perKm: number
}

// Stroke-based SVG icons — 20×20 viewBox, strokeWidth 1.8
const svgProps = {
  width: 20, height: 20, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

// Auto / 3-wheeler
const IcAuto = () => React.createElement('svg', svgProps,
  React.createElement('rect', { x: 1, y: 8, width: 14, height: 9, rx: 2 }),
  React.createElement('path', { d: 'M15 11h3l3 3v3h-6' }),
  React.createElement('circle', { cx: 5, cy: 19, r: 2 }),
  React.createElement('circle', { cx: 18, cy: 19, r: 2 }),
)

// Cab / standard car
const IcCab = () => React.createElement('svg', svgProps,
  React.createElement('rect', { x: 1, y: 3, width: 15, height: 13 }),
  React.createElement('polygon', { points: '16 8 20 8 23 11 23 16 16 16 16 8' }),
  React.createElement('circle', { cx: 5.5, cy: 18.5, r: 2.5 }),
  React.createElement('circle', { cx: 18.5, cy: 18.5, r: 2.5 }),
)

// SUV (slightly taller cab shape)
const IcSuv = () => React.createElement('svg', svgProps,
  React.createElement('rect', { x: 1, y: 5, width: 15, height: 12 }),
  React.createElement('polygon', { points: '16 7 20 7 23 11 23 17 16 17 16 7' }),
  React.createElement('circle', { cx: 5.5, cy: 19.5, r: 2.5 }),
  React.createElement('circle', { cx: 18.5, cy: 19.5, r: 2.5 }),
)

// Bike / motorcycle (simplified)
const IcBike = () => React.createElement('svg', svgProps,
  React.createElement('circle', { cx: 5, cy: 17, r: 3 }),
  React.createElement('circle', { cx: 19, cy: 17, r: 3 }),
  React.createElement('path', { d: 'M5 17l4-8h5l2 4' }),
  React.createElement('path', { d: 'M12 9l2 4h5' }),
)

// Car (delivery)
const IcCar = () => React.createElement('svg', svgProps,
  React.createElement('rect', { x: 1, y: 3, width: 15, height: 13 }),
  React.createElement('polygon', { points: '16 8 20 8 23 11 23 16 16 16 16 8' }),
  React.createElement('circle', { cx: 5.5, cy: 18.5, r: 2.5 }),
  React.createElement('circle', { cx: 18.5, cy: 18.5, r: 2.5 }),
)

// Van / tempo
const IcTempo = () => React.createElement('svg', svgProps,
  React.createElement('rect', { x: 1, y: 4, width: 22, height: 14, rx: 2 }),
  React.createElement('circle', { cx: 6, cy: 19, r: 2 }),
  React.createElement('circle', { cx: 18, cy: 19, r: 2 }),
  React.createElement('line', { x1: 9, y1: 4, x2: 9, y2: 18 }),
)

// Tractor
const IcTractor = () => React.createElement('svg', svgProps,
  React.createElement('rect', { x: 3, y: 8, width: 10, height: 8, rx: 1 }),
  React.createElement('circle', { cx: 7, cy: 18, r: 3 }),
  React.createElement('circle', { cx: 19, cy: 19, r: 2 }),
  React.createElement('path', { d: 'M13 10h5l2 4v4h-7' }),
  React.createElement('path', { d: 'M8 4v4' }),
)

// Truck
const IcTruck = () => React.createElement('svg', svgProps,
  React.createElement('rect', { x: 1, y: 3, width: 15, height: 13 }),
  React.createElement('polygon', { points: '16 8 20 8 23 11 23 16 16 16 16 8' }),
  React.createElement('circle', { cx: 5.5, cy: 18.5, r: 2.5 }),
  React.createElement('circle', { cx: 18.5, cy: 18.5, r: 2.5 }),
  React.createElement('rect', { x: 1, y: 7, width: 15, height: 9, rx: 0 }),
)

export const RIDE_VEHICLES: Vehicle[] = [
  { id: 'auto', name: 'Auto', icon: React.createElement(IcAuto), capacity: '1–3 people', perKm: 10 },
  { id: 'cab', name: 'Cab', icon: React.createElement(IcCab), capacity: '1–4 people', perKm: 14 },
  { id: 'suv', name: 'SUV', icon: React.createElement(IcSuv), capacity: '1–6 people', perKm: 18 },
]

export const DELIVERY_VEHICLES: Vehicle[] = [
  { id: 'bike', name: 'Bike', icon: React.createElement(IcBike), capacity: 'Up to 15 kg', perKm: 8 },
  { id: 'car', name: 'Car', icon: React.createElement(IcCar), capacity: 'Up to 100 kg', perKm: 12 },
  { id: 'tempo', name: 'Tempo', icon: React.createElement(IcTempo), capacity: 'Up to 1,200 kg', perKm: 22 },
  { id: 'tractor', name: 'Tractor', icon: React.createElement(IcTractor), capacity: 'Farm / bulk', perKm: 35 },
  { id: 'truck', name: 'Truck', icon: React.createElement(IcTruck), capacity: 'Up to 10,000 kg', perKm: 45 },
]
