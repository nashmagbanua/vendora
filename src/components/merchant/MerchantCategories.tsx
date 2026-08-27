import React, { useState } from 'react';
import { Category, Product } from '../../types';
import { Plus, Trash2, Edit2, GripVertical, FolderTree, Check } from 'lucide-react';

interface MerchantCategoriesProps {
  categories: Category[];
  products: Product[];
  onAddCategory: (category: Category) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const MerchantCategories: React.FC<MerchantCategoriesProps> = ({
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim()
    };
    onAddCategory(newCat);
    setNewCatName('');
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = (cat: Category) => {
    if (!editName.trim()) return;
    onUpdateCategory({ ...cat, name: editName.trim() });
    setEditingCatId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 md:space-y-8 pb-32 text-[#e0e0e2]">
      {/* Header */}
      <div className="bg-[#0e0f17] rounded-3xl p-5 sm:p-6 border border-[#1f202e] shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-white">Categories</h1>
          <p className="text-[14px] text-[#9496a1]">Organize your menu items and product groups for easy customer browsing.</p>
        </div>
      </div>

      {/* Add Category Card */}
      <form onSubmit={handleCreate} className="bg-[#0e0f17] rounded-3xl p-6 border border-[#1f202e] shadow-md flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="New Category Name (e.g. Desserts & Coolers)"
          className="flex-1 w-full bg-[#13141f] text-white text-[15px] border border-[#1f202e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-[#4f46e5] text-white hover:bg-[#6366f1] rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </form>

      {/* Categories List */}
      <div className="bg-[#0e0f17] rounded-3xl border border-[#1f202e] shadow-md overflow-hidden">
        <div className="p-4 bg-[#13141f] border-b border-[#1f202e] text-[13px] font-bold text-[#9496a1] uppercase tracking-wider flex justify-between">
          <span>Category Name</span>
          <span>Items in Menu</span>
        </div>

        <div className="divide-y divide-[#1f202e]">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.name).length;
            const isEditing = editingCatId === cat.id;

            return (
              <div key={cat.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#13141f] transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <GripVertical className="w-5 h-5 text-[#6b7280] shrink-0" />
                  <div className="w-10 h-10 rounded-xl bg-[#181926] text-[#818cf8] border border-[#2e3048] flex items-center justify-center shrink-0">
                    <FolderTree className="w-5 h-5" />
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 max-w-sm">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-[#0e0f17] border border-[#6366f1] rounded-lg px-3 py-1.5 text-[14px] font-bold text-white w-full focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(cat)}
                        className="p-1.5 bg-[#4f46e5] text-white rounded-lg hover:bg-[#6366f1] cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[16px] font-bold text-white truncate">
                      {cat.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[13px] font-bold text-[#818cf8] bg-[#818cf8]/10 border border-[#818cf8]/20 px-3 py-1 rounded-full">
                    {count} items
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-2 text-[#9496a1] hover:text-[#818cf8] hover:bg-[#181926] rounded-lg transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-2 text-[#9496a1] hover:text-[#f87171] hover:bg-[#f87171]/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

