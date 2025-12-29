'use client'

interface Table {
  id: number
  number: string
  capacity: number
  status: 'available' | 'reserved' | 'occupied' | 'cleaning'
  qr_code: string
  position_x: number
  position_y: number
  shape: 'square' | 'rectangle' | 'circle'
}

interface TableMapProps {
  tables: Table[]
  sessions: { [key: number]: any }
  onTableClick: (table: Table) => void
}

export default function TableMap({ tables, sessions, onTableClick }: TableMapProps) {
  const getTableColor = (table: Table) => {
    const session = sessions[table.id]
    if (session && session.status === 'active') {
      return 'bg-red-100 border-red-500 hover:bg-red-200'  // 使用中
    }
    return 'bg-green-100 border-green-500 hover:bg-green-200'  // 空席
  }

  const getTableShape = (shape: string) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full'
      case 'rectangle':
        return 'rounded-lg'
      default:
        return 'rounded-lg'
    }
  }

  return (
    <div className="relative w-full bg-gray-100 rounded-lg p-8" style={{ minHeight: '600px' }}>
      <div className="relative w-full h-full">
        {tables.map((table) => {
          const session = sessions[table.id]
          const isAvailable = !session || session.status !== 'active'

          return (
            <button
              key={table.id}
              onClick={() => isAvailable && onTableClick(table)}
              disabled={!isAvailable}
              className={`
                absolute border-2 transition-all
                ${getTableColor(table)}
                ${getTableShape(table.shape)}
                ${!isAvailable ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
              `}
              style={{
                left: `${table.position_x}%`,
                top: `${table.position_y}%`,
                width: table.shape === 'rectangle' ? '120px' : '80px',
                height: '80px',
              }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-2xl font-bold text-gray-900">{table.number}</p>
                <p className="text-xs text-gray-600">{table.capacity}名</p>
                {session && session.status === 'active' && (
                  <p className="text-xs text-red-600 font-medium">使用中</p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* グリッド線（オプション） */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="gray" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  )
}
