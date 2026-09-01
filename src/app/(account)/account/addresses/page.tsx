"use client";

import React, { useState } from "react";
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, ShieldCheck, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Address {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { isSpanish } = useTranslation();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      label: "Residencia Principal",
      fullName: "Alex Harrison",
      street: "2847 Mission Street, Suite 400",
      city: "San Francisco",
      state: "CA",
      postal: "94110",
      country: "United States",
      phone: "+1 415 555 9182",
      isDefault: true,
    },
    {
      id: "addr-2",
      label: "Laboratorio y Almacén",
      fullName: "Alex Harrison (Lennox Labs)",
      street: "100 Innovation Way, Bay 14",
      city: "San Jose",
      state: "CA",
      postal: "95134",
      country: "United States",
      phone: "+1 415 555 9182",
      isDefault: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState(isSpanish ? "Casa" : "Home");
  const [newFullName, setNewFullName] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newPostal, setNewPostal] = useState("");
  const [newCountry, setNewCountry] = useState("United States");
  const [newPhone, setNewPhone] = useState("");

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newStreet || !newCity) return;

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      fullName: newFullName,
      street: newStreet,
      city: newCity,
      state: newState,
      postal: newPostal,
      country: newCountry,
      phone: newPhone,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    setIsModalOpen(false);

    // Reset fields
    setNewFullName("");
    setNewStreet("");
    setNewCity("");
    setNewState("");
    setNewPostal("");
    setNewPhone("");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 font-montserrat">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00143D]">
            {isSpanish ? "Direcciones de Envío Guardadas" : "Saved Shipping Destinations"}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {isSpanish
              ? "Administra tus destinos globales para compras rápidas con Binance Pay USDT en 1 clic."
              : "Manage your global delivery addresses for rapid, 1-click Binance Pay USDT checkout."}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00143D] hover:bg-[#FF1028] text-white px-4 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isSpanish ? "Agregar Nueva Dirección" : "Add New Address"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between space-y-4 ${
              addr.isDefault
                ? "border-[#00143D] bg-slate-50 ring-2 ring-[#00143D]/10"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black text-[#00143D] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF1028]" />
                  <span>{addr.label}</span>
                </span>
                {addr.isDefault && (
                  <span className="bg-[#00143D] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                    {isSpanish ? "PREDETERMINADA" : "DEFAULT"}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-700">
                <span className="font-bold block text-slate-900">{addr.fullName}</span>
                <span className="block text-slate-600">{addr.street}</span>
                <span className="block text-slate-600">
                  {addr.city}, {addr.state} {addr.postal}
                </span>
                <span className="block font-semibold text-slate-800">{addr.country}</span>
                <span className="block text-[11px] text-slate-500 font-mono mt-1">
                  📞 {addr.phone}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
              {!addr.isDefault ? (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {isSpanish ? "Establecer como Predeterminada" : "Set as Default"}
                </button>
              ) : (
                <span className="text-[11px] text-[#10B981] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {isSpanish ? "Activa para Aéreo Express" : "Active for Air Express"}
                </span>
              )}

              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                title={isSpanish ? "Eliminar dirección" : "Delete address"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isSpanish ? "Agregar Nueva Dirección de Envío" : "Add New Shipping Address"}
        size="md"
      >
        <form onSubmit={handleAddAddress} className="p-4 sm:p-6 space-y-4 font-montserrat text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              {isSpanish ? "Etiqueta / Nombre de Dirección" : "Address Nickname / Label"}
            </label>
            <input
              type="text"
              required
              placeholder={isSpanish ? "ej. Casa, Oficina, Taller" : "e.g. Home, Office, Workshop"}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              {isSpanish ? "Nombre Completo del Destinatario" : "Recipient Full Name"}
            </label>
            <input
              type="text"
              required
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              {isSpanish ? "Dirección" : "Street Address"}
            </label>
            <input
              type="text"
              required
              value={newStreet}
              onChange={(e) => setNewStreet(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">
                {isSpanish ? "Ciudad" : "City"}
              </label>
              <input
                type="text"
                required
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">
                {isSpanish ? "Estado / Región" : "State / Region"}
              </label>
              <input
                type="text"
                required
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">
                {isSpanish ? "Código Postal" : "Postal / Zip Code"}
              </label>
              <input
                type="text"
                required
                value={newPostal}
                onChange={(e) => setNewPostal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">
                {isSpanish ? "País" : "Country"}
              </label>
              <select
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none focus:border-[#00143D]"
              >
                <option value="United States">{isSpanish ? "Estados Unidos" : "United States"}</option>
                <option value="United Kingdom">{isSpanish ? "Reino Unido" : "United Kingdom"}</option>
                <option value="Germany">{isSpanish ? "Alemania" : "Germany"}</option>
                <option value="Canada">{isSpanish ? "Canadá" : "Canada"}</option>
                <option value="Australia">{isSpanish ? "Australia" : "Australia"}</option>
                <option value="United Arab Emirates">{isSpanish ? "Emiratos Árabes Unidos" : "UAE"}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              {isSpanish ? "Teléfono de Contacto (para el transportista)" : "Contact Phone (for Courier)"}
            </label>
            <input
              type="tel"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 rounded-xl font-black text-xs transition-colors cursor-pointer"
            >
              {isSpanish ? "Guardar Dirección" : "Save Address"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              {isSpanish ? "Cancelar" : "Cancel"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
