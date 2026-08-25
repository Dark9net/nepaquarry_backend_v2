const app = require("./app");
const { env } = require("./config/env");

app.listen(env.PORT, () => {
    console.log(`NepaQuarry Server is running on ${env.PORT}`);
});