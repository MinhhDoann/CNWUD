import { Router } from 'express';
import {
  getAllInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoiceController';

const router = Router();

router.get('/', getAllInvoices);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
