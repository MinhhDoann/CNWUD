import { Router } from 'express';
import {
  getAllTransports,
  createTransport,
  updateTransport,
  deleteTransport,
} from '../controllers/transportController';

const router = Router();
router.get('/', getAllTransports);
router.post('/', createTransport);
router.put('/:id', updateTransport);
router.delete('/:id', deleteTransport);

export default router;