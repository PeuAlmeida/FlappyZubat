function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// const b = new barreira(true)
// b.setAltura(200)
// document.querySelector('[wm-flappy]').append(b.elemento)

function parDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')


    this.superior = new barreira(true)
    this.inferior = new barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// const b = new parDeBarreiras(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function barreiras(altura, largura, abertura, espaco, notificarPonto, deslocamento) {

    this.pares = [
        new parDeBarreiras(altura, abertura, largura),
        new parDeBarreiras(altura, abertura, largura + espaco),
        new parDeBarreiras(altura, abertura, largura + espaco * 2),
        new parDeBarreiras(altura, abertura, largura + espaco * 3)

    ]

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio

            if (cruzouOMeio) {
                notificarPonto()
            }
        })
    }
}


function passaro(alturaDoJogo, velocidade) {

    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/zubat.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? velocidade : -velocidade)
        const alturaMaxima = alturaDoJogo - this.elemento.clientHeight - 8

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaDoJogo / 2)

}

// const barreirasDoJogo = new barreiras(700, 1200, 200, 400, 1, 3)
// const flappy = new passaro(700)

// const areaDoJogo = document.querySelector('[wm-flappy]')

// areaDoJogo.appendChild(flappy.elemento)

// barreirasDoJogo.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

// setInterval(() => {
//     barreirasDoJogo.animar()
//     flappy.animar()
// }, 20)

function progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }

    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}


function colidiu(flappy, barreirasDoJogo) {

    let colidiu = false

    barreirasDoJogo.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(flappy.elemento, superior) || estaoSobrepostos(flappy.elemento, inferior)
        }
    })

    return colidiu
}

function restart() {
    this.easy = novoElemento('button', 'restart')
    this.easy.innerHTML = 'Fácil'
    this.easy.setAttribute('onclick', 'startEasy()')
    
    this.medium = novoElemento('button', 'restart')
    this.medium.innerHTML = 'Médio'
    this.medium.setAttribute('onclick', 'startMedium()')

    this.hard = novoElemento('button', 'restart')
    this.hard.innerHTML = 'Dificil'
    this.hard.setAttribute('onclick', 'startHard()')
}
 
function flappyBird(velocidadeParede, velocidadePassaro) {

    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progressoDoJogo = new progresso()
    const botaoDeRestart = new restart()
    const barreirasDoJogo = new barreiras(altura, largura, 200 , 400, () => progressoDoJogo.atualizarPontos(++pontos), velocidadeParede)

    const flappy = new passaro(altura, velocidadePassaro)

    areaDoJogo.appendChild(progressoDoJogo.elemento)  
    areaDoJogo.appendChild(flappy.elemento)

    barreirasDoJogo.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreirasDoJogo.animar()
            flappy.animar()
 
            if (colidiu(flappy, barreirasDoJogo)) {
                clearInterval(temporizador)  
                areaDoJogo.appendChild(botaoDeRestart.easy) 
                areaDoJogo.appendChild(botaoDeRestart.medium) 
                areaDoJogo.appendChild(botaoDeRestart.hard) 
            }
        }, 20)
    }
}

function startEasy() {
    const areaDoJogo = document.querySelector('[wm-flappy]')
    while(areaDoJogo.firstChild) {
        areaDoJogo.removeChild(areaDoJogo.firstChild)
    }
    
    new flappyBird(3, 4).start()
}

function startMedium() {
    const areaDoJogo = document.querySelector('[wm-flappy]')
    while(areaDoJogo.firstChild) {
        areaDoJogo.removeChild(areaDoJogo.firstChild)
    }
    
    new flappyBird(6, 7).start()
}

function startHard() {
    const areaDoJogo = document.querySelector('[wm-flappy]')
    while(areaDoJogo.firstChild) {
        areaDoJogo.removeChild(areaDoJogo.firstChild)
    }
    
    new flappyBird(9, 10).start()
}

startEasy()