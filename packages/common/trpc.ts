import { IRpc, RpcRet } from '@tianhuil/simple-trpc/dist/type'
import { WithoutId } from './util'
import { Address } from './address'
import { StateInfo, State } from './states'
import { Contact } from './contact'

export interface IVbmRpc extends IRpc<IVbmRpc> {
  add(x: number, y: number): Promise<RpcRet<number>>
  state(zip: string): Promise<RpcRet<State>>
  addAddress(address: WithoutId<Address>): Promise<RpcRet<{ id: string, contact: Contact | null}>>
  register(info: StateInfo): Promise<RpcRet<string>>
}
