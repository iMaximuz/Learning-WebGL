var gl;
let shader;
let lambertShader;
let mModel = mat4.create();
let mView = mat4.create();
let mPerspective = mat4.create();

let triangleMesh;
let squareMesh;
let cubeMesh;

let G_VERTEX_LAYOUT;

function webGLStart(){
    let canvas = $('canvas')[0];
    gl = glInit(canvas);
    
    G_VERTEX_LAYOUT = [
        { 
            name: 'position', 
            attribute: new AttributePointer (0, 3, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 0)
        },
        { 
            name: 'color', 
            attribute: new AttributePointer (1, 4, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT)
        }
    ];

    let vs = getShaderSource("color-vs");
    let fs = getShaderSource("color-fs");
    shader = new Shader(vs, fs); 

    vs = getShaderSource("lambert-vs");
    fs = getShaderSource("lambert-fs");
    lambertShader = new Shader(vs, fs); 

    triangleMesh = Geometry.Triangle();
    squareMesh = Geometry.Square();
    cubeMesh = Geometry.Box(1, 2, 1);

    gl.clearColor(0.12, 0.19, 0.31, 1.0);
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    
    glLoop(loop);
}

function loop(dt){
    gl.resize();
    drawScene(dt);
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
let lightColor = vec3.create();
let materialColor = vec3.create();

function drawScene(dt) {
    shader.bind();
    t += dt;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.identity(mModel);
    mat4.identity(mView);

    mat4.perspective(mPerspective, 45, gl.canvas.width / gl.canvas.height, 0.1, 100.0);

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

    shader.unbind();    
    lambertShader.bind();

    mat4.identity(mModel);
    mat4.translate(mModel, mModel, [0.0, 0.0, -7.0]);
    mat4.rotateY(mModel, mModel, radians);
    vec3.set(lightColor, 1.0, 1.0, 1.0);
    vec3.set(materialColor, 1.0, 0.5, 0.2);
    lambertShader.setMatrixUniforms(mModel, mView, mPerspective);
    lambertShader.setVecf('u_lightColor', lightColor);
    lambertShader.setVecf('u_materialColor', materialColor);

    cubeMesh.render(gl.TRIANGLES);
    lambertShader.unbind();
}

$(document).ready(webGLStart);