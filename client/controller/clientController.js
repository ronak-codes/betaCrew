const fs = require("fs");
const { connectAndRequest } = require("../connection/serverConnection");
const { config } = require("../config/config");

const streamAllPackets = async (req,res) =>{
    try {
        await connectAndRequest(1, 0);
        const output = fs.readFileSync(config.OUTPUT_FILE_NAME, 'utf8');
        const result = JSON.parse(output);
        res.json(result);
    } catch (error) {
        console.error(`[ERROR] Failed to process request:`, error);
        res.status(500).json({ error: 'Failed to process request' });
    }
}

const resendPacket = async(req,res) => {

    const { sequence } = req.query;
    if (parseInt(sequence, 10) < 1 || parseInt(sequence, 10) > 14) {
        return res.status(400).json({ msg: "Sequence number can be from 1 to 14" });
    }

    try {
        const packet = await connectAndRequest(2, parseInt(sequence, 10));
        if (packet) {
            res.json(packet);
        }else{
            res.status(404).json({ error: 'Packet not found' });
        }
    } catch (error) {
        console.error(`[ERROR] Failed to process request:`, error);
        res.status(500).json({ error: 'Failed to process request' });
    }
}


module.exports ={
    streamAllPackets,
    resendPacket
}