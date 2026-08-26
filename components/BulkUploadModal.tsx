"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShoppingBag,
  IceCream,
  FileText,
  Layers,
  Store
} from "lucide-react";
import { downloadExcelTemplate, BulkProductRow } from "./bulkTemplates";
import { useAuth } from "@/context/AuthContext";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const { apiFetch } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<BulkProductRow[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<{
    totalImported: number;
    categoriesCreated: number;
    variationsCreated: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMessage("");
    setUploadResult(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const wb = XLSX.read(binaryStr, { type: "binary" });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<BulkProductRow>(ws);

        if (jsonData.length === 0) {
          setErrorMessage("The uploaded spreadsheet does not contain any product rows.");
          setParsedRows([]);
        } else {
          setParsedRows(jsonData);
        }
      } catch (err: any) {
        setErrorMessage("Failed to parse Excel file: " + (err.message || "Invalid format"));
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    setIsUploading(true);
    setErrorMessage("");

    try {
      const res = await apiFetch("/products/bulk", {
        method: "POST",
        body: JSON.stringify({ items: parsedRows })
      });

      if (res.success) {
        setUploadResult(res.data);
        onSuccess();
      } else {
        throw new Error(res.message || "Import failed");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to import products to Firebase Firestore.");
    } finally {
      setIsUploading(false);
    }
  };

  // Preview stats
  const uniqueCategories = new Set(
    parsedRows.map((r) => r.Category || r["Product Name"] ? r.Category : "").filter(Boolean)
  ).size;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                <FileSpreadsheet className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-base">Bulk Upload Products</h3>
                <p className="text-[11px] text-gray-400 font-normal">
                  Import hundreds of products via Excel (.xlsx) with auto categories and variations
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 1: Template Downloads */}
          <div className="py-4 space-y-2.5">
            <span className="text-[11px] font-medium text-gray-600 block">
              1. Download Excel Templates & Sample Catalogs
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Empty Template */}
              <button
                type="button"
                onClick={() => downloadExcelTemplate("empty")}
                className="p-3 rounded-[8px] border border-gray-200 hover:border-purple-300 hover:bg-purple-50/20 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-[8px] bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center text-gray-700 group-hover:text-[#6320EE] mb-2">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-medium text-gray-900 text-xs">Empty Template</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Blank headers format (.xlsx)</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#6320EE] font-medium mt-2">
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </span>
              </button>

              {/* Supermarket 300 Items */}
              <button
                type="button"
                onClick={() => downloadExcelTemplate("supermarket")}
                className="p-3 rounded-[8px] border border-purple-200/80 bg-purple-50/20 hover:border-[#6320EE] hover:bg-purple-50/50 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-[8px] bg-purple-100 flex items-center justify-center text-[#6320EE] mb-2">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1">
                  <h4 className="font-medium text-gray-900 text-xs">Supermarket Sample</h4>
                  <span className="px-1.5 py-0.2 bg-[#6320EE] text-white text-[9px] rounded-full font-medium">
                    300 Items
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">Groceries, Dairy, Snacks, FMCG</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#6320EE] font-medium mt-2">
                  <Download className="w-3 h-3" />
                  <span>Download .xlsx</span>
                </span>
              </button>

              {/* Ice Cream Shop 100 Items */}
              <button
                type="button"
                onClick={() => downloadExcelTemplate("icecream")}
                className="p-3 rounded-[8px] border border-pink-200/80 bg-pink-50/20 hover:border-pink-400 hover:bg-pink-50/50 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-[8px] bg-pink-100 flex items-center justify-center text-pink-600 mb-2">
                  <IceCream className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1">
                  <h4 className="font-medium text-gray-900 text-xs">Ice Cream Shop</h4>
                  <span className="px-1.5 py-0.2 bg-pink-600 text-white text-[9px] rounded-full font-medium">
                    100 Items
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">Scoops, Sundaes, Tubs, Cones</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-pink-600 font-medium mt-2">
                  <Download className="w-3 h-3" />
                  <span>Download .xlsx</span>
                </span>
              </button>
            </div>
          </div>

          {/* Section 2: Upload Drop Zone */}
          <div className="py-3 border-t border-gray-100 space-y-2.5">
            <span className="text-[11px] font-medium text-gray-600 block">
              2. Upload Excel / Spreadsheet (.xlsx, .xls, .csv)
            </span>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-[#6320EE] hover:bg-purple-50/20 rounded-[8px] p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE] mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="font-medium text-gray-800 text-xs">
                {selectedFile ? selectedFile.name : "Click to browse or drop Excel file here"}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Automatically creates missing categories, variation types, and generates unique 13-digit EAN barcodes.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-[8px] text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Upload Success Alert */}
          {uploadResult && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-[8px] text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bulk Import Successful!</span>
              </div>
              <p className="text-[11px] pl-6 text-emerald-700">
                Imported <strong>{uploadResult.totalImported}</strong> products into Firebase Firestore.
                {uploadResult.categoriesCreated > 0 && ` Created ${uploadResult.categoriesCreated} new categories.`}
                {uploadResult.variationsCreated > 0 && ` Created ${uploadResult.variationsCreated} new variation attributes.`}
              </p>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && !uploadResult && (
            <div className="py-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">
                  Spreadsheet Preview ({parsedRows.length} Products Found)
                </span>
                <span className="text-[11px] text-gray-400">
                  {uniqueCategories} Categories Detected
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-[8px]">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-gray-50 text-gray-500 sticky top-0">
                    <tr className="border-b border-gray-100">
                      <th className="p-2">#</th>
                      <th className="p-2">Product Name</th>
                      <th className="p-2">Category</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {parsedRows.slice(0, 8).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="p-2 text-gray-400">{idx + 1}</td>
                        <td className="p-2 font-medium truncate max-w-[200px]">{row["Product Name"] || (row as any).name}</td>
                        <td className="p-2 text-gray-500">{row.Category || (row as any).category}</td>
                        <td className="p-2 text-right font-medium">₹ {row["Selling Price"] ?? (row as any).sellingPrice ?? 0}</td>
                        <td className="p-2 text-right text-emerald-600">{row.Stock ?? (row as any).stock ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 8 && (
                <p className="text-[10px] text-gray-400 text-center">
                  + {parsedRows.length - 8} more products ready for batch import
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[8px] cursor-pointer"
          >
            {uploadResult ? "Done" : "Cancel"}
          </button>

          {!uploadResult && (
            <button
              type="button"
              onClick={handleImport}
              disabled={parsedRows.length === 0 || isUploading || isParsing}
              className="h-8 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing {parsedRows.length} Items...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import {parsedRows.length > 0 ? `${parsedRows.length} Products` : "from Excel"}</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
