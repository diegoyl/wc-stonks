export interface DraftTeam {
  id: string           // 3-letter FIFA code, e.g. "BRA"
  name: string
  code: string         // same as id → /flags/{code}.png
  fifa_rank: number
  group_code: string   // e.g. "C1" — letter = group, digit = position within group
  draft_value: number  // ¢ per share
  confederation: string
}

export const DRAFT_TEAMS: DraftTeam[] = [
  // Group A
  { id: 'MEX', name: 'Mexico',             code: 'MEX', fifa_rank: 16, group_code: 'A1', draft_value: 10, confederation: 'CONCACAF' },
  { id: 'KOR', name: 'Korea Republic',     code: 'KOR', fifa_rank: 25, group_code: 'A2', draft_value: 10, confederation: 'AFC' },
  { id: 'CZE', name: 'Czechia',            code: 'CZE', fifa_rank: 41, group_code: 'A3', draft_value:  5, confederation: 'UEFA' },
  { id: 'RSA', name: 'South Africa',       code: 'RSA', fifa_rank: 61, group_code: 'A4', draft_value:  5, confederation: 'CAF' },
  // Group B
  { id: 'CAN', name: 'Canada',             code: 'CAN', fifa_rank: 30, group_code: 'B1', draft_value:  8, confederation: 'CONCACAF' },
  { id: 'SUI', name: 'Switzerland',        code: 'SUI', fifa_rank: 18, group_code: 'B2', draft_value: 10, confederation: 'UEFA' },
  { id: 'QAT', name: 'Qatar',              code: 'QAT', fifa_rank: 55, group_code: 'B3', draft_value:  3, confederation: 'AFC' },
  { id: 'BIH', name: 'Bosnia-Herzegovina', code: 'BIH', fifa_rank: 65, group_code: 'B4', draft_value:  4, confederation: 'UEFA' },
  // Group C
  { id: 'BRA', name: 'Brazil',             code: 'BRA', fifa_rank:  5, group_code: 'C1', draft_value: 36, confederation: 'CONMEBOL' },
  { id: 'MAR', name: 'Morocco',            code: 'MAR', fifa_rank:  8, group_code: 'C2', draft_value: 12, confederation: 'CAF' },
  { id: 'SCO', name: 'Scotland',           code: 'SCO', fifa_rank: 43, group_code: 'C3', draft_value:  5, confederation: 'UEFA' },
  { id: 'HAI', name: 'Haiti',              code: 'HAI', fifa_rank: 83, group_code: 'C4', draft_value:  2, confederation: 'CONCACAF' },
  // Group D
  { id: 'USA', name: 'USA',                code: 'USA', fifa_rank: 15, group_code: 'D1', draft_value: 10, confederation: 'CONCACAF' },
  { id: 'TUR', name: 'Türkiye',            code: 'TUR', fifa_rank: 25, group_code: 'D2', draft_value:  8, confederation: 'UEFA' },
  { id: 'AUS', name: 'Australia',          code: 'AUS', fifa_rank: 27, group_code: 'D3', draft_value:  8, confederation: 'AFC' },
  { id: 'PAR', name: 'Paraguay',           code: 'PAR', fifa_rank: 40, group_code: 'D4', draft_value:  5, confederation: 'CONMEBOL' },
  // Group E
  { id: 'GER', name: 'Germany',            code: 'GER', fifa_rank: 10, group_code: 'E1', draft_value: 22, confederation: 'UEFA' },
  { id: 'ECU', name: 'Ecuador',            code: 'ECU', fifa_rank: 23, group_code: 'E2', draft_value: 10, confederation: 'CONMEBOL' },
  { id: 'CIV', name: "Côte d'Ivoire",      code: 'CIV', fifa_rank: 34, group_code: 'E3', draft_value:  8, confederation: 'CAF' },
  { id: 'CUW', name: 'Curaçao',            code: 'CUW', fifa_rank: 82, group_code: 'E4', draft_value:  2, confederation: 'CONCACAF' },
  // Group F
  { id: 'NED', name: 'Netherlands',        code: 'NED', fifa_rank:  7, group_code: 'F1', draft_value: 18, confederation: 'UEFA' },
  { id: 'JPN', name: 'Japan',              code: 'JPN', fifa_rank: 19, group_code: 'F2', draft_value: 12, confederation: 'AFC' },
  { id: 'SWE', name: 'Sweden',             code: 'SWE', fifa_rank: 38, group_code: 'F3', draft_value:  8, confederation: 'UEFA' },
  { id: 'TUN', name: 'Tunisia',            code: 'TUN', fifa_rank: 44, group_code: 'F4', draft_value:  4, confederation: 'CAF' },
  // Group G
  { id: 'BEL', name: 'Belgium',            code: 'BEL', fifa_rank:  9, group_code: 'G1', draft_value: 14, confederation: 'UEFA' },
  { id: 'IRN', name: 'Iran',               code: 'IRN', fifa_rank: 20, group_code: 'G2', draft_value:  8, confederation: 'AFC' },
  { id: 'EGY', name: 'Egypt',              code: 'EGY', fifa_rank: 35, group_code: 'G3', draft_value:  8, confederation: 'CAF' },
  { id: 'NZL', name: 'New Zealand',        code: 'NZL', fifa_rank: 85, group_code: 'G4', draft_value:  3, confederation: 'OFC' },
  // Group H
  { id: 'ESP', name: 'Spain',              code: 'ESP', fifa_rank:  1, group_code: 'H1', draft_value: 40, confederation: 'UEFA' },
  { id: 'URU', name: 'Uruguay',            code: 'URU', fifa_rank: 17, group_code: 'H2', draft_value: 12, confederation: 'CONMEBOL' },
  { id: 'KSA', name: 'Saudi Arabia',       code: 'KSA', fifa_rank: 60, group_code: 'H3', draft_value:  5, confederation: 'AFC' },
  { id: 'CPV', name: 'Cabo Verde',         code: 'CPV', fifa_rank: 69, group_code: 'H4', draft_value:  4, confederation: 'CAF' },
  // Group I
  { id: 'FRA', name: 'France',             code: 'FRA', fifa_rank:  3, group_code: 'I1', draft_value: 40, confederation: 'UEFA' },
  { id: 'SEN', name: 'Senegal',            code: 'SEN', fifa_rank: 12, group_code: 'I2', draft_value: 10, confederation: 'CAF' },
  { id: 'NOR', name: 'Norway',             code: 'NOR', fifa_rank: 31, group_code: 'I3', draft_value: 14, confederation: 'UEFA' },
  { id: 'IRQ', name: 'Iraq',               code: 'IRQ', fifa_rank: 57, group_code: 'I4', draft_value:  3, confederation: 'AFC' },
  // Group J
  { id: 'ARG', name: 'Argentina',          code: 'ARG', fifa_rank:  2, group_code: 'J1', draft_value: 36, confederation: 'CONMEBOL' },
  { id: 'ALG', name: 'Algeria',            code: 'ALG', fifa_rank: 28, group_code: 'J2', draft_value:  5, confederation: 'CAF' },
  { id: 'AUT', name: 'Austria',            code: 'AUT', fifa_rank: 24, group_code: 'J3', draft_value:  6, confederation: 'UEFA' },
  { id: 'JOR', name: 'Jordan',             code: 'JOR', fifa_rank: 63, group_code: 'J4', draft_value:  3, confederation: 'AFC' },
  // Group K
  { id: 'POR', name: 'Portugal',           code: 'POR', fifa_rank:  6, group_code: 'K1', draft_value: 26, confederation: 'UEFA' },
  { id: 'COL', name: 'Colombia',           code: 'COL', fifa_rank: 13, group_code: 'K2', draft_value: 12, confederation: 'CONMEBOL' },
  { id: 'COD', name: 'DR Congo',           code: 'COD', fifa_rank: 46, group_code: 'K3', draft_value:  4, confederation: 'CAF' },
  { id: 'UZB', name: 'Uzbekistan',         code: 'UZB', fifa_rank: 50, group_code: 'K4', draft_value:  3, confederation: 'AFC' },
  // Group L
  { id: 'ENG', name: 'England',            code: 'ENG', fifa_rank:  4, group_code: 'L1', draft_value: 36, confederation: 'UEFA' },
  { id: 'CRO', name: 'Croatia',            code: 'CRO', fifa_rank: 11, group_code: 'L2', draft_value: 10, confederation: 'UEFA' },
  { id: 'PAN', name: 'Panama',             code: 'PAN', fifa_rank: 33, group_code: 'L3', draft_value:  4, confederation: 'CONCACAF' },
  { id: 'GHA', name: 'Ghana',              code: 'GHA', fifa_rank: 49, group_code: 'L4', draft_value:  6, confederation: 'CAF' },
]
