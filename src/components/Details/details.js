import { useState } from "react"
import Header from "../Header/Header"
import "./details.css"

import {APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps"
import calgaryRestaurants from "../../seed"
import MapMarker from "../MapMarker/mapMarker"




export default function Details (props) {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState(calgaryRestaurants)


    /* Generate random business */
    function busyAtRandom(min, max) {
        let tempNum = Math.floor(Math.random() * (max - min) ) + min;
        if (tempNum === 1) {
            return "Empty"
        } if (tempNum === 2) {
            return "Not too busy"
        } if (tempNum === 3) {
            return "Packed"
        }
    }

    //console.log(busyAtRandom(1, 4))


    return (
        <>
            <Header/>
            <section id="detailSection">
                <h1>Phil's Bar & Burgers</h1>
                <section id="imageSection">
                    <p>Images here</p>
                </section>
                <section className="venueRankings">
                    <p className="frequencyStatus">Not too busy</p>
                    <p className="venueCost">$</p>
                    <p className="venueScore">4.3</p>
                </section>
                <section id="venueDesc">
                    <h2>About</h2>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut at lorem vitae est ornare luctus. 
                        Pellentesque a arcu nec lectus mattis euismod. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. 
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut at lorem vitae est ornare luctus. 
                        Pellentesque a arcu nec lectus mattis euismod. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. 
                    </p>
                </section>
                <section id="offersSection">
                    <hr></hr>
                    <h2>Food & Drink Offered</h2>
                    
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut at lorem vitae est ornare luctus. 
                        Pellentesque a arcu nec lectus mattis euismod. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. 
                    </p>
                    <hr></hr>
            </section>
            <section id="mapSection">
                    <h2>Location</h2>
                    
                    <APIProvider>
                        <Map
                            defaultZoom={13}
                            defaultCenter={{ lat: 51.048750547898045, lng: -114.07528577799165 }}
                            mapId={"8e0468e996c5bdf3b9dbf482"}
                            >
     {/*                        <AdvancedMarker position={{ lat: -33.860664, lng: 151.208138 }} onClick={() => setOpen(true)}>
                                <Pin/>
                            </AdvancedMarker>
                            {open && (
                                <InfoWindow position={{ lat: -33.860664, lng: 151.208138 }} onCloseClick={() => setOpen(false)}>
                                    <p>I'm in Sydney!</p>
                                </InfoWindow>
                            )} */}
                            
                            {
                                data.map((e, i) => {
                                    return (
/*                                         <>
                                        <AdvancedMarker key={i} position={{ lat: e.position.lat, lng: e.position.lng }} onClick={() => setOpen(true)}>
                                            <p className="mapMarker">O</p>
                                        </AdvancedMarker>
                                        {open && (
                                            <InfoWindow  
                                            position={{ lat: e.position.lat, lng: e.position.lng }} onCloseClick={() => setOpen(false)}>
                                                <p>I'm in Calgary!</p>
                                            </InfoWindow>
                                            )}
                                        </> */

                                        <AdvancedMarker key={i} position={{ lat: e.position.lat, lng: e.position.lng }} onClick={() => setOpen(true)}>
                                            <MapMarker frequency={busyAtRandom(1, 4)}/>
                                        </AdvancedMarker>
                                        
                                    )
                                }
                            
                            )
                                
                            }
                        </Map>
                    </APIProvider>

                    <hr></hr>
            </section>
        </section>
        </>
        

    )



}


