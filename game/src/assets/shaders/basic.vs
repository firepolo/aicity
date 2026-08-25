#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;
layout(location = 2) in vec3 aNormal;

out vec2 vTexCoord;
out vec3 vNormal;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

void main()
{
	vTexCoord = aTexCoord;
	vNormal = aNormal;
	gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}