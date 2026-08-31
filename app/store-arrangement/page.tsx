"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Search,
  Plus,
  ArrowRightLeft,
  Package,
  Boxes,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Store,
  FolderPlus,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Archive,
  BarChart2,
  Tag
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/components/ProductData";

export interface RackItem {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  unit?: string;
  updatedAt?: string;
}

export interface StoreRack {
  id: string;
  businessId: string;
  rackName: string;
  capacity?: number;
  notes?: string;
  items: RackItem[];
  createdAt: string;
  updatedAt?: string;
}

export default function StoreArrangementPage() {
  const { apiFetch, activeBusiness } = useAuth();

  const [racks, setRacks] = useState<StoreRack[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Single Create / Edit Rack Modal
  const [isRackModalOpen, setIsRackModalOpen] = useState(false);
  const [editingRack, setEditingRack] = useState<StoreRack | null>(null);
  const [rackForm, setRackForm] = useState({
    rackName: "",
    capacity: "",
    notes: ""
  });

  // Bulk Create Racks Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    prefix: "R",
    startNumber: "1",
    endNumber: "10"
  });
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Add Item to Rack Modal
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [targetRackForAdd, setTargetRackForAdd] = useState<StoreRack | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Move Item Modal
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [sourceRackForMove, setSourceRackForMove] = useState<StoreRack | null>(null);
  const [selectedItemIdToMove, setSelectedItemIdToMove] = useState("");
  const [moveQuantity, setMoveQuantity] = useState("1");
  const [destinationRackId, setDestinationRackId] = useState("");
  const [isMovingItem, setIsMovingItem] = useState(false);

  // Load Racks and Products
  const loadData = async () => {
    if (!activeBusiness) return;
    setIsLoading(true);
    try {
      const [racksRes, prodsRes] = await Promise.all([
        apiFetch("/store-racks"),
        apiFetch("/products")
      ]);

      if (racksRes && racksRes.data) {
        setRacks(racksRes.data);
      }
      if (prodsRes && prodsRes.data) {
        setProducts(prodsRes.data);
      }
    } catch (err: any) {
      setErrorMsg("Failed to load store arrangement: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeBusiness]);

  // Analytics KPIs
  const analytics = useMemo(() => {
    const totalRacks = racks.length;
    let totalItemsStocked = 0;
    let activeRacks = 0;
    let emptyRacks = 0;

    racks.forEach((r) => {
      const itemsCount = (r.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
      totalItemsStocked += itemsCount;
      if (itemsCount > 0) {
        activeRacks++;
      } else {
        emptyRacks++;
      }
    });

    return { totalRacks, totalItemsStocked, activeRacks, emptyRacks };
  }, [racks]);

  // Filtered Racks
  const filteredRacks = useMemo(() => {
    if (!searchQuery.trim()) return racks;
    const q = searchQuery.toLowerCase().trim();

    return racks.filter((rack) => {
      const nameMatch = rack.rackName.toLowerCase().includes(q);
      const notesMatch = rack.notes && rack.notes.toLowerCase().includes(q);
      const itemsMatch = (rack.items || []).some(
        (it) =>
          it.productName.toLowerCase().includes(q) ||
          (it.sku && it.sku.toLowerCase().includes(q)) ||
          (it.barcode && it.barcode.toLowerCase().includes(q))
      );
      return nameMatch || notesMatch || itemsMatch;
    });
  }, [racks, searchQuery]);

  // -------------------------------------------------------------
  // SINGLE RACK SAVE / EDIT
  // -------------------------------------------------------------
  const handleOpenRackModal = (rack?: StoreRack) => {
    if (rack) {
      setEditingRack(rack);
      setRackForm({
        rackName: rack.rackName,
        capacity: rack.capacity ? String(rack.capacity) : "",
        notes: rack.notes || ""
      });
    } else {
      setEditingRack(null);
      setRackForm({
        rackName: "",
        capacity: "",
        notes: ""
      });
    }
    setIsRackModalOpen(true);
  };

  const handleSaveRack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rackForm.rackName.trim()) return;

    try {
      if (editingRack) {
        await apiFetch(`/store-racks/${editingRack.id}`, {
          method: "PUT",
          body: JSON.stringify({
            rackName: rackForm.rackName.trim().toUpperCase(),
            capacity: parseInt(rackForm.capacity, 10) || 0,
            notes: rackForm.notes.trim()
          })
        });
        setSuccessMsg(`Rack "${rackForm.rackName.toUpperCase()}" updated successfully.`);
      } else {
        await apiFetch("/store-racks", {
          method: "POST",
          body: JSON.stringify({
            rackName: rackForm.rackName.trim().toUpperCase(),
            capacity: parseInt(rackForm.capacity, 10) || 0,
            notes: rackForm.notes.trim()
          })
        });
        setSuccessMsg(`Rack "${rackForm.rackName.toUpperCase()}" created successfully.`);
      }

      setIsRackModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert("Failed to save rack: " + err.message);
    }
  };

  // -------------------------------------------------------------
  // BULK CREATE RACKS (e.g. R1 to R20)
  // -------------------------------------------------------------
  const handleBulkCreateRacks = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseInt(bulkForm.startNumber, 10);
    const end = parseInt(bulkForm.endNumber, 10);

    if (isNaN(start) || isNaN(end) || start > end) {
      alert("Please enter valid start and end numbers.");
      return;
    }

    setIsBulkSubmitting(true);
    try {
      const res = await apiFetch("/store-racks/bulk", {
        method: "POST",
        body: JSON.stringify({
          prefix: bulkForm.prefix.trim() || "R",
          startNumber: start,
          endNumber: end
        })
      });

      setIsBulkModalOpen(false);
      setSuccessMsg(res.message || `Successfully created racks from ${bulkForm.prefix}${start} to ${bulkForm.prefix}${end}!`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert("Failed to bulk create racks: " + err.message);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleDeleteRack = async (rackId: string, rackName: string) => {
    if (!confirm(`Are you sure you want to delete Rack "${rackName}" and remove all items inside it?`)) return;

    try {
      await apiFetch(`/store-racks/${rackId}`, { method: "DELETE" });
      setSuccessMsg(`Rack "${rackName}" deleted.`);
      setRacks(racks.filter((r) => r.id !== rackId));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert("Failed to delete rack: " + err.message);
    }
  };

  // -------------------------------------------------------------
  // ADD ITEM TO RACK
  // -------------------------------------------------------------
  const handleOpenAddItemModal = (rack: StoreRack) => {
    setTargetRackForAdd(rack);
    setSelectedProductId(products[0]?.id || "");
    setItemQuantity("1");
    setIsAddItemModalOpen(true);
  };

  const handleSaveAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRackForAdd || !selectedProductId) return;

    const qty = parseInt(itemQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid item quantity.");
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setIsAddingItem(true);
    try {
      const currentItems = [...(targetRackForAdd.items || [])];
      const existingIdx = currentItems.findIndex((it) => it.productId === prod.id);

      if (existingIdx >= 0) {
        currentItems[existingIdx] = {
          ...currentItems[existingIdx],
          quantity: Number(currentItems[existingIdx].quantity || 0) + qty,
          updatedAt: new Date().toISOString()
        };
      } else {
        const newItem: RackItem = {
          id: "item_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku || "",
          barcode: prod.barcode || "",
          quantity: qty,
          unit: prod.unit || "Pcs",
          updatedAt: new Date().toISOString()
        };
        currentItems.push(newItem);
      }

      await apiFetch(`/store-racks/${targetRackForAdd.id}`, {
        method: "PUT",
        body: JSON.stringify({ items: currentItems })
      });

      setIsAddItemModalOpen(false);
      setSuccessMsg(`Added ${qty} × ${prod.name} into Rack ${targetRackForAdd.rackName}`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert("Failed to add item: " + err.message);
    } finally {
      setIsAddingItem(false);
    }
  };

  // -------------------------------------------------------------
  // MOVE ITEM BETWEEN RACKS
  // -------------------------------------------------------------
  const handleOpenMoveModal = (rack: StoreRack) => {
    if (!rack.items || rack.items.length === 0) {
      alert(`Rack ${rack.rackName} has no items to move.`);
      return;
    }
    setSourceRackForMove(rack);
    setSelectedItemIdToMove(rack.items[0]?.id || "");
    setMoveQuantity("1");
    const otherRacks = racks.filter((r) => r.id !== rack.id);
    setDestinationRackId(otherRacks[0]?.id || "");
    setIsMoveModalOpen(true);
  };

  const handleExecuteMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceRackForMove || !selectedItemIdToMove || !destinationRackId) return;

    const qty = parseInt(moveQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid quantity to move.");
      return;
    }

    setIsMovingItem(true);
    try {
      const res = await apiFetch("/store-racks/move", {
        method: "POST",
        body: JSON.stringify({
          fromRackId: sourceRackForMove.id,
          toRackId: destinationRackId,
          itemId: selectedItemIdToMove,
          quantity: qty
        })
      });

      setIsMoveModalOpen(false);
      setSuccessMsg(res.message || "Item moved successfully!");
      loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert("Failed to move item: " + err.message);
    } finally {
      setIsMovingItem(false);
    }
  };

  // Quick remove single item from rack
  const handleRemoveItemFromRack = async (rack: StoreRack, itemId: string, itemName: string) => {
    if (!confirm(`Remove "${itemName}" from Rack ${rack.rackName}?`)) return;

    const updatedItems = (rack.items || []).filter((it) => it.id !== itemId);
    try {
      await apiFetch(`/store-racks/${rack.id}`, {
        method: "PUT",
        body: JSON.stringify({ items: updatedItems })
      });
      loadData();
      setSuccessMsg(`Item removed from ${rack.rackName}`);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      alert("Failed to remove item: " + err.message);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 space-y-5 animate-in fade-in duration-150">
      
      {/* Toast Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[8px] text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white p-4.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#6320EE]" />
            <span>Store Arrangement & Rack Inventory</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Organize retail floor racks (R1, R2...), place products, move items between racks, and auto-sync with POS billing
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="h-8.5 px-3 bg-purple-50 hover:bg-purple-100/80 text-[#6320EE] border border-purple-200 rounded-[8px] text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Bulk Create Racks</span>
          </button>

          <button
            onClick={() => handleOpenRackModal()}
            className="h-8.5 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Rack</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Store Racks</span>
            <h3 className="text-lg font-bold text-gray-900 mt-0.5">{analytics.totalRacks} Racks</h3>
            <span className="text-[10px] text-gray-400 font-normal">Floor Layout</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-purple-50 text-[#6320EE] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Items Stocked</span>
            <h3 className="text-lg font-bold text-emerald-600 mt-0.5">{analytics.totalItemsStocked} Units</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Assigned in Racks</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Active Stocked Racks</span>
            <h3 className="text-lg font-bold text-blue-600 mt-0.5">{analytics.activeRacks} Racks</h3>
            <span className="text-[10px] text-blue-600 font-medium">Holding Inventory</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-blue-50 text-blue-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Empty Racks Available</span>
            <h3 className="text-lg font-bold text-amber-600 mt-0.5">{analytics.emptyRacks} Racks</h3>
            <span className="text-[10px] text-amber-600 font-medium">Ready to Stock</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-amber-50 text-amber-600 flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search racks by name (e.g. R1), item name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-8 pr-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
          />
        </div>

        <div className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-700">{filteredRacks.length}</span> of{" "}
          <span className="font-semibold text-gray-700">{racks.length}</span> Racks
        </div>
      </div>

      {/* Racks Grid Container */}
      {isLoading ? (
        <div className="bg-white rounded-[8px] border border-gray-100 p-16 text-center text-gray-400">
          <Loader2 className="w-8 h-8 text-[#6320EE] animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-gray-600">Loading store racks layout...</p>
        </div>
      ) : filteredRacks.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-gray-100/90 p-16 text-center text-gray-400 shadow-2xs">
          <Layers className="w-12 h-12 mx-auto mb-3 text-purple-200" />
          <h3 className="text-sm font-bold text-gray-800">No Store Racks Found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            Get started by bulk generating racks (e.g. R1 to R20) or adding a single custom rack.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="h-8 px-3.5 bg-[#6320EE] text-white rounded-[6px] text-xs font-medium cursor-pointer"
            >
              Bulk Generate Racks (R1 - R10)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRacks.map((rack) => {
            const totalQtyInRack = (rack.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
            const distinctProducts = (rack.items || []).length;

            return (
              <div
                key={rack.id}
                className="bg-white rounded-[10px] border border-gray-100/90 shadow-2xs flex flex-col justify-between overflow-hidden hover:border-purple-200 transition-all"
              >
                {/* Rack Header */}
                <div className="p-4 bg-gray-50/60 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-[8px] bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                      {rack.rackName}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{rack.rackName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            totalQtyInRack > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {totalQtyInRack > 0 ? `${totalQtyInRack} Units` : "Empty Rack"}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        {distinctProducts} Distinct {distinctProducts === 1 ? "Product" : "Products"}
                      </span>
                    </div>
                  </div>

                  {/* Rack Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenRackModal(rack)}
                      className="p-1.5 text-gray-400 hover:text-[#6320EE] hover:bg-purple-50 rounded"
                      title="Edit Rack"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRack(rack.id, rack.rackName)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Rack"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Items List Inside Rack */}
                <div className="p-4 flex-1 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 border-b border-gray-100 pb-1.5">
                    <span>Products Placed in Rack</span>
                    <span>Count</span>
                  </div>

                  {!rack.items || rack.items.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      <Package className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                      <span>No items in this rack</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {rack.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between p-2 rounded-[6px] bg-gray-50/70 hover:bg-purple-50/30 text-xs transition-colors group"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-gray-900 block truncate" title={it.productName}>
                              {it.productName}
                            </span>
                            <span className="text-[10px] text-gray-400 block font-mono">
                              {it.sku || it.barcode || "No SKU"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 text-xs">
                              {it.quantity} {it.unit || "Pcs"}
                            </span>
                            <button
                              onClick={() => handleRemoveItemFromRack(rack, it.id, it.productName)}
                              className="text-gray-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              title="Remove item from rack"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons: Add Item & Move Item */}
                <div className="p-3 bg-gray-50/80 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenAddItemModal(rack)}
                    className="h-8 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[6px] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>

                  <button
                    onClick={() => handleOpenMoveModal(rack)}
                    disabled={!rack.items || rack.items.length === 0}
                    className="h-8 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-[6px] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
                    <span>Move Item</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SINGLE RACK (CREATE / EDIT) */}
      {/* ========================================================= */}
      {isRackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-[10px] w-full max-w-md shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-semibold text-gray-900">
                {editingRack ? `Edit Rack ${editingRack.rackName}` : "Create Store Rack"}
              </h3>
              <button onClick={() => setIsRackModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRack} className="p-4.5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rack Name / Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. R1, R2, R-A, Shelf-1"
                  value={rackForm.rackName}
                  onChange={(e) => setRackForm({ ...rackForm, rackName: e.target.value })}
                  className="w-full h-8.5 px-3 text-xs font-bold uppercase rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Max Capacity Units <span className="text-gray-400 text-[10px]">(Optional)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={rackForm.capacity}
                  onChange={(e) => setRackForm({ ...rackForm, capacity: e.target.value })}
                  className="w-full h-8.5 px-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Location Notes / Description <span className="text-gray-400 text-[10px]">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Aisle 1, Men footwear section, Top row..."
                  value={rackForm.notes}
                  onChange={(e) => setRackForm({ ...rackForm, notes: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRackModalOpen(false)}
                  className="h-8 px-3 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8.5 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  {editingRack ? "Update Rack" : "Save Rack"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BULK CREATE RACKS (e.g. from 1 to 20) */}
      {/* ========================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-[10px] w-full max-w-md shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Bulk Create Store Racks</h3>
                <p className="text-[11px] text-gray-400">Generate a sequential range of racks (e.g. R1 to R20)</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBulkCreateRacks} className="p-4.5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rack Name Prefix <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. R or SHELF-"
                  value={bulkForm.prefix}
                  onChange={(e) => setBulkForm({ ...bulkForm, prefix: e.target.value })}
                  className="w-full h-8.5 px-3 text-xs font-bold uppercase rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={bulkForm.startNumber}
                    onChange={(e) => setBulkForm({ ...bulkForm, startNumber: e.target.value })}
                    className="w-full h-8.5 px-3 text-xs font-semibold rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={bulkForm.endNumber}
                    onChange={(e) => setBulkForm({ ...bulkForm, endNumber: e.target.value })}
                    className="w-full h-8.5 px-3 text-xs font-semibold rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-purple-50 rounded-[8px] border border-purple-100 text-xs text-purple-800">
                <span>Preview: Will generate </span>
                <strong>
                  {bulkForm.prefix}
                  {bulkForm.startNumber || 1}
                </strong>{" "}
                <span>through </span>
                <strong>
                  {bulkForm.prefix}
                  {bulkForm.endNumber || 10}
                </strong>{" "}
                <span>
                  (
                  {Math.max(
                    0,
                    (parseInt(bulkForm.endNumber, 10) || 0) - (parseInt(bulkForm.startNumber, 10) || 0) + 1
                  )}{" "}
                  racks total)
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="h-8 px-3 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBulkSubmitting}
                  className="h-8.5 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-semibold cursor-pointer shadow-2xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isBulkSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Racks...</span>
                    </>
                  ) : (
                    <span>Create Racks Range</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD ITEM TO RACK */}
      {/* ========================================================= */}
      {isAddItemModalOpen && targetRackForAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-[10px] w-full max-w-md shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Add Item to {targetRackForAdd.rackName}</h3>
                <p className="text-[11px] text-gray-400">Place items directly into this rack</p>
              </div>
              <button onClick={() => setIsAddItemModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddItem} className="p-4.5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Product / Item <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs rounded-[8px] border border-gray-200 bg-white focus:outline-none focus:border-[#6320EE]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(SKU: ${p.sku})` : ""} - Stock: {p.stock || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantity / Count to Add <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  className="w-full h-8.5 px-3 text-xs font-bold rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="h-8 px-3 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingItem}
                  className="h-8.5 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-semibold cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {isAddingItem ? "Adding..." : "Add to Rack"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: MOVE ITEM BETWEEN RACKS */}
      {/* ========================================================= */}
      {isMoveModalOpen && sourceRackForMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-[10px] w-full max-w-md shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Move Item from {sourceRackForMove.rackName}</h3>
                <p className="text-[11px] text-gray-400">Transfer inventory units to another rack</p>
              </div>
              <button onClick={() => setIsMoveModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteMove} className="p-4.5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Item in {sourceRackForMove.rackName} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedItemIdToMove}
                  onChange={(e) => setSelectedItemIdToMove(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs rounded-[8px] border border-gray-200 bg-white focus:outline-none focus:border-[#6320EE]"
                >
                  {(sourceRackForMove.items || []).map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.productName} (Available: {it.quantity} {it.unit || "Pcs"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantity to Move <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={moveQuantity}
                  onChange={(e) => setMoveQuantity(e.target.value)}
                  className="w-full h-8.5 px-3 text-xs font-bold rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Destination Rack <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={destinationRackId}
                  onChange={(e) => setDestinationRackId(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs rounded-[8px] border border-gray-200 bg-white focus:outline-none focus:border-[#6320EE]"
                >
                  {racks
                    .filter((r) => r.id !== sourceRackForMove.id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.rackName} ({r.items?.length || 0} items currently)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsMoveModalOpen(false)}
                  className="h-8 px-3 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMovingItem}
                  className="h-8.5 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-semibold cursor-pointer shadow-2xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isMovingItem ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Moving...</span>
                    </>
                  ) : (
                    <span>Move Item</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
