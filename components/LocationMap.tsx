'use client';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = L.divIcon({ className: 'ves-marker', html: '<div>VES</div>', iconSize: [42,42], iconAnchor:[21,42] });
function Picker({onPick}:{onPick:(lat:number,lng:number)=>void}){ useMapEvents({click(e){onPick(e.latlng.lat,e.latlng.lng)}}); return null; }
export default function LocationMap({lat,lng,onPick}:{lat:number,lng:number,onPick:(lat:number,lng:number)=>void}){
 return <MapContainer key={`${lat.toFixed(3)}-${lng.toFixed(3)}`} center={[lat,lng]} zoom={15} scrollWheelZoom className="map">
  <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={[lat,lng]} icon={icon}/><Picker onPick={onPick}/>
 </MapContainer>
}
