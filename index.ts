window.AudioContext = window.AudioContext || window.webkitAudioContext;

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

window.addEventListener('resize', () => {
    console.log('resize')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
});

ctx.clearRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.lineWidth = 1
ctx.fillStyle = 'white'
ctx.strokeStyle = 'white'

let x = 0
let prev = { x: 0, y: 0 }

let started = false
let first = true
let mode = 'raw'
let triggered = false
document.onkeydown = (event) => {
    if (event.code == 'KeyM') {
        if (mode == 'trigger') {
            mode = 'raw'
        } else {
            mode = 'trigger'
        }
    }
    if (event.code == 'KeyC') {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.fillStyle = '#000f'
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
    if (!started) {
        const context = new AudioContext();

        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(1024, 1, 1);

            source.connect(processor);
            processor.connect(context.destination);

            processor.onaudioprocess = function (e) {


                let array = e.inputBuffer.getChannelData(0)

                if (mode == 'raw') {
                    ctx.fillStyle = '#0001'
                    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
                    ctx.lineWidth = 1
                    ctx.fillStyle = 'white'
                    ctx.strokeStyle = 'white'
                    ctx.beginPath()
                    ctx.moveTo(prev.x, prev.y)
                    let y
                    for (let sample of array) {
                        y = sample * canvas.height / 2 + canvas.height / 2
                        ctx.lineTo(x, y)
                        x++
                        if (x > ctx.canvas.width) {
                            ctx.stroke()
                            ctx.beginPath
                            ctx.moveTo(0, y)
                            x = 0
                        }
                    }
                    prev.x = x
                    prev.y = y
                    ctx.stroke()
                } else if (mode == 'trigger') {
                    ctx.beginPath()

                    for (let i = 0; i < array.length; i++) {
                        if (triggered) {
                            let y = array[i] * canvas.height / 2 + canvas.height / 2
                            ctx.lineTo(x, y)
                            x++
                            if (x > ctx.canvas.width) {
                                ctx.stroke()
                                ctx.moveTo(0, 0)
                                x = 0
                                triggered = false
                            }
                        } else {
                            if (Math.abs(array[i]) > 0.1) {
                                triggered = true
                                x = 0
                            }
                        }
                    }
                    ctx.stroke()
                }
            };
        });
    }
    started = true
}