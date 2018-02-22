var gl;
let shader;
let mModel = mat4.create();
let mView = mat4.create();
let mPerspective = mat4.create();

function webGLStart(){
    let canvas = $('canvas')[0];
    gl = glInit(canvas);
    let vs = getShaderSource("shader-vs");
    let fs = getShaderSource("shader-fs");
    shader = new Shader(vs, fs);

    initBuffers(shader);

    gl.clearColor(0.12, 0.19, 0.31, 1.0);
    gl.enable(gl.DEPTH_TEST);
    

    shader.bind();
    glLoop(loop);
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
// VAO = Vertex array buffer
// VBO = Vertex buffer object
// EBO = Element buffer object (indices)

let triangleVAO;
let squareVAO;
function initBuffers(shaderProgram) {
    triangleVAO = gl.createVertexArray();
    let triangleVBO = gl.createBuffer();
    gl.bindVertexArray(triangleVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
    let vertices = [
        //position          color
        0.0, 1.0, 0.0,      1.0, 0.0, 0.0, 1.0,
        -1.0, -1.0, 0.0,    0.0, 1.0, 0.0, 1.0,
        1.0, -1.0, 0.0,     0.0, 0.0, 1.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleVBO.itemSize = 7; // Number of floats per vertex
    triangleVBO.numItems = 3; // Number of vertex
    gl.vertexAttribPointer(
        shader.attributes['a_position'], // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of element
        false, // Normalized
        triangleVBO.itemSize * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the begining of a  single vertex to this attribute
    );
    gl.vertexAttribPointer(
        shader.attributes['a_color'], // Attribute location
        4, // Number of elements per attribute
        gl.FLOAT, // Type of element
        false, // Normalized
        triangleVBO.itemSize * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT// Offset from the begining of a  single vertex to this attribute
    );
    gl.enableVertexAttribArray(shader.attributes['a_position']);
    gl.enableVertexAttribArray(shader.attributes['a_color']);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    vertices = [
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

    squareVAO = gl.createVertexArray();
    let squareVBO = gl.createBuffer();
    let squareEBO = gl.createBuffer();
    gl.bindVertexArray(squareVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVBO.itemSize = 7; // Number of floats per vertex
    squareVBO.numItems = 4; // Number of vertex
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareEBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
        shader.attributes['a_position'], // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of element
        false, // Normalized
        squareVBO.itemSize * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the begining of a  single vertex to this attribute
    );
    gl.vertexAttribPointer(
        shader.attributes['a_color'], // Attribute location
        4, // Number of elements per attribute
        gl.FLOAT, // Type of element
        false, // Normalized
        squareVBO.itemSize * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT// Offset from the begining of a  single vertex to this attribute
    );
    gl.enableVertexAttribArray(shader.attributes['a_position']);
    gl.enableVertexAttribArray(shader.attributes['a_color']);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
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

    gl.bindVertexArray(triangleVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    mat4.identity(mModel);
    mat4.translate(mModel, mModel, [1.5, 0.0, -7.0]);
    mat4.rotateY(mModel, mModel, radians);
    shader.setMatrixUniforms(mModel, mView, mPerspective);

    gl.bindVertexArray(squareVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
    
}

$(document).ready(webGLStart);