import { useRef, useEffect } from 'react'


function WaveCanvas({ image }) { 

    const canvasRef = useRef(null);

    const bandHeight = 20;
    const k = 10;



    function drawWave() { 


        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let amplitude = 0.1;
        const frequency = 0.5;

        const y_offset = 200;

        ctx.beginPath() 
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;

        for (let x = 0; x < canvas.width; x++) { 
            const y = amplitude * Math.sin(frequency * x) + y_offset;
            
            amplitude += 0.0025


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


                // TODO change this to a new function 
                const imageData = ctx.getImageData(0, 0, canvas.width, bandHeight);
                calculateGrayscaleAvg(imageData.data, canvas.width, bandHeight, k);

            }
        }
    }

    function resetCanvas() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }




    function calculateGrayscaleAvg(data, canvasWidth, bandHeight) {
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




    useEffect(() => {

        function handleKeyDown(event) { 
            if (event.key == "Enter") { 
                drawWave();
            }
            else if (event.key == " ") { 
                resetCanvas();
            }
            else if (event.key == "1") { 
                drawImage();
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








*/