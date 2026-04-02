import prisma from "../src/config/db";

async function main() {
    console.log("Updating product 1 image...");
    const updated = await prisma.product.update({
        where: { id: 1 },
        data: {
            images: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=1000&auto=format"]
        }
    });
    console.log("Updated product:", updated.title);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
