'use client'

import { useEffect } from 'react'
import FlagImage from './FlagImage'
import type { DraftTeam } from '@/lib/data/teams'
import { DRAFT_TEAMS } from '@/lib/data/teams'

// ─── Lookups ──────────────────────────────────────────────────────────────────

const CONFEDERATION_LABEL: Record<string, string> = {
  UEFA:     'UEFA (Europe)',
  CAF:      'CAF (Africa)',
  AFC:      'AFC (Asia)',
  CONMEBOL: 'CONMEBOL (S. America)',
  CONCACAF: 'CONCACAF (N. America)',
  OFC:      'OFC (Oceania)',
}

const MANAGERS: Record<string, string> = {
  ESP: 'Luis de la Fuente',     FRA: 'Didier Deschamps',      ARG: 'Lionel Scaloni',
  BRA: 'Dorival Júnior',        ENG: 'Thomas Tuchel',         POR: 'Roberto Martínez',
  GER: 'Julian Nagelsmann',     NED: 'Ronald Koeman',         BEL: 'Domenico Tedesco',
  MAR: 'Walid Regragui',        JPN: 'Hajime Moriyasu',       NOR: 'Ståle Solbakken',
  COL: 'Néstor Lorenzo',        URU: 'Marcelo Bielsa',        SEN: 'Aliou Cissé',
  CRO: 'Zlatko Dalić',          ECU: 'Sebastián Beccacece',   USA: 'Mauricio Pochettino',
  MEX: 'Javier Aguirre',        SUI: 'Murat Yakin',           TUR: 'Vincenzo Montella',
  KOR: 'Hong Myung-bo',         AUS: 'Tony Popovic',          CAN: 'Jesse Marsch',
  IRN: 'Amir Ghalenoei',        KSA: 'Roberto Mancini',       EGY: 'Hossam Hassan',
  CZE: 'Ivan Hašek',            RSA: 'Hugo Broos',            SWE: 'Jon Dahl Tomasson',
  TUN: 'Jalel Kadri',           SCO: 'Steve Clarke',          BIH: 'Sergej Barbarez',
  PAR: 'Gustavo Alfaro',        CIV: 'Emerse Faé',            QAT: 'Marquez López',
  IRQ: 'Jesús Casas',           ALG: 'Djamel Belmadi',        AUT: 'Ralf Rangnick',
  COD: 'Sébastien Desabre',     CPV: 'Bubista',               GHA: 'Otto Addo',
  PAN: 'Thomas Christiansen',   HAI: '—',                     CUW: 'Remko Bicentini',
  NZL: 'Danny Hay',             UZB: 'Srecko Katanec',        JOR: 'Hussein Ammouta',
}

type Stars = 0 | 1 | 2 | 3
interface PlayerEntry { name: string; stars: Stars }

const STAR_PLAYERS: Record<string, PlayerEntry[]> = {
  ESP: [
    { name: 'Lamine Yamal', stars: 3 },
    { name: 'Rodri',        stars: 3 },
    { name: 'Pedri',        stars: 2 },
    { name: 'Morata',       stars: 1 },
    { name: 'Carvajal',     stars: 1 },
  ],
  FRA: [
    { name: 'Mbappé',      stars: 3 },
    { name: 'Griezmann',   stars: 2 },
    { name: 'Camavinga',   stars: 2 },
    { name: 'Dembélé',     stars: 2 },
    { name: 'Upamecano',   stars: 1 },
  ],
  ARG: [
    { name: 'Messi',       stars: 3 },
    { name: 'De Paul',     stars: 2 },
    { name: 'J. Álvarez',  stars: 2 },
    { name: 'Mac Allister',stars: 2 },
    { name: 'Dybala',      stars: 1 },
  ],
  BRA: [
    { name: 'Vinicius Jr', stars: 3 },
    { name: 'Rodrygo',     stars: 2 },
    { name: 'Paquetá',     stars: 2 },
    { name: 'Endrick',     stars: 1 },
    { name: 'Militão',     stars: 1 },
  ],
  ENG: [
    { name: 'Bellingham',        stars: 3 },
    { name: 'Saka',              stars: 2 },
    { name: 'Kane',              stars: 2 },
    { name: 'Foden',             stars: 2 },
    { name: 'Alexander-Arnold',  stars: 1 },
  ],
  POR: [
    { name: 'Cristiano',   stars: 2 },
    { name: 'B. Silva',    stars: 2 },
    { name: 'R. Leão',     stars: 2 },
    { name: 'Vitinha',     stars: 1 },
    { name: 'Rúben Dias',  stars: 1 },
  ],
  GER: [
    { name: 'Wirtz',    stars: 3 },
    { name: 'Musiala',  stars: 3 },
    { name: 'Havertz',  stars: 1 },
    { name: 'Kimmich',  stars: 1 },
    { name: 'Rüdiger',  stars: 1 },
  ],
  NED: [
    { name: 'Gakpo',    stars: 2 },
    { name: 'De Jong',  stars: 2 },
    { name: 'Van Dijk', stars: 1 },
    { name: 'Dumfries', stars: 1 },
  ],
  BEL: [
    { name: 'De Bruyne', stars: 3 },
    { name: 'Lukaku',    stars: 2 },
    { name: 'Tielemans', stars: 1 },
    { name: 'Doku',      stars: 1 },
  ],
  MAR: [
    { name: 'Hakimi',     stars: 2 },
    { name: 'Ziyech',     stars: 1 },
    { name: 'En-Nesyri',  stars: 1 },
    { name: 'Bounou',     stars: 1 },
  ],
  JPN: [
    { name: 'Mitoma',    stars: 1 },
    { name: 'Doan',      stars: 1 },
    { name: 'Minamino',  stars: 1 },
  ],
  NOR: [
    { name: 'Haaland',   stars: 3 },
    { name: 'Ødegaard',  stars: 2 },
    { name: 'Nusa',      stars: 1 },
  ],
  COL: [
    { name: 'James',    stars: 2 },
    { name: 'Díaz',     stars: 2 },
    { name: 'Caicedo',  stars: 2 },
    { name: 'Arias',    stars: 1 },
  ],
  URU: [
    { name: 'Valverde',  stars: 2 },
    { name: 'Núñez',     stars: 2 },
    { name: 'Bentancur', stars: 1 },
  ],
  SEN: [
    { name: 'Mané',   stars: 2 },
    { name: 'Sarr',   stars: 1 },
    { name: 'Diatta', stars: 1 },
  ],
  CRO: [
    { name: 'Modrić',   stars: 2 },
    { name: 'Gvardiol', stars: 2 },
    { name: 'Kovačić',  stars: 1 },
  ],
  ECU: [
    { name: 'Caicedo',  stars: 2 },
    { name: 'Valencia', stars: 1 },
    { name: 'Plata',    stars: 1 },
  ],
  USA: [
    { name: 'Pulisic',   stars: 2 },
    { name: 'Reyna',     stars: 1 },
    { name: 'McKennie',  stars: 1 },
    { name: 'Weah',      stars: 1 },
  ],
  MEX: [
    { name: 'Lozano',   stars: 1 },
    { name: 'Jiménez',  stars: 1 },
    { name: 'Antuna',   stars: 0 },
  ],
  SUI: [
    { name: 'Xhaka',   stars: 1 },
    { name: 'Shaqiri', stars: 1 },
    { name: 'Embolo',  stars: 1 },
  ],
  TUR: [
    { name: 'Çalhanoğlu', stars: 2 },
    { name: 'Güler',      stars: 1 },
    { name: 'Yıldız',     stars: 1 },
  ],
  KOR: [
    { name: 'Son',         stars: 2 },
    { name: 'Lee Kang-in', stars: 1 },
    { name: 'Kim Min-jae', stars: 1 },
  ],
  SWE: [
    { name: 'Isak',      stars: 2 },
    { name: 'Kulusevski',stars: 1 },
    { name: 'Forsberg',  stars: 0 },
  ],
  AUS: [
    { name: 'Leckie', stars: 0 },
    { name: 'Irvine', stars: 0 },
  ],
  CAN: [
    { name: 'David',    stars: 1 },
    { name: 'Buchanan', stars: 1 },
    { name: 'Larin',    stars: 0 },
  ],
  EGY: [
    { name: 'Salah',     stars: 3 },
    { name: 'Trezeguet', stars: 0 },
  ],
  CZE: [
    { name: 'Schick',  stars: 1 },
    { name: 'Souček',  stars: 1 },
  ],
  ALG: [
    { name: 'Bennacer',   stars: 1 },
    { name: 'Bensebaini', stars: 1 },
  ],
  AUT: [
    { name: 'Arnautović', stars: 1 },
    { name: 'Sabitzer',   stars: 1 },
    { name: 'Alaba',      stars: 1 },
  ],
  IRN: [
    { name: 'Taremi',       stars: 1 },
    { name: 'Jahanbakhsh',  stars: 0 },
  ],
  SCO: [
    { name: 'Robertson',  stars: 1 },
    { name: 'McTominay',  stars: 1 },
  ],
  BIH: [
    { name: 'Džeko',   stars: 1 },
    { name: 'Pjanić',  stars: 1 },
  ],
  CIV: [
    { name: 'Zaha',   stars: 1 },
    { name: 'Pépé',   stars: 0 },
  ],
  GHA: [
    { name: 'T. Partey', stars: 1 },
    { name: 'J. Ayew',   stars: 0 },
  ],
  KSA: [
    { name: 'Al-Dawsari', stars: 0 },
  ],
  QAT: [
    { name: 'Al-Moez Ali', stars: 0 },
  ],
  CPV: [
    { name: 'Tavares', stars: 0 },
  ],
  PAR: [
    { name: 'Sanabria', stars: 0 },
  ],
  PAN: [
    { name: 'Davis', stars: 0 },
  ],
  HAI: [
    { name: 'Nazon', stars: 0 },
  ],
  CUW: [
    { name: 'A. Adams', stars: 0 },
  ],
  NZL: [
    { name: 'Wood', stars: 0 },
  ],
  UZB: [
    { name: 'Shomurodov', stars: 0 },
  ],
  JOR: [
    { name: 'Al-Tamari', stars: 0 },
  ],
  COD: [
    { name: 'Mbokani', stars: 0 },
  ],
  IRQ: [
    { name: 'Amjad Attwan', stars: 0 },
  ],
  RSA: [
    { name: 'Tau',   stars: 0 },
    { name: 'Zwane', stars: 0 },
  ],
  TUN: [
    { name: 'Msakni', stars: 0 },
  ],
}

// ─── Star display ─────────────────────────────────────────────────────────────

function StarRow({ stars }: { stars: Stars }) {
  return (
    <span className="flex gap-0.5 shrink-0">
      {([0, 1, 2] as const).map(i => (
        <span key={i} className={`text-sm leading-none ${i < stars ? 'text-amber-400' : 'text-[#2e2e2e]'}`}>
          {i < stars ? '★' : '☆'}
        </span>
      ))}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  team: DraftTeam
  onClose: () => void
}

export default function DraftTeamPopup({ team, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const groupLetter = team.group_code[0]
  const groupMates = DRAFT_TEAMS.filter(
    t => t.group_code[0] === groupLetter && t.id !== team.id
  ).sort((a, b) => a.group_code.localeCompare(b.group_code))

  const continent = CONFEDERATION_LABEL[team.confederation] ?? team.confederation
  const manager = MANAGERS[team.id] ?? '—'
  const players = STAR_PLAYERS[team.id] ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#141414] rounded-2xl border border-white/[0.1] w-full max-w-sm overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header — name + price inline */}
        <div className="px-5 pt-5 pb-4 flex items-start gap-3">
          <FlagImage code={team.code} name={team.name} size={44} outlined className="shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold text-white leading-tight truncate uppercase">
                {team.name} <span className="text-[#555] font-semibold text-sm">({team.code})</span>
              </h2>
              <span className="text-xl font-bold text-[#f59e0b] shrink-0">{team.draft_value}¢</span>
            </div>
          </div>
        </div>

        {/* FIFA rank + continent */}
        <div className="border-t border-white/[0.08] px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#555] mb-0.5">FIFA Rank</p>
            <p className="text-lg font-bold text-white">#{team.fifa_rank}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#555] mb-0.5">Confederation</p>
            <p className="text-sm font-semibold text-white">{continent}</p>
          </div>
        </div>

        {/* Group + groupmates */}
        <div className="border-t border-white/[0.08] px-5 py-3">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#555]">Group {groupLetter}</span>
            <div className="flex gap-4">
              {groupMates.map(t => (
                <div key={t.id} className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold text-white">{t.code}</span>
                  <FlagImage code={t.code} name={t.name} size={28} outlined />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manager */}
        <div className="border-t border-white/[0.08] px-5 py-3 flex items-center justify-between">
          <p className="text-xs text-[#555]">Manager</p>
          <p className="text-sm font-semibold text-white text-right">{manager}</p>
        </div>

        {/* Star players */}
        {players.length > 0 && (
          <div className="border-t border-white/[0.08] px-5 py-3">
            <p className="text-xs text-[#555] mb-2">Star Players</p>
            <div className="space-y-2">
              {players.map(p => (
                <div key={p.name} className="flex items-center gap-2.5">
                  <StarRow stars={p.stars} />
                  <span className="text-sm text-white">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close button */}
        <div className="border-t border-white/[0.08] px-5 py-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-white/[0.12] text-sm font-bold text-[#555] hover:bg-white/[0.05] transition-colors uppercase"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
