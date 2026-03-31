import { Router } from 'express';
import {
  getAllContracts,
  createContract,
  updateContract,
  deleteContract,
} from '../controllers/contractsController';

const router = Router();
router.get('/', getAllContracts);
router.post('/', createContract);
router.put('/:id', updateContract);
router.delete('/:id', deleteContract);

export default router;