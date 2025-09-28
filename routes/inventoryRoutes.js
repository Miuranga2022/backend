import express from 'express';
import { addInventoryItem, getInventoryItems } from '../controllers/inventoryController.js';


const router = express.Router();

router.get('/', getInventoryItems);      // Fetch all items
router.post('/', addInventoryItem);      // Add a new item

export default router;