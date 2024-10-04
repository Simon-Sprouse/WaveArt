import { useState } from 'react';
import WaveCanvas from './WaveCanvas';

function Uploader() { 

    const [image, setImage] = useState(null);

    function handleUpload(event) { 
        const file = event.target.files[0];
        if (file) { 
            const reader = new FileReader();
            reader.onload = () => { 
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };



    return (
        <>
            <input type="file" onChange={handleUpload} accept="image/*" />
            {image && <WaveCanvas key={image} image={image} />}
        </>
    )
}

export default Uploader;