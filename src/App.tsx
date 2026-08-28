import React, { useState } from 'react';
import {
  AppMode,
  CustomerTab,
  MerchantTab,
  Product,
  Category,
  Order,
  StoreSettings
} from './types';
import { DEFAULT_MERCHANT_ID } from './data/initialData';

// Custom Hooks for Architecture Layering
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { useProducts } from './hooks/useProducts';
import { useOrders } from './hooks/useOrders';
import { useMerchant } from './hooks/useMerchant';
import { useStoreSettings } from './hooks/useStoreSettings';
import { useCustomerOrderRealtime } from './hooks/useOrderRealtime';

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
import { MerchantAuthModal } from './components/merchant/MerchantAuthModal';
import { OrderNotificationToast } from './components/merchant/OrderNotificationToast';

export default function App() {
  // Navigation & Mode States
  const [mode, setMode] = useState<AppMode>('customer');
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [merchantTab, setMerchantTab] = useState<MerchantTab>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [incomingOrderNotification, setIncomingOrderNotification] = useState<Order | null>(null);

  // Authentication State
  const auth = useAuth();

  // Active Merchant ID determination
  const activeMerchantId = auth.merchant?.id || (auth.isDemoMode || !auth.isAuthenticated ? DEFAULT_MERCHANT_ID : '');

  // Business State Hooks
  const { merchantId, categories, customers, addCategory, updateCategory, deleteCategory } = useMerchant(activeMerchantId);
  const { settings, updateSettings, toggleStoreStatus } = useStoreSettings(merchantId);
  const { products, saveProduct, toggleProductActive, deleteProduct } = useProducts(merchantId);
  const {
    orders,
    pendingOrdersCount,
    placeOrder,
    updateOrderStatus,
    advanceOrderStatus,
    setOrders
  } = useOrders(merchantId, {
    isMerchantAuthenticated: auth.isAuthenticated,
    onIncomingOrder: (newOrder) => {
      // Trigger visual toast notification
      setIncomingOrderNotification(newOrder);
    }
  });
  const {
    cart,
    cartTotalItems,
    addToCart,
    quickAddToCart,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();

  // Modal and Flow States
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inCheckout, setInCheckout] = useState(false);
  const [activeConfirmedOrder, setActiveConfirmedOrder] = useState<Order | null>(null);
  const [selectedMerchantOrder, setSelectedMerchantOrder] = useState<Order | null>(null);
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);

  // Customer Realtime tracking for active order
  useCustomerOrderRealtime({
    orderId: activeConfirmedOrder?.id,
    merchantId,
    trackingToken: activeConfirmedOrder?.trackingToken,
    enabled: Boolean(activeConfirmedOrder?.id),
    onOrderUpdated: (updated) => {
      setActiveConfirmedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    }
  });

  // Mode Switch Handlers
  const handleSwitchToMerchant = () => {
    if (auth.isAuthenticated) {
      setMode('merchant');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    setMode('customer');
  };

  // Cart operations
  const handleQuickAddToCart = (product: Product) => {
    quickAddToCart(product, (p) => setSelectedProductForDetail(p));
  };

  // Order Placement
  const handleOrderPlaced = async (newOrder: Order) => {
    const created = await placeOrder(newOrder);
    clearCart();
    setInCheckout(false);
    setActiveConfirmedOrder(created);
  };

  // Status progression
  const handleAdvanceOrderStatus = async (orderId: string) => {
    const updated = await advanceOrderStatus(orderId);
    if (activeConfirmedOrder && activeConfirmedOrder.id === orderId) {
      setActiveConfirmedOrder(updated);
    }
  };

  const handleMerchantUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updated = await updateOrderStatus(orderId, status);
    if (selectedMerchantOrder && selectedMerchantOrder.id === orderId) {
      setSelectedMerchantOrder(updated);
    }
  };

  // Product Save Flow
  const handleSaveProduct = async (product: Product) => {
    await saveProduct(product);
    setEditingProduct(null);
    setMerchantTab('products');
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
    }
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
                onSwitchToMerchant={handleSwitchToMerchant}
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
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeItem}
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
              onAddToCart={addToCart}
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
            onToggleStoreStatus={toggleStoreStatus}
            onSwitchToCustomer={() => setMode('customer')}
            pendingOrdersCount={pendingOrdersCount}
            user={auth.user}
            role={auth.role}
            isDemoMode={auth.isDemoMode}
            onSignOut={handleSignOut}
          />

          {/* Right Main Area */}
          <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
            {/* Mobile/Tablet Header */}
            <MerchantHeader
              settings={settings}
              onToggleStoreStatus={toggleStoreStatus}
              onSwitchToCustomer={() => setMode('customer')}
              role={auth.role}
              isDemoMode={auth.isDemoMode}
              onSignOut={handleSignOut}
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
                  onToggleProductActive={toggleProductActive}
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
                  onUpdateOrderStatus={handleMerchantUpdateOrderStatus}
                  onViewOrderDetail={(order) => setSelectedMerchantOrder(order)}
                />
              )}

              {merchantTab === 'categories' && (
                <MerchantCategories
                  categories={categories}
                  products={products}
                  onAddCategory={addCategory}
                  onUpdateCategory={updateCategory}
                  onDeleteCategory={deleteCategory}
                />
              )}

              {merchantTab === 'customers' && (
                <MerchantCustomers
                  orders={orders}
                  settings={settings}
                  customers={customers}
                />
              )}

              {merchantTab === 'settings' && (
                <MerchantSettings
                  settings={settings}
                  onUpdateSettings={(newSet: StoreSettings) => updateSettings(newSet)}
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
              onUpdateStatus={handleMerchantUpdateOrderStatus}
            />
          )}

          {/* Realtime Order Alert Toast */}
          {incomingOrderNotification && (
            <OrderNotificationToast
              order={incomingOrderNotification}
              settings={settings}
              onViewOrder={(order) => {
                setSelectedMerchantOrder(order);
                setMerchantTab('orders');
              }}
              onDismiss={() => setIncomingOrderNotification(null)}
            />
          )}
        </div>
      )}

      {/* ---------------- MERCHANT AUTH MODAL ---------------- */}
      <MerchantAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isLoading={auth.isLoading}
        error={auth.error}
        onClearError={auth.clearError}
        onSignIn={async (credentials) => {
          await auth.signIn(credentials);
          setShowAuthModal(false);
          setMode('merchant');
        }}
        onSignUp={async (signUpData) => {
          await auth.signUp(signUpData);
          setShowAuthModal(false);
          setMode('merchant');
        }}
        onEnableDemoMode={() => {
          auth.enableDemoMode();
          setShowAuthModal(false);
          setMode('merchant');
        }}
      />
    </div>
  );
}
