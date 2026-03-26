import { Router } from 'express';
import {
  getAllPartners,
  createPartner,
  updatePartner,
  deletePartner,
} from '../controllers/partnersController';

const router = Router();

router.get('/', getAllPartners);
router.post('/', createPartner);
router.put('/:id', updatePartner);
router.delete('/:id', deletePartner);

export default router;