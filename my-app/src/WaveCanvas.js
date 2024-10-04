import { useRef, useEffect } from 'react'


function WaveCanvas() { 

    const canvasRef = useRef(null);



    function drawWave() { 

        console.log("inside wave function");

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const amplitude = 50;
        const frequency = 0.1;

        const y_offset = 200;

        ctx.beginPath() 
        ctx.strokeStyle = "white";
        ctx.lineWidth = 10;

        for (let x = 0; x < canvas.width; x++) { 
            const y = amplitude * Math.sin(frequency * x) + y_offset;
            if (x == 0) { 
                ctx.moveTo(x, y);
            }
            else { 
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }


    function resetCanvas() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }




    useEffect(() => {

        function handleKeyDown(event) { 
            if (event.key == "Enter") { 
                drawWave();
            }
            else if (event.key == " ") { 
                resetCanvas();
            }
        }


        document.addEventListener("keydown", handleKeyDown);
        return (() => { 
            document.removeEventListener("keydown", handleKeyDown);
        })
    })

    useEffect(() => { 
        resetCanvas();
    }, []);

    return (
        <>
          <canvas ref={canvasRef} height="400" width="800"></canvas>
        </>
    )
}


export default WaveCanvas;