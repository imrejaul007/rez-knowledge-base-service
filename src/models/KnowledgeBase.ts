import mongoose, { Schema, Document } from 'mongoose';

// Merchant Types
export type MerchantType = 'restaurant' | 'hotel' | 'retail' | 'spa' | 'gym' | 'salon' | 'taxi' | 'flight' | 'other';

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
  complementary?: boolean; // Free item?
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
  type: MerchantType;
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

// ====== SALES STRATEGIES ======
export interface IComplimentaryOffer {
  item: string;
  condition?: string; // "after 7pm", "for orders over 500", "VIP only"
  description: string;
  isActive: boolean;
}

export interface IDiscount {
  name: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'free_item';
  value: number;
  minOrder?: number;
  applicableTo?: string[]; // categories or item names
  validDays?: string[]; // ["monday", "tuesday"]
  validHours?: { start: string; end: string };
  code?: string;
  description: string;
  isActive: boolean;
}

export interface IPromotion {
  id: string;
  name: string;
  type: 'happy_hour' | 'seasonal' | 'loyalty' | 'first_order' | 'referral';
  description: string;
  startDate?: Date;
  endDate?: Date;
  discount?: IDiscount;
  complimentaryItems?: IComplimentaryOffer[];
  terms?: string;
  isActive: boolean;
}

// ====== POLICIES BY MERCHANT TYPE ======

// Common to all
export interface IBasePolicy {
  acceptsReturns?: boolean;
  returnWindowDays?: number;
  returnConditions?: string;
  refundPolicy?: string;
  cancellationPolicy?: string;
}

// Restaurant specific
export interface IRestaurantPolicy extends IBasePolicy {
  // Ordering
  minOrderValue?: number;
  deliveryFee?: number;
  freeDeliveryAbove?: number;
  deliveryAreas?: string[];
  deliveryTime?: string;

  // Dining
  reservationRequired?: boolean;
  reservationAdvanceHours?: number;
  partySizeLimit?: number;

  // Complimentary
  complimentaryDrink?: IComplimentaryOffer;
  complimentaryAppetizer?: IComplimentaryOffer;
  complimentaryDessert?: IComplimentaryOffer;
  birthdayOffer?: IComplimentaryOffer;

  // Ordering rules
  takeoutAvailable?: boolean;
  dineInOnly?: boolean;
  cateringAvailable?: boolean;
  privateDiningAvailable?: boolean;

  // Payment
  paymentMethods?: string[];
  tipPolicy?: string;
}

// Hotel specific
export interface IHotelPolicy extends IBasePolicy {
  // Check-in/out
  checkInTime?: string;
  checkOutTime?: string;
  lateCheckoutAvailable?: boolean;
  lateCheckoutFee?: number;
  earlyCheckInAvailable?: boolean;
  earlyCheckInFee?: number;

  // Rooms
  maxOccupancy?: number;
  extraBedAvailable?: boolean;
  extraBedFee?: number;

  // Amenities
  complimentaryBreakfast?: boolean;
  complimentaryWiFi?: boolean;
  complimentaryParking?: boolean;
  complimentaryGym?: boolean;
  complimentaryPool?: boolean;

  // Services
  roomServiceAvailable?: boolean;
  laundryAvailable?: boolean;
  airportTransfer?: boolean;
  concierge24h?: boolean;

  // Deposits
  securityDeposit?: number;
  idRequired?: boolean;
}

// Retail specific
export interface IRetailPolicy extends IBasePolicy {
  // Returns (already in base but enhanced)
  storeCreditOnly?: boolean;
  originalPackagingRequired?: boolean;

  // Shopping
  exchangeAvailable?: boolean;
  sizeExchangeDays?: number;

  // Loyalty
  loyaltyPointsEnabled?: boolean;
  pointsPerRupee?: number;

  // Services
  giftWrappingAvailable?: boolean;
  giftWrappingFee?: number;
  alterationService?: boolean;
}

// Spa/Salon specific
export interface ISpaPolicy extends IBasePolicy {
  // Appointments
  advanceBookingRequired?: boolean;
  advanceBookingHours?: number;
  cancellationWindowHours?: number;

  // Services
  packagesAvailable?: boolean;
  membershipAvailable?: boolean;

  // Facilities
  saunaAvailable?: boolean;
  steamRoomAvailable?: boolean;
  jacuzziAvailable?: boolean;

  // Health
  healthFormRequired?: boolean;
  ageRestriction?: number;
}

// Gym specific
export interface IGymPolicy extends IBasePolicy {
  // Membership
  joiningFee?: number;
  monthlyFee?: number;
  yearlyFee?: number;

  // Access
  hours24h?: boolean;
  accessTo?: string[]; // ["pool", "sauna", "classes"]

  // Personal Training
  personalTrainingAvailable?: boolean;
  personalTrainingFee?: number;

  // Guest
  guestPassesIncluded?: number;
  additionalGuestFee?: number;

  // Lockers
  lockerRental?: boolean;
  lockerFee?: number;
}

// Taxi/Ride specific
export interface ITaxiPolicy extends IBasePolicy {
  // Pricing
  baseFare?: number;
  perKmRate?: number;
  perMinuteRate?: number;
  minimumFare?: number;

  // Services
  airportTransfer?: boolean;
  outstationAvailable?: boolean;
  corporateAccounts?: boolean;

  // Vehicle
  vehicleTypes?: string[];

  // Payment
  cashEnabled?: boolean;
  onlinePaymentEnabled?: boolean;
  corporateBilling?: boolean;
}

// Unified Policy Interface
export interface IPolicy {
  // Base policies (all merchants)
  cancellation?: string;
  delivery?: { minOrder: number; fee: number; areas: string[] };
  paymentMethods?: string[];
  reservationRules?: string;

  // Merchant-specific policies
  restaurant?: IRestaurantPolicy;
  hotel?: IHotelPolicy;
  retail?: IRetailPolicy;
  spa?: ISpaPolicy;
  gym?: IGymPolicy;
  taxi?: ITaxiPolicy;

  // Generic custom policies
  customPolicies?: { key: string; value: string; description: string }[];
}

// ====== CAMPAIGNS & OFFERS ======
export interface ICampaign {
  id: string;
  name: string;
  type: 'discount' | 'combo' | 'bundle' | 'loyalty' | 'seasonal';
  description: string;
  merchantType?: MerchantType[]; // Applicable merchant types
  conditions?: string; // When applicable
  benefits: {
    discountPercent?: number;
    discountAmount?: number;
    freeItem?: string;
    cashback?: number;
    points?: number;
  };
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: string;
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

  // Sales strategies
  complimentaryOffers?: IComplimentaryOffer[];
  discounts?: IDiscount[];
  activePromotions?: IPromotion[];

  // AI Settings
  settings: {
    aiEnabled: boolean;
    autoResponse: boolean;
    escalationThreshold: number;
    salesStrategyEnabled?: boolean;
    allowDynamicPricing?: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

// ====== SCHEMAS ======

const ComplimentaryOfferSchema = new Schema({
  item: { type: String, required: true },
  condition: { type: String },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const DiscountSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['percentage', 'fixed', 'bogo', 'free_item'], required: true },
  value: { type: Number, required: true },
  minOrder: { type: Number },
  applicableTo: [{ type: String }],
  validDays: [{ type: String }],
  validHours: {
    start: { type: String },
    end: { type: String }
  },
  code: { type: String },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const PromotionSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['happy_hour', 'seasonal', 'loyalty', 'first_order', 'referral'], required: true },
  description: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  discount: { type: DiscountSchema },
  complimentaryItems: [{ type: ComplimentaryOfferSchema }],
  terms: { type: String },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const MenuItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  available: { type: Boolean, default: true },
  preparationTime: { type: Number },
  dietary: [{ type: String }],
  allergens: [{ type: String }],
  modifiers: [{
    name: { type: String },
    price: { type: Number }
  }],
  complementary: { type: Boolean, default: false }
}, { _id: false });

const FAQSchema = new Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String },
  tags: [{ type: String }],
  helpfulCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const TrainingDocSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['book', 'article', 'document', 'menu'] },
  source: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const BusinessInfoSchema = new Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['restaurant', 'hotel', 'retail', 'spa', 'gym', 'salon', 'taxi', 'flight', 'other'],
    required: true
  },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  website: { type: String },
  hours: {
    type: Map,
    of: {
      open: { type: String },
      close: { type: String },
      closed: { type: Boolean }
    }
  },
  social: {
    type: Map,
    of: { type: String }
  }
}, { _id: false });

const PolicySchema = new Schema({
  // Base
  cancellation: { type: String },
  delivery: {
    minOrder: { type: Number },
    fee: { type: Number },
    areas: [{ type: String }]
  },
  paymentMethods: [{ type: String }],
  reservationRules: { type: String },

  // Type-specific (all optional)
  restaurant: {
    minOrderValue: { type: Number },
    deliveryFee: { type: Number },
    freeDeliveryAbove: { type: Number },
    deliveryAreas: [{ type: String }],
    deliveryTime: { type: String },
    reservationRequired: { type: Boolean },
    reservationAdvanceHours: { type: Number },
    partySizeLimit: { type: Number },
    complimentaryDrink: { type: ComplimentaryOfferSchema },
    complimentaryAppetizer: { type: ComplimentaryOfferSchema },
    complimentaryDessert: { type: ComplimentaryOfferSchema },
    birthdayOffer: { type: ComplimentaryOfferSchema },
    takeoutAvailable: { type: Boolean },
    dineInOnly: { type: Boolean },
    cateringAvailable: { type: Boolean },
    privateDiningAvailable: { type: Boolean },
    paymentMethods: [{ type: String }],
    tipPolicy: { type: String }
  },

  hotel: {
    checkInTime: { type: String },
    checkOutTime: { type: String },
    lateCheckoutAvailable: { type: Boolean },
    lateCheckoutFee: { type: Number },
    earlyCheckInAvailable: { type: Boolean },
    earlyCheckInFee: { type: Number },
    maxOccupancy: { type: Number },
    extraBedAvailable: { type: Boolean },
    extraBedFee: { type: Number },
    complimentaryBreakfast: { type: Boolean },
    complimentaryWiFi: { type: Boolean },
    complimentaryParking: { type: Boolean },
    complimentaryGym: { type: Boolean },
    complimentaryPool: { type: Boolean },
    roomServiceAvailable: { type: Boolean },
    laundryAvailable: { type: Boolean },
    airportTransfer: { type: Boolean },
    concierge24h: { type: Boolean },
    securityDeposit: { type: Number },
    idRequired: { type: Boolean }
  },

  retail: {
    acceptsReturns: { type: Boolean },
    returnWindowDays: { type: Number },
    returnConditions: { type: String },
    refundPolicy: { type: String },
    storeCreditOnly: { type: Boolean },
    originalPackagingRequired: { type: Boolean },
    exchangeAvailable: { type: Boolean },
    sizeExchangeDays: { type: Number },
    loyaltyPointsEnabled: { type: Boolean },
    pointsPerRupee: { type: Number },
    giftWrappingAvailable: { type: Boolean },
    giftWrappingFee: { type: Number },
    alterationService: { type: Boolean }
  },

  spa: {
    advanceBookingRequired: { type: Boolean },
    advanceBookingHours: { type: Number },
    cancellationWindowHours: { type: Number },
    packagesAvailable: { type: Boolean },
    membershipAvailable: { type: Boolean },
    saunaAvailable: { type: Boolean },
    steamRoomAvailable: { type: Boolean },
    jacuzziAvailable: { type: Boolean },
    healthFormRequired: { type: Boolean },
    ageRestriction: { type: Number }
  },

  gym: {
    joiningFee: { type: Number },
    monthlyFee: { type: Number },
    yearlyFee: { type: Number },
    hours24h: { type: Boolean },
    accessTo: [{ type: String }],
    personalTrainingAvailable: { type: Boolean },
    personalTrainingFee: { type: Number },
    guestPassesIncluded: { type: Number },
    additionalGuestFee: { type: Number },
    lockerRental: { type: Boolean },
    lockerFee: { type: Number }
  },

  taxi: {
    baseFare: { type: Number },
    perKmRate: { type: Number },
    perMinuteRate: { type: Number },
    minimumFare: { type: Number },
    airportTransfer: { type: Boolean },
    outstationAvailable: { type: Boolean },
    corporateAccounts: { type: Boolean },
    vehicleTypes: [{ type: String }],
    cashEnabled: { type: Boolean },
    onlinePaymentEnabled: { type: Boolean },
    corporateBilling: { type: Boolean }
  },

  customPolicies: [{
    key: { type: String },
    value: { type: String },
    description: { type: String }
  }]
}, { _id: false });

const MerchantKnowledgeSchema = new Schema({
  merchantId: { type: String, required: true, unique: true, index: true },
  businessInfo: { type: BusinessInfoSchema, required: true },
  menuData: {
    categories: [{ type: String }],
    items: [{ type: MenuItemSchema }],
    lastUpdated: { type: Date, default: Date.now }
  },
  policies: { type: PolicySchema, default: {} },
  faqs: [{ type: FAQSchema }],
  trainingDocs: [{ type: TrainingDocSchema }],

  // Sales strategies
  complimentaryOffers: [{ type: ComplimentaryOfferSchema }],
  discounts: [{ type: DiscountSchema }],
  activePromotions: [{ type: PromotionSchema }],

  // Settings
  settings: {
    aiEnabled: { type: Boolean, default: true },
    autoResponse: { type: Boolean, default: false },
    escalationThreshold: { type: Number, default: 0.8 },
    salesStrategyEnabled: { type: Boolean, default: false },
    allowDynamicPricing: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Indexes
MerchantKnowledgeSchema.index({ 'businessInfo.type': 1 });
MerchantKnowledgeSchema.index({ 'businessInfo.city': 1 });
MerchantKnowledgeSchema.index({ 'policies.restaurant.complimentaryDrink.isActive': 1 });
MerchantKnowledgeSchema.index({ 'policies.hotel.lateCheckoutAvailable': 1 });
MerchantKnowledgeSchema.index({ 'policies.retail.acceptsReturns': 1 });
MerchantKnowledgeSchema.index({ 'activePromotions.isActive': 1 });
MerchantKnowledgeSchema.index({ 'settings.salesStrategyEnabled': 1 });

export const MerchantKnowledgeModel = mongoose.model<IMerchantKnowledge>('MerchantKnowledge', MerchantKnowledgeSchema);
