import prisma from './prisma'

export const websiteExists = async (website: string): Promise<boolean> => {
  return (await prisma.website.count({ where: { name: website } })) > 0
}

export const getSiteID = async (site: string): Promise<number | null> => {
  return (await prisma.site.findFirst({ where: { name: site } }))?.id ?? null
}

export const getStarID = async (star: string): Promise<number> => {
  return (await prisma.star.findFirstOrThrow({ where: { name: star } })).id
}

export const getAliasAsStarID = async (alias: string): Promise<number> => {
  return (await prisma.starAlias.findFirstOrThrow({ where: { name: alias }, include: { star: true } })).starID
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
