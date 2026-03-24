import { Router } from 'express';
import {
  getAllContainers,
  createContainer,
  updateContainer,
  deleteContainer,
} from '../controllers/containersController';

const router = Router();

router.get('/', getAllContainers);
router.post('/', createContainer);
router.put('/:id', updateContainer);
router.delete('/:id', deleteContainer);

export default router;