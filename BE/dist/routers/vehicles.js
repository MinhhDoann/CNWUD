"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// vehicles.ts
const express_1 = require("express");
const vehiclesController_1 = require("../controllers/vehiclesController");
const router = (0, express_1.Router)();
router.get('/', vehiclesController_1.getAllVehicles);
router.post('/', vehiclesController_1.createVehicle);
router.put('/:id', vehiclesController_1.updateVehicle);
router.delete('/:id', vehiclesController_1.deleteVehicle);
exports.default = router;
