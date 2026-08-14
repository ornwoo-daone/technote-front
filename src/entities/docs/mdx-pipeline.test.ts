// MDX 파이프라인 회귀 방지.
//
// 사고 이력: remark-gfm 이 없어서 마크다운 표가 파이프 문자 그대로 렌더됐다.
// 덱 10개가 전부 깨져 있었는데 빌드도 타입 검사도 통과했다 — 컴파일은 성공하고
// 결과물만 틀리는 종류의 결함이라, 사람이 화면을 볼 때까지 아무도 모른다.
//
// 게다가 이 프로젝트는 dev(@mdx-js/rollup)와 prod(@mdx-js/loader)가 서로 다른
// 플러그인을 쓴다. 한쪽에만 넣으면 dev 에선 멀쩡한데 배포가 깨진다.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const viteCfg = readFileSync(join(root, 'vite.config.js'), 'utf8');
const webpackCfg = readFileSync(join(root, 'webpack.config.js'), 'utf8');

describe('dev · prod MDX 설정 일치', () => {
  it('양쪽 다 remark-gfm 을 import 한다', () => {
    expect(viteCfg, 'vite.config.js').toMatch(/from 'remark-gfm'/);
    expect(webpackCfg, 'webpack.config.js').toMatch(/from 'remark-gfm'/);
  });

  it('양쪽 다 remarkPlugins 로 넘긴다', () => {
    // import 만 하고 안 넘기면 아무 효과가 없다
    expect(viteCfg, 'vite.config.js').toMatch(/remarkPlugins:\s*\[\s*remarkGfm\s*\]/);
    expect(webpackCfg, 'webpack.config.js').toMatch(/remarkPlugins:\s*\[\s*remarkGfm\s*\]/);
  });

  it('양쪽 다 providerImportSource 를 지정한다', () => {
    // 없으면 MDXProvider 의 컴포넌트 매핑(slide-kit)이 통째로 무시된다
    expect(viteCfg, 'vite.config.js').toMatch(/providerImportSource:\s*'@mdx-js\/react'/);
    expect(webpackCfg, 'webpack.config.js').toMatch(/providerImportSource:\s*'@mdx-js\/react'/);
  });
});

describe('실제 컴파일 결과', () => {
  const SAMPLE = ['| 항목 | 값 |', '|---|---|', '| 가 | 나 |', ''].join('\n');

  it('remark-gfm 이 있으면 마크다운 표가 table 로 컴파일된다', async () => {
    const out = String(await compile(SAMPLE, {
      remarkPlugins: [remarkGfm],
      providerImportSource: '@mdx-js/react',
    }));
    expect(out).toContain('_components.table');
    expect(out).not.toContain('| 항목 |');
  });

  it('remark-gfm 이 빠지면 파이프가 생 텍스트로 남는다 (사고 재현)', async () => {
    // 이 테스트가 깨진다면 MDX 기본 동작이 바뀐 것 — 위 설정 검사의 전제가 무너진다
    const out = String(await compile(SAMPLE, { providerImportSource: '@mdx-js/react' }));
    expect(out).not.toContain('_components.table');
  });
});

describe('운영 번들의 JSX 런타임', () => {
  // 사고 이력: webpack 의 babel 설정에 development 를 안 적어서 Babel 8 이
  // envName(BABEL_ENV || NODE_ENV || 'development')을 보고 개발용으로 판단,
  // `import { jsxDEV } from "react/jsx-dev-runtime"` 를 뽑았다.
  // webpack production 이 넣는 react 의 «운영» jsx-dev-runtime 은 jsxDEV 가 undefined 라
  // 첫 렌더에서 TypeError → 화면이 통째로 검게 뜬다. 빌드·타입·테스트는 전부 통과한다.
  // dist/ 를 아무도 안 열어봐서 오래 방치됐다.
  it('webpack 의 babel 이 운영용 jsx-runtime 을 쓴다', async () => {
    const { transformAsync } = await import('@babel/core');
    // webpack.config.js 가 실제로 쓰는 옵션을 그대로 가져와 돌린다 (문자열 검사로는 못 잡는다)
    const cfg = await import(join(root, 'webpack.config.js'));
    const rules: unknown = (cfg.default as { module: { rules: unknown[] } }).module.rules;
    const first = (rules as { use?: { options?: unknown } }[])[0]?.use;
    const options = (first as { options?: object } | undefined)?.options;
    expect(options, 'babel-loader 옵션을 못 찾았다').toBeTruthy();

    const out = await transformAsync('export const A = () => <div/>;', {
      filename: 'sample.tsx',
      configFile: false,
      babelrc: false,
      // ⚠️ 실제 `npm run build` 는 NODE_ENV 가 비어 있어 Babel 이 envName 을 'development' 로
      // 잡는다. 반면 vitest 는 NODE_ENV=test 를 넣어 그 조건이 재현되지 않는다 →
      // 여기서 못박아야 «설정에 development:false 가 없으면 실패» 가 성립한다.
      envName: 'development',
      ...(options as object),
    });
    const code = out?.code ?? '';
    expect(code, '개발용 런타임(jsxDEV)이 운영 번들에 들어간다').not.toContain('jsx-dev-runtime');
    expect(code).toContain('react/jsx-runtime');
  });
});
