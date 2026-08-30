"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AttributeGroup, MOCK_ATTRIBUTES } from "@/lib/mockData";

export interface ExtendedAttributeGroup extends AttributeGroup {
  colorMap?: Record<string, string>; // e.g. { "5000K Neutral White": "#F3E8CB", "6500K Cool White (High Lumen)": "#E0F2FE", "3000K Warm Amber": "#F59E0B" }
  description?: string;
  categories?: string[];
  isRequired?: boolean;
  updated_at?: string;
}

const DEFAULT_ATTRIBUTES: ExtendedAttributeGroup[] = [
  {
    id: "attr-1",
    name: "Battery Configuration",
    code: "battery",
    type: "button",
    values: [
      "1 Battery (30min)",
      "2 Batteries (60min)",
      "3 Batteries (90min)",
      "4 Batteries + Quad Hub",
    ],
    description: "Configures battery capacity, quantity, and operational runtime for electronics & drones.",
    categories: ["all", "drones-quadcopters", "power-tools"],
    isRequired: true,
    productCount: 14,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
  },
  {
    id: "attr-2",
    name: "Storage & Case",
    code: "storage_case",
    type: "select",
    values: ["Standard Cardboard", "Waterproof Hard Shell", "Tactical EVA Travel Bag"],
    description: "Protective packaging, carry cases, and transport solutions.",
    categories: ["all", "hardware-tools", "drones-quadcopters"],
    isRequired: false,
    productCount: 28,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
  },
  {
    id: "attr-3",
    name: "LED Color Temperature",
    code: "color_temp",
    type: "color",
    values: ["5000K Neutral White", "6500K Cool White (High Lumen)", "3000K Warm Amber"],
    colorMap: {
      "5000K Neutral White": "#F3E8CB",
      "6500K Cool White (High Lumen)": "#E0F2FE",
      "3000K Warm Amber": "#F59E0B",
    },
    description: "Kelvin color temperature options for workshop lighting, studio flashes, and lamps.",
    categories: ["industrial-lighting", "smart-home"],
    isRequired: true,
    productCount: 19,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: "attr-4",
    name: "Plug / Voltage Standard",
    code: "plug_type",
    type: "radio",
    values: ["US Standard 110V", "EU Plug 220V", "UK 3-Pin 230V", "AU Standard 240V"],
    description: "International electrical wall outlet plug formats and operational voltages.",
    categories: ["all"],
    isRequired: true,
    productCount: 42,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
  },
  {
    id: "attr-5",
    name: "Tool Pack Setup",
    code: "tool_pack",
    type: "select",
    values: [
      "Bare Tool (No Battery)",
      "Kit with 1x 2.0Ah Pack",
      "Pro Kit with 2x 4.0Ah Packs & Fast Charger",
    ],
    description: "Hardware tool packaging combinations, including bare-tool or full battery packs.",
    categories: ["power-tools", "workshop-machinery"],
    isRequired: true,
    productCount: 22,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
  {
    id: "attr-6",
    name: "Finish & Colorway",
    code: "color_finish",
    type: "color",
    values: ["Stealth Matte Black", "Cyberpunk Neon Orange", "Titanium Silver", "Military Olive Green"],
    colorMap: {
      "Stealth Matte Black": "#18181B",
      "Cyberpunk Neon Orange": "#FF5722",
      "Titanium Silver": "#94A3B8",
      "Military Olive Green": "#4D5D3B",
    },
    description: "Chassis finish, anodization color, and industrial casing aesthetics.",
    categories: ["all", "electronics", "3d-printers"],
    isRequired: false,
    productCount: 16,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
];

interface AttributeState {
  attributes: ExtendedAttributeGroup[];
  isLoaded: boolean;
  addAttribute: (attribute: ExtendedAttributeGroup) => void;
  updateAttribute: (id: string, updates: Partial<ExtendedAttributeGroup>) => void;
  deleteAttribute: (id: string) => void;
  duplicateAttribute: (id: string) => ExtendedAttributeGroup | null;
  addValueToAttribute: (id: string, value: string, colorHex?: string) => void;
  removeValueFromAttribute: (id: string, value: string) => void;
  reorderValues: (id: string, newValues: string[]) => void;
  resetToDefaults: () => void;
  getAttributeById: (id: string) => ExtendedAttributeGroup | undefined;
  getAttributeByCode: (code: string) => ExtendedAttributeGroup | undefined;
}

export const useAttributeStore = create<AttributeState>()(
  persist(
    (set, get) => ({
      attributes: DEFAULT_ATTRIBUTES,
      isLoaded: true,

      addAttribute: (newAttr: ExtendedAttributeGroup) => {
        set((state) => ({
          attributes: [newAttr, ...state.attributes],
        }));
      },

      updateAttribute: (id: string, updates: Partial<ExtendedAttributeGroup>) => {
        set((state) => ({
          attributes: state.attributes.map((attr) =>
            attr.id === id
              ? {
                  ...attr,
                  ...updates,
                  updated_at: new Date().toISOString(),
                }
              : attr
          ),
        }));
      },

      deleteAttribute: (id: string) => {
        set((state) => ({
          attributes: state.attributes.filter((attr) => attr.id !== id),
        }));
      },

      duplicateAttribute: (id: string) => {
        const { attributes } = get();
        const existing = attributes.find((a) => a.id === id);
        if (!existing) return null;

        const timestamp = Date.now();
        const duplicated: ExtendedAttributeGroup = {
          ...existing,
          id: `attr-${timestamp}`,
          name: `${existing.name} (Copy)`,
          code: `${existing.code}_copy_${timestamp.toString().slice(-4)}`,
          productCount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          attributes: [duplicated, ...state.attributes],
        }));

        return duplicated;
      },

      addValueToAttribute: (id: string, value: string, colorHex?: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;

        set((state) => ({
          attributes: state.attributes.map((attr) => {
            if (attr.id !== id) return attr;
            if (attr.values.includes(trimmed)) return attr;

            const updatedValues = [...attr.values, trimmed];
            const updatedColorMap = { ...(attr.colorMap || {}) };
            if (colorHex) {
              updatedColorMap[trimmed] = colorHex;
            }

            return {
              ...attr,
              values: updatedValues,
              colorMap: updatedColorMap,
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      removeValueFromAttribute: (id: string, value: string) => {
        set((state) => ({
          attributes: state.attributes.map((attr) => {
            if (attr.id !== id) return attr;
            const updatedValues = attr.values.filter((v) => v !== value);
            const updatedColorMap = { ...(attr.colorMap || {}) };
            delete updatedColorMap[value];

            return {
              ...attr,
              values: updatedValues,
              colorMap: updatedColorMap,
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      reorderValues: (id: string, newValues: string[]) => {
        set((state) => ({
          attributes: state.attributes.map((attr) =>
            attr.id === id
              ? {
                  ...attr,
                  values: newValues,
                  updated_at: new Date().toISOString(),
                }
              : attr
          ),
        }));
      },

      resetToDefaults: () => {
        set({ attributes: DEFAULT_ATTRIBUTES });
      },

      getAttributeById: (id: string) => {
        const { attributes } = get();
        return attributes.find((a) => a.id === id);
      },

      getAttributeByCode: (code: string) => {
        const { attributes } = get();
        return attributes.find((a) => a.code.toLowerCase() === code.toLowerCase());
      },
    }),
    {
      name: "lennox_chinamall_attributes_v2",
      partialize: (state) => ({ attributes: state.attributes }),
    }
  )
);
