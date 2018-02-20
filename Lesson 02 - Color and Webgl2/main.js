
/*const gl = (function(){
    let canvas = $('canvas')[0];

})();*/

let gl;

function resize(canvas){
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    if (canvas.width != displayWidth || canvas.height != displayHeight){
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }
}

function webGLStart(){
    let canvas = $('canvas')[0];
    initGL(canvas);
    
    let shaderProgram = initShaders();
    initBuffers(shaderProgram);

    gl.clearColor(0.12, 0.19, 0.31, 1.0);
    gl.enable(gl.DEPTH_TEST);

    resize(gl.canvas);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    drawScene(shaderProgram);
}

function initGL(canvas) {
    gl = canvas.getContext("webgl2");
    if(!gl){
        gl = canvas.getContext("experimental-webgl2");
    }

    if(!gl){
        console.error('Your browser does not support webgl.')
    }
    else{
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }
}

function getShader(gl, id){
    let shaderScript = $('#'+id)[0];
    if(!shaderScript)
        return null;
    
    let str = "";
    let k = shaderScript.firstChild;
    while(k){
        if(k.nodeType == 3)
            str += k.textContent;
        k = k.nextSibling
    }

    let shader;
    if(shaderScript.type == "x-shader/x-fragment"){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if(shaderScript.type == "x-shader/x-vertex"){
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders() {

    let fragmentShader = getShader(gl, "shader-fs");
    let vertexShader = getShader(gl, "shader-vs");

    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    gl.bindAttribLocation(shaderProgram, 0, "a_position" );
    gl.bindAttribLocation(shaderProgram, 1, "a_color" );

    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
        console.error("Could not initialize shaders");
    
    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "a_color");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.perspMatUniform = gl.getUniformLocation(shaderProgram, "u_perspective");
    shaderProgram.modelViewMatUniform = gl.getUniformLocation(shaderProgram, "u_modelView");
    return shaderProgram;
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
        shaderProgram.vertexPositionAttribute, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of element
        false, // Normalized
        triangleVBO.itemSize * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the begining of a  single vertex to this attribute
    );
    gl.vertexAttribPointer(
        shaderProgram.vertexColorAttribute, // Attribute location
        4, // Number of elements per attribute
        gl.FLOAT, // Type of element
        false, // Normalized
        triangleVBO.itemSize * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT// Offset from the begining of a  single vertex to this attribute
    );
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    vertices = [
        //position          color
        1.0, 1.0, 0.0,      1.0, 0.0, 0.0, 1.0, // top right
        1.0, -1.0, 0.0,     0.0, 0.0, 1.0, 1.0, // bottom right
        -1.0, -1.0, 0.0,    0.0, 1.0, 0.0, 1.0, // bottom left
        -1.0, 1.0, 0.0,     1.0, 1.0, 1.0, 1.0, // top left
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
        shaderProgram.vertexPositionAttribute, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of element
        false, // Normalized
        squareVBO.itemSize * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the begining of a  single vertex to this attribute
    );
    gl.vertexAttribPointer(
        shaderProgram.vertexColorAttribute, // Attribute location
        4, // Number of elements per attribute
        gl.FLOAT, // Type of element
        false, // Normalized
        squareVBO.itemSize * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT// Offset from the begining of a  single vertex to this attribute
    );
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function setMatrixUniforms(shaderProgram, perspectiveMatrix, modelViewMatrix) {
    gl.uniformMatrix4fv(shaderProgram.perspMatUniform, false, perspectiveMatrix);
    gl.uniformMatrix4fv(shaderProgram.modelViewMatUniform, false, modelViewMatrix);
}

function drawScene(shaderProgram) {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let perspectiveMat = mat4.create();
    let modelViewMat = mat4.create();

    mat4.perspective(perspectiveMat, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    mat4.identity(modelViewMat);

    mat4.translate(modelViewMat, modelViewMat, [-1.5, 0.0, -7.0]);
    
    setMatrixUniforms(shaderProgram, perspectiveMat, modelViewMat);
    gl.bindVertexArray(triangleVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    mat4.translate(modelViewMat, modelViewMat, [3.0, 0.0, 0.0]);
    setMatrixUniforms(shaderProgram, perspectiveMat, modelViewMat);
    gl.bindVertexArray(squareVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
    
}

$(document).ready(webGLStart);