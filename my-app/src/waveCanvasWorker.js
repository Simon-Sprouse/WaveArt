onmessage = async (event) => { 

    const { image, bandHeight, maxAmp, frequency, stroke, k, canvasWidth, canvasHeight } = event.data;


    const response = await fetch(image);
    const blob = await response.blob();

    const imgBitMap = await createImageBitmap(blob);



    const offscreenCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = offscreenCanvas.getContext("2d");


    const dataCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const dataCtx = dataCanvas.getContext("2d", {willReadFrequently: true});
    dataCtx.drawImage(imgBitMap, 0, 0, canvasWidth, canvasHeight);

    const numberOfWaves = Math.floor(canvasHeight / bandHeight);
    for (let i = 0; i < numberOfWaves; i++) { 
        const imageData = dataCtx.getImageData(0, i * bandHeight, canvasWidth, (i + 1) * bandHeight);
        const averages = calculateGrayscaleAvg(imageData.data, canvasWidth, bandHeight, k);
        const amplitudes = smoothAverages(averages, canvasWidth, k);
        const normalized = normalizeAmplitudes(amplitudes, maxAmp);
        
        const y_offset = (bandHeight/2) + (i*bandHeight)

        drawWave(ctx, canvasWidth, normalized, y_offset, frequency, stroke);
    }

    postMessage(offscreenCanvas.transferToImageBitmap());


    
    






};





function calculateGrayscaleAvg(data, canvasWidth, bandHeight, k) {
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


    return averages;
}





function smoothAverages(averages, canvasWidth, k) { 

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


    return amplitudeArray;
}





function normalizeAmplitudes(amplitudes, maxAmp) { 
    const scale = (maxAmp / 255);
    return amplitudes.map(point => maxAmp - (scale * point));
}






function drawWave(ctx, canvasWidth, amplitudes, y_offset, frequency, stroke) { 

    


    ctx.beginPath() 
    ctx.strokeStyle = "black";
    ctx.lineWidth = stroke;

    for (let x = 0; x < canvasWidth; x++) { 
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
