import { Router } from 'express';
import {
  getAllFinance,
  saveFinance,
  deleteFinance
} from '../controllers/financeController';

const router = Router();

router.get('/', getAllFinance);
router.post('/', saveFinance);
router.delete('/:id', deleteFinance);

export default router;
