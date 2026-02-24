

import "./mapMarker.css"

export default function MapMarker (props) {

    

    return (
        <div className={"mapMarker" + " " + props.frequency} >
            {props.frequency}
        </div>
    )
} 