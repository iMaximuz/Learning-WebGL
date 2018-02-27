var gl;
let shader;
let mModel = mat4.create();
let mView = mat4.create();
let mPerspective = mat4.create();

let triangleMesh;
let squareMesh;

let g_vertex_layout = [];

function webGLStart(){
    let canvas = $('canvas')[0];
    gl = glInit(canvas);
    let vs = getShaderSource("shader-vs");
    let fs = getShaderSource("shader-fs");
    shader = new Shader(vs, fs);  

    g_vertex_layout.push(new AttributePointer ('position', 0, 3, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 0));
    g_vertex_layout.push(new AttributePointer ('color', 1, 4, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT));

    triangleMesh = generateTriangleMesh();
    squareMesh = generateSquareMesh();

    gl.clearColor(0.12, 0.19, 0.31, 1.0);
    gl.enable(gl.DEPTH_TEST);
    

    shader.bind();
    glLoop(loop);
}

function generateTriangleMesh(){
    let vertices = [
        //position          color
        0.0, 1.0, 0.0,      1.0, 0.0, 0.0, 1.0,
        -1.0, -1.0, 0.0,    0.0, 1.0, 0.0, 1.0,
        1.0, -1.0, 0.0,     0.0, 0.0, 1.0, 1.0,
    ];
    let vertexArray = new VertexArray(vertices, 3, g_vertex_layout);
    return new Mesh(vertexArray);
}

function generateSquareMesh(){
    let vertices = [
        //position          color
        1.0, 1.0, 0.0,      1.0, 0.5, 0.2, 1.0, // top right
        1.0, -1.0, 0.0,     1.0, 0.5, 0.2, 1.0, // bottom right
        -1.0, -1.0, 0.0,    1.0, 0.5, 0.2, 1.0, // bottom left
        -1.0, 1.0, 0.0,     1.0, 0.5, 0.2, 1.0, // top left
    ];
    let indices = [
        0, 1, 3,
        1, 2, 3
    ]
    let vertexArray = new VertexArray(vertices, 4, g_vertex_layout);
    return new Mesh(vertexArray, indices);
}

function loop(dt){
    gl.resize();
    drawScene(dt, shader);
}

function getShaderSource(id){
    let shaderScript = $('#'+id);
    if(!shaderScript)
        return "";
    
    let shaderText = shaderScript.text();
    return shaderText;
}

let rot = 0;
let zoom = 0;
let t = 0;
function drawScene(dt, shader) {
    t += dt;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.identity(mModel);
    mat4.identity(mView);

    zoom = 45 + (Math.sin(t) * 30);
    mat4.perspective(mPerspective, glMatrix.toRadian(zoom), gl.canvas.width / gl.canvas.height, 0.1, 100.0);

    let radians = glMatrix.toRadian(rot);
    rot += 20 * dt;
    mat4.translate(mModel, mModel, [-1.5, 0.0, -7.0]);
    mat4.rotateX(mModel, mModel, radians);    
    shader.setMatrixUniforms(mModel, mView, mPerspective);

    triangleMesh.render(gl.TRIANGLES);
    
    mat4.identity(mModel);
    mat4.translate(mModel, mModel, [1.5, 0.0, -7.0]);
    mat4.rotateY(mModel, mModel, radians);
    shader.setMatrixUniforms(mModel, mView, mPerspective);

    squareMesh.render(gl.TRIANGLES);

    gl.bindVertexArray(null);
    
}

$(document).ready(webGLStart);