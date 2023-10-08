const net = require("net");
const fs = require("node:fs/promises");
const path = require("path");

const clearLine = (dir) => {
    return new Promise((resolve, reject) => {
        process.stdout.clearLine(dir, () => {
            resolve();
        });
    });
};

const moveCursor = (dx, dy) => {
    return new Promise((resolve, reject) => {
        process.stdout.moveCursor(dx, dy, () => {
            resolve();
        });
    });
};

const socket = net.createConnection({ host: "::1", port: 5050 }, async () => {
    const filePaths = process.argv.slice(2);

    for (const filePath of filePaths) {
        const fileName = path.basename(filePath);
        const fileHandle = await fs.open(filePath, "r");
        const fileReadStream = fileHandle.createReadStream();
        const fileSize = (await fileHandle.stat()).size;

        let uploadedPercentage = 0;
        let bytesUploaded = 0;

        socket.write(`fileName: ${fileName}-------`);

        console.log();

        fileReadStream.on("data", async (data) => {
            if (!socket.write(data)) {
                fileReadStream.pause();
            }

            bytesUploaded += data.length;
            let newPercentage = Math.floor((bytesUploaded / fileSize) * 100);

            if (newPercentage !== uploadedPercentage) {
                uploadedPercentage = newPercentage;
                await moveCursor(0, -1);
                await clearLine(0);
                console.log(`Uploading... ${uploadedPercentage}%`);
            }
        });

        socket.on("drain", () => {
            fileReadStream.resume();
        });

        fileReadStream.on("end", () => {
            console.log(`File '${fileName}' was successfully uploaded!`);
            socket.write("-------end-of-file-------");
        });
    }

    socket.on("data", (data) => {
        if (data.toString() === "-------end-of-file-------") {
            console.log("All files uploaded!");
            socket.end();
        }
    });
});

socket.on("end", () => {
    console.log("Socket connection closed.");
});
