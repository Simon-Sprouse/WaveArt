import { useState } from 'react';
import Controller from './Controller';

function Uploader() { 

    const [image, setImage] = useState(null);

    function handleUpload(event) { 
        const file = event.target.files[0];
        if (file) { 
            const reader = new FileReader();
            reader.onload = () => { 
                const img = new Image();
                img.src = reader.result;
                img.onload = () => { 
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) { 
                        const avg = Math.floor((data[i] + data[i+1] + data[i+2]) / 3);
                        data[i] = avg;
                        data[i + 1] = avg;
                        data[i + 2] = avg;
                    }

                    ctx.putImageData(imageData, 0, 0);
                    const grayScaleImage = canvas.toDataURL();
                    setImage(grayScaleImage);


                }
            };
            reader.readAsDataURL(file);
        }
    };



    return (
        <>
            <input type="file" onChange={handleUpload} accept="image/*" />
            {image && <Controller key={image} image={image} />}
        </>
    )
}

export default Uploader;