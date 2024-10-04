import { useRef, useEffect } from 'react'
import App from './App';


function WaveCanvas({ image }) { 

    const canvasRef = useRef(null);

    const bandHeight = 10;
    const k = 100;



    function drawWave(amplitudes, y_offset) { 


        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");


        const frequency = 0.5;


        ctx.beginPath() 
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        for (let x = 0; x < canvas.width; x++) { 
            const y = amplitudes[x] * Math.sin(frequency * x) + y_offset;
            



            if (x == 0) { 
                ctx.moveTo(x, y);
            }
            else { 
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }


    function drawImage() { 
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
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }


    function getAmplitudes() { 



        if (image) { 

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const img = new Image();
            img.src = image;
            img.onload = () => { 

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const numberOfWaves = Math.floor(canvas.height / bandHeight);
                for (let i = 0; i < numberOfWaves; i++) { 
                    const imageData = ctx.getImageData(0, i * bandHeight, canvas.width, (i + 1) * bandHeight);
                    const averages = calculateGrayscaleAvg(imageData.data, canvas.width, k);
                    const amplitudes = smoothAverages(averages);
                    const normalized = normalizeAmplitudes(amplitudes);
                    
                    const y_offset = (bandHeight/2) + (i*bandHeight)

                    drawWave(normalized, y_offset);
                }

                



            }
        }
    }


    function calculateGrayscaleAvg(data, canvasWidth) {
        const chunkWidth = Math.floor(canvasWidth / k);
        const averages = new Array(k).fill(0);
        const counts = new Array(k).fill(0);

        for (let y = 0; y < bandHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) { 
                const index = (x + y * canvasWidth) * 4  ;
                const grayscaleValue = data[index];
    
                let chunkIndex = Math.floor(x / chunkWidth);
                if (chunkIndex >= k) { 
                    chunkIndex = k - 1;
                }

                averages[chunkIndex] += grayscaleValue;
                counts[chunkIndex] += 1;
            }
        }
       

        for (let i = 0; i < k; i++) { 
            if (counts[i] != 0) { 
                averages[i] = averages[i] / counts[i];
            }
        }

        console.log("average grayscale values");
        console.log(averages);

        return averages;
    }


    function smoothAverages(averages) { 

        const canvasWidth = canvasRef.current.width;
        const chunkWidth = Math.floor(canvasWidth / k);

        const middleIndexes = new Array(averages.length).fill(0);

        for (let i = 0; i < averages.length; i++) { 
            const middleOfChunk = (i * chunkWidth) + Math.floor(chunkWidth / 2);
            middleIndexes[i] = middleOfChunk;
        }

        const amplitudeArray = new Array(canvasWidth).fill(0);


        // from edge to first median

        let startIndex = 0;
        let endIndex = middleIndexes[0];

        let startValue = 0;
        let endValue = averages[0];

        let difference = endValue - startValue;
        let distance = endIndex - startIndex;

        let smoothing = difference / distance;

        for (let j = 0; j < distance; j++) { 
            amplitudeArray[startIndex + j] = startValue + smoothing * j;
        }


        // from first median to next median
        for (let i = 0; i < middleIndexes.length - 1; i++) { 

            const startIndex = middleIndexes[i];
            const endIndex = middleIndexes[i + 1];

            const startValue = averages[i];
            const endValue = averages[i + 1];

            const difference = endValue - startValue;
            const distance = endIndex - startIndex;

            const smoothing = difference / distance;

            for (let j = 0; j < distance; j++) { 
                amplitudeArray[startIndex + j] = startValue + smoothing * j;
            }

        }

        // from last median to edge
        startIndex = middleIndexes[middleIndexes.length - 1];
        endIndex = canvasWidth;

        startValue = averages[averages.length - 1];
        endValue = 0;

        difference = endValue - startValue;
        distance = endIndex - startIndex;

        smoothing = difference / distance;

        for (let j = 0; j < distance; j++) { 
            amplitudeArray[startIndex + j] = startValue + smoothing * j;
        }







        console.log(middleIndexes);
        console.log(amplitudeArray);

        return amplitudeArray;
    }

    function normalizeAmplitudes(amplitudes) { 
        const maxAmp = bandHeight / 2;
        const scale = (maxAmp / 255);
        return amplitudes.map(point => maxAmp - (scale * point));
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
                drawImage();
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

    // On Mount
    useEffect(() => { 
        resetCanvas();
        drawImage();
        

    }, []);

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