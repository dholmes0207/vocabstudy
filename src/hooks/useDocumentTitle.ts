import { useEffect } from 'react'

/** Set the browser tab title while a page is on screen. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
  }, [title])
}
