import prisma from './prisma'

import { Star } from '@prisma/client'

export const getAliasAsStar = async (alias: string): Promise<Star> => {
  return (await prisma.starAlias.findFirstOrThrow({ where: { name: alias }, include: { star: true } })).star
}

export const starIsIgnored = async (star: string): Promise<boolean> => {
  return (await prisma.star.count({ where: { name: star, autoTaggerIgnore: true } })) > 0
}

export const aliasIsIgnored = async (alias: string): Promise<boolean> => {
  return (
    await prisma.starAlias.findFirstOrThrow({
      where: { name: alias },
      include: { star: true }
    })
  ).star.autoTaggerIgnore
}

export const starExists = async (star: string): Promise<boolean> => {
  return (await prisma.star.count({ where: { name: star } })) > 0
}

export const aliasExists = async (alias: string): Promise<boolean> => {
  return (await prisma.starAlias.count({ where: { name: alias } })) > 0
}
