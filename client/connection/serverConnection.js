const net = require("net");
const fs = require("fs");
const {createPayload,parseData,handleMissingSequences,sortPackets} = require("../services/clientService");
const {config} = require("../config/config");


async function connectAndRequest(callType, resendSeq) {
    return new Promise((resolve, reject) => {
        console.log(`[INFO] Establishing connection to the BetaCrew server...`);

        const client = net.connect({ port: 3000, host: 'localhost' }, () => {
            console.log(`[INFO] Connected to BetaCrew server`);
            
            const requestPayload = createPayload(callType, resendSeq);
            console.log(`[INFO] Sending request payload to server:`, requestPayload);
            client.write(requestPayload);
        });

        let packets = [];

        client.on('data', (data) => {
            console.log(`[INFO] Data received from server:`, data);
            const packet = parseData(data);

            if (packet) {
                packets.push(packet);
                console.log(`[INFO] Parsed packet:`, packet);

                if (callType === 2) {
                    client.end();   // Explicitly closing the connection for callType 2
                }
            } else {
                console.error(`[ERROR] Invalid packet data received.`);
            }
        });

        client.on('end', async () => {
            console.log(`[INFO] Server closed the connection`);

            if (callType === 1) {

                await handleMissingSequences(packets,connectAndRequest)

                // Arrange packets in increasing sequence
                packets=sortPackets(packets);

                // Save all data to the output file
                fs.writeFileSync(config.OUTPUT_FILE_NAME, JSON.stringify(packets,null,2));
                console.log(`[INFO] All data received and saved to ${config.OUTPUT_FILE_NAME}`);
                resolve(packets); // Return packets for callType 1
            } else {
                resolve(packets.length > 0 ? packets[0] : null); // Return the single packet for callType 2
            }
        });

        client.on('error', (err) => {
            console.error(`[ERROR] Connection error:`, err);
            client.end(); // closing the connection on error
            reject(err);
        });

        client.on('close', () => {
            console.log(`[INFO] Connection closed`);
        });
    });
}


module.exports = {
    connectAndRequest
}