const express = require("express");
const writeJournal = require("./controllers/writeJornal");
const listJournals = require("./controllers/listJournal");
const readJournal = require("./controllers/listSingleJournal");
const auth = require("../middleware/auth");

const journalRoute = express.Router();

journalRoute.use(auth);

journalRoute.post("/write",writeJournal);
journalRoute.get("/list",listJournals);
journalRoute.get("/single/:journalId",readJournal);

module.exports = journalRoute;