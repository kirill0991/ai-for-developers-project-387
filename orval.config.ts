import { defineConfig } from 'orval';

export default defineConfig({
  calendar: {
    input: 'tsp-output/@typespec/openapi3/openapi.yaml',
    output: {
      target: 'src/shared/api/generated.ts',
      client: 'fetch',
      mode: 'single',
      clean: true,
    },
  },
});
