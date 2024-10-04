import { useState } from 'react'
import WaveCanvas from './WaveCanvas'

function Controller({image}) { 

    // const bandHeight = 10;
    // const k = 100;
    // const maxAmp = 10;
    // const frequency = 0.5;
    // const stroke = 2;


    const [bandHeight, setBandHeight] = useState(10);
    const [k, setK] = useState(100);
    const [maxAmp, setMaxAmp] = useState(10);
    const [frequency, setFrequency]  = useState(0.5);
    const [stroke, setStroke] = useState(2);






    return (
        <>
            <div>
                <input 
                    type="range"
                    min="1"
                    max="50"
                    value={bandHeight}
                    onChange={(event) => setBandHeight(event.target.value)}
                />
            </div>
            <WaveCanvas image={image} bandHeight={bandHeight}/>
        </>
    )
}

export default Controller;