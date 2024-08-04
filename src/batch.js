const fs = require("fs")
const path = require("path")

function readFile(filePath) {
    return fs.readFileSync(filePath, "utf8")
}

function getAllFiles(folderPath) {
    let filePaths = []

    function traverseFolder(currentPath) {
        const files = fs.readdirSync(currentPath)

        files.forEach((file) => {
            const filePath = path.join(currentPath, file)
            const isDir = fs.statSync(filePath).isDirectory()

            if (isDir) {
                traverseFolder(filePath)
            } else {
                filePaths.push(filePath)
            }
        })
    }

    traverseFolder(folderPath)

    return filePaths
}

function batchExec(dirPath, fn) {
    getAllFiles(dirPath).forEach((filePath) => {
        const content = readFile(filePath)
        fn(content, filePath)
    })
}

module.exports = {
    batchExec
}




