import fs from 'fs'
import csv from 'csv-parser' 
import { State, isState } from '../../common'

interface Line {
  zip: string
  state_id: string
  state_name: string
}

const lines: Line[] = []
interface StateValue {
  stateId: string,
  stateName: string
}
let obj: Record<string, StateValue> | null = null

fs.createReadStream(__dirname + '/uszips.csv')
  .pipe(csv())
  .on('data', (data: Line) => lines.push(data))
  .on('end', () => {
    obj = Object.fromEntries(
      lines.map(
        ({zip, state_id, state_name}) => [
          zip.padStart(5, '0'),
          {
            stateId: state_id,
            stateName: state_name
          }
        ]
      )
    )
  })

export const search = (zip: string): State | null => {
  if (!obj) return null
  const {stateName} = obj[zip]
  if (!isState(stateName)) return null
  return stateName
}
