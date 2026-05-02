import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MerchantKnowledgeModel, IMenuItem, IFAQ, ITrainingDoc } from '../models/KnowledgeBase';

// Get all merchants (with pagination and filters)
export const getAllMerchants = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, city, category } = req.query;

    const filter: any = {};
    if (city) filter['businessInfo.city'] = city;
    if (category) filter['menuData.category'] = category;

    const merchants = await MerchantKnowledgeModel
      .find(filter)
      .select('merchantId businessInfo.name businessInfo.city menuData.categories settings')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await MerchantKnowledgeModel.countDocuments(filter);

    res.json({
      success: true,
      data: merchants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch merchants' });
  }
};

// Get merchant by ID
export const getMerchantById = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;

    const merchant = await MerchantKnowledgeModel.findOne({ merchantId });

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    res.json({ success: true, data: merchant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch merchant' });
  }
};

// Create merchant knowledge base
export const createMerchant = async (req: Request, res: Response) => {
  try {
    const merchantId = req.body.merchantId || uuidv4();

    const existing = await MerchantKnowledgeModel.findOne({ merchantId });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Merchant already exists' });
    }

    const merchant = new MerchantKnowledgeModel({
      merchantId,
      ...req.body
    });

    await merchant.save();

    res.status(201).json({ success: true, data: merchant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create merchant' });
  }
};

// Update merchant knowledge base
export const updateMerchant = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;

    const merchant = await MerchantKnowledgeModel.findOneAndUpdate(
      { merchantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    res.json({ success: true, data: merchant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update merchant' });
  }
};

// Delete merchant
export const deleteMerchant = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;

    const result = await MerchantKnowledgeModel.deleteOne({ merchantId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    res.json({ success: true, message: 'Merchant deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete merchant' });
  }
};

// Menu Items
export const addMenuItem = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;
    const menuItem: IMenuItem = {
      id: uuidv4(),
      ...req.body
    };

    const merchant = await MerchantKnowledgeModel.findOneAndUpdate(
      { merchantId },
      {
        $push: { 'menuData.items': menuItem },
        $set: { 'menuData.lastUpdated': new Date() }
      },
      { new: true }
    );

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    res.json({ success: true, data: menuItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add menu item' });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { merchantId, itemId } = req.params;

    const merchant = await MerchantKnowledgeModel.findOneAndUpdate(
      { merchantId, 'menuData.items.id': itemId },
      {
        $set: {
          'menuData.items.$': { ...req.body, id: itemId },
          'menuData.lastUpdated': new Date()
        }
      },
      { new: true }
    );

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    res.json({ success: true, data: merchant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update menu item' });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { merchantId, itemId } = req.params;

    const merchant = await MerchantKnowledgeModel.findOneAndUpdate(
      { merchantId },
      {
        $pull: { 'menuData.items': { id: itemId } },
        $set: { 'menuData.lastUpdated': new Date() }
      },
      { new: true }
    );

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete menu item' });
  }
};

// FAQs
export const getFAQs = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;
    const { category } = req.query;

    const merchant = await MerchantKnowledgeModel.findOne({ merchantId });

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    let faqs = merchant.faqs;
    if (category) {
      faqs = faqs.filter(faq => faq.category === category);
    }

    res.json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch FAQs' });
  }
};

export const addFAQ = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;
    const faq: IFAQ = {
      id: uuidv4(),
      ...req.body,
      helpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const merchant = await MerchantKnowledgeModel.findOneAndUpdate(
      { merchantId },
      { $push: { faqs: faq } },
      { new: true }
    );

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add FAQ' });
  }
};

export const updateFAQ = async (req: Request, res: Response) => {
  try {
    const { merchantId, faqId } = req.params;

    const merchant = await MerchantKnowledgeModel.findOneAndUpdate(
      { merchantId, 'faqs.id': faqId },
      {
        $set: {
          'faqs.$': { ...req.body, id: faqId, updatedAt: new Date() }
        }
      },
      { new: true }
    );

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'FAQ not found' });
    }

    res.json({ success: true, data: merchant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update FAQ' });
  }
};

export const deleteFAQ = async (req: Request, res: Response) => {
  try {
    const { merchantId, faqId } = req.params;

    const merchant = await MerchantKnowledgeModel.findOneAndUpdate(
      { merchantId },
      { $pull: { faqs: { id: faqId } } },
      { new: true }
    );

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete FAQ' });
  }
};

// Search
export const searchKnowledge = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;
    const { q, type } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query required' });
    }

    const searchRegex = new RegExp(q as string, 'i');
    const merchant = await MerchantKnowledgeModel.findOne({ merchantId });

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    const results: any = { q, merchantId };

    // Search menu items
    if (!type || type === 'menu') {
      results.menuItems = merchant.menuData.items.filter(item =>
        searchRegex.test(item.name) || searchRegex.test(item.description || '')
      );
    }

    // Search FAQs
    if (!type || type === 'faq') {
      results.faqs = merchant.faqs.filter(faq =>
        searchRegex.test(faq.question) || searchRegex.test(faq.answer)
      );
    }

    // Search training docs
    if (!type || type === 'docs') {
      results.trainingDocs = merchant.trainingDocs.filter(doc =>
        searchRegex.test(doc.title) || searchRegex.test(doc.content)
      );
    }

    // Search business info
    if (!type || type === 'business') {
      const bi = merchant.businessInfo;
      if (searchRegex.test(bi.name) || searchRegex.test(bi.address)) {
        results.businessInfo = bi;
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
};

// Import data (CSV/JSON)
export const importData = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;
    const { data, format } = req.body;

    if (!data) {
      return res.status(400).json({ success: false, error: 'Data required' });
    }

    const merchant = await MerchantKnowledgeModel.findOne({ merchantId });
    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    let imported = 0;

    if (format === 'json') {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

      if (Array.isArray(parsedData.menuItems)) {
        const menuItems = parsedData.menuItems.map((item: any) => ({
          id: uuidv4(),
          ...item
        }));
        await MerchantKnowledgeModel.updateOne(
          { merchantId },
          { $push: { 'menuData.items': { $each: menuItems } } }
        );
        imported += menuItems.length;
      }

      if (Array.isArray(parsedData.faqs)) {
        const faqs = parsedData.faqs.map((faq: any) => ({
          id: uuidv4(),
          ...faq,
          helpfulCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        await MerchantKnowledgeModel.updateOne(
          { merchantId },
          { $push: { faqs: { $each: faqs } } }
        );
        imported += faqs.length;
      }
    }

    await MerchantKnowledgeModel.updateOne(
      { merchantId },
      { $set: { 'menuData.lastUpdated': new Date() } }
    );

    res.json({ success: true, imported });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Import failed' });
  }
};

// Export data
export const exportData = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;
    const { format = 'json' } = req.query;

    const merchant = await MerchantKnowledgeModel.findOne({ merchantId });

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    if (format === 'json') {
      res.json({
        success: true,
        data: {
          merchantId: merchant.merchantId,
          businessInfo: merchant.businessInfo,
          menuData: merchant.menuData,
          policies: merchant.policies,
          faqs: merchant.faqs
        }
      });
    } else if (format === 'csv') {
      // Return menu items as CSV-compatible format
      const menuItems = merchant.menuData.items.map(item => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        available: item.available
      }));
      res.json({ success: true, data: menuItems, format: 'csv-compatible' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Export failed' });
  }
};
