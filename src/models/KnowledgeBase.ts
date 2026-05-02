import mongoose, { Schema, Document } from 'mongoose';

// Menu Item Interface
export interface IMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  preparationTime?: number;
  dietary?: string[];
  allergens?: string[];
  modifiers?: { name: string; price: number }[];
}

// FAQ Interface
export interface IFAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Training Doc Interface
export interface ITrainingDoc {
  id: string;
  title: string;
  content: string;
  type: 'book' | 'article' | 'document' | 'menu';
  source?: string;
  createdAt: Date;
}

// Business Info Interface
export interface IBusinessInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email?: string;
  website?: string;
  hours: { [day: string]: { open: string; close: string; closed?: boolean } };
  social?: { [platform: string]: string };
}

// Policy Interface
export interface IPolicy {
  cancellation?: string;
  delivery?: { minOrder: number; fee: number; areas: string[] };
  paymentMethods?: string[];
  reservationRules?: string;
}

// Merchant Knowledge Schema
export interface IMerchantKnowledge extends Document {
  merchantId: string;
  businessInfo: IBusinessInfo;
  menuData: {
    categories: string[];
    items: IMenuItem[];
    lastUpdated: Date;
  };
  policies: IPolicy;
  faqs: IFAQ[];
  trainingDocs: ITrainingDoc[];
  settings: {
    aiEnabled: boolean;
    autoResponse: boolean;
    escalationThreshold: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: String,
  available: { type: Boolean, default: true },
  preparationTime: Number,
  dietary: [String],
  allergens: [String],
  modifiers: [{
    name: String,
    price: Number
  }]
}, { _id: false });

const FAQSchema = new Schema<IFAQ>({
  id: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: String,
  tags: [String],
  helpfulCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const TrainingDocSchema = new Schema<ITrainingDoc>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['book', 'article', 'document', 'menu'], required: true },
  source: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const BusinessInfoSchema = new Schema<IBusinessInfo>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  website: String,
  hours: { type: Map, of: {
    open: String,
    close: String,
    closed: Boolean
  }},
  social: { type: Map, of: String }
}, { _id: false });

const PolicySchema = new Schema<IPolicy>({
  cancellation: String,
  delivery: {
    minOrder: Number,
    fee: Number,
    areas: [String]
  },
  paymentMethods: [String],
  reservationRules: String
}, { _id: false });

const MerchantKnowledgeSchema = new Schema<IMerchantKnowledge>({
  merchantId: { type: String, required: true, unique: true, index: true },
  businessInfo: { type: BusinessInfoSchema, required: true },
  menuData: {
    categories: [String],
    items: [MenuItemSchema],
    lastUpdated: { type: Date, default: Date.now }
  },
  policies: { type: PolicySchema, default: () => ({}) },
  faqs: [FAQSchema],
  trainingDocs: [TrainingDocSchema],
  settings: {
    aiEnabled: { type: Boolean, default: true },
    autoResponse: { type: Boolean, default: true },
    escalationThreshold: { type: Number, default: 3 }
  }
}, {
  timestamps: true,
  collection: 'merchant_knowledge'
});

// Indexes
MerchantKnowledgeSchema.index({ 'menuData.category': 1 });
MerchantKnowledgeSchema.index({ 'faqs.category': 1 });
MerchantKnowledgeSchema.index({ 'businessInfo.city': 1 });

export const MerchantKnowledgeModel = mongoose.model<IMerchantKnowledge>('MerchantKnowledge', MerchantKnowledgeSchema);
