/*****************************************/
// === MONOLITH FILE - All code merged ===

/* State */
const DEBUG = true;
var g_isPaused = false;
var bw = 0, bh = 0, body = null;
var canvas = null;

/* Globals for buffers */
var vertexBuffer = null;
var indexBuffer = null;
var vertexData = null;
var indexData = null;

/* Main */
function main() {
    canvas = getCanvasElement();
    const gl = getWebGLContext(canvas);

    updateSize(gl, canvas);
    window.addEventListener("resize", () => updateSize(gl, canvas));

    gl.clearColor(0.1, 0.1, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);

    const vertexShader = document.getElementById('VertexShader').textContent;
    const fragmentShader = document.getElementById('FragmentShader').textContent;

    const program = gl.createProgram();
    addShader(gl, program, gl.VERTEX_SHADER, vertexShader);
    addShader(gl, program, gl.FRAGMENT_SHADER, fragmentShader);
    linkAndUseProgram(gl, program);

    var a_Position = gl.getAttribLocation(program, "a_Position");
    var u_FragColor = gl.getUniformLocation(program, "u_FragColor");
    var u_xformMatrix = gl.getUniformLocation(program, "u_xformMatrix");

    gl.uniform4f(u_FragColor, 1, 1, 1, 1);

    // Initial quad
    vertexData = new Float32Array([
        -0.5, 0.5, 0,  -0.5, -0.5, 0,
         0.5, 0.5, 0,   0.5, -0.5, 0
    ]);

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Initial draw
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    var i = 0;
    var tx = 0, ty = 0, s = 1;

    // Controls
    canvas.addEventListener("click", () => g_isPaused = !g_isPaused);

    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "ArrowDown": ty -= 0.02; break;
            case "ArrowUp":   ty += 0.02; break;
            case "ArrowLeft": tx -= 0.02; break;
            case "ArrowRight":tx += 0.02; break;
            case "1": case "2": case "3": case "4": case "5":
                s = parseInt(event.key) * 0.33;
                break;
        }
    });

    // OBJ Loader
    document.getElementById("objFile").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        await loadObj(gl, file, a_Position);
    });

    var tick = function() {
        if (g_isPaused) {
            requestAnimationFrame(tick);
            return;
        }

        i += 0.01;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const T = createTranslation(tx, ty, 0);
        const R = createRotationXYZ(0, 45 * i, 0);
        const S = createScale(s, s, 1);

        let xformMatrix = createTransformation({T, R, S});
        xformMatrix = multiplyScalar(xformMatrix, i);  // your original effect

        gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

        if (indexData && indexData.length > 0) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexData.length / 3);
        }

        requestAnimationFrame(tick);
    };

    tick();
    console.log("Engine started - OBJ loader ready");
}

/* Improved OBJ Loader with faces + auto centering */
async function loadObj(gl, file, a_Position) {
    const text = await file.text();
    const lines = text.split('\n');

    const positions = [];
    const indices = [];

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('v ')) {
            const [, x, y, z] = line.split(/\s+/).map(Number);
            positions.push(x, y, z || 0);
        } else if (line.startsWith('f ')) {
            const parts = line.split(/\s+/).slice(1);
            // Triangulate simple polygons
            for (let i = 1; i < parts.length - 1; i++) {
                indices.push(parseInt(parts[0]) - 1);
                indices.push(parseInt(parts[i]) - 1);
                indices.push(parseInt(parts[i + 1]) - 1);
            }
        }
    }

    // Center and normalize
    let min = [Infinity, Infinity, Infinity];
    let max = [-Infinity, -Infinity, -Infinity];

    for (let i = 0; i < positions.length; i += 3) {
        min[0] = Math.min(min[0], positions[i]);
        min[1] = Math.min(min[1], positions[i+1]);
        min[2] = Math.min(min[2], positions[i+2]);
        max[0] = Math.max(max[0], positions[i]);
        max[1] = Math.max(max[1], positions[i+1]);
        max[2] = Math.max(max[2], positions[i+2]);
    }

    const centerX = (min[0] + max[0]) / 2;
    const centerY = (min[1] + max[1]) / 2;
    const centerZ = (min[2] + max[2]) / 2;
    const maxSize = Math.max(max[0]-min[0], max[1]-min[1], max[2]-min[2]) || 1;
    const scale = 1.5 / maxSize;

    for (let i = 0; i < positions.length; i += 3) {
        positions[i]   = (positions[i]   - centerX) * scale;
        positions[i+1] = (positions[i+1] - centerY) * scale;
        positions[i+2] = (positions[i+2] - centerZ) * scale;
    }

    vertexData = new Float32Array(positions);
    indexData = new Uint16Array(indices);

    // Update vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

    // Create / update index buffer
    if (!indexBuffer) indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);

    console.log(`✅ Loaded OBJ: ${positions.length/3} vertices, ${indices.length} indices`);
}

/* === Matrix & Utility Functions (from Mat4.js) === */
function createIdentity() {
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
}

function createTranslation(tx, ty, tz) {
    const m = createIdentity();
    m[12] = tx; m[13] = ty; m[14] = tz;
    return m;
}

function createScale(sx, sy, sz) {
    const m = createIdentity();
    m[0] = sx; m[5] = sy; m[10] = sz;
    return m;
}

const DTRM = Math.PI / 180;
function toRadians(deg) { return deg * DTRM; }

function createRotationXYZ(x=0, y=0, z=0) {
    const out = new Float32Array(16);
    const xr = toRadians(x), yr = toRadians(y), zr = toRadians(z);
    const cx = Math.cos(xr), sx = Math.sin(xr);
    const cy = Math.cos(yr), sy = Math.sin(yr);
    const cz = Math.cos(zr), sz = Math.sin(zr);

    out[0] = cy * cz; out[1] = sz * cy; out[2] = -sy;
    out[4] = sy*sx*cz - sz*cx; out[5] = sy*sz*sx + cz*cx; out[6] = sx*cy;
    out[8] = sy*cz*cx + sz*sx; out[9] = sy*sz*cx - sx*cz; out[10] = cy*cx;
    out[15] = 1;
    return out;
}

function multiply(a, b) {
    const out = new Float32Array(16);
    // ... (full multiply implementation - kept from your original)
    const a00=a[0],a01=a[1],a02=a[2],a03=a[3], a10=a[4],a11=a[5],a12=a[6],a13=a[7],
          a20=a[8],a21=a[9],a22=a[10],a23=a[11], a30=a[12],a31=a[13],a32=a[14],a33=a[15];

    let b0,b1,b2,b3;
    b0=b[0];b1=b[1];b2=b[2];b3=b[3];
    out[0]=b0*a00+b1*a10+b2*a20+b3*a30; out[1]=b0*a01+b1*a11+b2*a21+b3*a31;
    out[2]=b0*a02+b1*a12+b2*a22+b3*a32; out[3]=b0*a03+b1*a13+b2*a23+b3*a33;

    b0=b[4];b1=b[5];b2=b[6];b3=b[7];
    out[4]=b0*a00+b1*a10+b2*a20+b3*a30; out[5]=b0*a01+b1*a11+b2*a21+b3*a31;
    out[6]=b0*a02+b1*a12+b2*a22+b3*a32; out[7]=b0*a03+b1*a13+b2*a23+b3*a33;

    b0=b[8];b1=b[9];b2=b[10];b3=b[11];
    out[8]=b0*a00+b1*a10+b2*a20+b3*a30; out[9]=b0*a01+b1*a11+b2*a21+b3*a31;
    out[10]=b0*a02+b1*a12+b2*a22+b3*a32; out[11]=b0*a03+b1*a13+b2*a23+b3*a33;

    b0=b[12];b1=b[13];b2=b[14];b3=b[15];
    out[12]=b0*a00+b1*a10+b2*a20+b3*a30; out[13]=b0*a01+b1*a11+b2*a21+b3*a31;
    out[14]=b0*a02+b1*a12+b2*a22+b3*a32; out[15]=b0*a03+b1*a13+b2*a23+b3*a33;
    return out;
}

function createTransformation({T, R, S} = {}) {
    const t = T || createIdentity();
    const r = R || createIdentity();
    const s = S || createIdentity();
    return multiply(t, multiply(r, s));
}

function multiplyScalar(matrix, scalar) {
    for (let i = 0; i < 16; i++) matrix[i] *= scalar;
    return matrix;
}

/* === Other Helpers === */
function updateSize(gl, canvas) {
    body = document.getElementsByTagName("body")[0];
    if (canvas && gl) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}

function getCanvasElement() {
    const c = document.getElementById("example");
    if (!c) console.error("No canvas found");
    return c;
}

function linkAndUseProgram(gl, program) {
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Could not link program");
        return;
    }
    gl.useProgram(program);
}

function addShader(gl, program, type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Shader compile error:\n" + gl.getShaderInfoLog(shader));
        return;
    }
    gl.attachShader(program, shader);
}

function getWebGLContext(canvas) {
    const ctx = canvas.getContext('experimental-webgl') || canvas.getContext('webgl');
    if (!ctx) alert("WebGL not supported");
    return ctx;
}

function checkCtx(ctx) {
    if (!ctx && DEBUG) alert("WebGL context failed");
}