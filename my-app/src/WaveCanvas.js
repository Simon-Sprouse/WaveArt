import { useRef, useEffect } from 'react'



function WaveCanvas({ image, bandHeight, maxAmp, frequency, stroke, k }) { 

    const canvasRef = useRef(null);
    const workerRef = useRef(null);


    useEffect(() => { 

        displayImage();


        workerRef.current = new Worker(new URL("./waveCanvasWorker.js", import.meta.url));

        workerRef.current.onmessage = (event) => { 
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            resetCanvas();

            const imageBitMap = event.data;
            ctx.drawImage(imageBitMap, 0, 0);
        };

        return () => { 
            if (workerRef.current) { 
                workerRef.current.terminate();
            }
        };


    }, []);




    function displayImage() { 
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (image) { 

            const img = new Image();
            img.src = image;
            img.onload = () => { 


                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);



            }
        }
    }

    function resetCanvas() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        // gradient.addColorStop(0, "purple");
        // gradient.addColorStop(0.5, "violet");
        // gradient.addColorStop(1, "pink");

        // ctx.fillStyle = gradient;
        // ctx.fillRect(0, 0, canvas.width, canvas.height);


    }


    function getAmplitudes() { 

        if (!image) {
            return;
        }

        const canvas = canvasRef.current;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        workerRef.current.postMessage({
            image, 
            bandHeight,
            maxAmp,
            frequency,
            stroke,
            k,
            canvasWidth,
            canvasHeight
        });
      
    }


   
    useEffect(() => {

        function handleKeyDown(event) { 
            if (event.key == "Enter") { 
                // drawWave();
            }
            else if (event.key == " ") { 
                resetCanvas();
            }
            else if (event.key == "1") { 
                displayImage();
            }
            else if (event.key == "a") { 
                getAmplitudes();
            }
        }


        document.addEventListener("keydown", handleKeyDown);
        return (() => { 
            document.removeEventListener("keydown", handleKeyDown);
        })
    })


    useEffect(() => {
        resetCanvas();
        getAmplitudes();
    })



    return (
        <>
          <canvas ref={canvasRef} height="400" width="800"></canvas>
        </>
    )
}


export default WaveCanvas;





/*

Ok so here's what the fuck I'm doing


I have a grayscale image and also a wave drawing function

I need to get each horizontal band from the image.
I then need to separate the horizontal band into chunks
    So each band is now a row of k squares
I need to calculate the average grayscale value in each square
Then I need to use a smoothing function to create a continuous flow
Then I need the drawWave function to use this flow to set amplitude




Ok so here's what the fuck I'm doing next: 

So right now the amplitudes array contains amplitudes that are backwards and not normalized. 
I need to normalize and flip these values. 
The max amplitude needs to be half of the bandheight. 
Therefore all values in the amplitude array *= (max amp / 255)

To invert the amplitude array: 
For all values in amplitude array: 10 - value






*/