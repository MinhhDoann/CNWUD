"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transportController_1 = require("../controllers/transportController");
const router = (0, express_1.Router)();
router.get('/', transportController_1.getAllTransports);
router.post('/', transportController_1.createTransport);
router.delete('/:id', transportController_1.deleteTransport);
exports.default = router;
