"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface WeeklySalesChartProps {
    data: any[]
}

export function WeeklySalesChart({ data }: WeeklySalesChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Ventas Semanales (Contado vs Crédito)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="label"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `Gs. ${value / 1000000}M`}
                        />
                        <Tooltip
                            formatter={(value: any) => formatCurrency(Number(value || 0))}
                            labelStyle={{ color: "black" }}
                        />
                        <Legend />
                        <Bar dataKey="cashAmount" name="Contado" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="creditAmount" name="Crédito" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

interface PortfolioChartProps {
    total: number
    overdue: number
}

export function PortfolioChart({ total, overdue }: PortfolioChartProps) {
    const data = [
        { name: "Al Día", value: total - overdue },
        { name: "Vencido", value: overdue },
    ]
    const COLORS = ["#22c55e", "#ef4444"]

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Estado de Cartera</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
