# 独立开发与三包对应关系

本仓库可以独立 npm ci、build、typecheck 和 test，不需要父仓库、不导入 M-C。src/ 保留本次发布的完整共同核心，使类型依赖和来源可审查；scripts/build.mjs 只以 src/memory-plugin.ts 为发行入口，并将原生 @deepseek-ai 组件留给宿主。源码中其他协作模块不会因此自动启用。

lib/index.js 是可独立装载的发行运行文件，lib/types 是声明；work/test-lib 是测试编译结果，19 个测试文件覆盖工程记忆、证据、检索、上下文压缩、归档与知识库。测试目录和依赖不会进入发布 TGZ。

本版官方安装包由 Ultra 三包流水线冻结。两个发布页分发相同 TGZ；本仓库独立构建核验 lib/index.js 与该包一致。自行 npm pack 含本仓库的构建脚本和源码布局，因此不宣称压缩包元数据与官方下载 TGZ 逐字相同。

版本：Ultra 0.7.0 / Memory 0.2.0 / Decision 0.2.0。共同核心对应来源以发布回执中的两个提交和 SOURCE-MANIFEST.json 为准。后续共同算法修改应同步回另一仓库，再核对运行字节，避免维护分叉。

```powershell
npm ci --ignore-scripts
npm run build
npm run typecheck
$env:DSH_ULTRA_TEST_SDK = (Resolve-Path node_modules).Path
npm test
```

当前锁文件与三包验证使用相同的 93 包依赖图，固定 rc.3。不要靠无锁的安装结果判断宿主兼容性。