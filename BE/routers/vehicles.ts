// vehicles.ts
import { Router } from 'express';
import {
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehiclesController';

const router = Router();

router.get('/', getAllVehicles);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;