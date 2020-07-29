const express = require("express");
const path = require("path");
const app = new express();
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => res.sendFile(__dirname + "/dist/index.html"));
app.listen(3200, () => {
  console.log("Preview can be seen visiting 3200 port");
});
