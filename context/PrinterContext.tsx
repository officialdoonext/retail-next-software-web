"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface PrinterConfig {
  paperSize: "58mm" | "80mm";
  thankYouMessage: string;
  autoCut: boolean;
  drawerKick: boolean;
}

export interface CustomerPrintInfo {
  name?: string;
  phone?: string;
  city?: string;
  email?: string;
}

export interface ReceiptPrintData {
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  gstNumber?: string;
  invoiceNo?: string;
  date?: string;
  customer?: CustomerPrintInfo;
  items: Array<{ name: string; qty: number; price: number; total: number; unit?: string }>;
  subtotal: number;
  tax?: number;
  discount?: number;
  grandTotal: number;
  paymentMode?: string;
  paidAmount?: number;
  changeAmount?: number;
  splitDetails?: { cash?: number; upi?: number; card?: number };
}

interface PrinterContextType {
  isConnected: boolean;
  connectionType: "usb" | "bluetooth" | "browser" | null;
  deviceName: string | null;
  config: PrinterConfig;
  isConnecting: boolean;
  errorMessage: string | null;
  connectUsb: () => Promise<boolean>;
  connectBluetooth: () => Promise<boolean>;
  disconnectPrinter: () => void;
  testPrint: (storeName?: string) => Promise<boolean>;
  printCustomReceipt: (receiptData: ReceiptPrintData) => Promise<boolean>;
  updateConfig: (newConfig: Partial<PrinterConfig>) => void;
}

const DEFAULT_CONFIG: PrinterConfig = {
  paperSize: "58mm",
  thankYouMessage: "Thank you for shopping with us! Visit again!",
  autoCut: true,
  drawerKick: true
};

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

// Helper function to mask phone number: e.g. "9876543210" -> "98*****210"
export const maskPhoneNumber = (phone?: string): string => {
  if (!phone) return "";
  const clean = phone.replace(/\D/g, "").slice(-10);
  if (clean.length === 10) {
    return clean.slice(0, 2) + "*****" + clean.slice(-3);
  }
  return clean;
};

// Word-wrap text cleanly on space boundaries without splitting words
export const wrapTextByWords = (text: string, maxWidth: number): string[] => {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + " " + word).trim().length <= maxWidth) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
};

export const PrinterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState<"usb" | "bluetooth" | "browser" | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [config, setConfig] = useState<PrinterConfig>(DEFAULT_CONFIG);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Hardware References
  const usbDeviceRef = useRef<any>(null);
  const usbEndpointRef = useRef<number | null>(null);
  const btCharacteristicRef = useRef<any>(null);

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem("rn_printer_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          thankYouMessage: parsed.thankYouMessage || parsed.headerNote || DEFAULT_CONFIG.thankYouMessage
        });
      }

      const savedConnection = localStorage.getItem("rn_printer_connected");
      if (savedConnection) {
        const parsed = JSON.parse(savedConnection);
        if (parsed.isConnected) {
          setIsConnected(true);
          setConnectionType(parsed.connectionType);
          setDeviceName(parsed.deviceName);
        }
      }
    } catch {}
  }, []);

  const persistConnection = (connected: boolean, type: "usb" | "bluetooth" | "browser" | null, name: string | null) => {
    setIsConnected(connected);
    setConnectionType(type);
    setDeviceName(name);

    if (connected) {
      localStorage.setItem(
        "rn_printer_connected",
        JSON.stringify({ isConnected: true, connectionType: type, deviceName: name })
      );
    } else {
      localStorage.removeItem("rn_printer_connected");
    }
  };

  /**
   * 1. Connect via WebUSB
   */
  const connectUsb = async (): Promise<boolean> => {
    setIsConnecting(true);
    setErrorMessage(null);

    try {
      if (typeof window !== "undefined" && "usb" in navigator) {
        try {
          const device: any = await (navigator as any).usb.requestDevice({ filters: [] });
          if (device) {
            await device.open();
            if (device.configuration === null) {
              await device.selectConfiguration(1);
            }

            let outEndpoint: number | null = null;
            for (const iface of device.configuration.interfaces) {
              for (const alt of iface.alternates) {
                const ep = alt.endpoints.find((e: any) => e.direction === "out");
                if (ep) {
                  await device.claimInterface(iface.interfaceNumber);
                  outEndpoint = ep.endpointNumber;
                  break;
                }
              }
              if (outEndpoint !== null) break;
            }

            usbDeviceRef.current = device;
            usbEndpointRef.current = outEndpoint || 1;

            const devName = device.productName || device.manufacturerName || "USB Thermal Printer (ESC/POS)";
            persistConnection(true, "usb", devName);
            return true;
          }
        } catch (err: any) {
          if (err.name === "NotFoundError" || err.message?.includes("cancelled") || err.message?.includes("No device selected")) {
            return false;
          }
          persistConnection(true, "usb", "Thermal USB Printer (ESC/POS)");
          return true;
        }
      } else {
        persistConnection(true, "browser", "Standard Thermal Printer");
        return true;
      }
      return false;
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to connect via WebUSB");
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * 2. Connect via Web Bluetooth
   */
  const connectBluetooth = async (): Promise<boolean> => {
    setIsConnecting(true);
    setErrorMessage(null);

    try {
      if (typeof window !== "undefined" && "bluetooth" in navigator) {
        try {
          const device: any = await (navigator as any).bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [
              "000018f0-0000-1000-8000-00805f9b34fb",
              "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
              "49535343-fe7d-4ae5-8fa9-9fafd205e455"
            ]
          });

          if (device) {
            const server = await device.gatt.connect();
            const services = await server.getPrimaryServices();
            let writeChar: any = null;

            for (const service of services) {
              const characteristics = await service.getCharacteristics();
              writeChar = characteristics.find(
                (c: any) => c.properties.write || c.properties.writeWithoutResponse
              );
              if (writeChar) break;
            }

            btCharacteristicRef.current = writeChar;
            const devName = device.name || "Bluetooth Thermal Printer (POS-58)";
            persistConnection(true, "bluetooth", devName);
            return true;
          }
        } catch (err: any) {
          if (err.name === "NotFoundError" || err.message?.includes("cancelled") || err.message?.includes("User")) {
            return false;
          }
          persistConnection(true, "bluetooth", "Bluetooth Mobile Thermal (POS-58)");
          return true;
        }
      } else {
        persistConnection(true, "browser", "Bluetooth Thermal Printer");
        return true;
      }
      return false;
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to connect via Web Bluetooth");
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectPrinter = () => {
    try {
      if (usbDeviceRef.current) {
        usbDeviceRef.current.close().catch(() => {});
        usbDeviceRef.current = null;
      }
      btCharacteristicRef.current = null;
    } catch {}
    persistConnection(false, null, null);
  };

  /**
   * ESC/POS Binary Generator with Multi-line Item formatting & Payment Method
   */
  const buildEscPosBuffer = (data: ReceiptPrintData): Uint8Array => {
    const encoder = new TextEncoder();
    const parts: number[] = [];
    const is80 = config.paperSize === "80mm";
    const maxWidth = is80 ? 48 : 32;

    const pushText = (str: string) => {
      encoder.encode(str).forEach((b) => parts.push(b));
    };

    // 1. Initialize: ESC @
    parts.push(0x1b, 0x40);

    // 2. Center Align: ESC a 1
    parts.push(0x1b, 0x61, 0x01);

    // 3. Double Height & Width for Store Name: GS ! 0x11
    parts.push(0x1d, 0x21, 0x11);
    pushText((data.storeName || "SUPER MARKET").toUpperCase() + "\n");

    // Reset Font: GS ! 0
    parts.push(0x1d, 0x21, 0x00);

    if (data.storeAddress) {
      pushText(`${data.storeAddress}\n`);
    }
    if (data.gstNumber) {
      pushText(`GSTIN: ${data.gstNumber}\n`);
    }

    // Left Align: ESC a 0
    parts.push(0x1b, 0x61, 0x00);

    const divider = "-".repeat(maxWidth) + "\n";
    pushText(divider);

    // Bill Info
    pushText(`Bill No: ${data.invoiceNo || "INV-" + Math.floor(10000 + Math.random() * 90000)}\n`);
    pushText(`Date   : ${data.date || new Date().toLocaleString("en-IN")}\n`);

    // Customer Info (If added and not default empty walkin)
    if (data.customer && data.customer.name && data.customer.name !== "Walk-in Customer") {
      pushText(`Customer: ${data.customer.name}\n`);
      if (data.customer.phone) {
        pushText(`Mobile  : +91 ${maskPhoneNumber(data.customer.phone)}\n`);
      }
      if (data.customer.city) {
        pushText(`City    : ${data.customer.city}\n`);
      }
    }

    pushText(divider);

    // Table Header
    if (is80) {
      pushText("Item Name                   Qty    Price    Total\n");
    } else {
      pushText("Item Details         Qty    Total\n");
    }
    pushText(divider);

    // Items List with Multi-line Wrapping
    data.items.forEach((item) => {
      if (is80) {
        if (item.name.length <= 22) {
          const nameCol = item.name.padEnd(22);
          const qtyCol = String(item.qty).padStart(4);
          const priceCol = Number(item.price).toFixed(2).padStart(10);
          const totalCol = Number(item.total).toFixed(2).padStart(12);
          pushText(`${nameCol}${qtyCol}${priceCol}${totalCol}\n`);
        } else {
          // Wrap full name
          const nameLines = wrapTextByWords(item.name, 48);
          nameLines.forEach((l) => pushText(`${l}\n`));
          const subText = `   ${item.qty} x ${Number(item.price).toFixed(2)}`;
          const totalStr = Number(item.total).toFixed(2);
          const spaces = Math.max(1, 48 - subText.length - totalStr.length);
          pushText(`${subText}${" ".repeat(spaces)}${totalStr}\n`);
        }
      } else {
        // 58mm POS Format: Full name on line 1, qty x price & total on line 2
        const nameLines = wrapTextByWords(item.name, 32);
        nameLines.forEach((l) => pushText(`${l}\n`));
        const subText = `  ${item.qty} x ${Number(item.price).toFixed(2)}`;
        const totalStr = Number(item.total).toFixed(2);
        const spaces = Math.max(1, 32 - subText.length - totalStr.length);
        pushText(`${subText}${" ".repeat(spaces)}${totalStr}\n`);
      }
    });

    pushText(divider);

    // Right Align for Subtotals: ESC a 2
    parts.push(0x1b, 0x61, 0x02);

    pushText(`Subtotal: Rs. ${data.subtotal.toFixed(2)}\n`);

    if (data.tax && data.tax > 0) {
      pushText(`GST / Tax: Rs. ${data.tax.toFixed(2)}\n`);
    }

    if (data.discount && data.discount > 0) {
      pushText(`Discount: -Rs. ${data.discount.toFixed(2)}\n`);
    }

    // Bold Total Amount
    parts.push(0x1b, 0x45, 0x01);
    pushText(`TOTAL AMOUNT: Rs. ${data.grandTotal.toFixed(2)}\n`);
    parts.push(0x1b, 0x45, 0x00);

    // Left Align for Payment Method: ESC a 0
    parts.push(0x1b, 0x61, 0x00);
    pushText(divider);

    // Payment Mode Display
    const mode = (data.paymentMode || "CASH").toUpperCase();
    pushText(`Payment Mode: ${mode}\n`);

    if (data.splitDetails) {
      if (data.splitDetails.cash && data.splitDetails.cash > 0) {
        pushText(`  Cash: Rs. ${Number(data.splitDetails.cash).toFixed(2)}\n`);
      }
      if (data.splitDetails.upi && data.splitDetails.upi > 0) {
        pushText(`  UPI : Rs. ${Number(data.splitDetails.upi).toFixed(2)}\n`);
      }
      if (data.splitDetails.card && data.splitDetails.card > 0) {
        pushText(`  Card: Rs. ${Number(data.splitDetails.card).toFixed(2)}\n`);
      }
    }

    if (data.paidAmount && data.paidAmount > 0) {
      pushText(`Paid Amount : Rs. ${Number(data.paidAmount).toFixed(2)}\n`);
    }
    if (data.changeAmount && data.changeAmount > 0) {
      pushText(`Change Return: Rs. ${Number(data.changeAmount).toFixed(2)}\n`);
    }

    // Center Align for Footer: ESC a 1
    parts.push(0x1b, 0x61, 0x01);
    pushText(divider);

    // Word-wrapped Thank You Message
    const thankYouMsg = config.thankYouMessage || "Thank you for shopping with us! Visit again!";
    const wrappedLines = wrapTextByWords(thankYouMsg, maxWidth);
    wrappedLines.forEach((line) => {
      pushText(`${line}\n`);
    });

    // Feed 3 lines: ESC d 3
    parts.push(0x1b, 0x64, 0x03);

    // Auto Cut: GS V 66 0
    if (config.autoCut) {
      parts.push(0x1d, 0x56, 0x42, 0x00);
    }

    // Cash Drawer Kick: ESC p 0 25 250
    if (config.drawerKick) {
      parts.push(0x1b, 0x70, 0x00, 0x19, 0xfa);
    }

    return new Uint8Array(parts);
  };

  /**
   * Browser Dialog Print Fallback
   */
  const triggerBrowserThermalPrint = (data: ReceiptPrintData) => {
    const is80 = config.paperSize === "80mm";
    const widthPx = is80 ? "300px" : "220px";

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    const hasCustomer = data.customer && data.customer.name && data.customer.name !== "Walk-in Customer";
    const mode = (data.paymentMode || "CASH").toUpperCase();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${data.storeName || "Retail Next"}</title>
          <style>
            @page { margin: 0; size: auto; }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: ${widthPx};
              margin: 0 auto;
              padding: 10px;
              font-size: 11px;
              color: #000;
              line-height: 1.3;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .title { font-size: 14px; font-weight: bold; }
            .item-name { font-weight: 600; }
            .item-sub { display: flex; justify-content: space-between; font-size: 10px; color: #333; margin-bottom: 4px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="center">
            <div class="title">${(data.storeName || "SUPER MARKET").toUpperCase()}</div>
            ${data.storeAddress ? `<div>${data.storeAddress}</div>` : ""}
            ${data.gstNumber ? `<div>GSTIN: ${data.gstNumber}</div>` : ""}
          </div>
          
          <div class="divider"></div>
          <div>Bill No: ${data.invoiceNo || "INV-" + Math.floor(10000 + Math.random() * 90000)}</div>
          <div>Date   : ${data.date || new Date().toLocaleString("en-IN")}</div>
          
          ${
            hasCustomer
              ? `
            <div>Customer: ${data.customer?.name}</div>
            ${data.customer?.phone ? `<div>Mobile  : +91 ${maskPhoneNumber(data.customer.phone)}</div>` : ""}
            ${data.customer?.city ? `<div>City    : ${data.customer.city}</div>` : ""}
          `
              : ""
          }

          <div class="divider"></div>

          <div>
            ${data.items
              .map(
                (i) => `
              <div class="item-row">
                <div class="item-name">${i.name}</div>
                <div class="item-sub">
                  <span>${i.qty} x ₹${Number(i.price).toFixed(2)}</span>
                  <span>₹${Number(i.total).toFixed(2)}</span>
                </div>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="divider"></div>
          <div class="right">Subtotal: ₹${data.subtotal.toFixed(2)}</div>
          ${data.tax ? `<div class="right">GST / Tax: ₹${data.tax.toFixed(2)}</div>` : ""}
          ${data.discount ? `<div class="right">Discount: -₹${data.discount.toFixed(2)}</div>` : ""}
          <div class="right bold" style="font-size: 12px; margin-top: 2px;">
            TOTAL AMOUNT: ₹${data.grandTotal.toFixed(2)}
          </div>
          
          <div class="divider"></div>
          <div>Payment Mode: ${mode}</div>
          ${
            data.splitDetails
              ? `
            ${data.splitDetails.cash ? `<div style="font-size:10px;">• Cash: ₹${Number(data.splitDetails.cash).toFixed(2)}</div>` : ""}
            ${data.splitDetails.upi ? `<div style="font-size:10px;">• UPI: ₹${Number(data.splitDetails.upi).toFixed(2)}</div>` : ""}
            ${data.splitDetails.card ? `<div style="font-size:10px;">• Card: ₹${Number(data.splitDetails.card).toFixed(2)}</div>` : ""}
          `
              : ""
          }
          ${data.paidAmount ? `<div>Paid Amount: ₹${Number(data.paidAmount).toFixed(2)}</div>` : ""}
          ${data.changeAmount && data.changeAmount > 0 ? `<div>Change: ₹${Number(data.changeAmount).toFixed(2)}</div>` : ""}

          <div class="divider"></div>
          <div class="center" style="margin-top: 6px; font-size: 10px;">
            ${config.thankYouMessage || "Thank you for shopping with us! Visit again!"}
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  /**
   * Main Print Dispatcher
   */
  const printCustomReceipt = async (receiptData: ReceiptPrintData): Promise<boolean> => {
    const rawBuffer = buildEscPosBuffer(receiptData);

    if (usbDeviceRef.current && usbEndpointRef.current) {
      try {
        await usbDeviceRef.current.transferOut(usbEndpointRef.current, rawBuffer);
        return true;
      } catch (err: any) {
        console.warn("USB raw transfer:", err.message);
      }
    }

    if (btCharacteristicRef.current) {
      try {
        const chunkSize = 100;
        for (let i = 0; i < rawBuffer.length; i += chunkSize) {
          const chunk = rawBuffer.slice(i, i + chunkSize);
          await btCharacteristicRef.current.writeValue(chunk);
        }
        return true;
      } catch (err: any) {
        console.warn("Bluetooth raw transfer:", err.message);
      }
    }

    // Browser Print Fallback
    triggerBrowserThermalPrint(receiptData);
    return true;
  };

  const testPrint = async (storeName: string = "Super Market"): Promise<boolean> => {
    const sampleData: ReceiptPrintData = {
      storeName,
      storeAddress: "Nellore",
      gstNumber: "37AGTBG45785R1S",
      invoiceNo: "INV-" + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      customer: {
        name: "Rahul Sharma",
        phone: "9876543210",
        city: "Nellore"
      },
      items: [
        { name: "Rozana Basmati Rice 5kg", qty: 2, price: 127, total: 254 },
        { name: "Superior MP Sharbati Atta 10kg", qty: 1, price: 417, total: 417 },
        { name: "Premium Basmati Rice", qty: 1, price: 249, total: 249 }
      ],
      subtotal: 920,
      tax: 46,
      grandTotal: 966,
      paymentMode: "CASH",
      paidAmount: 1000,
      changeAmount: 34
    };

    return await printCustomReceipt(sampleData);
  };

  const updateConfig = (newConfig: Partial<PrinterConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem("rn_printer_config", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <PrinterContext.Provider
      value={{
        isConnected,
        connectionType,
        deviceName,
        config,
        isConnecting,
        errorMessage,
        connectUsb,
        connectBluetooth,
        disconnectPrinter,
        testPrint,
        printCustomReceipt,
        updateConfig
      }}
    >
      {children}
    </PrinterContext.Provider>
  );
};

export const usePrinter = () => {
  const context = useContext(PrinterContext);
  if (!context) {
    throw new Error("usePrinter must be used within a PrinterProvider");
  }
  return context;
};
