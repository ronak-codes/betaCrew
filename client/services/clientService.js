

// Function to create the request payload
function createPayload(callType, resendSeq = 0) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt8(callType, 0);
    buffer.writeUInt8(resendSeq, 1); // Default to 0 
    return buffer;
}


// Function to handle and parse data received from the server
function parseData(data) {
    try {
        const symbol = data.toString('ascii', 0, 4);
        const buySellIndicator = data.toString('ascii', 4, 5);
        const quantity = data.readUInt32BE(5);
        const price = data.readUInt32BE(9);
        const sequence = data.readUInt32BE(13);

        return { symbol, buySellIndicator, quantity, price, sequence };
    } catch (err) {
        console.error(`[ERROR] Failed to parse packet data:`, err);
        return null;
    }
}

// function to handle missingSequence/packets and fetch them
async function handleMissingSequences(packets, connectAndRequest) {
    const sequences = packets.map(packet => packet.sequence);
    const missingSequences = [];

    for (let i = 1; i <= Math.max(...sequences); i++) {
        if (!sequences.includes(i)) {
            missingSequences.push(i);
        }
    }

    for (const seq of missingSequences) {
        const missingPacket = await connectAndRequest(2, seq);
        if (missingPacket) {
            packets.push(missingPacket);
        }
    }
}

// sort packes in ascending order
function sortPackets(packets) {
    return packets.sort((a, b) => a.sequence - b.sequence);
}



module.exports ={
    createPayload,
    parseData,
    handleMissingSequences,
    sortPackets
}