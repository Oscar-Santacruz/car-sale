'use client'

import { useState } from "react"
import { SimpleCatalogManager } from "./SimpleCatalogManager"
import { ModelManager } from "./ModelManager"
import { TaxManager } from "./TaxManager"
import { saveSimpleItem, deleteItem, saveModel, saveTax } from "@/app/settings-actions"

interface SettingsTabsProps {
    data: {
        brands: any[]
        models: any[]
        categories: any[]
        types: any[]
        costConcepts: any[]
        paymentMethods: any[]
        taxes: any[]
        creditors: any[]
        debug?: any
    }
}

export default function SettingsTabs({ data }: SettingsTabsProps) {
    const [activeTab, setActiveTab] = useState("vehicles")

    const tabs = [
        { id: "vehicles", label: "Vehículos" },
        { id: "financial", label: "Financiero" },
        { id: "others", label: "Otros" },
    ]

    return (
        <div className="space-y-6">
            {/* Tabs Header */}
            <div className="border-b">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === "vehicles" && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <SimpleCatalogManager
                            title="Marcas"
                            items={data.brands}
                            onSave={(name, id) => saveSimpleItem('brands', name, id)}
                            onDelete={(id) => deleteItem('brands', id)}
                        />
                        <ModelManager
                            models={data.models}
                            brands={data.brands}
                            onSave={(name, brandId, id) => saveModel(name, brandId, id)}
                            onDelete={(id) => deleteItem('models', id)}
                        />
                        <SimpleCatalogManager
                            title="Condiciones / Familias"
                            items={data.categories}
                            onSave={(name, id) => saveSimpleItem('vehicle_categories', name, id)}
                            onDelete={(id) => deleteItem('vehicle_categories', id)}
                        />
                        <SimpleCatalogManager
                            title="Tipos de Vehículo"
                            items={data.types}
                            onSave={(name, id) => saveSimpleItem('vehicle_types', name, id)}
                            onDelete={(id) => deleteItem('vehicle_types', id)}
                        />
                    </div>
                )}

                {activeTab === "financial" && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <SimpleCatalogManager
                            title="Conceptos de Costo"
                            items={data.costConcepts}
                            onSave={(name, id) => saveSimpleItem('cost_concepts', name, id)}
                            onDelete={(id) => deleteItem('cost_concepts', id)}
                        />
                        <SimpleCatalogManager
                            title="Formas de Pago"
                            items={data.paymentMethods}
                            onSave={(name, id) => saveSimpleItem('payment_methods', name, id)}
                            onDelete={(id) => deleteItem('payment_methods', id)}
                        />
                        <TaxManager
                            taxes={data.taxes}
                            onSave={(name, rate, id) => saveTax(name, rate, id)}
                            onDelete={(id) => deleteItem('taxes', id)}
                        />
                    </div>
                )}

                {activeTab === "others" && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <SimpleCatalogManager
                            title="Acreedores"
                            items={data.creditors}
                            onSave={(name, id) => saveSimpleItem('creditors', name, id)}
                            onDelete={(id) => deleteItem('creditors', id)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
