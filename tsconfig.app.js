module.exports = {
  compilerOptions: {
    target: "ES2020",
    useDefineForClassFields: true,
    lib: ["ES2020", "DOM", "DOM.Iterable"],
    module: "ESNext",
    skipLibCheck: true,
    moduleResolution: "bundler",
    allowImportingTsExtensions: true,
    isolatedModules: true,
    moduleDetection: "force",
    noEmit: true,
    jsx: "react-jsx",
    strict: false,
    noUnusedLocals: false,
    noUnusedParameters: false,
    noImplicitAny: false,
    noFallthroughCasesInSwitch: false,
    baseUrl: ".",
    paths: {
      "@/*": ["./src/*"]
    }
  },
  include: ["src", "pages", "next-env.d.ts", "**/*.ts", "**/*.tsx"],
  exclude: ["node_modules"]
};