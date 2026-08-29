import React, { useState, useEffect } from 'react';
import {
  CustomerTab,
  MerchantTab,
  Product,
  Order,
  StoreSettings
} from './types';
import { merchantService } from './services/merchantService';

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
import { MerchantOnboarding } from './components/merchant/MerchantOnboarding';
import { OrderNotificationToast } from './components/merchant/OrderNotificationToast';
import { isSupabaseConfigured } from './lib/supabase';
import { AlertTriangle, Loader2, Store, ArrowLeft } from 'lucide-react';

function parseStoreSlugFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  const pathname = window.location.pathname;
  const match = pathname.match(/^\/store\/([^/?#]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('store') || params.get('merchant') || null;
}

export default function App() {
  // Navigation & Storefront Route States
  const [urlStoreSlug] = useState<string | null>(() => parseStoreSlugFromLocation());
  const [isViewingStorefrontAsOwner, setIsViewingStorefrontAsOwner] = useState(false);
  const [discoveredMerchantId, setDiscoveredMerchantId] = useState<string>('');
  const [isDiscoveringStore, setIsDiscoveringStore] = useState<boolean>(() => Boolean(parseStoreSlugFromLocation()));
  const [storeNotFound, setStoreNotFound] = useState<boolean>(false);

  // Tabs & Views
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [merchantTab, setMerchantTab] = useState<MerchantTab>('home');
  const [incomingOrderNotification, setIncomingOrderNotification] = useState<Order | null>(null);

  // Authentication State
  const auth = useAuth();

  // Route Determination: Customer Storefront vs Merchant Portal
  const isCustomerStorefront = Boolean(urlStoreSlug) || isViewingStorefrontAsOwner;

  // Active Merchant ID determination
  const activeMerchantId = isCustomerStorefront
    ? (discoveredMerchantId || (isViewingStorefrontAsOwner ? (auth.merchant?.id || '') : ''))
    : (auth.merchant?.id || '');

  // Discover storefront merchant when on a public customer URL
  useEffect(() => {
    if (!urlStoreSlug) {
      setIsDiscoveringStore(false);
      return;
    }

    let isMounted = true;
    const discoverStore = async () => {
      setIsDiscoveringStore(true);
      setStoreNotFound(false);
      try {
        const m = await merchantService.getMerchantBySlug(urlStoreSlug);
        if (isMounted) {
          if (m) {
            setDiscoveredMerchantId(m.id);
            setStoreNotFound(false);
          } else {
            setDiscoveredMerchantId('');
            setStoreNotFound(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Storefront merchant discovery error:', err);
          setStoreNotFound(true);
        }
      } finally {
        if (isMounted) {
          setIsDiscoveringStore(false);
        }
      }
    };

    discoverStore();
    return () => {
      isMounted = false;
    };
  }, [urlStoreSlug]);

  // Business State Hooks
  const { merchantId, categories, customers, addCategory, updateCategory, deleteCategory } = useMerchant(activeMerchantId);
  const { settings, updateSettings, toggleStoreStatus } = useStoreSettings(merchantId);
  const { products, saveProduct, toggleProductActive, deleteProduct } = useProducts(merchantId);
  const {
    orders,
    pendingOrdersCount,
    placeOrder,
    updateOrderStatus,
    setOrders
  } = useOrders(merchantId, {
    isMerchantAuthenticated: auth.isAuthenticated,
    onIncomingOrder: (newOrder) => {
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
  } = useCart(activeMerchantId);

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

  const handleSignOut = async () => {
    await auth.signOut();
    setIsViewingStorefrontAsOwner(false);
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

  // Production configuration guard: never silently fall back to mock data in production
  if (import.meta.env.PROD && !isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#050507] text-[#e0e0e2] flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 bg-[#0e0f17] border border-[#1f202e] rounded-3xl shadow-xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">System Configuration Notice</h2>
          <p className="text-sm text-[#9496a1]">
            Vendora is not configured correctly. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 1. PUBLIC CUSTOMER STOREFRONT ROUTE (e.g. /store/:slug or ?store=slug)
  // --------------------------------------------------------------------------
  if (isCustomerStorefront) {
    if (isDiscoveringStore) {
      return (
        <div className="min-h-screen bg-[#050507] text-[#e0e0e2] flex flex-col items-center justify-center p-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#181926] border border-[#27273a] flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-[#818cf8] text-[28px] fill">restaurant</span>
          </div>
          <div className="flex items-center gap-2 text-[#9496a1] text-[14px]">
            <Loader2 className="w-4 h-4 animate-spin text-[#818cf8]" />
            <span>Loading storefront...</span>
          </div>
        </div>
      );
    }

    if (storeNotFound) {
      return (
        <div className="min-h-screen bg-[#050507] text-[#e0e0e2] flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 bg-[#0e0f17] border border-[#1f202e] rounded-3xl shadow-xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Store Not Found</h2>
            <p className="text-sm text-[#9496a1]">
              We couldn&apos;t find a store matching &quot;{urlStoreSlug}&quot;. Please verify the store URL or contact the restaurant.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#050507] text-[#e0e0e2] antialiased selection:bg-[#4f46e5] selection:text-white">
        {/* Owner Storefront Preview Banner (Only visible when merchant clicks 'View Customer Storefront' in dashboard) */}
        {isViewingStorefrontAsOwner && auth.isAuthenticated && auth.merchant && (
          <div className="bg-[#1e1e38] border-b border-[#2e3048] px-4 py-2 text-xs flex items-center justify-between text-[#818cf8] sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
              <span>Store Owner Preview Mode: <strong>{settings.storeName || auth.merchant.name}</strong></span>
            </div>
            <button
              onClick={() => setIsViewingStorefrontAsOwner(false)}
              className="px-3 py-1 bg-[#4f46e5] hover:bg-[#6366f1] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}

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
              {/* Customer Header (Strictly customer-only, no merchant access) */}
              <CustomerHeader
                settings={settings}
                cartCount={cartTotalItems}
                onOpenCart={() => {
                  setActiveConfirmedOrder(null);
                  setCustomerTab('cart');
                }}
                activeTab={customerTab}
                onChangeTab={(tab) => {
                  setActiveConfirmedOrder(null);
                  setCustomerTab(tab);
                }}
              />

              {/* Customer Main Area */}
              <main className="flex-1 pt-16">
                {activeConfirmedOrder ? (
                  <OrderConfirmedView
                    order={activeConfirmedOrder}
                    settings={settings}
                    onBackToHome={() => {
                      setActiveConfirmedOrder(null);
                      setCustomerTab('home');
                    }}
                    onOpenReceipt={() => setViewingReceiptOrder(activeConfirmedOrder)}
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
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. ROOT & MERCHANT ROUTE (Visitor opens "/" or "/merchant")
  // --------------------------------------------------------------------------

  // A. Initial Authentication Session Loading
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-[#050507] text-[#e0e0e2] flex flex-col items-center justify-center p-6 space-y-4 selection:bg-[#4f46e5] selection:text-white">
        <div className="w-14 h-14 rounded-2xl bg-[#1e1e38] border border-[#2e3048] text-[#818cf8] flex items-center justify-center shadow-lg animate-pulse">
          <Store className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2.5 text-[#9496a1] text-[14px]">
          <Loader2 className="w-4 h-4 animate-spin text-[#818cf8]" />
          <span>Loading Vendora Merchant Portal...</span>
        </div>
      </div>
    );
  }

  // B. Authenticated Merchant Session Exists
  if (auth.isAuthenticated) {
    if (!auth.merchant) {
      // User is authenticated but does not have a store yet -> Onboarding
      return (
        <MerchantOnboarding
          user={auth.user}
          profile={auth.profile}
          onCreateStore={async (data) => {
            await auth.createStore(data);
          }}
          onSignOut={handleSignOut}
        />
      );
    }

    // Authenticated Merchant Dashboard
    return (
      <div className="min-h-screen flex bg-[#050507] text-[#e0e0e2] selection:bg-[#4f46e5] selection:text-white">
        {/* Desktop Left Sidebar */}
        <MerchantSidebar
          activeTab={merchantTab}
          onChangeTab={(t) => setMerchantTab(t)}
          settings={settings}
          onToggleStoreStatus={toggleStoreStatus}
          onSwitchToCustomer={() => setIsViewingStorefrontAsOwner(true)}
          pendingOrdersCount={pendingOrdersCount}
          user={auth.user}
          role={auth.role}
          onSignOut={handleSignOut}
        />

        {/* Right Main Area */}
        <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
          {/* Mobile/Tablet Header */}
          <MerchantHeader
            settings={settings}
            onToggleStoreStatus={toggleStoreStatus}
            onSwitchToCustomer={() => setIsViewingStorefrontAsOwner(true)}
            role={auth.role}
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
    );
  }

  // C. Unauthenticated Visitor on "/" -> Show Merchant Portal Entry Screen (Sign In / Create Account)
  return (
    <MerchantAuthModal
      isStandalone={true}
      isLoading={auth.isLoading}
      error={auth.error}
      onClearError={auth.clearError}
      onSignIn={async (credentials) => {
        await auth.signIn(credentials);
      }}
      onSignUp={async (signUpData) => {
        const result = await auth.signUp(signUpData);
        return result;
      }}
    />
  );
}
