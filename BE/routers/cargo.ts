import { Router } from 'express';
import {
  getAllCargo,
  createCargo,
  updateCargo,
  deleteCargo,
} from '../controllers/cargoController';

const router = Router();

router.get('/', getAllCargo);
router.post('/', createCargo);
router.put('/:id', updateCargo);
router.delete('/:id', deleteCargo);

export default router;