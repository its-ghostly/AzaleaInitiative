import { useEffect, useState } from 'react'
import {
  bootstrapStore,
  getCommunityDraft,
  getSessionUser,
  getStoreReady,
  listAudit,
  listFacilities,
  listSubmissions,
  subscribeStore,
} from './store'

export function usePlatform() {
  const [, setTick] = useState(0)

  useEffect(() => {
    void bootstrapStore().catch(() => undefined)
    return subscribeStore(() => setTick((value) => value + 1))
  }, [])

  return {
    ready: getStoreReady(),
    user: getSessionUser(),
    submissions: listSubmissions(),
    audit: listAudit(),
    facilities: listFacilities(),
    draft: getCommunityDraft(),
  }
}
