import { db } from './prisma'

import { Star } from '@prisma/client'

export async function getAliasAsStar(alias: string): Promise<Star> {
  return (await db.starAlias.findFirstOrThrow({ where: { name: alias }, include: { star: true } })).star
}

export async function starIsIgnored(star: string): Promise<boolean> {
  return (await db.star.count({ where: { name: star, autoTaggerIgnore: true } })) > 0
}

export async function aliasIsIgnored(alias: string): Promise<boolean> {
  return (
    await db.starAlias.findFirstOrThrow({
      where: { name: alias },
      include: { star: true }
    })
  ).star.autoTaggerIgnore
}

export async function starExists(star: string): Promise<boolean> {
  return (await db.star.count({ where: { name: star } })) > 0
}

export async function aliasExists(alias: string): Promise<boolean> {
  return (await db.starAlias.count({ where: { name: alias } })) > 0
}
