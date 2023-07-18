let mouseDown = false;

addEventListener("mousedown", e => {mouseDown = true;});
addEventListener("mouseup", e => {mouseDown = false;});

function sigma(value) {
    return 1/(1 + Math.pow(2.7182, value * -1));
}

class network {
    gridX = 250;
    gridY = 100;
    offset = 32;
    neurons = [];
    inputIsEmpty = true;
    constructor(weights) {
        this.weights = weights;
        let maxLayerSize = 0;
        weights.forEach(weight => {
            this.neurons.push(new Array(weight.length).fill(0))
            if(weight.length > maxLayerSize)
                maxLayerSize = weight.length;
        });
        this.viewportWidth = (this.neurons.length-1)*this.gridX+this.offset*2;
        this.viewportHeight = (maxLayerSize-1)*this.gridY+this.offset*2;
    }
    predict(values = null) {
        if(values != null) {
            if(this.neurons[0].length != values.length) {
                console.error("Provided input size not equal to input layer size");
                return 1;
            }
            values.forEach((value, i) => {
                this.neurons[0][i] = value;
            });
        }
        for(let i = 1; i < this.neurons.length; i++) {
            this.neurons[i].forEach((neuron, j) => {
                this.neurons[i][j] = 0;
                this.weights[i][j].forEach((weight, w) => {
                    this.neurons[i][j] += weight*this.neurons[i-1][w];
                });
                this.neurons[i][j] = sigma(this.neurons[i][j]);
            });
        }
        return this.neurons[this.neurons.length-1]
    }

    canvas = null

    setOutputMethod(method, viewport) {
        if(method == "full") {
            this.displayMethod = method;
            this.viewport = viewport;
            this.connectionsCanvas = document.createElement("canvas");
            this.neuronsCanvas = document.createElement("canvas");
            this.viewport.appendChild(this.connectionsCanvas);
            this.viewport.appendChild(this.neuronsCanvas);
            this.connectionsCanvas.height = this.viewportHeight
            this.connectionsCanvas.width = this.viewportWidth;
            this.neuronsCanvas.height = this.viewportHeight;
            this.neuronsCanvas.width = this.viewportWidth;
            this.viewport.style.position = "relative";
            this.viewport.style.width = `${this.viewportWidth}px`;
            this.viewport.style.height = `${this.viewportHeight}px`;
            this.connectionsCanvas.style = "position: absolute; top: 0; left: 0;"
            this.neuronsCanvas.style = "position: absolute; top: 0; left: 0;"
            this.connectionsCtx = this.connectionsCanvas.getContext("2d");
            this.neuronsCtx = this.neuronsCanvas.getContext("2d");

            this.connectionsCtx.clearRect(0, 0, this.connectionsCanvas.width, this.connectionsCanvas.height);
            for(let i = 0; i < this.weights.length-1; i++) {
                this.weights[i].forEach((weights, j) => {
                    this.weights[i+1].forEach((weight, k) => {
                        this.connectionsCtx.beginPath();
                        this.connectionsCtx.strokeStyle = weight[j] > 0 ? "limegreen" : "red";
                        this.connectionsCtx.lineWidth = weight[j];
                        this.connectionsCtx.moveTo(i*this.gridX+this.offset, j*this.gridY+this.offset);
                        this.connectionsCtx.lineTo(i*this.gridX+this.gridX+this.offset, k*this.gridY+this.offset);
                        this.connectionsCtx.closePath();
                        this.connectionsCtx.stroke();
                    })
                });
            }

            this.neurons.forEach((layer, i) => {
                layer.forEach((neuron, j) => {
                    this.connectionsCtx.beginPath();
                    this.connectionsCtx.lineWidth = 2;
                    this.connectionsCtx.fillStyle="black";
                    this.connectionsCtx.strokeStyle = "limegreen";
                    this.connectionsCtx.arc(i*this.gridX+this.offset, j*this.gridY+this.offset, 30, 0, 2*3.14);
                    this.connectionsCtx.fill();
                    this.connectionsCtx.closePath();
                    this.connectionsCtx.stroke();
                });
            })
            this.drawSchema();
        } else if(method == "output") {
            this.displayMethod = method;
            this.viewport = viewport;
        } else if(method == "none") {
            this.displayMethod = method;
        } else
            console.error("This output method is unknown");
    }

    setInputMethod(method, element, editButtons = true, width = 10, height = 10, pixelSize = 10, brushBlur = false, brushSize = 1) {
        if(method == "range") {
            element.style.display = "flex";
            element.style.flexDirection = "column";
            element.style.gap = `${this.gridY-20}px`;
            element.style.paddingTop = `${this.offset/2}px`;
            this.neurons[0].forEach((input, i) => {
                let range = document.createElement("input");
                range.style.height = "20px"
                range.type = "range";
                range.min = 0;
                range.max = 1;
                range.step = 0.01;
                range.value = input;
                range.oninput = e => {
                    this.neurons[0][i] = e.target.value;
                    this.predict();
                    this.drawSchema();
                };
                element.appendChild(range);
            });
        } else if (method == "canvas") {
            element.style.display = "flex";
            element.style.flexDirection = "column";
            let canvas = document.createElement("canvas");
            canvas.style.imageRendering = "pixelated";
            console.log(element);
            element.appendChild(canvas);   
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = `${width*pixelSize}px`;
            canvas.style.height = `${height*pixelSize}px`;
            canvas.style.outline = "2px solid limegreen";
            let ctx = canvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, width, height);
            let blur = brushBlur ? 2 : 1;
            addEventListener('mousemove', e => {
                let rect = canvas.getBoundingClientRect();
                ctx.fillStyle = "black";
                let x = Math.round((e.pageX-rect.left)/pixelSize*blur)/blur;
                let y = Math.round((e.pageY-rect.top)/pixelSize*blur)/blur;
                if(mouseDown && x >= 0 && y >= 0 && x < canvas.width && y < canvas.height) {
                    ctx.fillRect(x, y, brushSize, brushSize);
                    let input = [];
                    for(let i = 0; i < canvas.width; i++) {
                        for(let j = 0; j < canvas.height; j++)
                            input.push((255-ctx.getImageData(j,i,1,1)["data"][0])/255);
                    }
                    this.predict(input)
                    this.drawSchema();
                    this.onInputChange();
                    this.inputIsEmpty = false;
                }
            }, false);
            if(editButtons) {
                let clearButton = document.createElement("button");  
                let readButton = document.createElement("button");
                clearButton.innerHTML = "clear";
                readButton.innerHTML = "read";
                clearButton.addEventListener("click", e => {
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, width, height);
                });
                readButton.addEventListener("click", e => {
                    let input = [];
                    for(let i = 0; i < canvas.width; i++) {
                        for(let j = 0; j < canvas.height; j++)
                            input.push((255-ctx.getImageData(j,i,1,1)["data"][0])/255);
                    }
                    this.predict(input)
                    this.drawSchema();
                });
                element.appendChild(clearButton);   
                element.appendChild(readButton); 
            }
        } else if (method == "none") {

        } else
            console.error("This input method is unknown");
    }

    drawSchema() {
        if(this.displayMethod == "full") {
            this.neuronsCtx.clearRect(0, 0, this.connectionsCanvas.width, this.connectionsCanvas.height);
            this.neurons.forEach((layer, i) => {
                layer.forEach((neuron, j) => {
                    this.neuronsCtx.font = "24px Serif"
                    this.neuronsCtx.fillStyle="limegreen"
                    this.neuronsCtx.fillText(Math.round(neuron*100)/100, i*this.gridX+this.offset-22, j*this.gridY+this.offset+8)
                });
            })
        } else if(this.displayMethod == "output") {
            this.viewport.innerHTML = "";
            this.neurons[this.neurons.length-1].forEach((neuron, i) => {
                this.viewport.innerHTML += `${i}: ${neuron}<br>`;
            });
        }
    }

    getOutput() {
        return this.neurons[this.neurons.length-1];
    }

    onInputChange() {

    }
 };
