const express = require("express");
const writeJournal = require("./controllers/writeJornal");
const listJournals = require("./controllers/listJournal");
const readJournal = require("./controllers/listSingleJournal");

const journalRoute = express.Router();

journalRoute.post("/write",writeJournal);
journalRoute.get("/list",listJournals);
journalRoute.get("/single/:journalId",readJournal);

module.exports = journalRoute;