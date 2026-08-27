import { Product, Category, Order, StoreSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'lutong-ulam',
    name: 'Lutong Ulam',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCSQC0nQ5rF6iyPjSoX5jsXNDDPf_V6LqOYsGz4R3paipmUk_5yCVsSQel_f3lzyH4qHYrPNzgKSmFk4zmk8rM1fwB34PiNxOFyJLweQrPZNC57z1_MJSWfCLo15Wv18u30fuU6hiApX9MVlL7kaRHgBkaqCpU8f8GrjKQcesK4PKc-iZUPeRPkra3WMxKHuQs0iEyQ4OHeSNrgEhD1OTjo4RW7QecWwAyIJxO8RbeICfCrDXfxyWs',
    count: 12
  },
  {
    id: 'meryenda',
    name: 'Meryenda',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBislfxJKao9rLMVgnTEkirGlLfNE4Tz7HC2ErVPGEkTHSts44YbDIts3DN0a7pM4AWzhPh-C1DB-edFPCiRyibeqD584mWzVKA1lxZo_4f-BBK58NEH2wJ1eSg5egV9kBEBJcI8PA2j7PzRiACmFsWFW_9gBsdhOk-gHIt4rmYpx5DVb845nQMp0PUHV1KW6WoreA68i-haVHYU18j9Qry7esq8_LxOauvQOUZLPUoz6nMIiCjWWMq',
    count: 8
  },
  {
    id: 'drinks',
    name: 'Drinks',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDU8PKT0OgqMM8OUzRIeuZifiFDW8n35h8nVQilrKO5BSRtD6QrFEEm34iqrz0lNBv_WWAUEK_0InolphkaegL4vxUBBq6GYZuCga1UHjj4yftspKwfQURp9zBH0PDFKWZJdQUGZ4waAjh602v0XAY7I0jor1Kk2rw-ajzuSL4UxD8AS9AUKW3rIaRRPKDtgkAzmXXk9-J3u3yOa-S6hj_B3m-pRpD6Iqtrl_QCm-r_4suLVNZzKvYY',
    count: 6
  },
  {
    id: 'clothing',
    name: 'Clothing',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8eRFNFZ_ZTT2q4eI583qt2srqGduBRoUjDE9vo4Xk-UHhTqlJ7fWvP-hqharTsvLVmv3KRxbEqyPB-nYkeWu3WH5fUFzW7hMyFfSTcTC2YvIaYjoFGs6UfEmCN1UyaIh-RrZSMYR-zI13RHg2SZANCfVwpVjfxe1ZUs3TqHJiBk-9Gi4EsxzAMjoVeflIXpKuvZbe_3qhFI7CbO_-YOQXfjrjTvjZ0b_JTCEVihpO6lHFMNyHHfsA',
    count: 4
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-chicken-adobo',
    name: 'Chicken Adobo Special',
    category: 'Lutong Ulam',
    basePrice: 250,
    description: 'Our award-winning signature dish. Tender chicken pieces slow-cooked in a perfectly balanced soy sauce and vinegar reduction, with abundant garlic and whole peppercorns. Served with garlic rice.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRWUr9Bq0WhhX2mDX81QXtUgWh1uO68qtlUMp4chEtaXbrhvXyTdga_BAb7yMH504SPCr7-HyhY7h5k-e0IzAB9XwZRyVtTqejTCG8-ekS2lxfflHlj_8h0kxx7Z3NeAhtn-LMIrEmoMzdtYbbSQSc_ut-dciZCvp42L_RLPYRbm0QTAr0HKV58IqCtvutti3JFFUlJOpVIbNveHM9A8-6uqbtQo3hlr1d0QzAJruJhvlwmLUpd-6H',
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    tag: 'HOT MEALS',
    optionGroups: [
      {
        id: 'rice',
        name: 'Rice Choice',
        type: 'radio',
        required: true,
        options: [
          { id: 'rice-none', name: 'No Rice', priceModifier: 0 },
          { id: 'rice-white', name: 'White Rice', priceModifier: 20 },
          { id: 'rice-garlic', name: 'Garlic Rice', priceModifier: 35 }
        ]
      },
      {
        id: 'spice',
        name: 'Spice Level',
        type: 'pills',
        required: true,
        options: [
          { id: 'spice-normal', name: 'Normal', priceModifier: 0 },
          { id: 'spice-spicy', name: 'Spicy', priceModifier: 0 },
          { id: 'spice-extra', name: 'Extra Spicy', priceModifier: 0 }
        ]
      },
      {
        id: 'addons',
        name: 'Add-ons',
        type: 'checkbox',
        required: false,
        options: [
          { id: 'addon-egg', name: 'Extra Egg', priceModifier: 15 },
          { id: 'addon-sauce', name: 'Extra Sauce', priceModifier: 10 }
        ]
      }
    ]
  },
  {
    id: 'prod-pork-sinigang',
    name: 'Pork Sinigang',
    category: 'Lutong Ulam',
    basePrice: 280,
    description: 'Classic sour tamarind soup with tender pork belly, fresh kangkong, radish, and tomatoes.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA81i7JFe0T9Qf4BZApId_fXw7qo8H6HVsXrFYch_SdqC5TpaU4eZVqfI_Chpwm8ICMDil0sNrFnzAmddMtWEVpYcKAzJpLizbYE4vx5eRNd49Aqhwbn5ltdgEPEmuDjY3JKTRMffaumUI2OOo5PbKorPk7IMMvQ0zBGiGU0ldnhW111eZcT_WxKfCWXWb9Nav81etxNV88ZAmzpMFAbJCgUVODHGtNMf-5UAUmj9rYL1BjBHIXQL_U',
    isFeatured: false,
    isActive: true,
    tag: 'HOT MEALS',
    optionGroups: [
      {
        id: 'serving',
        name: 'Serving Size',
        type: 'radio',
        required: true,
        options: [
          { id: 'serv-solo', name: 'Solo Portion', priceModifier: 0 },
          { id: 'serv-family', name: 'Family Size (2-3 pax)', priceModifier: 100 }
        ]
      },
      {
        id: 'rice',
        name: 'Rice Choice',
        type: 'radio',
        required: false,
        options: [
          { id: 'rice-none', name: 'No Rice', priceModifier: 0 },
          { id: 'rice-steamed', name: 'Steamed Rice', priceModifier: 20 }
        ]
      }
    ]
  },
  {
    id: 'prod-pancit-canton',
    name: 'Pancit Canton',
    category: 'Lutong Ulam',
    basePrice: 150,
    description: 'Stir-fried noodles with mixed vegetables, calamansi, and savory sauce.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeeb7BYI-gNOzN5dL2p91b03q_341tAoX7LR1C_TuKPgQSUseAfPCmexb74YviYk23FDlZel8pH4liRKITmFztO8mIDLdJjql5Q02nY3SPveby4361K1ZnXyHn-jgbFsMyynM5E-PEtqa6nPw-iqhcr5L8bWYyCJwrGw8CiSbfE_YlN4INtPTBFcTBtU-H4IkIdGvij7yrpuQAxx_EApWNDLTpt9bBqRP9F09J98Ihe3n24T1AT_cP',
    isFeatured: false,
    isActive: true,
    tag: 'HOT MEALS',
    optionGroups: [
      {
        id: 'portion',
        name: 'Portion',
        type: 'radio',
        required: true,
        options: [
          { id: 'p-regular', name: 'Regular Platter', priceModifier: 0 },
          { id: 'p-bilao', name: 'Party Bilao', priceModifier: 300 }
        ]
      }
    ]
  },
  {
    id: 'prod-turon',
    name: 'Turon',
    category: 'Meryenda',
    basePrice: 45,
    description: 'Crispy fried banana spring rolls coated in rich caramelized brown sugar and jackfruit.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrZDL26AuQdA-y_zUoaVpIOulX83Npk24gjkRM175CP7U4GV5E-XA-mbTMgZ6IoTDkzNPcyccfXH-oBd7zE-rPfDguQ82pBHntck3vaMUtMf2TWtNBYY-0iULqknw489TpKt89Q8k5Q5jXPR8o_V6eCNV2xptxbZsn4FPmlqF0bX_JSC7cXqcIPE2TWgSTzLm5grcY0yyYhhZzpM0gZxVJl9QwAeQ9pJnx3qabNwnf_K8OFjCGBZAL',
    isFeatured: false,
    isActive: true,
    tag: 'MERYENDA',
    optionGroups: [
      {
        id: 'dip',
        name: 'Dipping Sauce',
        type: 'radio',
        required: false,
        options: [
          { id: 'dip-none', name: 'None', priceModifier: 0 },
          { id: 'dip-caramel', name: 'Caramel Drizzle', priceModifier: 10 },
          { id: 'dip-latik', name: 'Coconut Latik', priceModifier: 15 }
        ]
      }
    ]
  },
  {
    id: 'prod-floral-dress',
    name: 'Floral Summer Dress',
    category: 'Clothing',
    basePrice: 599,
    description: 'Lightweight and breathable floral dress perfect for summer outings and tropical weather.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzTXxO09JpE9vvD5CG7Ny1mIIU2kL0QjOUrA-z2leL-9XF6bT1Zkf0YvTlE3uEgzx3I6rA6_gQTWXEmfbaRoPk6j49Yxl_QndQGyZTo6vOslkx6LIZqTuoC07E8HjbOUvMzfnphbLOLGvzTfglbIzhOpIBwAba4mMm-3ygWFKAYd-lto7OVgQZwIpXN1i7e5iyy1l9yEGmDO3k4N0gYm5A9D4dN1NYoloDtGgLSgIZdsls_Qyk3nq7',
    isFeatured: false,
    isActive: true,
    tag: 'APPAREL',
    optionGroups: [
      {
        id: 'size',
        name: 'Size',
        type: 'pills',
        required: true,
        options: [
          { id: 'sz-s', name: 'Small', priceModifier: 0 },
          { id: 'sz-m', name: 'Medium', priceModifier: 0 },
          { id: 'sz-l', name: 'Large', priceModifier: 0 },
          { id: 'sz-xl', name: 'XL', priceModifier: 0 }
        ]
      },
      {
        id: 'color',
        name: 'Color',
        type: 'radio',
        required: true,
        options: [
          { id: 'col-black', name: 'Classic Black', priceModifier: 0, colorHex: '#000000' },
          { id: 'col-red', name: 'Rose Red', priceModifier: 0, colorHex: '#ef4444' },
          { id: 'col-blue', name: 'Ocean Blue', priceModifier: 0, colorHex: '#3b82f6' }
        ]
      },
      {
        id: 'gift',
        name: 'Gift Options',
        type: 'checkbox',
        required: false,
        options: [
          { id: 'gift-wrap', name: 'Gift Wrap', priceModifier: 50 },
          { id: 'gift-note', name: 'Custom Note', priceModifier: 20 }
        ]
      }
    ]
  },
  {
    id: 'prod-sisig',
    name: 'Classic Pork Sisig',
    category: 'Lutong Ulam',
    basePrice: 285,
    description: 'Sizzling minced pork seasoned with calamansi, onions, and chili peppers. Served with fresh egg on top.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBvmkR_xMilFYbNUzowUp27hz1tPPshN0VyitxUvyCECsGBomGkHnd8Wc9WFvIAMxNel8pY3GDUhcr0RYe3WAtTfkVsGDZhnoN02leVZexsDuT0VkNJ5US3f0fpUnHDENL5Jk_D52sk8jzj1XRY2asZp5tP5MXZ5FcsC0ifCl_QS952xKYjUoPv6rgtT2Ygd0NwJ4gAtp6M8pFcVH18Qzf2z7n4Re4LP2WMBeU078gVhpmXBRrZRJs',
    isFeatured: false,
    isActive: true,
    tag: 'HOT MEALS',
    optionGroups: [
      {
        id: 'egg',
        name: 'Egg Option',
        type: 'radio',
        required: true,
        options: [
          { id: 'egg-fresh', name: 'Raw Fresh Egg on top', priceModifier: 0 },
          { id: 'egg-fried', name: 'Extra Fried Egg', priceModifier: 15 },
          { id: 'egg-none', name: 'No Egg', priceModifier: 0 }
        ]
      },
      {
        id: 'spice',
        name: 'Spice Level',
        type: 'pills',
        required: true,
        options: [
          { id: 'sp-mild', name: 'Mild', priceModifier: 0 },
          { id: 'sp-hot', name: 'Hot', priceModifier: 0 },
          { id: 'sp-extreme', name: 'Extreme Sili', priceModifier: 0 }
        ]
      }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'order-8829-a',
    orderNumber: '#8829-A',
    customerName: 'Maria Santos',
    phone: '+63 917 123 4567',
    fulfillment: 'delivery',
    address: '123 Sampaguita St., Brgy. San Lorenzo, Makati City',
    paymentMethod: 'gcash',
    notes: 'Please separate the sauce and extra garlic rice.',
    items: [
      {
        productId: 'prod-chicken-inasal',
        title: 'Chicken Inasal Plate',
        optionsDescription: 'Garlic Rice, Extra Garlic Bits',
        quantity: 2,
        unitPrice: 225,
        totalPrice: 450
      },
      {
        productId: 'prod-halo-halo',
        title: 'Halo-Halo',
        optionsDescription: 'With Ube Ice Cream',
        quantity: 1,
        unitPrice: 120,
        totalPrice: 120
      }
    ],
    subtotal: 570,
    deliveryFee: 50,
    total: 620,
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    timeAgo: '2 min ago',
    estimatedTime: '30-45 mins'
  },
  {
    id: 'order-8829-b',
    orderNumber: '#8829-B',
    customerName: 'Jose Rizal Jr.',
    phone: '+63 918 555 1896',
    fulfillment: 'delivery',
    address: 'Unit 1204, Alpha Tower, Ayala Avenue, Makati City',
    paymentMethod: 'maya',
    notes: 'Extra spicy for the sisig please!',
    items: [
      {
        productId: 'prod-sisig',
        title: 'Pork Sisig',
        optionsDescription: 'Extra spicy',
        quantity: 1,
        unitPrice: 220,
        totalPrice: 220
      },
      {
        productId: 'prod-garlic-rice',
        title: 'Garlic Rice',
        optionsDescription: 'Solo portion',
        quantity: 2,
        unitPrice: 35,
        totalPrice: 70
      }
    ],
    subtotal: 290,
    deliveryFee: 50,
    total: 340,
    status: 'accepted',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    timeAgo: '5 min ago',
    estimatedTime: '25-35 mins'
  },
  {
    id: 'order-8829-c',
    orderNumber: '#8829-C',
    customerName: 'Anna Lim',
    phone: '+63 920 987 6543',
    fulfillment: 'delivery',
    address: 'Penthouse B, Salcedo Park Towers, Makati City',
    paymentMethod: 'cod',
    items: [
      {
        productId: 'prod-pancit',
        title: 'Pancit Palabok (Family Size)',
        optionsDescription: 'Complete toppings with chicharon',
        quantity: 4,
        unitPrice: 300,
        totalPrice: 1200
      }
    ],
    subtotal: 1200,
    deliveryFee: 50,
    total: 1250,
    status: 'preparing',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    timeAgo: '12 min ago',
    estimatedTime: '15-20 mins'
  },
  {
    id: 'order-1040',
    orderNumber: '#1040',
    customerName: 'Ana Reyes',
    phone: '+63 917 888 4321',
    fulfillment: 'pickup',
    address: 'Store Pickup',
    paymentMethod: 'gcash',
    items: [
      {
        productId: 'prod-pancit-canton',
        title: 'Pancit Canton',
        optionsDescription: 'Regular Platter',
        quantity: 1,
        unitPrice: 150,
        totalPrice: 150
      }
    ],
    subtotal: 150,
    deliveryFee: 0,
    total: 150,
    status: 'ready',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    timeAgo: '1 hr ago',
    estimatedTime: 'Ready for Pickup'
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: "Juan's Kitchen",
  isOpen: true,
  phone: '+63 917 123 4567',
  address: 'Ground Floor, Ayala Food Hall, Makati City',
  deliveryFee: 50,
  currency: '₱',
  trialDaysLeft: 4,
  merchantId: '8829',
  plan: 'Premium Plan'
};
