
function newElement(tagName, className) {
    const el = document.createElement(tagName)
    el.className = className
    return el
}

function Barreira(rev = false) {
    this.el = newElement('div', 'barreira')
    const bor = newElement('div', 'borda')
    const core = newElement('div', 'corpo')

    this.el.appendChild(rev ? core : bor)
    this.el.appendChild(rev ? bor : core)

    //public function to set height
    this.setHeight = height => core.style.height = `${height}px`
}

function ParDeBarreiras(altura, abertura, x) {
    this.el = newElement('div', 'par-de-barreiras')

    this.up = new Barreira(true)
    this.down = new Barreira()

    // this el refers to the element(el) created in the constructor,
    // so we have to remember to refer it when we append a child
    this.el.appendChild(this.up.el)
    this.el.appendChild(this.down.el)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.up.setHeight(alturaSuperior)
        this.down.setHeight(alturaInferior)
    }

    this.getX = () => parseInt(this.el.style.left.split(`px`)[0])
    this.setX = x => this.el.style.left = `${x}px`
    this.getLargura = () => this.el.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) { 
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // when the element leaves the screen
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio &&
                par.getX() < meio
            cruzouOMeio && notificarPonto()
        })
    }
}

function Passaro(alturaDoJogo) {
    let voando = false

    this.el = newElement('img', 'passaro')
    this.el.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.el.style.bottom.split('px')[0])
    this.setY = y => this.el.style.bottom = `${y}px`

    this.setY(alturaDoJogo / 2) 

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 6  : -5 )
        const alturaMax = alturaDoJogo - this.el.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMax) {
            this.setY(alturaMax)    
        } else {
            this.setY(novoY)
        }     
    }
}


function Progresso() {
    this.el = newElement('span', 'progresso')
    this.atualizarPontos = points => {
        this.el.innerHTML = points
    }
    this.atualizarPontos(0)
}

function sobrepostos(elA, elB) {
    const a = elA.getBoundingClientRect()
    const b = elB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(par => {
        if(!colidiu) {
            const superior = par.up.el
            const inferior = par.down.el
            colidiu = sobrepostos(passaro.el, superior)
                || sobrepostos(passaro.el, inferior)
        }
    })
    return colidiu
}

function restart(reset) {
    const restartElement = newElement('div', 'restart')
    document.querySelector('[wm-flappy]').appendChild(restartElement )
    restartElement.style.display = `flex`
    restartElement.style.justifyContent = `center`
    restartElement.style.alignItems = `center`
    restartElement.style.cursor = `pointer`
    restartElement.innerHTML = reset
    restartElement.onclick = e => {
        window.location.reload()
    }
}

function criateFooter() {
    const footer = newElement('footer', `footer`)
    footer.innerHTML = `TonAlmeida 2021&copy;`
    document.querySelector('body').appendChild(footer)
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const plin = new Audio('media/plin.mp3')
    const barreiras = new Barreiras(altura, largura, 200, 400, () => {
        plin.play()
        progresso.atualizarPontos(++pontos)
    }) 
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(passaro.el)
    areaDoJogo.appendChild(progresso.el)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.el))

    this.start = () => {
        //loop of the game
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()
            if(colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
                restart('RESTART')
            }
        }, 50);
    }
    criateFooter()
}

new FlappyBird().start()