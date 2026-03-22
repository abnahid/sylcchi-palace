const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "..", "docs", "prisma-schema-reference");
const targetFile = path.join(__dirname, "..", "prisma", "schema.prisma");

const orderedFiles = [
    "base.prisma",
    "enums.prisma",
    "auth.prisma",
    "room.prisma",
    "review.prisma",
    "reservation.prisma",
    "payment.prisma",
];

const missing = orderedFiles.filter((fileName) => {
    return !fs.existsSync(path.join(sourceDir, fileName));
});

if (missing.length > 0) {
    throw new Error(
        `Missing Prisma source file(s): ${missing.join(", ")}. Expected in ${sourceDir}`,
    );
}

const sections = orderedFiles.map((fileName) => {
    const fullPath = path.join(sourceDir, fileName);
    const content = fs.readFileSync(fullPath, "utf8").trim();

    return [
        `// -----------------------------------------------------------------------------`,
        `// Source: docs/prisma-schema-reference/${fileName}`,
        `// -----------------------------------------------------------------------------`,
        content,
    ].join("\n");
});

const merged = [
    "// THIS FILE IS AUTO-GENERATED.",
    "// Edit feature files in docs/prisma-schema-reference and run: npm run prisma:build-schema",
    "",
    ...sections,
    "",
].join("\n");

fs.mkdirSync(path.dirname(targetFile), { recursive: true });
fs.writeFileSync(targetFile, merged, "utf8");

console.log("Generated prisma/schema.prisma from feature files.");
