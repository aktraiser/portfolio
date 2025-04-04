const stats = [
  { id: 1, name: 'Modele de Générative AI', value: '10+' },
  { id: 2, name: 'De gain de productivité', value: '30%' },
  { id: 3, name: 'Marques accompagnées', value: '15+' },
  { id: 4, name: 'Satisfaction clients', value: '95%' },
]

export default function Stats() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.id} className="bg-[#252339] rounded-2xl overflow-hidden p-8 text-left">
          <dd className="text-4xl font-semibold tracking-tight text-white">{stat.value}</dd>
          <dt className="mt-2 text-sm font-semibold text-gray-300">{stat.name}</dt>
        </div>
      ))}
    </div>
  )
} 