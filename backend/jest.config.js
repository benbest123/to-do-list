/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFiles: ["<rootDir>/src/__tests__/setup.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          // Override to CommonJS so ts-jest resolves modules without NodeNext extension rules
          module: "CommonJS",
          moduleResolution: "node",
        },
      },
    ],
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,
};
