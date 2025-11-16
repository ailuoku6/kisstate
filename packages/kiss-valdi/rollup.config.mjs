import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import ts from 'typescript';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 解析 kiss-state-core 的路径
const corePath = resolve(__dirname, '../kiss-state-core');
const coreSrcPath = resolve(corePath, 'src');
const coreDistPath = resolve(corePath, 'dist');

export default [
  // 构建 JS
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'esm',
      name: 'kisstate',
    },
    // 只将 react 标记为 external，kiss-state-core 会被打包进来
    external: [],
    plugins: [
      // 自定义插件：解析 kiss-state-core 导入
      {
        name: 'resolve-kiss-state-core',
        resolveId(id) {
          if (id === 'kiss-state-core') {
            // 优先使用编译后的文件，如果没有则使用源文件
            const distIndex = resolve(coreDistPath, 'index.js');
            const srcIndex = resolve(coreSrcPath, 'index.ts');

            if (existsSync(distIndex)) {
              return distIndex;
            } else if (existsSync(srcIndex)) {
              return srcIndex;
            }
          }
          return null;
        },
      },
      typescript({
        tsconfig: './tsconfig.json',
        useTsconfigDeclarationDir: false,
        declaration: false, // JS 构建不需要类型定义
        typescript: ts,
      }),
      terser(),
    ],
  },
  // 构建类型定义
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external: [], // kiss-state-core 不标记为 external，rollup-plugin-dts 会自动内联
    plugins: [
      dts({
        tsconfig: './tsconfig.json',
        respectExternal: true, // 尊重 external 配置，react 保持外部引用
      }),
    ],
  },
];
