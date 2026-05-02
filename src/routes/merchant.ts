import { Router } from 'express';
import {
  getAllMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
  deleteMerchant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getFAQs,
  addFAQ,
  updateFAQ,
  deleteFAQ,
  searchKnowledge,
  importData,
  exportData
} from '../controllers/merchantController';

const router = Router();

// All merchants
router.get('/', getAllMerchants);
router.post('/', createMerchant);

// Specific merchant
router.get('/:merchantId', getMerchantById);
router.put('/:merchantId', updateMerchant);
router.delete('/:merchantId', deleteMerchant);

// Menu items
router.post('/:merchantId/menu', addMenuItem);
router.put('/:merchantId/menu/:itemId', updateMenuItem);
router.delete('/:merchantId/menu/:itemId', deleteMenuItem);

// FAQs
router.get('/:merchantId/faq', getFAQs);
router.post('/:merchantId/faq', addFAQ);
router.put('/:merchantId/faq/:faqId', updateFAQ);
router.delete('/:merchantId/faq/:faqId', deleteFAQ);

// Search
router.get('/:merchantId/search', searchKnowledge);

// Import/Export
router.post('/:merchantId/import', importData);
router.get('/:merchantId/export', exportData);

export default router;
