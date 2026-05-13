export interface UserProfile {
  profileId: number;
  fullName: string;
  emailId: string;
  mobileNumber: number;
  about: string;
  dateOfBirth: string;
  gender: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN' | 'DELIVERY_AGENT';
  image: string;
  addresses: Address[];
}

export interface Address {
  houseNumber: string;
  streetName: string;
  colonyName: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Product {
  productId: number;
  productType: string;
  productName: string;
  category: string;
  price: number;
  description: string;
  stockQuantity: number;
  merchantId: number;
  rating: Record<string, number>;
  review: Record<string, string>;
  image: string[];
  specification: Record<string, string>;
}

export interface Cart {
  cartId: number;
  totalPrice: number;
  items: CartItem[];
}

export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Wishlist {
  wishlistId: number;
  userId: number;
  productId: number;
  productName: string;
  price: number;
  imageUrl?: string;
  addedAt: string;
}

export interface Order {
  orderId: number;
  orderDate: string;
  customerId: number;
  amountPaid: number;
  modeOfPayment: string;
  orderStatus: string;
  quantity: number;
  productId: number;
  productName: string;
  price: number;
  address?: OrderAddress;
}

export interface OrderAddress {
  customerId: number;
  fullName: string;
  mobileNumber: number;
  flatNumber: string;
  city: string;
  pincode: number;
  state: string;
}

export interface EWallet {
  walletId: number;
  currentBalance: number;
  statements: Statement[];
}

export interface Statement {
  statementId: number;
  transactionType: 'CREDIT' | 'DEBIT';
  amount: number;
  dateTime: string;
  orderId: number;
  transactionRemarks: string;
}

export interface Review {
  reviewId: number;
  productId: number;
  customerId: number;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  helpfulVotes: number;
}

export interface Notification {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
