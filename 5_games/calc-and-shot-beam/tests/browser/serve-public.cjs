const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
module.exports=async()=>{
  const root=path.resolve(__dirname,'../../public');
  const server=http.createServer((req,res)=>{
    const url=decodeURIComponent(req.url.split('?')[0]);
    const file=path.resolve(root,'.'+(url==='/'?'/index.html':url));
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp'};
    fs.readFile(file,(e,data)=>{res.writeHead(e?404:200,{'Content-Type':type[path.extname(file)]||'application/octet-stream'});res.end(e?'Not found':data);});
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  return {url:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(r=>server.close(r))};
};
