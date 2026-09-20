const path=require('node:path');
const os=require('node:os');
// Prefer an explicitly selected or project-installed runtime. The Codex bundled
// fallback lets this workspace run without installing packages on the host.
module.exports=()=>{
  const candidates=[process.env.PLAYWRIGHT_MODULE,'playwright',path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')].filter(Boolean);
  for(const candidate of candidates){
    try {const entry=require.resolve(candidate);return {api:require(entry),entry};}
    catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
  }
  throw new Error('Playwright is unavailable. Install playwright@1.62.1 or set PLAYWRIGHT_MODULE to its module path.');
};
