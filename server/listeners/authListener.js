const appEvents = require("../events/appEvents");

appEvents.on("user:registered", (data) => {
  console.log("EVENT user:registered", {
    userId: data.userId,
    email: data.email,
    createdAt: new Date().toISOString(),
  });
});

appEvents.on("user:login", (data) => {
  console.log("EVENT user:login", {
    userId: data.userId,
    email: data.email,
    loginAt: new Date().toISOString(),
  });
});