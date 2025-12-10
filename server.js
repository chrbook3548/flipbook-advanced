const express = require("express");
const fetch = require("node-fetch");
const app = express();

const DRIVE_FILE_ID = process.env.DRIVE_FILE_ID || "1n_G5ZRn34PBgLWa_iTLAZhaBCGg5dfR8";
const DRIVE_URL = `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`;

app.use(express.static("public"));

app.get("/pdf", async (req, res) => {
  try {
    const r = await fetch(DRIVE_URL, { redirect: "follow" });

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Content-Type", "application/pdf");

    r.body.pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).send("PDF proxy error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Advanced flipbook running on " + port));
