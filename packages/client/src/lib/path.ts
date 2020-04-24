import { useHistory, useLocation, matchPath } from "react-router-dom"
import { pageView } from "./analytics"

const allPathEnums = [
  'start',
  'address',
  'state',
  'success',
] as const
export type PathEnum = (typeof allPathEnums)[number]

interface PathBase {
  type: PathEnum
  oid: string
}

export interface StartPath extends PathBase {
  type: 'start'
}
export interface AddressPath extends PathBase {
  type: 'address'
  state: string
  zip?: string
}
export interface StatePath extends PathBase {
  type: 'state'
  state: string
}
export interface SuccessPath extends PathBase {
  type: 'success'
  id?: string
}

export type Path = (
  | StartPath
  | AddressPath
  | StatePath
  | SuccessPath
)

interface PathDatum<P extends Path = Path> {
  path: string
  toUrl: (path: P) => string
  scrollId: string
}

type ByEnum<E extends PathEnum, P> = P extends {type: E} ? P : never
type PathByEnum<E extends PathEnum> = ByEnum<E, Path>
type PathData = { [E in PathEnum]: PathDatum<PathByEnum<E>> }

export const pathData: PathData = {
  'start': {
    path: '/org/:oid',
    toUrl: ({oid}) => `/org/${oid}`,
    scrollId: 'start',
  },
  'address': {
    path: '/org/:oid/address/:state/:zip?',
    toUrl: ({oid, state, zip}) => `/org/${oid}/address/${state}/${zip || ''}`,
    scrollId: 'address'
  },
  'state': {
    path: '/org/:oid/state/:state',
    toUrl: ({oid, state}) => `/org/${oid}/state/${state}`,
    scrollId: 'address',
  },
  'success': {
    path: '/org/:oid/success/:id?',
    toUrl: ({oid, id}) => `/org/${oid}/success/${id || ''}`,
    scrollId: 'address',
  }
}

export const toUrl = <P extends Path>(path: P): string => {
  // arg -- can't get around this typecast
  return (pathData[path.type] as PathDatum<P>).toUrl(path)
}

const defaultOid = 'default'
export const defaultUrl = toUrl({type:'start', oid:defaultOid})

const rawToPath = <P extends Path>(url: string, pathEnum: PathEnum, exact = false): P | null => {
  const { path } = pathData[pathEnum]
  const match = matchPath<P>(url, { path, exact })
  if (!match) return null
  return { type: pathEnum, ...match.params }
}

export const toPath = (pathname: string): Path | null => {
  const matches = allPathEnums.map(e => rawToPath<StartPath>(pathname, e, true))
  return matches.reduce((x, y) => x || y, null)
}

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

export const useAppHistory = () => {
  const history = useHistory()
  const { pathname, search } = useLocation()
  const _query = new URLSearchParams(search)
  const path = toPath(pathname)
  const oid = path?.oid || defaultOid
  
  const pushScroll = (path: Path) => {
    history.push(toUrl(path))
    scrollToId(pathData[path.type].scrollId)
    pageView()
  }

  return {
    path,
    oid,
    pushStart: () => pushScroll({oid, type: 'start'}),
    pushAddress: (state: string, zip?: string) => {
      pushScroll({oid, type: 'address', state, zip})
    },
    pushState: (state: string) => {
      pushScroll({oid, type: 'state', state})
    },
    pushSuccess: (id: string) => {
      pushScroll({oid, type: 'success', id})
    },
    query: (id: string) => {
      return _query.get(id)
    }
  }
}
