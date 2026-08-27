import React, { useState } from 'react';
import { Product, OptionGroup, StoreSettings, Category } from '../../types';
import { ArrowLeft, Upload, Plus, Trash2, GripVertical, Check } from 'lucide-react';

interface MerchantAddEditProductProps {
  initialProduct?: Product | null;
  categories: Category[];
  settings: StoreSettings;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const SAMPLE_IMAGE_PRESETS = [
  { name: 'Adobo Rice Platter', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRWUr9Bq0WhhX2mDX81QXtUgWh1uO68qtlUMp4chEtaXbrhvXyTdga_BAb7yMH504SPCr7-HyhY7h5k-e0IzAB9XwZRyVtTqejTCG8-ekS2lxfflHlj_8h0kxx7Z3NeAhtn-LMIrEmoMzdtYbbSQSc_ut-dciZCvp42L_RLPYRbm0QTAr0HKV58IqCtvutti3JFFUlJOpVIbNveHM9A8-6uqbtQo3hlr1d0QzAJruJhvlwmLUpd-6H' },
  { name: 'Sinigang Soup', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA81i7JFe0T9Qf4BZApId_fXw7qo8H6HVsXrFYch_SdqC5TpaU4eZVqfI_Chpwm8ICMDil0sNrFnzAmddMtWEVpYcKAzJpLizbYE4vx5eRNd49Aqhwbn5ltdgEPEmuDjY3JKTRMffaumUI2OOo5PbKorPk7IMMvQ0zBGiGU0ldnhW111eZcT_WxKfCWXWb9Nav81etxNV88ZAmzpMFAbJCgUVODHGtNMf-5UAUmj9rYL1BjBHIXQL_U' },
  { name: 'Pancit Canton', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeeb7BYI-gNOzN5dL2p91b03q_341tAoX7LR1C_TuKPgQSUseAfPCmexb74YviYk23FDlZel8pH4liRKITmFztO8mIDLdJjql5Q02nY3SPveby4361K1ZnXyHn-jgbFsMyynM5E-PEtqa6nPw-iqhcr5L8bWYyCJwrGw8CiSbfE_YlN4INtPTBFcTBtU-H4IkIdGvij7yrpuQAxx_EApWNDLTpt9bBqRP9F09J98Ihe3n24T1AT_cP' },
  { name: 'Golden Turon', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrZDL26AuQdA-y_zUoaVpIOulX83Npk24gjkRM175CP7U4GV5E-XA-mbTMgZ6IoTDkzNPcyccfXH-oBd7zE-rPfDguQ82pBHntck3vaMUtMf2TWtNBYY-0iULqknw489TpKt89Q8k5Q5jXPR8o_V6eCNV2xptxbZsn4FPmlqF0bX_JSC7cXqcIPE2TWgSTzLm5grcY0yyYhhZzpM0gZxVJl9QwAeQ9pJnx3qabNwnf_K8OFjCGBZAL' },
  { name: 'Floral Dress', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzTXxO09JpE9vvD5CG7Ny1mIIU2kL0QjOUrA-z2leL-9XF6bT1Zkf0YvTlE3uEgzx3I6rA6_gQTWXEmfbaRoPk6j49Yxl_QndQGyZTo6vOslkx6LIZqTuoC07E8HjbOUvMzfnphbLOLGvzTfglbIzhOpIBwAba4mMm-3ygWFKAYd-lto7OVgQZwIpXN1i7e5iyy1l9yEGmDO3k4N0gYm5A9D4dN1NYoloDtGgLSgIZdsls_Qyk3nq7' },
  { name: 'Sizzling Sisig', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBvmkR_xMilFYbNUzowUp27hz1tPPshN0VyitxUvyCECsGBomGkHnd8Wc9WFvIAMxNel8pY3GDUhcr0RYe3WAtTfkVsGDZhnoN02leVZexsDuT0VkNJ5US3f0fpUnHDENL5Jk_D52sk8jzj1XRY2asZp5tP5MXZ5FcsC0ifCl_QS952xKYjUoPv6rgtT2Ygd0NwJ4gAtp6M8pFcVH18Qzf2z7n4Re4LP2WMBeU078gVhpmXBRrZRJs' }
];

export const MerchantAddEditProduct: React.FC<MerchantAddEditProductProps> = ({
  initialProduct,
  categories,
  settings,
  onSave,
  onCancel
}) => {
  const isEditing = Boolean(initialProduct);

  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState(initialProduct?.category || categories[0]?.name || 'Lutong Ulam');
  const [basePrice, setBasePrice] = useState<number | string>(initialProduct?.basePrice || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [image, setImage] = useState(initialProduct?.image || SAMPLE_IMAGE_PRESETS[0].url);
  const [isActive, setIsActive] = useState(initialProduct ? initialProduct.isActive : true);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>(
    initialProduct?.optionGroups || [
      {
        id: 'opt-size',
        name: 'Size',
        type: 'radio',
        required: true,
        options: [
          { id: 'opt-reg', name: 'Regular', priceModifier: 0 },
          { id: 'opt-large', name: 'Large', priceModifier: 20 }
        ]
      }
    ]
  );

  const handleAddOptionGroup = () => {
    const newGroup: OptionGroup = {
      id: `group-${Date.now()}`,
      name: 'Add-ons',
      type: 'checkbox',
      required: false,
      options: [
        { id: `opt-${Date.now()}-1`, name: 'Extra Item', priceModifier: 15 }
      ]
    };
    setOptionGroups([...optionGroups, newGroup]);
  };

  const handleRemoveOptionGroup = (groupId: string) => {
    setOptionGroups(optionGroups.filter((g) => g.id !== groupId));
  };

  const handleUpdateGroupName = (groupId: string, newName: string) => {
    setOptionGroups(
      optionGroups.map((g) => (g.id === groupId ? { ...g, name: newName } : g))
    );
  };

  const handleUpdateGroupType = (groupId: string, newType: OptionGroup['type']) => {
    setOptionGroups(
      optionGroups.map((g) => (g.id === groupId ? { ...g, type: newType } : g))
    );
  };

  const handleToggleGroupRequired = (groupId: string) => {
    setOptionGroups(
      optionGroups.map((g) => (g.id === groupId ? { ...g, required: !g.required } : g))
    );
  };

  const handleAddOptionToGroup = (groupId: string) => {
    setOptionGroups(
      optionGroups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          options: [
            ...g.options,
            { id: `opt-${Date.now()}`, name: 'New Option', priceModifier: 10 }
          ]
        };
      })
    );
  };

  const handleUpdateOptionItem = (
    groupId: string,
    optionId: string,
    field: 'name' | 'priceModifier',
    val: string | number
  ) => {
    setOptionGroups(
      optionGroups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          options: g.options.map((opt) => {
            if (opt.id !== optionId) return opt;
            return {
              ...opt,
              [field]: field === 'priceModifier' ? Number(val) || 0 : String(val)
            };
          })
        };
      })
    );
  };

  const handleRemoveOptionItem = (groupId: string, optionId: string) => {
    setOptionGroups(
      optionGroups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          options: g.options.filter((opt) => opt.id !== optionId)
        };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name');
      return;
    }
    const parsedPrice = Number(basePrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    const savedProduct: Product = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      name,
      category,
      basePrice: parsedPrice,
      description,
      image: image || SAMPLE_IMAGE_PRESETS[0].url,
      isActive,
      isFeatured: initialProduct?.isFeatured || false,
      isBestSeller: initialProduct?.isBestSeller || false,
      tag: category === 'Clothing' ? 'APPAREL' : 'HOT MEALS',
      optionGroups
    };

    onSave(savedProduct);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto space-y-6 md:space-y-8 pb-32 text-[#e0e0e2]">
      {/* Top Header */}
      <div className="bg-[#0e0f17] rounded-3xl p-5 sm:p-6 border border-[#1f202e] shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-10 h-10 rounded-full bg-[#13141f] border border-[#1f202e] flex items-center justify-center text-[#9496a1] hover:text-white hover:bg-[#181926] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[20px] sm:text-[24px] font-bold text-white">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-[13px] text-[#9496a1]">
              {isEditing ? 'Update details, pricing, and variants' : 'Create a new item for your menu and catalog'}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-[#4f46e5]' : 'bg-[#27273a]'}`} />
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'translate-x-6' : ''}`} />
            </div>
            <span className="ml-3 text-[13px] font-semibold text-[#9496a1]">
              {isActive ? 'Available for Sale' : 'Hidden'}
            </span>
          </label>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#6366f1] text-white font-bold rounded-xl shadow-md text-[14px] transition-all cursor-pointer"
          >
            Save Product
          </button>
        </div>
      </div>

      {/* Grid: Details (2/3) + Image (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Basic Details Card */}
        <div className="lg:col-span-2 bg-[#0e0f17] rounded-3xl p-6 sm:p-8 border border-[#1f202e] shadow-md space-y-5">
          <h2 className="text-[18px] font-bold text-white">Basic Details</h2>

          <div>
            <label className="block text-[13px] font-semibold text-[#9496a1] mb-2" htmlFor="prod-name">
              Product Name
            </label>
            <input
              id="prod-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Signature Adobo"
              className="w-full bg-[#13141f] text-white text-[15px] border border-[#1f202e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#9496a1] mb-2" htmlFor="prod-cat">
                Category
              </label>
              <select
                id="prod-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#13141f] text-white text-[15px] border border-[#1f202e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name} className="bg-[#0e0f17] text-white">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#9496a1] mb-2" htmlFor="prod-price">
                Base Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9496a1] font-bold">
                  {settings.currency}
                </span>
                <input
                  id="prod-price"
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#13141f] text-white text-[15px] pl-8 pr-4 py-3 border border-[#1f202e] rounded-xl focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#9496a1] mb-2" htmlFor="prod-desc">
              Description
            </label>
            <textarea
              id="prod-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item, ingredients, key highlights, etc."
              className="w-full bg-[#13141f] text-white text-[15px] border border-[#1f202e] rounded-xl p-4 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all resize-none"
            />
          </div>
        </div>

        {/* Product Image Selection & Upload */}
        <div className="lg:col-span-1 bg-[#0e0f17] rounded-3xl p-6 sm:p-8 border border-[#1f202e] shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-white mb-3">Product Image</h2>

            {/* Preview Box */}
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-[#2e3048] bg-[#13141f] flex flex-col items-center justify-center p-2 group mb-4">
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-[13px] rounded-xl">
                    Change Selection Below
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-[#181926] text-[#818cf8] flex items-center justify-center mx-auto mb-2 border border-[#2e3048]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-[13px] font-bold text-[#818cf8]">Click to pick image preset</p>
                  <p className="text-[11px] text-[#6b7280] mt-1">High resolution food photography</p>
                </div>
              )}
            </div>

            {/* Quick Sample Presets */}
            <label className="block text-[12px] font-bold text-[#9496a1] uppercase mb-2">
              Select Preset Photo:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_IMAGE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    image === preset.url ? 'border-[#818cf8] ring-2 ring-[#818cf8]/30 scale-95' : 'border-transparent hover:opacity-80'
                  }`}
                  title={preset.name}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  {image === preset.url && (
                    <div className="absolute top-1 right-1 bg-[#4f46e5] text-white p-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Or enter image URL"
              className="w-full bg-[#13141f] text-white text-[12px] px-3 py-2 border border-[#1f202e] rounded-lg focus:outline-none focus:border-[#6366f1]"
            />
          </div>
        </div>
      </div>

      {/* Custom Option Groups Section */}
      <div className="bg-[#0e0f17] rounded-3xl p-6 sm:p-8 border border-[#1f202e] shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-bold text-white">Custom Option Groups</h2>
            <p className="text-[13px] text-[#9496a1]">
              Add variations like rice choices, sizes, spice levels, add-ons, or gift options.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddOptionGroup}
            className="px-4 py-2.5 rounded-xl bg-[#13141f] text-[#818cf8] hover:bg-[#181926] border border-[#1f202e] font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Option Group</span>
          </button>
        </div>

        {optionGroups.length === 0 ? (
          <div className="p-8 border border-dashed border-[#1f202e] rounded-2xl text-center text-[#6b7280]">
            No option groups yet. Click "Add Option Group" to create variants.
          </div>
        ) : (
          <div className="space-y-6">
            {optionGroups.map((group) => (
              <div
                key={group.id}
                className="border border-[#1f202e] rounded-2xl overflow-hidden shadow-2xs"
              >
                {/* Group Header */}
                <div className="bg-[#13141f] p-4 sm:p-5 border-b border-[#1f202e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="w-5 h-5 text-[#6b7280] shrink-0" />
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => handleUpdateGroupName(group.id, e.target.value)}
                      placeholder="Group Name (e.g. Size, Spice Level)"
                      className="font-bold text-[16px] text-white bg-[#0e0f17] border border-[#1f202e] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#6366f1]"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={group.type}
                        onChange={(e) => handleUpdateGroupType(group.id, e.target.value as any)}
                        className="bg-[#0e0f17] border border-[#1f202e] rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-white focus:outline-none"
                      >
                        <option value="radio">Single Choice</option>
                        <option value="checkbox">Multiple Choice</option>
                        <option value="pills">Pill Badges</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleToggleGroupRequired(group.id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors ${
                          group.required ? 'bg-[#fb923c]/20 text-[#fb923c] border border-[#fb923c]/30' : 'bg-[#181926] text-[#9496a1] border border-[#1f202e]'
                        }`}
                      >
                        {group.required ? 'Required' : 'Optional'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveOptionGroup(group.id)}
                    className="self-end sm:self-auto p-2 text-[#f87171] hover:bg-[#f87171]/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Group Option Items */}
                <div className="p-4 sm:p-5 bg-[#0e0f17] space-y-3">
                  {group.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center gap-3 bg-[#13141f] p-3 rounded-xl border border-[#1f202e]"
                    >
                      <GripVertical className="w-4 h-4 text-[#6b7280] shrink-0" />
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) => handleUpdateOptionItem(group.id, opt.id, 'name', e.target.value)}
                        placeholder="Option Name (e.g. Garlic Rice, Large)"
                        className="flex-1 bg-[#0e0f17] text-[14px] text-white px-3 py-1.5 rounded-lg border border-[#1f202e] focus:outline-none focus:border-[#6366f1]"
                      />
                      <div className="flex items-center gap-1.5 w-32 shrink-0">
                        <span className="text-[12px] font-bold text-[#9496a1]">+₱</span>
                        <input
                          type="number"
                          min="0"
                          value={opt.priceModifier}
                          onChange={(e) => handleUpdateOptionItem(group.id, opt.id, 'priceModifier', e.target.value)}
                          className="w-full bg-[#0e0f17] text-[14px] text-white px-2.5 py-1.5 rounded-lg border border-[#1f202e] focus:outline-none focus:border-[#6366f1] font-semibold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveOptionItem(group.id, opt.id)}
                        className="p-1.5 text-[#6b7280] hover:text-[#f87171] rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddOptionToGroup(group.id)}
                    className="flex items-center gap-1.5 text-[#818cf8] hover:text-[#a5b4fc] text-[13px] font-bold pt-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item to {group.name}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#0a0a0f] border-t border-[#1f202e] p-4 pb-safe flex items-center justify-between z-50 shadow-2xl">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${isActive ? 'bg-[#4f46e5]' : 'bg-[#27273a]'}`} />
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'translate-x-5' : ''}`} />
          </div>
          <span className="ml-2 text-[12px] font-bold text-[#9496a1]">
            {isActive ? 'Available' : 'Hidden'}
          </span>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-[#1f202e] bg-[#13141f] text-[#9496a1] text-[13px] font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#4f46e5] text-white text-[13px] font-bold py-2.5 px-6 rounded-xl shadow-md cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

