import axios from 'axios'
import type { HiscoresData } from '../types'

const USERNAME = 'The BrummJob'

export async function fetchHiscores(): Promise<HiscoresData> {
  const encoded = encodeURIComponent(USERNAME)
  const { data } = await axios.get<HiscoresData>(`/api/osrs/hiscores/${encoded}`)
  return data
}
