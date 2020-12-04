const robos = {
    input: require('./robos/input.js'),
    text: require('./robos/text.js'),
    state: require('./robos/state.js')
}

async function start(){
    
    robos.input()
    await robos.text()

    const content = robos.state.load()
    console.dir(content, {depth: null})
}

start()