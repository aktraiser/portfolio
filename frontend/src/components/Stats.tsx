const stats = [
  { id: 1, name: 'Creators on the platform', value: '8,000+' },
  { id: 2, name: 'Flat platform fee', value: '3%' },
  { id: 3, name: 'Uptime guarantee', value: '99.9%' },
  { id: 4, name: 'Paid out to creators', value: '$70M' },
]

export default function Stats() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.id} className="bg-gray-900 rounded-2xl overflow-hidden p-8 text-left">
          <dd className="text-4xl font-semibold tracking-tight text-white">{stat.value}</dd>
          <dt className="mt-2 text-sm font-semibold text-gray-300">{stat.name}</dt>
        </div>
      ))}
    </div>
  )
} 