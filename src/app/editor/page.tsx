import { revalidatePath } from 'next/cache'

import Client, { EditorPageProps } from './client'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export const dynamic = 'force-dynamic'

export default async function EditorPage() {
  type Prop = EditorPageProps['data'][number]

  const attributes: Prop = {
    name: 'attribute',
    data: await prisma.attribute.findMany({ orderBy: { id: 'asc' } }),
    add: async data => {
      'use server'

      const { name } = validate(
        z.object({
          name: z.string().min(3)
        }),
        data
      )

      await prisma.attribute.create({ data: { name } })
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

      await prisma.attribute.update({ where: { id }, data: { name } })
      revalidatePath('/editor')
      revalidatePath('/video/[id]')
    }
  }

  const categories: Prop = {
    name: 'category',
    data: await prisma.category.findMany({ orderBy: { id: 'asc' } }),
    add: async data => {
      'use server'

      const { name } = validate(
        z.object({
          name: z.string().min(3)
        }),
        data
      )

      await prisma.category.create({ data: { name } })
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

      await prisma.category.update({ where: { id }, data: { name } })
      revalidatePath('/editor')
      revalidatePath('/video/[id]')
    }
  }

  const locations: Prop = {
    name: 'location',
    data: await prisma.location.findMany({ orderBy: { id: 'asc' } }),
    add: async data => {
      'use server'

      const { name } = validate(
        z.object({
          name: z.string().min(3)
        }),
        data
      )

      await prisma.location.create({ data: { name } })
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

      await prisma.location.update({ where: { id }, data: { name } })
      revalidatePath('/editor')
      revalidatePath('/video/[id]')
    }
  }

  return <Client data={[attributes, categories, locations]} />
}
