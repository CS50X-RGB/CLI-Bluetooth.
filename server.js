const net = require("net");
const fs = require("node:fs/promises");
const path = require("path");

const server = net.createServer((socket) => {
    console.log("New connection!");

    let fileHandle, fileWriteStream;
    let fileName = null;

    socket.on("data", async (data) => {
        if (!fileHandle) {
            socket.pause();

            const indexOfDivider = data.indexOf("-------");
            fileName = data.subarray(10, indexOfDivider).toString("utf-8");

            fileHandle = await fs.open(
                path.join(__dirname, "Storage", fileName),
                "w"
            );
            fileWriteStream = fileHandle.createWriteStream();

            fileWriteStream.write(data.subarray(indexOfDivider + 7));
            socket.resume();
        } else {
            if (!fileWriteStream.write(data)) {
                socket.pause();
            }
        }
    });

    socket.on("end", () => {
        if (fileHandle) {
            fileHandle.close();
            fileHandle = undefined;
        }

        if (fileWriteStream) {
            fileWriteStream.end();
            fileWriteStream = undefined;
        }

        console.log(`Connection ended for file: ${fileName}`);
    });
});

server.listen(5050, "::1", () => {
    console.log("Uploader server opened on", server.address());
});
