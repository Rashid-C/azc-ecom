'use client'

import { PieChart, Pie, ResponsiveContainer, Cell } from 'recharts'

export default function SalesCategoryPieChart({ data }: { data: any[] }) {
      const RADIAN = Math.PI / 180
  const COLORS = [
    'hsl(47.9 95.8% 53.1%)',
    'hsl(142.1 76.2% 36.3%)',
    'hsl(0 72.2% 50.6%)',
    'hsl(217 91% 60%)',
    'hsl(271 91% 65%)',
    'hsl(25 95% 53%)',
  ]

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text
        x={x}
        y={y}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline='central'
        fontSize={12}
        fill='#fff'
      >
        {`${data[index]._id} (${data[index].totalSales})`}
      </text>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={400}>
      <PieChart>
        <Pie
          data={data}
          dataKey='totalSales'
          cx='50%'
          cy='50%'
          outerRadius={160}
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
