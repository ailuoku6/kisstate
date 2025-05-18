import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts', // 指定入口文件
  output: {
    file: 'dist/index.js', // 指定输出文件
    format: 'esm', // 指定输出格式,
    name: 'kisstate',
  },
  plugins: [typescript(), terser()], // 使用 TypeScript 插件
};
