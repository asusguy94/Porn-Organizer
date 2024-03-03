import { createQueryKeys } from '@lukemorales/query-key-factory'

export const video = createQueryKeys('video', {
  byId: (id: number) => ({
    queryKey: [id],
    contextQueries: {
      bookmark: null,
      star: null
    }
  }),
  home: (label: string) => ({
    queryKey: [label]
  }),
  new: null
})
