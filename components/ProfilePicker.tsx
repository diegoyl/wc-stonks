'use client'

import { useProfile } from './ProfileProvider'
import { getPlayers } from '@/lib/mock'

const PLAYER_COLORS: Record<string, string> = {
  'player-diego': 'bg-blue-500',
  'player-marco': 'bg-green-500',
  'player-sofia': 'bg-purple-500',
  'player-lucas': 'bg-orange-500',
  'player-ana':   'bg-pink-500',
  'player-raj':   'bg-teal-500',
}

export default function ProfilePicker() {
  const { pickerOpen, closePicker, setPlayerId, playerId } = useProfile()
  const players = getPlayers()

  if (!pickerOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#141111] rounded-2xl border border-white/[0.08] shadow-2xl px-5 py-6 w-full max-w-sm">
        <h2 className="text-xl text-[#ebe0cc] mb-1">Who are you?</h2>
        <p className="text-[#888] text-sm mb-5">Select your profile.</p>

        <div className="grid grid-cols-2 gap-3">
          {players.map(p => (
            <button
              key={p.id}
              onClick={() => { setPlayerId(p.id); closePicker() }}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all active:scale-95 ${
                playerId === p.id
                  ? 'border-[#00c805] bg-[#00c805]/[0.08]'
                  : 'border-white/[0.1] bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[#ebe0cc] text-sm shrink-0 ${PLAYER_COLORS[p.id] ?? 'bg-gray-600'}`}>
                {p.name[0]}
              </div>
              <span className="font-semibold text-[#ebe0cc] text-sm">{p.name}</span>
            </button>
          ))}
        </div>

        {playerId && (
          <button
            onClick={closePicker}
            className="mt-4 w-full py-3 text-sm text-[#666] hover:text-[#888] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
