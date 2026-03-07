### Project Setup:
- Clone package.json
- bun install
- bunx tsc --init

### Logging Setup:
- bun add winston 

### Drizzle ORM & Neon Postgress Setup:
- bun add drizzle-orm pg dotenv
- bun add -D drizzle-kit tsx @types/pg
- bun add neondatabase/serverless
- bunx drizzle-kit generate
- bunx drizzle-kit migrate
- bunx drizzle-kit push

### Better-Auth Setup:
- bun add better-auth

### Biome Setup:
- bun add -D -E @biomejs/biome
- bunx --bun biome init

### Husky Setup:
- npm install --save-dev husky
- bunx husky init

### Setup Code Reddit
- 
- 
- 