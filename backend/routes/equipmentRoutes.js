import express from 'express';
import { getAllEquipment, addEquipment, removeEquipment, updateEquipment } from '../controllers/equipmentController.js';

const router = express.Router();

router.get('/', getAllEquipment);
router.post('/', addEquipment);
router.delete('/:id', removeEquipment);
router.put('/:id', updateEquipment);

export default router;