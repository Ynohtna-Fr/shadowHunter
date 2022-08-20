const imagesFolder = 'public/cards/images'
const cardsFile = 'public/cards/cards.json'
const fs = require('fs')
const path = require('path')

const allCards = {
    all: []
}
const basePathImages = path.join(__dirname, imagesFolder)

// each dirs is another deck
const dirs = fs.readdirSync(basePathImages, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
dirs.map(dir => {
    const files = fs.readdirSync(path.join(basePathImages, dir)).filter(file => file !== 'default.webp')
    const images = files.filter(file => file.endsWith('.webp'))

    allCards[dir] = images.map(file => {
        const name = file.split('.')[0]
        let team
        switch (name.substr(0, 1)) {
            case 'a':
            case 'b':
            case 'c':
            case 'd':
                team = 'neutral'
                break
            case 'e':
            case 'f':
            case 'g':
                team = 'hunter'
                break
            case 'm':
            case 'v':
            case 'l':
            case 'u':
            case 'w':
                team = 'shadow'
                break
        }
        const fallbacks = files.filter(file => !file.endsWith('.webp') && file.startsWith(name))
        return {
            name: name.split('-').map(word => capitalizeFirstLetter(word)).join(' '),
            team,
            image: dir + '/' + file,
            imageFallbacks: dir + '/' + fallbacks,
            deck: dir,
        }
    })
    allCards['all'].push(...allCards[dir])
})

fs.writeFileSync(path.join(__dirname, cardsFile), JSON.stringify(allCards, null, 4))

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}
