const express = require('express');
const app = express();
const { config } = require("./config/config");
const clientRoutes = require("./routes/clientRoutes");
const PORT =  config.PORT;

app.use(express.json());

app.use("/betaCrewClient",clientRoutes);


app.listen(PORT,()=>console.log(`[INFO] BetaCrew Client is running at port ${PORT}`));