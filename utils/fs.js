const fs = require('fs');
const path = require('path');

const read = (directory) => {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, `../model/${directory}`)))
}

const write = (dir, data) => {
    fs.writeFileSync(path.resolve(__dirname, `../model/${dir}`), JSON.stringify(data, null, 4))
}

module.exports = {
    read,
    write
}