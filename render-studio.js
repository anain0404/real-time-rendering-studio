const canvas = document.querySelector('#scene');
const errorBox = document.querySelector('#error');
const gl = canvas.getContext('webgl2', { antialias: true, preserveDrawingBuffer: true });
const state = { preset: 'studio', normalMap: true, shadows: true, animate: true, shading: 0, intensity: 1.15, ambient: 0.22, shininess: 50, bump: 0.6, material: 0, yaw: 0.48, pitch: 0.34, distance: 9.3 };
const palettes = {
  studio: { background: [0.095, 0.13, 0.17], color: [0.71, 0.75, 0.68], floor: [0.28, 0.33, 0.36], light: [1, 0.94, 0.83], ambient: 0.22, intensity: 1.15 },
  night: { background: [0.04, 0.065, 0.13], color: [0.43, 0.58, 0.84], floor: [0.19, 0.23, 0.4], light: [0.62, 0.76, 1], ambient: 0.16, intensity: 1.5 },
  gold: { background: [0.21, 0.13, 0.13], color: [0.82, 0.56, 0.4], floor: [0.41, 0.3, 0.3], light: [1, 0.71, 0.45], ambient: 0.27, intensity: 1.45 }
};
function matIdentity() { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
function matMultiply(a, b) { const out = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) out[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return out; }
function matPerspective(fov, aspect, near, far) { const f = 1 / Math.tan(fov / 2), m = new Float32Array(16); m[0] = f / aspect; m[5] = f; m[10] = (far + near) / (near - far); m[11] = -1; m[14] = 2 * far * near / (near - far); return m; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function norm(a) { const d = Math.hypot(...a); return a.map(x => x / (d || 1)); }
function matLook(eye, center, up) { const z = norm(eye.map((x, i) => x - center[i])), x = norm(cross(up, z)), y = cross(z, x), m = matIdentity(); m[0] = x[0]; m[1] = y[0]; m[2] = z[0]; m[4] = x[1]; m[5] = y[1]; m[6] = z[1]; m[8] = x[2]; m[9] = y[2]; m[10] = z[2]; m[12] = -x.reduce((s, a, i) => s + a * eye[i], 0); m[13] = -y.reduce((s, a, i) => s + a * eye[i], 0); m[14] = -z.reduce((s, a, i) => s + a * eye[i], 0); return m; }
function matModel(x, y, z, scale, angle) { const m = matIdentity(), c = Math.cos(angle), s = Math.sin(angle); m[0] = c * scale; m[2] = -s * scale; m[5] = scale; m[8] = s * scale; m[10] = c * scale; m[12] = x; m[13] = y; m[14] = z; return m; }
function compile(type, source) { const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader); if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader)); return shader; }
function program(vertex, fragment) { const p = gl.createProgram(); gl.attachShader(p, compile(gl.VERTEX_SHADER, vertex)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(p)); return p; }
const vertexShader = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec2 aUV;
layout(location=3) in vec3 aTangent;
uniform mat4 uModel;
uniform mat4 uVP;
uniform mat4 uLightVP;
out vec3 vPosition;
out vec3 vNormal;
out vec3 vTangent;
out vec2 vUV;
out vec4 vLightPos;
void main(){
 vec4 world=uModel*vec4(aPosition,1.0);
 vPosition=world.xyz;
 vNormal=normalize(mat3(uModel)*aNormal);
 vTangent=normalize(mat3(uModel)*aTangent);
 vUV=aUV;
 vLightPos=uLightVP*world;
 gl_Position=uVP*world;
}`;
const fragmentShader = `#version 300 es
precision highp float;
in vec3 vPosition;
in vec3 vNormal;
in vec3 vTangent;
in vec2 vUV;
in vec4 vLightPos;
out vec4 outColor;
uniform sampler2D uShadow;
uniform vec3 uLight;
uniform vec3 uEye;
uniform vec3 uColor;
uniform vec3 uLightColor;
uniform float uIntensity;
uniform float uAmbient;
uniform float uShininess;
uniform float uBump;
uniform int uNormalMap;
uniform int uShadows;
uniform int uMode;
uniform int uFloor;
uniform int uMaterial;
float pattern(vec2 uv){
 vec2 p=uv*11.0;
 return sin(p.x*3.4)*sin(p.y*3.1)*0.6+sin(p.x*1.7+p.y*2.5)*0.25;
}
vec3 surfaceNormal(){
 vec3 n=normalize(vNormal);
 if(uNormalMap==0||uFloor==1) return n;
 vec3 t=normalize(vTangent-dot(vTangent,n)*n);
 vec3 b=normalize(cross(n,t));
 float h=0.012;
 float dx=(pattern(vUV+vec2(h,0.0))-pattern(vUV-vec2(h,0.0)))/(2.0*h);
 float dy=(pattern(vUV+vec2(0.0,h))-pattern(vUV-vec2(0.0,h)))/(2.0*h);
 return normalize(n-uBump*0.19*(dx*t+dy*b));
}
float shadow(){
 if(uShadows==0)return 0.0;
 vec3 pos=vLightPos.xyz/vLightPos.w*0.5+0.5;
 if(pos.x<0.0||pos.x>1.0||pos.y<0.0||pos.y>1.0||pos.z>1.0)return 0.0;
 vec3 n=normalize(vNormal);
 float bias=max(0.002*(1.0-dot(n,normalize(uLight-vPosition))),0.0007);
 vec2 texel=1.0/vec2(textureSize(uShadow,0));
 float shade=0.0;
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
  float d=texture(uShadow,pos.xy+vec2(float(x),float(y))*texel).r;
  shade+=pos.z-bias>d?1.0:0.0;
 }
 return shade/9.0;
}
void main(){
 vec3 n=surfaceNormal();
 vec3 p=vLightPos.xyz/vLightPos.w*0.5+0.5;
 if(uMode==1){outColor=vec4(n*0.5+0.5,1.0);return;}
 if(uMode==2){float d=texture(uShadow,clamp(p.xy,0.0,1.0)).r;outColor=vec4(vec3(pow(d,24.0)),1.0);return;}
 vec3 albedo=uColor;
 if(uFloor==1){float c=mod(floor(vUV.x*8.0)+floor(vUV.y*8.0),2.0);albedo*=mix(0.88,1.09,c);}
 else if(uMaterial==0){albedo*=0.94+0.06*pattern(vUV);}
 else if(uMaterial==2){albedo*=0.86+0.12*sin(vUV.y*135.0);}
 vec3 l=normalize(uLight-vPosition),v=normalize(uEye-vPosition),h=normalize(l+v);
 float diffuse=max(dot(n,l),0.0);
 float spec=pow(max(dot(n,h),0.0),uShininess);
 float gloss=uMaterial==1?0.55:uMaterial==2?0.85:0.27;
 float dist=length(uLight-vPosition);
 float attenuation=1.0/(1.0+0.013*dist*dist);
 float shade=shadow();
 vec3 color=albedo*uAmbient+uLightColor*uIntensity*attenuation*(1.0-shade)*(albedo*diffuse+vec3(spec*gloss));
 color=color/(1.0+color);
 color=pow(color,vec3(1.0/2.2));
 outColor=vec4(color,1.0);
}`;
const depthVertex = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
uniform mat4 uModel;
uniform mat4 uLightVP;
void main(){gl_Position=uLightVP*uModel*vec4(aPosition,1.0);}`;
const depthFragment = `#version 300 es
precision highp float;
void main(){}`;
function cubeData() {
 const out = [];
 const faces = [
  [[0,0,1],[1,0,0],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],
  [[0,0,-1],[-1,0,0],[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],
  [[1,0,0],[0,0,-1],[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],
  [[-1,0,0],[0,0,1],[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],
  [[0,1,0],[1,0,0],[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],
  [[0,-1,0],[1,0,0],[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]
 ];
 for (const [n,t,...pts] of faces) {
  const uv=[[0,0],[1,0],[1,1],[0,1]];
  for (const i of [0,1,2,0,2,3]) out.push(...pts[i],...n,...uv[i],...t);
 }
 return new Float32Array(out);
}
function planeData() {
 const p=[[-1,0,-1],[1,0,-1],[1,0,1],[-1,0,1]];
 const uv=[[0,0],[1,0],[1,1],[0,1]], a=[];
 for(const i of [0,2,1,0,3,2])a.push(...p[i],0,1,0,...uv[i],1,0,0);
 return new Float32Array(a);
}
function mesh(data) {
 const vao=gl.createVertexArray();gl.bindVertexArray(vao);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
 for(const [i,size,offset] of [[0,3,0],[1,3,12],[2,2,24],[3,3,32]]){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,size,gl.FLOAT,false,44,offset);}
 gl.bindVertexArray(null);return{vao,count:data.length/11};
}
let surface, depth, cube, plane, shadowTexture, shadowFrame;
const mapSize=1024;
function initialize() {
 if(!gl)throw Error('WebGL2 is unavailable in this browser.');
 surface=program(vertexShader,fragmentShader);depth=program(depthVertex,depthFragment);
 cube=mesh(cubeData());plane=mesh(planeData());
 shadowTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,shadowTexture);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,mapSize,mapSize,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 shadowFrame=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFrame);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,shadowTexture,0);
 gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
 if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Shadow map framebuffer is unavailable.');
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.enable(gl.DEPTH_TEST);
 gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
 requestAnimationFrame(render);
}
function uniformMat(p,name,m){gl.uniformMatrix4fv(gl.getUniformLocation(p,name),false,m);}
function uniform3(p,name,x){gl.uniform3fv(gl.getUniformLocation(p,name),x);}
function uniform1(p,name,x){gl.uniform1f(gl.getUniformLocation(p,name),x);}
function uniformI(p,name,x){gl.uniform1i(gl.getUniformLocation(p,name),x);}
function drawObjects(p,drawColor,t){
 const objects=[
  {mesh:plane,model:matModel(0,0,0,6,0),floor:1,color:palettes[state.preset].floor},
  {mesh:cube,model:matModel(-1.25,1.13,0,1.07,0.35+Math.sin(t*0.25)*0.13),floor:0,color:palettes[state.preset].color},
  {mesh:cube,model:matModel(1.65,0.68,-0.65,0.65,-0.55),floor:0,color:[0.59,0.74,0.71]}
 ];
 for(const o of objects){uniformMat(p,'uModel',o.model);if(drawColor){uniformI(p,'uFloor',o.floor);uniform3(p,'uColor',o.color);}gl.bindVertexArray(o.mesh.vao);gl.drawArrays(gl.TRIANGLES,0,o.mesh.count);}
 gl.bindVertexArray(null);
}
let last=0,frames=0,frameTime=0;
function render(now){
 const t=now*0.001;
 const rect=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,1.75);
 const width=Math.max(1,Math.floor(rect.width*dpr)),height=Math.max(1,Math.floor(rect.height*dpr));
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 const eye=[Math.sin(state.yaw)*Math.cos(state.pitch)*state.distance,2.1+Math.sin(state.pitch)*state.distance,Math.cos(state.yaw)*Math.cos(state.pitch)*state.distance];
 const view=matLook(eye,[0,0.75,0],[0,1,0]);const vp=matMultiply(matPerspective(Math.PI/4,width/height,0.1,90),view);
 const phase=state.animate?t*0.4:0.45;
 const light=[Math.cos(phase)*5.3,6.3,Math.sin(phase)*5.3];
 const lightVP=matMultiply(matPerspective(Math.PI/2,1,0.5,30),matLook(light,[0,0,0],[0,1,0]));
 gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFrame);gl.viewport(0,0,mapSize,mapSize);gl.clearDepth(1);gl.clear(gl.DEPTH_BUFFER_BIT);
 gl.useProgram(depth);uniformMat(depth,'uLightVP',lightVP);drawObjects(depth,false,t);
 const palette=palettes[state.preset];
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,width,height);gl.clearColor(...palette.background,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.useProgram(surface);uniformMat(surface,'uVP',vp);uniformMat(surface,'uLightVP',lightVP);
 uniform3(surface,'uLight',light);uniform3(surface,'uEye',eye);uniform3(surface,'uLightColor',palette.light);
 uniform1(surface,'uIntensity',state.intensity);uniform1(surface,'uAmbient',state.ambient);uniform1(surface,'uShininess',state.shininess);uniform1(surface,'uBump',state.bump);
 uniformI(surface,'uNormalMap',state.normalMap?1:0);uniformI(surface,'uShadows',state.shadows?1:0);uniformI(surface,'uMode',state.shading);uniformI(surface,'uMaterial',state.material);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,shadowTexture);uniformI(surface,'uShadow',0);
 drawObjects(surface,true,t);
 frames++;if(now-frameTime>800){document.querySelector('#fps').textContent=`${Math.round(frames*1000/(now-frameTime))} FPS`;frames=0;frameTime=now;}
 last=now;requestAnimationFrame(render);
}
function updateControls(){
 for(const [id,key,divisor,unit] of [['intensity','intensity',100,'%'],['ambient','ambient',100,'%'],['shininess','shininess',1,''],['bump','bump',100,'%']]){
  const el=document.querySelector(`#${id}`);el.addEventListener('input',()=>{state[key]=Number(el.value)/divisor;document.querySelector(`#${id}-value`).textContent=`${el.value}${unit}`;});
 }
 for(const [id,key] of [['normal-map','normalMap'],['shadows','shadows'],['animate','animate']])document.querySelector(`#${id}`).addEventListener('change',e=>{state[key]=e.target.checked;});
 document.querySelector('#shading').addEventListener('change',e=>{state.shading={phong:0,normals:1,depth:2}[e.target.value];});
 document.querySelector('#material').addEventListener('change',e=>{state.material={stone:0,ceramic:1,metal:2}[e.target.value];});
 document.querySelectorAll('.preset').forEach(btn=>btn.addEventListener('click',()=>setPreset(btn.dataset.preset)));
 document.querySelector('#reset').addEventListener('click',()=>{state.yaw=0.48;state.pitch=0.34;state.distance=9.3;setPreset('studio');});
 document.querySelector('#export').addEventListener('click',()=>{const a=document.createElement('a');a.download=`rendering-studio-${state.preset}.png`;a.href=canvas.toDataURL('image/png');a.click();});
 let dragging=false,px=0,py=0;
 canvas.addEventListener('pointerdown',e=>{dragging=true;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!dragging)return;state.yaw-=(e.clientX-px)*0.006;state.pitch=Math.max(-0.12,Math.min(1.17,state.pitch+(e.clientY-py)*0.005));px=e.clientX;py=e.clientY;});
 canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
 canvas.addEventListener('wheel',e=>{e.preventDefault();state.distance=Math.max(4.8,Math.min(19,state.distance*Math.exp(e.deltaY*0.0009)));},{passive:false});
 canvas.addEventListener('dblclick',()=>{state.yaw=0.48;state.pitch=0.34;state.distance=9.3;});
}
function setPreset(name){
 state.preset=name;state.intensity=palettes[name].intensity;state.ambient=palettes[name].ambient;
 for(const [id,key] of [['intensity','intensity'],['ambient','ambient']]){const v=Math.round(state[key]*100);document.querySelector(`#${id}`).value=v;document.querySelector(`#${id}-value`).textContent=`${v}%`;}
 document.querySelectorAll('.preset').forEach(btn=>btn.classList.toggle('active',btn.dataset.preset===name));
 document.querySelector('#scene-name').textContent=({studio:'01 / Clay Studio',night:'02 / Midnight',gold:'03 / Golden Hour'})[name];
}
try{updateControls();initialize();}catch(error){errorBox.hidden=false;errorBox.textContent=`Unable to start renderer: ${error.message}`;document.querySelector('.live').textContent='RENDER ERROR';}
