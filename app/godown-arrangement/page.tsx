"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
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
  Tag,
  Warehouse
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/components/ProductData";

export interface GodownItem {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  unit?: string;
  updatedAt?: string;
}

export interface GodownSlot {
  id: string;
  businessId: string;
  serialNumber: string;
  notes?: string;
  items: GodownItem[];
  createdAt: string;
  updatedAt?: string;
}

export default function GodownArrangementPage() {
  const { apiFetch, activeBusiness } = useAuth();

  const [slots, setSlots] = useState<GodownSlot[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Single Create / Edit Slot Modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<GodownSlot | null>(null);
  const [slotForm, setSlotForm] = useState({
    serialNumber: "",
    notes: ""
  });

  // Bulk Create Slots Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    prefix: "S",
    startNumber: "1",
    endNumber: "20"
  });
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Add Item to Slot Modal
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [targetSlotForAdd, setTargetSlotForAdd] = useState<GodownSlot | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [itemQuantity, setItemQuantity] = useState("10");
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Move Item Modal
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [sourceSlotForMove, setSourceSlotForMove] = useState<GodownSlot | null>(null);
  const [selectedItemIdToMove, setSelectedItemIdToMove] = useState("");
  const [moveQuantity, setMoveQuantity] = useState("1");
  const [destinationSlotId, setDestinationSlotId] = useState("");
  const [isMovingItem, setIsMovingItem] = useState(false);

  // Load Slots and Products
  const loadData = async () => {
    if (!activeBusiness) return;
    setIsLoading(true);
    try {
      const [slotsRes, prodsRes] = await Promise.all([
        apiFetch("/godown-slots"),
        apiFetch("/products")
      ]);

      if (slotsRes && slotsRes.data) {
        setSlots(slotsRes.data);
      }
      if (prodsRes && prodsRes.data) {
        setProducts(prodsRes.data);
      }
    } catch (err: any) {
      setErrorMsg("Failed to load godown arrangement: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeBusiness]);

  // Analytics KPIs
  const analytics = useMemo(() => {
    const totalSlots = slots.length;
    let totalItemsStocked = 0;
    let activeSlots = 0;
    let emptySlots = 0;

    slots.forEach((s) => {
      const itemsCount = (s.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
      totalItemsStocked += itemsCount;
      if (itemsCount > 0) {
        activeSlots++;
      } else {
        emptySlots++;
      }
    });

    return { totalSlots, totalItemsStocked, activeSlots, emptySlots };
  }, [slots]);

  // Filtered Slots
  const filteredSlots = useMemo(() => {
    if (!searchQuery.trim()) return slots;
    const q = searchQuery.toLowerCase().trim();

    return slots.filter((slot) => {
      const serialMatch = slot.serialNumber.toLowerCase().includes(q);
      const notesMatch = slot.notes && slot.notes.toLowerCase().includes(q);
      const itemsMatch = (slot.items || []).some(
        (it) =>
          it.productName.toLowerCase().includes(q) ||
          (it.sku && it.sku.toLowerCase().includes(q)) ||
          (it.barcode && it.barcode.toLowerCase().includes(q))
      );
      return serialMatch || notesMatch || itemsMatch;
    });
  }, [slots, searchQuery]);

  // -------------------------------------------------------------
  // SINGLE SERIAL SLOT SAVE / EDIT
  // -------------------------------------------------------------
  const handleOpenSlotModal = (slot?: GodownSlot) => {
    if (slot) {
      setEditingSlot(slot);
      setSlotForm({
        serialNumber: slot.serialNumber,
        notes: slot.notes || ""
      });
    } else {
      setEditingSlot(null);
      setSlotForm({
        serialNumber: "",
        notes: ""
      });
    }
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.serialNumber.trim()) return;

    try {
      if (editingSlot) {
        await apiFetch(`/godown-slots/${editingSlot.id}`, {
          method: "PUT",
          body: JSON.stringify({
            serialNumber: slotForm.serialNumber.trim().toUpperCase(),
            notes: slotForm.notes.trim()
          })
        });
        setSuccessMsg(`Godown Serial "${slotForm.serialNumber.toUpperCase()}" updated successfully.`);
      } else {
        await apiFetch("/godown-slots", {
          method: "POST",
          body: JSON.stringify({
            serialNumber: slotForm.serialNumber.trim().toUpperCase(),
            notes: slotForm.notes.trim()
          })
        });
        setSuccessMsg(`Godown Serial "${slotForm.serialNumber.toUpperCase()}" created successfully.`);
      }

      setIsSlotModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert("Failed to save godown slot: " + err.message);
    }
  };

  // -------------------------------------------------------------
  // BULK CREATE GODOWN SERIALS (e.g. S1 to S50)
  // -------------------------------------------------------------
  const handleBulkCreateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseInt(bulkForm.startNumber, 10);
    const end = parseInt(bulkForm.endNumber, 10);

    if (isNaN(start) || isNaN(end) || start > end) {
      alert("Please enter valid start and end numbers.");
      return;
    }

    setIsBulkSubmitting(true);
    try {
      const res = await apiFetch("/godown-slots/bulk", {
        method: "POST",
        body: JSON.stringify({
          prefix: bulkForm.prefix.trim() || "S",
          startNumber: start,
          endNumber: end
        })
      });

      setIsBulkModalOpen(false);
      setSuccessMsg(res.message || `Successfully created godown serials from ${bulkForm.prefix}${start} to ${bulkForm.prefix}${end}!`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert("Failed to bulk create serials: " + err.message);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId: string, serialNumber: string) => {
    if (!confirm(`Are you sure you want to delete Godown Serial "${serialNumber}" and remove all items inside it?`)) return;

    try {
      await apiFetch(`/godown-slots/${slotId}`, { method: "DELETE" });
      setSuccessMsg(`Godown Serial "${serialNumber}" deleted.`);
      setSlots(slots.filter((s) => s.id !== slotId));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert("Failed to delete serial: " + err.message);
    }
  };

  // -------------------------------------------------------------
  // ADD ITEM TO GODOWN SERIAL SLOT
  // -------------------------------------------------------------
  const handleOpenAddItemModal = (slot: GodownSlot) => {
    setTargetSlotForAdd(slot);
    setSelectedProductId(products[0]?.id || "");
    setItemQuantity("10");
    setIsAddItemModalOpen(true);
  };

  const handleSaveAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSlotForAdd || !selectedProductId) return;

    const qty = parseInt(itemQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid item quantity.");
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setIsAddingItem(true);
    try {
      const currentItems = [...(targetSlotForAdd.items || [])];
      const existingIdx = currentItems.findIndex((it) => it.productId === prod.id);

      if (existingIdx >= 0) {
        currentItems[existingIdx] = {
          ...currentItems[existingIdx],
          quantity: Number(currentItems[existingIdx].quantity || 0) + qty,
          updatedAt: new Date().toISOString()
        };
      } else {
        const newItem: GodownItem = {
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

      await apiFetch(`/godown-slots/${targetSlotForAdd.id}`, {
        method: "PUT",
        body: JSON.stringify({ items: currentItems })
      });

      setIsAddItemModalOpen(false);
      setSuccessMsg(`Added ${qty} × ${prod.name} into Godown Serial ${targetSlotForAdd.serialNumber}`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert("Failed to add item: " + err.message);
    } finally {
      setIsAddingItem(false);
    }
  };

  // -------------------------------------------------------------
  // MOVE ITEM BETWEEN GODOWN SERIAL SLOTS
  // -------------------------------------------------------------
  const handleOpenMoveModal = (slot: GodownSlot) => {
    if (!slot.items || slot.items.length === 0) {
      alert(`Godown Serial ${slot.serialNumber} has no items to move.`);
      return;
    }
    setSourceSlotForMove(slot);
    setSelectedItemIdToMove(slot.items[0]?.id || "");
    setMoveQuantity("1");
    const otherSlots = slots.filter((s) => s.id !== slot.id);
    setDestinationSlotId(otherSlots[0]?.id || "");
    setIsMoveModalOpen(true);
  };

  const handleExecuteMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceSlotForMove || !selectedItemIdToMove || !destinationSlotId) return;

    const qty = parseInt(moveQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid quantity to move.");
      return;
    }

    setIsMovingItem(true);
    try {
      const res = await apiFetch("/godown-slots/move", {
        method: "POST",
        body: JSON.stringify({
          fromSlotId: sourceSlotForMove.id,
          toSlotId: destinationSlotId,
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

  // Quick remove item from slot
  const handleRemoveItemFromSlot = async (slot: GodownSlot, itemId: string, itemName: string) => {
    if (!confirm(`Remove "${itemName}" from Godown Serial ${slot.serialNumber}?`)) return;

    const updatedItems = (slot.items || []).filter((it) => it.id !== itemId);
    try {
      await apiFetch(`/godown-slots/${slot.id}`, {
        method: "PUT",
        body: JSON.stringify({ items: updatedItems })
      });
      loadData();
      setSuccessMsg(`Item removed from ${slot.serialNumber}`);
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
            <Warehouse className="w-5 h-5 text-[#6320EE]" />
            <span>Godown Arrangement & Warehouse Serials</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Organize bulk warehouse storage sections (S1, S2...), stock cartons, transfer items between serial sections
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="h-8.5 px-3 bg-purple-50 hover:bg-purple-100/80 text-[#6320EE] border border-purple-200 rounded-[8px] text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Bulk Create Serials</span>
          </button>

          <button
            onClick={() => handleOpenSlotModal()}
            className="h-8.5 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Serial</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Godown Serials</span>
            <h3 className="text-lg font-bold text-gray-900 mt-0.5">{analytics.totalSlots} Slots</h3>
            <span className="text-[10px] text-gray-400 font-normal">Warehouse Layout</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-purple-50 text-[#6320EE] flex items-center justify-center">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Bulk Stocked</span>
            <h3 className="text-lg font-bold text-emerald-600 mt-0.5">{analytics.totalItemsStocked} Units</h3>
            <span className="text-[10px] text-emerald-600 font-medium">In Godown Storage</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Active Storage Slots</span>
            <h3 className="text-lg font-bold text-blue-600 mt-0.5">{analytics.activeSlots} Serials</h3>
            <span className="text-[10px] text-blue-600 font-medium">Holding Bulk Goods</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-blue-50 text-blue-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Empty Serials Available</span>
            <h3 className="text-lg font-bold text-amber-600 mt-0.5">{analytics.emptySlots} Serials</h3>
            <span className="text-[10px] text-amber-600 font-medium">Available for Intake</span>
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
            placeholder="Search serials (e.g. S1), product name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-8 pr-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
          />
        </div>

        <div className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-700">{filteredSlots.length}</span> of{" "}
          <span className="font-semibold text-gray-700">{slots.length}</span> Serials
        </div>
      </div>

      {/* Godown Slots Grid Container */}
      {isLoading ? (
        <div className="bg-white rounded-[8px] border border-gray-100 p-16 text-center text-gray-400">
          <Loader2 className="w-8 h-8 text-[#6320EE] animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-gray-600">Loading godown arrangement...</p>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-gray-100/90 p-16 text-center text-gray-400 shadow-2xs">
          <Warehouse className="w-12 h-12 mx-auto mb-3 text-purple-200" />
          <h3 className="text-sm font-bold text-gray-800">No Godown Serials Found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            Get started by bulk generating godown serial slots (e.g. S1 to S20) or adding a single serial.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="h-8 px-3.5 bg-[#6320EE] text-white rounded-[6px] text-xs font-medium cursor-pointer"
            >
              Bulk Generate Serials (S1 - S20)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSlots.map((slot) => {
            const totalQtyInSlot = (slot.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
            const distinctProducts = (slot.items || []).length;

            return (
              <div
                key={slot.id}
                className="bg-white rounded-[10px] border border-gray-100/90 shadow-2xs flex flex-col justify-between overflow-hidden hover:border-purple-200 transition-all"
              >
                {/* Slot Header */}
                <div className="p-4 bg-gray-50/60 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-[8px] bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                      {slot.serialNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">Serial {slot.serialNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            totalQtyInSlot > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {totalQtyInSlot > 0 ? `${totalQtyInSlot} Units` : "Empty Serial"}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        {distinctProducts} Distinct {distinctProducts === 1 ? "Product" : "Products"}
                      </span>
                    </div>
                  </div>

                  {/* Slot Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenSlotModal(slot)}
                      className="p-1.5 text-gray-400 hover:text-[#6320EE] hover:bg-purple-50 rounded"
                      title="Edit Serial"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot.id, slot.serialNumber)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Serial"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Items List Inside Slot */}
                <div className="p-4 flex-1 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 border-b border-gray-100 pb-1.5">
                    <span>Cartons / Products in Serial</span>
                    <span>Quantity</span>
                  </div>

                  {!slot.items || slot.items.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      <Package className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                      <span>No items stored in this serial slot</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {slot.items.map((it) => (
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
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-xs">
                              {it.quantity} {it.unit || "Pcs"}
                            </span>
                            <button
                              onClick={() => handleRemoveItemFromSlot(slot, it.id, it.productName)}
                              className="text-gray-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              title="Remove item from serial"
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
                    onClick={() => handleOpenAddItemModal(slot)}
                    className="h-8 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[6px] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>

                  <button
                    onClick={() => handleOpenMoveModal(slot)}
                    disabled={!slot.items || slot.items.length === 0}
                    className="h-8 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-[6px] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Move Item</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SINGLE GODOWN SERIAL (CREATE / EDIT) */}
      {/* ========================================================= */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-[10px] w-full max-w-md shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-semibold text-gray-900">
                {editingSlot ? `Edit Serial ${editingSlot.serialNumber}` : "Create Godown Serial"}
              </h3>
              <button onClick={() => setIsSlotModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="p-4.5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Serial Number / Bay Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S1, S2, BAY-101"
                  value={slotForm.serialNumber}
                  onChange={(e) => setSlotForm({ ...slotForm, serialNumber: e.target.value })}
                  className="w-full h-8.5 px-3 text-xs font-bold uppercase rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Warehouse Location Notes <span className="text-gray-400 text-[10px]">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Godown Floor 2, East wing, Bulk storage..."
                  value={slotForm.notes}
                  onChange={(e) => setSlotForm({ ...slotForm, notes: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="h-8 px-3 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8.5 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  {editingSlot ? "Update Serial" : "Save Serial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BULK CREATE SERIALS (e.g. from S1 to S50) */}
      {/* ========================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-[10px] w-full max-w-md shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Bulk Create Godown Serials</h3>
                <p className="text-[11px] text-gray-400">Generate a sequential range of serial slots (e.g. S1 to S50)</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBulkCreateSlots} className="p-4.5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Serial Prefix <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S or BAY-"
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

              <div className="p-2.5 bg-indigo-50 rounded-[8px] border border-indigo-100 text-xs text-indigo-800">
                <span>Preview: Will generate </span>
                <strong>
                  {bulkForm.prefix}
                  {bulkForm.startNumber || 1}
                </strong>{" "}
                <span>through </span>
                <strong>
                  {bulkForm.prefix}
                  {bulkForm.endNumber || 20}
                </strong>{" "}
                <span>
                  (
                  {Math.max(
                    0,
                    (parseInt(bulkForm.endNumber, 10) || 0) - (parseInt(bulkForm.startNumber, 10) || 0) + 1
                  )}{" "}
                  serials total)
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
                      <span>Generating Serials...</span>
                    </>
                  ) : (
                    <span>Create Serials Range</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD ITEM TO GODOWN SERIAL */}
      {/* ========================================================= */}
      {isAddItemModalOpen && targetSlotForAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-[10px] w-full max-w-md shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Add Item to Serial {targetSlotForAdd.serialNumber}
                </h3>
                <p className="text-[11px] text-gray-400">Place bulk products into this godown section</p>
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
                  {isAddingItem ? "Adding..." : "Add to Serial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: MOVE ITEM BETWEEN GODOWN SERIALS */}
      {/* ========================================================= */}
      {isMoveModalOpen && sourceSlotForMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-[10px] w-full max-w-md shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Move Item from Serial {sourceSlotForMove.serialNumber}
                </h3>
                <p className="text-[11px] text-gray-400">Transfer inventory units to another godown serial section</p>
              </div>
              <button onClick={() => setIsMoveModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteMove} className="p-4.5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Item in {sourceSlotForMove.serialNumber} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedItemIdToMove}
                  onChange={(e) => setSelectedItemIdToMove(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs rounded-[8px] border border-gray-200 bg-white focus:outline-none focus:border-[#6320EE]"
                >
                  {(sourceSlotForMove.items || []).map((it) => (
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
                  Destination Serial Number <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={destinationSlotId}
                  onChange={(e) => setDestinationSlotId(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs rounded-[8px] border border-gray-200 bg-white focus:outline-none focus:border-[#6320EE]"
                >
                  {slots
                    .filter((s) => s.id !== sourceSlotForMove.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.serialNumber} ({s.items?.length || 0} items currently)
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
