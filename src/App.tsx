import React, { useState } from 'react';
import {
  AppMode,
  CustomerTab,
  MerchantTab,
  Product,
  Category,
  Order,
  StoreSettings,
  CartItem
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_SETTINGS
} from './data/initialData';

// Customer Components
import { CustomerHeader } from './components/CustomerHeader';
import { CustomerStorefront } from './components/CustomerStorefront';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { OrderConfirmedView } from './components/OrderConfirmedView';
import { ViewReceiptModal } from './components/ViewReceiptModal';
import { CustomerOrdersView } from './components/CustomerOrdersView';
import { CustomerBottomNav } from './components/CustomerBottomNav';

// Merchant Components
import { MerchantSidebar } from './components/merchant/MerchantSidebar';
import { MerchantHeader } from './components/merchant/MerchantHeader';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { MerchantProducts } from './components/merchant/MerchantProducts';
import { MerchantAddEditProduct } from './components/merchant/MerchantAddEditProduct';
import { MerchantOrders } from './components/merchant/MerchantOrders';
import { MerchantOrderDetailModal } from './components/merchant/MerchantOrderDetailModal';
import { MerchantCategories } from './components/merchant/MerchantCategories';
import { MerchantCustomers } from './components/merchant/MerchantCustomers';
import { MerchantSettings } from './components/merchant/MerchantSettings';
import { MerchantBottomNav } from './components/merchant/MerchantBottomNav';

export default function App() {
  // Mode & Tabs
  const [mode, setMode] = useState<AppMode>('customer');
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [merchantTab, setMerchantTab] = useState<MerchantTab>('home');

  // Application Data States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  // Cart & Flow States
  const [cart, setCart] = useState<CartItem[]>([
    {
      cartItemId: 'initial-1',
      product: INITIAL_PRODUCTS[0], // Chicken Adobo
      quantity: 1,
      selectedOptions: {
        'group-rice': 'opt-white',
        'group-spice': 'opt-spicy'
      },
      totalPrice: 270
    },
    {
      cartItemId: 'initial-2',
      product: INITIAL_PRODUCTS[4], // Floral Summer Dress
      quantity: 1,
      selectedOptions: {
        'group-size': 'opt-m',
        'group-color': 'opt-rose'
      },
      totalPrice: 599
    }
  ]);

  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inCheckout, setInCheckout] = useState(false);
  const [activeConfirmedOrder, setActiveConfirmedOrder] = useState<Order | null>(null);
  const [selectedMerchantOrder, setSelectedMerchantOrder] = useState<Order | null>(null);
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);

  // Computed Cart Items Count
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  // Cart operations
  const handleAddToCart = (
    product: Product,
    quantity: number,
    selectedOptions: Record<string, string | string[]>,
    calculatedTotalPrice: number
  ) => {
    const newItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random()}`,
      product,
      quantity,
      selectedOptions,
      totalPrice: calculatedTotalPrice
    };
    setCart((prev) => [...prev, newItem]);
  };

  const handleQuickAddToCart = (product: Product) => {
    // Check if product has required options
    const hasRequired = product.optionGroups.some((g) => g.required);
    if (hasRequired) {
      setSelectedProductForDetail(product);
      return;
    }

    const newItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random()}`,
      product,
      quantity: 1,
      selectedOptions: {},
      totalPrice: product.basePrice
    };
    setCart((prev) => [...prev, newItem]);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId !== cartItemId) return item;
        const unitPrice = item.totalPrice / item.quantity;
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: unitPrice * newQuantity
        };
      })
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Order Placement
  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setInCheckout(false);
    setActiveConfirmedOrder(newOrder);
  };

  // Order Status Tracking & Simulation
  const handleAdvanceOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        let nextStatus: Order['status'] = o.status;
        if (o.status === 'pending') nextStatus = 'accepted';
        else if (o.status === 'accepted') nextStatus = 'preparing';
        else if (o.status === 'preparing') nextStatus = 'ready';

        const updated = { ...o, status: nextStatus };
        if (activeConfirmedOrder && activeConfirmedOrder.id === orderId) {
          setActiveConfirmedOrder(updated);
        }
        return updated;
      })
    );
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    if (selectedMerchantOrder && selectedMerchantOrder.id === orderId) {
      setSelectedMerchantOrder((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Product CRUD
  const handleSaveProduct = (product: Product) => {
    const exists = products.some((p) => p.id === product.id);
    if (exists) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    } else {
      setProducts((prev) => [product, ...prev]);
    }
    setEditingProduct(null);
    setMerchantTab('products');
  };

  const handleToggleProductActive = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  // Category CRUD
  const handleAddCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleUpdateCategory = (cat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  // Mode & navigation helpers
  const handleToggleStoreStatus = () => {
    setSettings((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#e0e0e2] antialiased selection:bg-[#4f46e5] selection:text-white">
      {/* ---------------- CUSTOMER VIEW MODE ---------------- */}
      {mode === 'customer' && (
        <div className="min-h-screen flex flex-col">
          {/* If inside checkout flow, render CheckoutView exclusively */}
          {inCheckout ? (
            <CheckoutView
              cart={cart}
              settings={settings}
              onBackToCart={() => setInCheckout(false)}
              onOrderPlaced={handleOrderPlaced}
            />
          ) : (
            <>
              {/* Customer Header */}
              <CustomerHeader
                settings={settings}
                cartCount={cartTotalItems}
                onOpenCart={() => {
                  setActiveConfirmedOrder(null);
                  setCustomerTab('cart');
                }}
                onSwitchToMerchant={() => setMode('merchant')}
                activeTab={customerTab}
                onChangeTab={(tab) => {
                  setActiveConfirmedOrder(null);
                  setCustomerTab(tab);
                }}
              />

              {/* Customer Main Area */}
              <main className="flex-1">
                {activeConfirmedOrder ? (
                  <OrderConfirmedView
                    order={activeConfirmedOrder}
                    settings={settings}
                    onBackToHome={() => {
                      setActiveConfirmedOrder(null);
                      setCustomerTab('home');
                    }}
                    onOpenReceipt={() => setViewingReceiptOrder(activeConfirmedOrder)}
                    onAdvanceOrderStatus={handleAdvanceOrderStatus}
                  />
                ) : customerTab === 'cart' ? (
                  <CartView
                    cart={cart}
                    settings={settings}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    onRemoveItem={handleRemoveCartItem}
                    onProceedToCheckout={() => setInCheckout(true)}
                    onBackToShopping={() => setCustomerTab('home')}
                  />
                ) : customerTab === 'orders' ? (
                  <CustomerOrdersView
                    orders={orders}
                    settings={settings}
                    onSelectOrder={(order) => setActiveConfirmedOrder(order)}
                    onExploreMenu={() => setCustomerTab('home')}
                  />
                ) : (
                  <CustomerStorefront
                    products={products}
                    categories={categories}
                    settings={settings}
                    onSelectProduct={(product) => setSelectedProductForDetail(product)}
                    onQuickAddToCart={handleQuickAddToCart}
                  />
                )}
              </main>

              {/* Customer Mobile Bottom Bar */}
              {!inCheckout && !activeConfirmedOrder && (
                <CustomerBottomNav
                  activeTab={customerTab}
                  onChangeTab={(tab) => {
                    setActiveConfirmedOrder(null);
                    setCustomerTab(tab);
                  }}
                  cartCount={cartTotalItems}
                />
              )}
            </>
          )}

          {/* Product Detail Modal */}
          {selectedProductForDetail && (
            <ProductDetailModal
              product={selectedProductForDetail}
              settings={settings}
              onClose={() => setSelectedProductForDetail(null)}
              onAddToCart={handleAddToCart}
            />
          )}

          {/* View Receipt Modal */}
          {viewingReceiptOrder && (
            <ViewReceiptModal
              order={viewingReceiptOrder}
              settings={settings}
              onClose={() => setViewingReceiptOrder(null)}
            />
          )}
        </div>
      )}

      {/* ---------------- MERCHANT VIEW MODE ---------------- */}
      {mode === 'merchant' && (
        <div className="min-h-screen flex bg-[#050507]">
          {/* Desktop Left Sidebar */}
          <MerchantSidebar
            activeTab={merchantTab}
            onChangeTab={(t) => setMerchantTab(t)}
            settings={settings}
            onToggleStoreStatus={handleToggleStoreStatus}
            onSwitchToCustomer={() => setMode('customer')}
            pendingOrdersCount={pendingOrdersCount}
          />

          {/* Right Main Area */}
          <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
            {/* Mobile/Tablet Header */}
            <MerchantHeader
              settings={settings}
              onToggleStoreStatus={handleToggleStoreStatus}
              onSwitchToCustomer={() => setMode('customer')}
            />

            {/* Merchant Tab Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
              {merchantTab === 'home' && (
                <MerchantDashboard
                  orders={orders}
                  settings={settings}
                  onChangeTab={(tab) => {
                    if (tab === 'add_product') setEditingProduct(null);
                    setMerchantTab(tab);
                  }}
                  onSelectOrder={(order) => setSelectedMerchantOrder(order)}
                />
              )}

              {merchantTab === 'products' && (
                <MerchantProducts
                  products={products}
                  settings={settings}
                  onAddProduct={() => {
                    setEditingProduct(null);
                    setMerchantTab('add_product');
                  }}
                  onEditProduct={(product) => {
                    setEditingProduct(product);
                    setMerchantTab('add_product');
                  }}
                  onToggleProductActive={handleToggleProductActive}
                  onDeleteProduct={handleDeleteProduct}
                  onOpenCategories={() => setMerchantTab('categories')}
                />
              )}

              {merchantTab === 'add_product' && (
                <MerchantAddEditProduct
                  initialProduct={editingProduct}
                  categories={categories}
                  settings={settings}
                  onSave={handleSaveProduct}
                  onCancel={() => {
                    setEditingProduct(null);
                    setMerchantTab('products');
                  }}
                />
              )}

              {merchantTab === 'orders' && (
                <MerchantOrders
                  orders={orders}
                  settings={settings}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onViewOrderDetail={(order) => setSelectedMerchantOrder(order)}
                />
              )}

              {merchantTab === 'categories' && (
                <MerchantCategories
                  categories={categories}
                  products={products}
                  onAddCategory={handleAddCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onDeleteCategory={handleDeleteCategory}
                />
              )}

              {merchantTab === 'customers' && (
                <MerchantCustomers orders={orders} settings={settings} />
              )}

              {merchantTab === 'settings' && (
                <MerchantSettings
                  settings={settings}
                  onUpdateSettings={(newSet) => setSettings(newSet)}
                />
              )}
            </main>

            {/* Merchant Mobile Bottom Navigation */}
            <MerchantBottomNav
              activeTab={merchantTab}
              onChangeTab={(tab) => {
                if (tab === 'add_product') setEditingProduct(null);
                setMerchantTab(tab);
              }}
              pendingOrdersCount={pendingOrdersCount}
            />
          </div>

          {/* Merchant Order Details Modal */}
          {selectedMerchantOrder && (
            <MerchantOrderDetailModal
              order={selectedMerchantOrder}
              settings={settings}
              onClose={() => setSelectedMerchantOrder(null)}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}
        </div>
      )}
    </div>
  );
}

