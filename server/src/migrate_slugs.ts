import prisma from "../src/config/db";
import { slugify } from "../src/utils/slugify";

async function main() {
    console.log("Migrating products to use slugs...");
    const products = await prisma.product.findMany();

    for (const p of products) {
        let baseSlug = slugify(p.title);
        let finalSlug = `${baseSlug}-${p.id}`; // Always append ID for guaranteed uniqueness in this simple demo
        
        await prisma.product.update({
            where: { id: p.id },
            data: { slug: finalSlug }
        });
        console.log(`Updated: ${p.title} -> ${finalSlug}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
