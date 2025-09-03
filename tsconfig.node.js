module.exports = {
  compilerOptions: {
    target: "ES2022",
    lib: ["ES2023"],
    module: "ESNext",
    skipLibCheck: true,
    moduleResolution: "bundler",
    allowSyntheticDefaultImports: true,
    strict: false,
    noEmit: true,
    isolatedModules: true,
    allowImportingTsExtensions: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
    noImplicitAny: false
  },
  include: ["next.config.js", "vite.config.ts", "tailwind.config.ts"]
};