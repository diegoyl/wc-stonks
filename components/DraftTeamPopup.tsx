'use client'

import { useEffect } from 'react'
import FlagImage from './FlagImage'
import WavingFlagImage from './WavingFlagImage'
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
  ARG: [
    { name: 'Lionel Messi',         stars: 3 },
    { name: 'Lautaro Martínez',     stars: 3 },
    { name: 'Julián Álvarez',       stars: 2 },
    { name: 'Alexis Mac Allister',  stars: 2 },
    { name: 'Enzo Fernández',       stars: 1 },
    { name: 'Rodrigo de Paul',      stars: 1 },
  ],
  BRA: [
    { name: 'Vinícius Júnior',  stars: 3 },
    { name: 'Raphinha',         stars: 3 },
    { name: 'Gabriel Magalhães',stars: 2 },
    { name: 'Bruno Guimarães',  stars: 1 },
    { name: 'Neymar Jr.',       stars: 1 },
    { name: 'Endrick',          stars: 1 },
  ],
  ENG: [
    { name: 'Harry Kane',      stars: 3 },
    { name: 'Jude Bellingham', stars: 3 },
    { name: 'Bukayo Saka',     stars: 2 },
    { name: 'Declan Rice',     stars: 2 },
    { name: 'Marcus Rashford', stars: 1 },
    { name: 'Kobbie Mainoo',   stars: 1 },
  ],
  FRA: [
    { name: 'Kylian Mbappé',        stars: 3 },
    { name: 'Ousmane Dembélé',      stars: 3 },
    { name: 'Michael Olise',        stars: 2 },
    { name: 'Aurélien Tchouaméni',  stars: 2 },
    { name: 'Rayan Cherki',         stars: 2 },
    { name: 'Désiré Doué',          stars: 2 },
  ],
  GER: [
    { name: 'Joshua Kimmich',  stars: 3 },
    { name: 'Florian Wirtz',   stars: 2 },
    { name: 'Jamal Musiala',   stars: 2 },
    { name: 'Manuel Neuer',    stars: 1 },
    { name: 'Kai Havertz',     stars: 1 },
    { name: 'Antonio Rüdiger', stars: 1 },
  ],
  POR: [
    { name: 'Vitinha',           stars: 3 },
    { name: 'Bruno Fernandes',   stars: 2 },
    { name: 'Cristiano Ronaldo', stars: 2 },
    { name: 'Nuno Mendes',       stars: 2 },
    { name: 'João Neves',        stars: 1 },
    { name: 'Rafael Leão',       stars: 1 },
  ],
  ESP: [
    { name: 'Lamine Yamal',  stars: 3 },
    { name: 'Rodri',         stars: 3 },
    { name: 'Pedri',         stars: 2 },
    { name: 'Gavi',          stars: 2 },
    { name: 'Nico Williams', stars: 1 },
    { name: 'Dani Olmo',     stars: 1 },
  ],
  NED: [
    { name: 'Virgil van Dijk',    stars: 3 },
    { name: 'Frenkie de Jong',    stars: 2 },
    { name: 'Tijjani Reijnders',  stars: 2 },
    { name: 'Ryan Gravenberch',   stars: 1 },
    { name: 'Cody Gakpo',         stars: 1 },
  ],
  NOR: [
    { name: 'Erling Haaland',    stars: 3 },
    { name: 'Alexander Sørloth', stars: 3 },
    { name: 'Martin Ødegaard',   stars: 2 },
  ],
  BEL: [
    { name: 'Kevin De Bruyne', stars: 3 },
    { name: 'Jérémy Doku',     stars: 2 },
    { name: 'Youri Tielemans', stars: 1 },
    { name: 'Romelu Lukaku',   stars: 1 },
  ],
  COL: [
    { name: 'Luis Díaz',          stars: 3 },
    { name: 'Davinson Sánchez',   stars: 1 },
    { name: 'Jefferson Lerma',    stars: 1 },
    { name: 'James Rodríguez',    stars: 0 },
  ],
  MAR: [
    { name: 'Achraf Hakimi',    stars: 3 },
    { name: 'Brahim Díaz',      stars: 2 },
    { name: 'Yassine Bounou',   stars: 0 },
    { name: 'Noussair Mazraoui',stars: 0 },
  ],
  JPN: [
    { name: 'Takefusa Kubo', stars: 2 },
    { name: 'Ritsu Doan',    stars: 0 },
    { name: 'Wataru Endo',   stars: 0 },
  ],
  MEX: [
    { name: 'Raúl Jiménez',    stars: 2 },
    { name: 'Edson Álvarez',   stars: 1 },
    { name: 'Santiago Giménez',stars: 1 },
    { name: 'Alexis Vega',     stars: 0 },
    { name: 'Gilberto Mora',   stars: 0 },
    { name: 'Julian Quiñones', stars: 0 },
  ],
  USA: [
    { name: 'Christian Pulisic', stars: 2 },
    { name: 'Antonee Robinson',  stars: 1 },
    { name: 'Weston McKennie',   stars: 1 },
    { name: 'Tyler Adams',       stars: 0 },
    { name: 'Sergiño Dest',      stars: 0 },
    { name: 'Folarin Balogun',   stars: 0 },
  ],
  CRO: [
    { name: 'Joško Gvardiol',  stars: 2 },
    { name: 'Luka Modrić',     stars: 2 },
    { name: 'Mateo Kovačić',   stars: 2 },
    { name: 'Ante Budimir',    stars: 1 },
    { name: 'Ivan Perišić',    stars: 1 },
    { name: 'Andrej Kramarić', stars: 1 },
  ],
  URU: [
    { name: 'Federico Valverde',    stars: 3 },
    { name: 'Ronald Araújo',        stars: 2 },
    { name: 'Darwin Núñez',         stars: 1 },
    { name: 'Manuel Ugarte',        stars: 1 },
    { name: 'José María Giménez',   stars: 0 },
  ],
  SEN: [
    { name: 'Sadio Mané',        stars: 2 },
    { name: 'Kalidou Koulibaly', stars: 1 },
    { name: 'Pape Matar Sarr',   stars: 0 },
    { name: 'Nicolas Jackson',   stars: 0 },
    { name: 'Ismaïla Sarr',      stars: 0 },
  ],
  TUR: [
    { name: 'Hakan Çalhanoğlu', stars: 2 },
    { name: 'Arda Güler',       stars: 2 },
    { name: 'Kenan Yıldız',     stars: 1 },
    { name: 'Merih Demiral',    stars: 0 },
  ],
  SUI: [
    { name: 'Granit Xhaka',  stars: 0 },
    { name: 'Breel Embolo',  stars: 0 },
  ],
  ECU: [
    { name: 'Moisés Caicedo',   stars: 2 },
    { name: 'Willian Pachó',    stars: 2 },
    { name: 'Piero Hincapié',   stars: 1 },
    { name: 'Pervis Estupiñán', stars: 1 },
    { name: 'Enner Valencia',   stars: 0 },
  ],
  AUT: [
    { name: 'David Alaba',           stars: 2 },
    { name: 'Konrad Laimer',         stars: 1 },
    { name: 'Marcel Sabitzer',       stars: 0 },
    { name: 'Christoph Baumgartner', stars: 0 },
  ],
  SWE: [
    { name: 'Viktor Gyökeres',  stars: 3 },
    { name: 'Alexander Isak',   stars: 2 },
    { name: 'Anthony Elanga',   stars: 0 },
    { name: 'Victor Lindelöf',  stars: 0 },
  ],
  CAN: [
    { name: 'Alphonso Davies',   stars: 2 },
    { name: 'Jonathan David',    stars: 1 },
    { name: 'Tajon Buchanan',    stars: 0 },
    { name: 'Stephen Eustáquio', stars: 0 },
  ],
  CIV: [
    { name: 'Amad Diallo',  stars: 1 },
    { name: 'Franck Kessié',stars: 1 },
    { name: 'Yan Diomande', stars: 0 },
    { name: 'Seko Fofana',  stars: 0 },
  ],
  BIH: [
    { name: 'Edin Džeko',        stars: 1 },
    { name: 'Ermedin Demirović', stars: 1 },
    { name: 'Amar Dedić',        stars: 0 },
  ],
  EGY: [
    { name: 'Mohamed Salah',     stars: 3 },
    { name: 'Omar Marmoush',     stars: 1 },
    { name: 'Mahmoud Trezeguet', stars: 0 },
  ],
  CZE: [
    { name: 'Patrik Schick',   stars: 2 },
    { name: 'Tomáš Souček',    stars: 1 },
    { name: 'Ladislav Krejčí', stars: 0 },
  ],
  KOR: [
    { name: 'Son Heung-min',  stars: 3 },
    { name: 'Kim Min-jae',    stars: 1 },
    { name: 'Lee Kang-in',    stars: 1 },
    { name: 'Hwang Hee-chan', stars: 0 },
    { name: 'Hwang In-beom',  stars: 0 },
  ],
  PAR: [
    { name: 'Miguel Almirón', stars: 1 },
    { name: 'Diego Gómez',   stars: 0 },
    { name: 'Julio Enciso',  stars: 0 },
  ],
  SCO: [
    { name: 'Andy Robertson',  stars: 1 },
    { name: 'Scott McTominay', stars: 1 },
    { name: 'John McGinn',     stars: 0 },
    { name: 'Kieran Tierney',  stars: 0 },
  ],
  GHA: [
    { name: 'Antoine Semenyo', stars: 1 },
    { name: 'Thomas Partey',   stars: 1 },
    { name: 'Jordan Ayew',     stars: 0 },
  ],
  ALG: [
    { name: 'Riyad Mahrez',           stars: 2 },
    { name: 'Mohamed Amine Amoura',   stars: 0 },
    { name: 'Aminory Irankunda',      stars: 0 },
  ],
  AUS: [
    { name: 'Cristian Volpato', stars: 0 },
    { name: 'Mathew Leckie',    stars: 0 },
  ],
  HAI: [
    { name: 'Duckens Nazon',       stars: 0 },
    { name: 'Jean-Ricner Bellegarde', stars: 0 },
    { name: 'Wilson Isidor',       stars: 0 },
  ],
  IRN: [
    { name: 'Mehdi Taremi',       stars: 1 },
    { name: 'Alireza Jahanbakhsh',stars: 0 },
    { name: 'Saman Ghoddos',      stars: 0 },
  ],
  COD: [
    { name: 'Yoane Wissa',       stars: 1 },
    { name: 'Aaron Wan-Bissaka', stars: 1 },
    { name: 'Chancel Mbemba',    stars: 0 },
  ],
  IRQ: [
    { name: 'Aymen Hussein',  stars: 0 },
    { name: 'Ali Al-Hamadi',  stars: 0 },
  ],
  CPV: [
    { name: 'Jovane Cabral', stars: 0 },
    { name: 'Logan Costa',   stars: 0 },
  ],
  JOR: [
    { name: 'Musa Al-Taamari',  stars: 1 },
    { name: 'Yazan Al-Naimat',  stars: 0 },
  ],
  CUW: [
    { name: 'Tahith Chong', stars: 0 },
  ],
  NZL: [
    { name: 'Chris Wood', stars: 1 },
  ],
  PAN: [
    { name: 'Adalberto Carrasquilla', stars: 0 },
    { name: 'Ismael Díaz',            stars: 0 },
  ],
  QAT: [
    { name: 'Akram Afif',  stars: 1 },
    { name: 'Almoez Ali',  stars: 0 },
  ],
  RSA: [
    { name: 'Lyle Foster',  stars: 1 },
    { name: 'Themba Zwane', stars: 0 },
  ],
  KSA: [
    { name: 'Salem Al-Dawsari',  stars: 1 },
    { name: 'Mohammed Kanno',    stars: 0 },
  ],
  TUN: [
    { name: 'Hannibal Mejbri', stars: 1 },
  ],
  UZB: [
    { name: 'Abdukodir Khusanov', stars: 1 },
    { name: 'Eldor Shomurodov',   stars: 0 },
  ],
}

// ─── Star display ─────────────────────────────────────────────────────────────

function StarRow({ stars }: { stars: Stars }) {
  return (
    <span className="flex gap-0.5 shrink-0">
      {([0, 1, 2] as const).map(i => (
        <span key={i} className={`text-sm leading-none ${i < stars ? 'text-[#eeb22d]' : 'text-[#2e2e2e]'}`}>
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
        className="bg-[#18110D] rounded-2xl border border-white/[0.1] w-full max-w-sm overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header — name + price inline */}
        <div className="px-5 pt-5 pb-4 flex items-start gap-3">
          <WavingFlagImage code={team.code} name={team.name} size={80} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold text-white leading-tight break-words uppercase">
                {team.name} <span className="text-[#6b5c4e] font-semibold text-sm">({team.code})</span>
              </h2>
              <span className="text-xl font-bold text-[#eeb22d] shrink-0">{team.draft_value}¢</span>
            </div>
          </div>
        </div>

        {/* FIFA rank + continent */}
        <div className="border-t border-white/[0.08] px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6b5c4e] mb-0.5">FIFA Rank</p>
            <p className="text-lg font-bold text-white">#{team.fifa_rank}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6b5c4e] mb-0.5">Confederation</p>
            <p className="text-sm font-semibold text-white">{continent}</p>
          </div>
        </div>

        {/* Group + groupmates */}
        <div className="border-t border-white/[0.08] px-5 py-3">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#6b5c4e]">Group {groupLetter}</span>
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
          <p className="text-xs text-[#6b5c4e]">Manager</p>
          <p className="text-sm font-semibold text-white text-right">{manager}</p>
        </div>

        {/* Star players */}
        {players.length > 0 && (
          <div className="border-t border-white/[0.08] px-5 py-3">
            <p className="text-xs text-[#6b5c4e] mb-2">Players</p>
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
            className="w-full py-2.5 rounded-lg bg-[#776856] text-[#18110D] text-sm font-bold hover:bg-[#776856]/90 transition-colors uppercase"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
