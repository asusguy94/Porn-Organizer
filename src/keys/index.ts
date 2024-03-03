import { mergeQueryKeys } from '@lukemorales/query-key-factory'

import { attribute } from './attribute'
import { category } from './category'
import { location } from './location'
import { search } from './search'
import { star } from './star'
import { video } from './video'
import { website } from './website'

export const keys = mergeQueryKeys(attribute, category, location, search, star, video, website)
