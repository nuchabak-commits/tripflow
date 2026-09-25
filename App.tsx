import {useEffect,useMemo,useState} from 'react';
import Sidebar from './components/Sidebar'; import Dashboard from './pages/Dashboard'; import TripPage from './pages/TripPage'; import {seedTrips} from './data/demo'; import type {Trip} from './types';
const KEY='tripflow-v02';
export default function App(){
 const [trips,setTrips]=useState<Trip[]>(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||seedTrips}catch{return seedTrips}});
 const [selected,setSelected]=useState<string|null>(null); const [section,setSection]=useState('Home');
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(trips)),[trips]);
 const trip=useMemo(()=>trips.find(t=>t.id===selected),[trips,selected]);
 const update=(next:Trip)=>setTrips(x=>x.map(t=>t.id===next.id?next:t));
 if(trip)return <TripPage trip={trip} update={update} back={()=>setSelected(null)}/>;
 return <div className="app"><Sidebar section={section} setSection={setSection} onNew={()=>setSection('New Trip')}/><Dashboard trips={trips} setTrips={setTrips} openTrip={setSelected} section={section} setSection={setSection}/></div>
}
