import { revalidatePath } from 'next/cache'

import Client, { EditorPageProps } from './client'

import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export const dynamic = 'force-dynamic'

export default async function EditorPage() {
  type Prop = EditorPageProps['data'][number]

  const attributes: Prop = {
    name: 'attribute',
    data: await db.attribute.findMany({ orderBy: { id: 'asc' } }),
    add: async data => {
      'use server'

      const { name } = validate(
        z.object({
          name: z.string().min(3)
        }),
        data
      )

      await db.attribute.create({ data: { name } })
      revalidatePath('/editor')
      revalidatePath('/video/[id]')
    },
    update: async data => {
      'use server'

      const { id, name } = validate(
        z.object({
          id: z.coerce.number().int().positive(),
          name: z.string().min(3)
        }),
        data
      )

      await db.attribute.update({ where: { id }, data: { name } })
      revalidatePath('/editor')
      revalidatePath('/video/[id]')
    }
  }

  const categories: Prop = {
    name: 'category',
    data: await db.category.findMany({ orderBy: { id: 'asc' } }),
    add: async data => {
      'use server'

      const { name } = validate(
        z.object({
          name: z.string().min(3)
        }),
        data
      )

      await db.category.create({ data: { name } })
      revalidatePath('/editor')
      revalidatePath('/video/[id]')
    },
    update: async data => {
      'use server'

      const { id, name } = validate(
        z.object({
          id: z.coerce.number().int().positive(),
          name: z.string().min(3)
        }),
        data
      )

      await db.category.update({ where: { id }, data: { name } })
      revalidatePath('/editor')
      revalidatePath('/video/[id]')
    }
  }

  const locations: Prop = {
    name: 'location',
    data: await db.location.findMany({ orderBy: { id: 'asc' } }),
    add: async data => {
      'use server'

      const { name } = validate(
        z.object({
          name: z.string().min(3)
        }),
        data
      )

      await db.location.create({ data: { name } })
      revalidatePath('/editor')
    },
    update: async data => {
      'use server'

      const { id, name } = validate(
        z.object({
          id: z.coerce.number().int().positive(),
          name: z.string().min(3)
        }),
        data
      )

      await db.location.update({ where: { id }, data: { name } })
      revalidatePath('/editor')
      revalidatePath('/video/[id]')
    }
  }

  return <Client data={[attributes, categories, locations]} />
}
